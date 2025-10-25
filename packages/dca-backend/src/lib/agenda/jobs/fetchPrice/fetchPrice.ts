import * as Sentry from '@sentry/node';
import { Job } from '@whisthub/agenda';
import consola from 'consola';
import { ethers } from 'ethers';

import { PriceLog } from '../../../mongo/models/PurchasedCoin'; // We renamed the model
import { env } from '../../../env';
import { normalizeError } from '../../../error';

export type JobType = Job<JobParams>;
export type JobParams = {
  contractAddress: string;
  name: string;
};


// ABI for your contract
const CONTRACT_ABI = [
  'function getPrice() external view returns (uint256)',
  'function setPrice(uint256 _newPrice) external='
];

// Use Sepolia RPC instead of Base
const SEPOLIA_RPC_URL = 'https://eth-sepolia.g.alchemy.com/v2/vJ54dV77TVZI5180tGCFhgahZKDr4k2Z'; // UPDATE THIS
const provider = new ethers.providers.JsonRpcProvider(SEPOLIA_RPC_URL);

export async function fetchPriceJob(job: JobType, sentryScope: Sentry.Scope): Promise<void> {
  try {
    const {
      data: { contractAddress, name },
    } = job.attrs;

    consola.log('Starting price fetch job...', {
      contractAddress,
      name,
    });

    // Create contract instance
    const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, provider);

    // Fetch price from contract
    const priceRaw = await contract.getPrice();
    const priceString = priceRaw.toString();

    // Get current block number for metadata
    const blockNumber = await provider.getBlockNumber();

    sentryScope.addBreadcrumb({
      data: {
        price: priceString,
        blockNumber,
      },
      message: 'Fetched price from contract',
    });

    // Store in MongoDB
    const priceLog = new PriceLog({
      price: priceString,
      blockNumber,
      transactionHash: null, // No tx since it's a view function
    });
    await priceLog.save();

    consola.info(`Successfully fetched price: ${priceString} at block ${blockNumber}`);
  } catch (e) {
    const err = normalizeError(e);
    sentryScope.captureException(err);
    consola.error(err.message, err.stack);
    throw e;
  }
}