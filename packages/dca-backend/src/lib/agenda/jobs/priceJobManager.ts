import consola from 'consola';
import * as fetchPriceJobDef from './fetchPrice';
import { getAgenda } from '../agendaClient';

const logger = consola.withTag('priceJobManager');

export async function createPriceFetchJob(data: {
  contractAddress: string;
  name: string;
}) {
  const agenda = getAgenda();

  // Create job that runs every 15 seconds
  const job = agenda.create<fetchPriceJobDef.JobParams>(fetchPriceJobDef.jobName, data);

  // Run every 15 seconds
  job.repeatEvery('15 seconds');

  await job.save();
  logger.log(`Created price fetch job ${job.attrs._id}`);

  return job;
}

export async function listPriceFetchJobs() {
  const agenda = getAgenda();
  return (await agenda.jobs({ name: fetchPriceJobDef.jobName })) as fetchPriceJobDef.JobType[];
}

export async function cancelPriceFetchJob(jobId: string) {
  const agenda = getAgenda();
  logger.log(`Cancelling price fetch job ${jobId}`);
  return agenda.cancel({ _id: jobId });
}