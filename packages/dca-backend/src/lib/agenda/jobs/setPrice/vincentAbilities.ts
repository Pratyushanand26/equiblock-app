// packages/dca-backend/src/lib/agenda/jobs/setPrice/vincentabilities.ts
import { LitNodeClient } from '@lit-protocol/lit-node-client';
import { getVincentAbilityClient } from '@lit-protocol/vincent-app-sdk/abilityClient';
import { bundledVincentAbility as oracleSetterBundledAbility } from '@pratyushanand26/vincent-ability-oracle-setter/dist/src/lib/index.js';
import { delegateeSigner } from './utils/signer'; // adjust path if your signer util lives elsewhere

// single LitNodeClient instance (starter pattern)
export const litNodeClient = new LitNodeClient({
  debug: true,
  litNetwork: 'datil',
});

// thin wrapper: returns a configured ability client
export function getOracleSetterClient() {
  return getVincentAbilityClient({
    bundledVincentAbility: oracleSetterBundledAbility,
    ethersSigner: delegateeSigner,
    litNodeClient,
  });
}
