import { Response } from 'express';
import { z } from 'zod';

import { VincentAuthenticatedRequest } from './types';
import * as jobManager from '../agenda/jobs/priceJobManager';
import * as setPriceManager from '../agenda/jobs/setPriceJobManager';
import { PriceLog } from '../mongo/models/PurchasedCoin';
import { delegateeSigner } from '../agenda/jobs/setPrice/utils/signer';

const CreateJobSchema = z.object({
  contractAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid contract address'),
  name: z.string().default('Price Fetcher'),
});

export const handleListJobsRoute = async (req: VincentAuthenticatedRequest, res: Response) => {
  const jobs = await jobManager.listPriceFetchJobs();
  res.json({ data: jobs.map((job) => job.toJson()), success: true });
};

export const handleCreateJobRoute = async (req: VincentAuthenticatedRequest, res: Response) => {
  const jobParams = CreateJobSchema.parse(req.body);
  const job = await jobManager.createPriceFetchJob(jobParams);
  res.status(201).json({ data: job.toJson(), success: true });
};

export const handleDeleteJobRoute = async (req: VincentAuthenticatedRequest, res: Response) => {
  const { jobId } = req.params;
  await jobManager.cancelPriceFetchJob(jobId);
  res.json({ success: true });
};

export const handleListPriceLogsRoute = async (req: VincentAuthenticatedRequest, res: Response) => {
  // Get last 100 price logs
  const logs = await PriceLog.find()
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();

  res.json({ data: logs, success: true });
};

export const handleCreateSetPriceJobRoute = async (req: VincentAuthenticatedRequest, res: Response) => {
  const { contractAddress, name, priceToSet } = req.body;

  // Construct abilityParams to pass into job
  const abilityParams = {
    newPrice: String(priceToSet),   // string is required
    oracleAddress: contractAddress,
    rpcUrl: process.env.SEPOLIA_RPC_URL,
    chainId: 11155111,             // replace with your chain ID
  };

  const job = await setPriceManager.createSetPriceJob({ 
    name,
    abilityParams,
  });

  res.status(201).json({ data: job.toJson(), success: true });
};




export const handleListSetPriceJobsRoute = async (_req: VincentAuthenticatedRequest, res: Response) => {
  const jobs = await setPriceManager.listSetPriceJobs();
  res.json({ data: jobs.map((j) => j.toJson()), success: true });
};

export const handleDeleteSetPriceJobRoute = async (req: VincentAuthenticatedRequest, res: Response) => {
  const { jobId } = req.params;
  await setPriceManager.cancelSetPriceJob(jobId);
  res.json({ success: true });
};
