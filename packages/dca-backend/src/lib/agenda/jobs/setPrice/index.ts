// packages/dca-backend/src/lib/agenda/jobs/setPrice/index.ts
import { setPriceJob } from './setPrice';
import type { JobType, JobParams } from './setPrice';

export const jobName = 'set-price';
export const processJob = setPriceJob;
export type { JobType, JobParams };
