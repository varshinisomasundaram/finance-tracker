import { useState } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { InfoCallout } from '@/components/ui/info-callout'
import { LearnSection } from './investments/LearnSection'
import { StockReferenceTable } from './investments/StockReferenceTable'
import { MutualFundTable } from './investments/MutualFundTable'
import { indianStocks } from '@/data/indian-stocks'
import { usStocks } from '@/data/us-stocks'
import { mutualFunds } from '@/data/mutual-funds'

type SubTab = 'learn' | 'indian-stocks' | 'us-stocks' | 'mutual-funds'

export function InvestmentsTab() {
  const [tab, setTab] = useState<SubTab>('learn')

  return (
    <div className="space-y-6">
      <InfoCallout
        title="Investment Reference & Learning"
        description="Understand key stock valuation metrics before you invest. Learn formulas like Book Value, P/B, P/E, and ROE with real Indian examples, then browse popular stocks and mutual funds."
        examples={['Book Value = Assets - Liabilities', 'P/B < 1 = Undervalued', 'ROE > 15% = Efficient', 'SBI P/B 1.4 vs HDFC P/B 2.2']}
      />

      <Tabs value={tab} onValueChange={(v) => setTab(v as SubTab)}>
        <TabsList>
          <TabsTrigger value="learn">Learn Formulas</TabsTrigger>
          <TabsTrigger value="indian-stocks">Indian Stocks</TabsTrigger>
          <TabsTrigger value="us-stocks">US Stocks</TabsTrigger>
          <TabsTrigger value="mutual-funds">Mutual Funds</TabsTrigger>
        </TabsList>

        <TabsContent value="learn" className="mt-4">
          <LearnSection />
        </TabsContent>

        <TabsContent value="indian-stocks" className="mt-4">
          <StockReferenceTable data={indianStocks} title="Indian Stocks (Nifty 50)" />
        </TabsContent>

        <TabsContent value="us-stocks" className="mt-4">
          <StockReferenceTable data={usStocks} title="US Stocks (S&P 500)" />
        </TabsContent>

        <TabsContent value="mutual-funds" className="mt-4">
          <MutualFundTable data={mutualFunds} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
