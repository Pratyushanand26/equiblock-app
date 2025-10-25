// packages/dca-backend/src/lib/agenda/jobs/setPriceJobManager.ts
import consola from 'consola';
import * as setPriceJobDef from './setPrice';
import { getAgenda } from '../agendaClient';

const logger = consola.withTag('setPriceJobManager');

export async function createSetPriceJob(data: { contractAddress: string; name: string; priceToSet?: string }) {
  const agenda = getAgenda();
  const job = agenda.create<setPriceJobDef.JobParams>(setPriceJobDef.jobName, data);

  // Run every 1 minute
  job.repeatEvery('10 seconds');

  await job.save();
  logger.log(`Created set-price job ${job.attrs._id}`);
  return job;
}

export async function listSetPriceJobs() {
  const agenda = getAgenda();
  return (await agenda.jobs({ name: setPriceJobDef.jobName })) as setPriceJobDef.JobType[];
}

export async function cancelSetPriceJob(jobId: string) {
  const agenda = getAgenda();
  logger.log(`Cancelling set-price job ${jobId}`);
  return agenda.cancel({ _id: jobId });
}
