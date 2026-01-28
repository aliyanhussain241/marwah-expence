import React, { useState, useMemo, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Banknote, 
  TrendingUp, 
  TrendingDown, 
  PieChart as PieIcon, 
  Activity,
  BrainCircuit,
  Download
} from 'lucide-react';
import { Transaction, ComputedMetrics, MonthlyData, ExpenseBreakdown } from './types';
import { KPICard } from './components/KPICard';
import { DashboardCharts } from './components/DashboardCharts';
import { DataEntryTable } from './components/DataEntryTable';
import { generateBusinessInsights } from './services/geminiService';

// Initial Mock Data (Scaled for PKR)
const INITIAL_DATA: Transaction[] = [
  { id: '1', date: '2024-01-15', productName: 'Consulting Service A', revenue: 500000, productCost: 50000, marketingCost: 120000, otherExpenses: 30000 },
  { id: '2', date: '2024-01-20', productName: 'Product Sales B', revenue: 320000, productCost: 180000, marketingCost: 40000, otherExpenses: 15000 },
  { id: '3', date: '2024-02-05', productName: 'Consulting Service A', revenue: 550000, productCost: 50000, marketingCost: 110000, otherExpenses: 35000 },
  { id: '4', date: '2024-02-18', productName: 'Product Sales C', revenue: 120000, productCost: 90000, marketingCost: 20000, otherExpenses: 5000 },
  { id: '5', date: '2024-03-10', productName: 'Premium Subscription', revenue: 800000, productCost: 100000, marketingCost: 250000, otherExpenses: 50000 },
  { id: '6', date: '2024-03-25', productName: 'Product Sales B', revenue: 410000, productCost: 200000, marketingCost: 60000, otherExpenses: 20000 },
];

const App: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_DATA);
  const [aiAnalysis, setAiAnalysis] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Compute Metrics
  const metrics = useMemo<ComputedMetrics>(() => {
    let totalRevenue = 0;
    let totalProductCost = 0;
    let totalMarketingCost = 0;
    let totalOtherExpenses = 0;

    transactions.forEach(t => {
      totalRevenue += t.revenue;
      totalProductCost += t.productCost;
      totalMarketingCost += t.marketingCost;
      totalOtherExpenses += t.otherExpenses;
    });

    const totalCosts = totalProductCost + totalMarketingCost + totalOtherExpenses;
    const netProfit = totalRevenue - totalCosts;
    const marketingROI = totalMarketingCost > 0 ? ((totalRevenue - totalMarketingCost) / totalMarketingCost) * 100 : 0;
    
    let profitStatus: 'Profit' | 'Loss' | 'Break-Even' = 'Break-Even';
    if (netProfit > 0) profitStatus = 'Profit';
    if (netProfit < 0) profitStatus = 'Loss';

    // Simplified Break Even for Display
    const breakEvenPoint = totalCosts; 

    return {
      totalRevenue,
      totalProductCost,
      totalMarketingCost,
      totalOtherExpenses,
      totalCosts,
      netProfit,
      marketingROI,
      profitStatus,
      breakEvenPoint
    };
  }, [transactions]);

  // Aggregate for Charts
  const monthlyData = useMemo<MonthlyData[]>(() => {
    const map = new Map<string, { revenue: number, costs: number, profit: number }>();

    transactions.forEach(t => {
      const date = new Date(t.date);
      const month = date.toLocaleString('default', { month: 'short' }); // Jan, Feb...
      
      if (!map.has(month)) {
        map.set(month, { revenue: 0, costs: 0, profit: 0 });
      }
      
      const current = map.get(month)!;
      const tCost = t.productCost + t.marketingCost + t.otherExpenses;
      
      current.revenue += t.revenue;
      current.costs += tCost;
      current.profit += (t.revenue - tCost);
    });

    const monthsOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return Array.from(map.entries()).map(([name, data]) => ({
      name,
      ...data
    })).sort((a, b) => monthsOrder.indexOf(a.name) - monthsOrder.indexOf(b.name));
  }, [transactions]);

  const expenseBreakdown = useMemo<ExpenseBreakdown[]>(() => [
    { name: 'Product Cost', value: metrics.totalProductCost },
    { name: 'Marketing', value: metrics.totalMarketingCost },
    { name: 'Operations/Other', value: metrics.totalOtherExpenses },
  ].filter(i => i.value > 0), [metrics]);


  const handleAiAnalysis = async () => {
    setIsAnalyzing(true);
    const result = await generateBusinessInsights(transactions, metrics);
    setAiAnalysis(result);
    setIsAnalyzing(false);
  };

  const formatPKR = (amount: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const statusColor = 
    metrics.profitStatus === 'Profit' ? 'bg-green-500' : 
    metrics.profitStatus === 'Loss' ? 'bg-red-500' : 'bg-yellow-500';

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-green-600 p-2 rounded-lg">
              <LayoutDashboard className="text-white h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">BizAnalytics Pro</h1>
              <p className="text-xs text-gray-500">Google Looker Studio Simulator (PKR Edition)</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <button 
              onClick={handleAiAnalysis}
              disabled={isAnalyzing}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg shadow hover:shadow-lg transition-all disabled:opacity-50 text-sm font-medium"
             >
               <BrainCircuit size={18} />
               {isAnalyzing ? "Analyzing..." : "Ask AI Analyst"}
             </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* KPI Scorecards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KPICard 
            title="Total Revenue" 
            value={formatPKR(metrics.totalRevenue)} 
            icon={Banknote} 
            colorClass="bg-white"
            trend="+12.5%" 
            trendUp={true}
          />
           <KPICard 
            title="Total Costs" 
            value={formatPKR(metrics.totalCosts)} 
            icon={TrendingDown}
             colorClass="bg-white"
             trend="+5.2%"
             trendUp={false} // Cost going up is bad
          />
           <KPICard 
            title="Net Profit" 
            value={formatPKR(metrics.netProfit)} 
            icon={TrendingUp} 
            colorClass={metrics.profitStatus === 'Profit' ? 'bg-green-50 border-green-200' : metrics.profitStatus === 'Loss' ? 'bg-red-50 border-red-200' : 'bg-yellow-50'}
            trend={metrics.profitStatus}
            trendUp={metrics.profitStatus === 'Profit'}
          />
           <KPICard 
            title="Marketing ROI" 
            value={`${metrics.marketingROI.toFixed(1)}%`} 
            icon={PieIcon} 
            colorClass="bg-white"
            trend={metrics.marketingROI > 100 ? "Healthy" : "Low"}
            trendUp={metrics.marketingROI > 100}
          />
        </div>

        {/* AI Insights Section */}
        {aiAnalysis && (
          <div className="mb-8 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100 shadow-sm">
             <div className="flex items-center gap-2 mb-4">
                <BrainCircuit className="text-indigo-600" />
                <h3 className="text-lg font-bold text-indigo-900">AI Business Insights (Pakistan Market)</h3>
             </div>
             <div className="prose prose-indigo max-w-none text-gray-700 text-sm">
               <div dangerouslySetInnerHTML={{ __html: aiAnalysis.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br />') }} />
             </div>
          </div>
        )}

        {/* Charts Section */}
        <DashboardCharts monthlyData={monthlyData} expenseBreakdown={expenseBreakdown} />

        {/* Data Entry Section */}
        <div className="mt-8">
          <DataEntryTable data={transactions} onUpdate={setTransactions} />
        </div>

      </main>
    </div>
  );
};

export default App;