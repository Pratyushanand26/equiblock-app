import { fetchPriceJob } from './fetchPrice';

import type { JobType, JobParams } from './fetchPrice';

export const jobName = 'fetch-price';
export const processJob = fetchPriceJob;
export type { JobType, JobParams };