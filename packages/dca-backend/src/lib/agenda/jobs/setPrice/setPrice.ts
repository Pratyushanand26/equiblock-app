// inside your setPrice job file (setPrice.ts) — replace relevant execute logic
import * as Sentry from '@sentry/node';
import { Job } from '@whisthub/agenda';
import consola from 'consola';
import { getOracleSetterClient, litNodeClient } from './vincentAbilities';
import { env } from '../../../env';
import { normalizeError } from '../../../error';
import { PriceLog } from '../../../mongo/models/PurchasedCoin';

export type JobType = Job<JobParams>;
export type JobParams = {
  app?: any;
  name?: string;
  pkpInfo: any; // IRelayPKP-ish
  abilityParams: Record<string, any>;
  updatedAt?: Date;
};

export async function setPriceJob(job: JobType, sentryScope: Sentry.Scope): Promise<void> {
  try {
    const {
      _id,
      data: { pkpInfo, abilityParams },
    } = job.attrs;

    const delegatorEthAddress = pkpInfo?.ethAddress;
    consola.log('Running setPriceJob...', { _id, delegatorEthAddress, abilityParams });

    // ensure litNodeClient is connected (wrapper doesn't auto-connect)
    if (!litNodeClient.ready) await litNodeClient.connect();

    // get the ability client (thin wrapper)
    const abilityClient = getOracleSetterClient();

    // optional: run precheck if available
    if (typeof abilityClient.precheck === 'function') {
      const precheckRes = await abilityClient.precheck(abilityParams, {
        delegatorPkpEthAddress: delegatorEthAddress,
      });
      consola.log('Precheck result:', precheckRes);
      if (!precheckRes?.success) {
        throw new Error(`Precheck failed: ${JSON.stringify(precheckRes)}`);
      }
    }

    // execute ability (this runs through Vincent/Lit runtime)
    const execRes = await abilityClient.execute(abilityParams, {
      delegatorPkpEthAddress: delegatorEthAddress,
    });

    // The abilityClient returns either success object or failure schema; handle both
    if ((execRes as any)?.success === false || (execRes as any)?.status === 'failure') {
      throw new Error(`Ability execution returned failure: ${JSON.stringify(execRes)}`);
    }

    consola.info('Ability executed successfully', execRes);

    // Persist a log in MongoDB (optional)
    try {
      await PriceLog.create({
        price: String(abilityParams.newPrice ?? abilityParams.price ?? ''),
        blockNumber: (execRes as any)?.blockNumber ?? null,
        transactionHash: (execRes as any)?.txHash ?? (execRes as any)?.transactionHash ?? null,
      });
    } catch (e) {
      consola.warn('Failed to write PriceLog', e);
    }
  } catch (e) {
    const err = normalizeError(e);
    sentryScope.captureException(err);
    consola.error('setPriceJob failed:', err.message || err);
    throw e;
  } finally {
    try {
      // safe cleanup
      // disconnect clients if you want but keep it optional (starter sometimes does)
      // disconnectVincentAbilityClients();
    } catch (e) {
      /* ignore */
    }
  }
}
