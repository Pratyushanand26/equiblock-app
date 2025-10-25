import React, { useCallback, useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';

import { useBackend, PriceLog as PriceLogType, PriceFetchJob } from '@/hooks/useBackend';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Spinner } from '@/components/ui/spinner';

export const PriceLogs: React.FC = () => {
  const [logs, setLogs] = useState<PriceLogType[]>([]);
  const [jobs, setJobs] = useState<PriceFetchJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { getPriceLogs, getJobs, deleteJob } = useBackend();

  const fetchData = useCallback(async () => {
    try {
      const [logsData, jobsData] = await Promise.all([getPriceLogs(), getJobs()]);
      setLogs(logsData);
      setJobs(jobsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [getPriceLogs, getJobs]);

  useEffect(() => {
    fetchData();
    // Refresh every 5 seconds to see new prices
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleDeleteJob = async (jobId: string) => {
    try {
      await deleteJob(jobId);
      setJobs(jobs.filter((j) => j._id !== jobId));
    } catch (error) {
      console.error('Error deleting job:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Active Jobs */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Active Price Fetch Jobs</h3>
        {jobs.length === 0 ? (
          <p className="text-sm text-gray-500">No active jobs. Start one from the backend.</p>
        ) : (
          <div className="space-y-2">
            {jobs.map((job) => (
              <div key={job._id} className="flex justify-between items-center p-3 border rounded">
                <div>
                  <p className="font-medium">{job.data.name}</p>
                  <p className="text-xs text-gray-500">{job.data.contractAddress}</p>
                </div>
                <Button variant="destructive" size="sm" onClick={() => handleDeleteJob(job._id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Price Logs Table */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Price History</h3>
        {logs.length === 0 ? (
          <p className="text-sm text-gray-500">No price logs yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Block Number</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log._id}>
                  <TableCell>{new Date(log.createdAt).toLocaleString()}</TableCell>
                  <TableCell className="font-mono">{log.price}</TableCell>
                  <TableCell>{log.blockNumber}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
};