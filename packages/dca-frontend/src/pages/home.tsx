import React, { useState } from 'react';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { CreateDCA } from '@/components/create-dca';
import { ActiveDcas } from '@/components/active-dcas';
import { Wallet } from '@/components/wallet';
import { PageHeader } from '@/components/ui/page-header';
import { PriceLogs } from '@/components/price-logs';

// enum Tab {
//   CreateDCA = 'create-dca',
//   ActiveDCAs = 'active-dcas',
//   Wallet = 'wallet',
// }

enum Tab {
  PriceLogs = 'price-logs',
  Wallet = 'wallet',
}

export const Home: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.PriceLogs);

  return (
    <main className="relative px-4 sm:px-6 md:px-8 flex justify-center pt-8 sm:pt-16 md:pt-24 pb-8">
      <div className="w-full max-w-4xl mx-auto">
        <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 shadow-sm w-full">
          <PageHeader
            title="Vincent wBTC DCA Agent"
            subtitle="Automated Dollar-Cost Averaging"
            description={
              <>
                This app uses the Vincent platform to securely and verifiably execute dollar-cost
                averaging strategies for your crypto investments. Learn more about{' '}
                <a
                  href="https://docs.heyvincent.ai/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                  style={{ color: '#FF4205' }}
                >
                  Vincent
                </a>
                .
              </>
            }
          />

          <Tabs
            data-testid="dca-tabs"
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as Tab)}
            className="w-full items-stretch"
          >
            <TabsList
              className="mb-4 flex space-x-2 rounded-md p-2 w-full mt-6"
              style={{ backgroundColor: 'transparent' }}>
                <TabsTrigger value={Tab.PriceLogs} className="data-[state=active]:bg-[#FF4205]">Price Logs</TabsTrigger>
                <TabsTrigger value={Tab.Wallet} className="data-[state=active]:bg-[#FF4205]">Wallet</TabsTrigger>
            </TabsList>

            <div className="min-h-[300px] sm:min-h-[400px] md:min-h-[500px]">
              <TabsContent value={Tab.PriceLogs}>
                <PriceLogs />
              </TabsContent>
              <TabsContent value={Tab.Wallet}>
                <Wallet />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </main>
  );
};
