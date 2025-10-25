import * as Sentry from '@sentry/node';
import consola from 'consola';

import { createAgenda, getAgenda } from './agenda/agendaClient';
// import { executeDCASwapJobDef } from './agenda/jobs';
import { fetchPriceJobDef } from './agenda/jobs';
import { setPriceJobDef } from './agenda/jobs';



// Function to create and configure a new agenda instance
export async function startWorker() {
  await createAgenda();

  const agenda = getAgenda();

  // agenda.define(executeDCASwapJobDef.jobName, async (job: executeDCASwapJobDef.JobType) =>
  //   Sentry.withIsolationScope(async (scope) => {
  //     // TODO: add job-aware logic such as cool-downs in case of repeated failures here

  //     try {
  //       await executeDCASwapJobDef.processJob(job, scope);
  //     } catch (err) {
  //       scope.captureException(err);
  //       const error = err as Error;
  //       // If we get an error we know is non-transient (the user must fix the state), disable the job
  //       // The user can re-enable it after resolving the fatal error.
  //       if (
  //         error?.message?.includes('Not enough balance') ||
  //         error?.message?.includes('insufficient funds') ||
  //         error?.message?.includes('gas too low') ||
  //         error?.message?.includes('out of gas')
  //       ) {
  //         consola.log(`Disabling job due to fatal error: ${error.message}`);
  //         job.disable();
  //         await job.save();
  //         throw new Error(`DCA schedule disabled due to fatal error: ${error.message}`);
  //       }
  //       // Other errors just bubble up to the job doc
  //       throw err;
  //     } finally {
  //       Sentry.flush(2000);
  //     }
  //   })
  // );

  agenda.define(fetchPriceJobDef.jobName, async (job: fetchPriceJobDef.JobType) =>
  Sentry.withIsolationScope(async (scope) => {
    try {
      await fetchPriceJobDef.processJob(job, scope);
    } catch (err) {
      scope.captureException(err);
      throw err; // Let Agenda handle retries
    } finally {
      Sentry.flush(2000);
    }
  })
);

agenda.define(setPriceJobDef.jobName, async (job: setPriceJobDef.JobType) =>
  Sentry.withIsolationScope(async (scope) => {
    try {
      await setPriceJobDef.processJob(job, scope);
    } catch (err) {
      scope.captureException(err);
      throw err;
    } finally {
      Sentry.flush(2000);
    }
  })
);

  return agenda;
}
