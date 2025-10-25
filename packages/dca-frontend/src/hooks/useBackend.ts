import { useCallback } from 'react';

import { useJwtContext, useVincentWebAuthClient } from '@lit-protocol/vincent-app-sdk/react';

import { env } from '@/config/env';

const { VITE_APP_ID, VITE_BACKEND_URL, VITE_REDIRECT_URI } = env;

type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export type DCA = {
  lastRunAt: string;
  nextRunAt: string;
  lastFinishedAt: string;
  failedAt: string;
  _id: string;
  disabled: boolean;
  failReason: string;
  data: {
    name: string;
    purchaseAmount: number;
    purchaseIntervalHuman: string;
    vincentAppVersion: number;
    pkpInfo: {
      ethAddress: string;
      publicKey: string;
      tokenId: string;
    };
    updatedAt: string;
  };
};

export type PriceFetchJob = {
  _id: string;
  name: string;
  data: {
    contractAddress: string;
    name: string;
  };
  nextRunAt: string;
  lastRunAt: string;
};

export type PriceLog = {
  _id: string;
  price: string;
  blockNumber: number;
  transactionHash: string | null;
  createdAt: string;
  updatedAt: string;
};

export interface CreateDCARequest {
  name: string;
  purchaseAmount: string;
  purchaseIntervalHuman: string;
}

export const useBackend = () => {
  const { authInfo } = useJwtContext();
  const vincentWebAuthClient = useVincentWebAuthClient(VITE_APP_ID);

  const getJwt = useCallback(() => {
    // Redirect to Vincent Auth consent page with appId and version
    vincentWebAuthClient.redirectToConnectPage({
      // consentPageUrl: `http://localhost:3000/`,
      redirectUri: VITE_REDIRECT_URI,
    });
  }, [vincentWebAuthClient]);

  const sendRequest = useCallback(
    async <T>(endpoint: string, method: HTTPMethod, body?: unknown): Promise<T> => {
      if (!authInfo?.jwt) {
        throw new Error('No JWT to query backend');
      }

      const headers: HeadersInit = {
        Authorization: `Bearer ${authInfo.jwt}`,
      };
      if (body != null) {
        headers['Content-Type'] = 'application/json';
      }

      const response = await fetch(`${VITE_BACKEND_URL}${endpoint}`, {
        method,
        headers,
        ...(body ? { body: JSON.stringify(body) } : {}),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const json = (await response.json()) as { data: T; success: boolean };

      if (!json.success) {
        throw new Error(`Backend error: ${json.data}`);
      }

      return json.data;
    },
    [authInfo]
  );
const createJob = useCallback(async (data: { contractAddress: string; name: string }) => {
  return sendRequest<PriceFetchJob>('/job', 'POST', data);
}, [sendRequest]);

const getJobs = useCallback(async () => {
  return sendRequest<PriceFetchJob[]>('/jobs', 'GET');
}, [sendRequest]);

const deleteJob = useCallback(async (jobId: string) => {
  return sendRequest<void>(`/jobs/${jobId}`, 'DELETE');
}, [sendRequest]);

const getPriceLogs = useCallback(async () => {
  return sendRequest<PriceLog[]>('/price-logs', 'GET');
}, [sendRequest]);

return {
  createJob,
  deleteJob,
  getJobs,
  getPriceLogs,
  getJwt,
};
  

 
};
