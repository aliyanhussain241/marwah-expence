export interface Transaction {
  id: string;
  date: string;
  productName: string;
  revenue: number;
  productCost: number;
  marketingCost: number;
  otherExpenses: number;
}

export interface ComputedMetrics {
  totalRevenue: number;
  totalProductCost: number;
  totalMarketingCost: number;
  totalOtherExpenses: number;
  totalCosts: number;
  netProfit: number;
  marketingROI: number;
  profitStatus: 'Profit' | 'Loss' | 'Break-Even';
  breakEvenPoint: number; // Simplified: Fixed Cost / (Price - Var Cost) - roughly estimated here as % of revenue needed to cover costs
}

export interface MonthlyData {
  name: string; // "Jan", "Feb" etc.
  revenue: number;
  costs: number;
  profit: number;
}

export interface ExpenseBreakdown {
  name: string;
  value: number;
}