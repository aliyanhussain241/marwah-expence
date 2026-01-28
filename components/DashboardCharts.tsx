import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { ExpenseBreakdown, MonthlyData } from '../types';

interface DashboardChartsProps {
  monthlyData: MonthlyData[];
  expenseBreakdown: ExpenseBreakdown[];
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];
const PIE_COLORS = ['#EF4444', '#F59E0B', '#6366F1']; // Product, Marketing, Other

const formatPKR = (value: number) => {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
  return value.toString();
};

const tooltipFormatter = (value: number) => `PKR ${value.toLocaleString()}`;

export const DashboardCharts: React.FC<DashboardChartsProps> = ({ monthlyData, expenseBreakdown }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Monthly Performance Line Chart */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Monthly Performance (Revenue vs Profit)</h3>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" tickFormatter={formatPKR} />
              <Tooltip 
                formatter={tooltipFormatter}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
              />
              <Legend />
              <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="profit" name="Net Profit" stroke="#10B981" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Expenses vs Revenue Bar Chart */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Revenue vs Costs Comparison</h3>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" tickFormatter={formatPKR} />
              <Tooltip 
                cursor={{ fill: '#F3F4F6' }} 
                formatter={tooltipFormatter}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} 
              />
              <Legend />
              <Bar dataKey="revenue" name="Revenue" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="costs" name="Total Costs" fill="#EF4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Cost Breakdown Pie Chart */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-1">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Cost Structure Breakdown</h3>
        <div className="h-72 w-full flex justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={expenseBreakdown}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {expenseBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={tooltipFormatter} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      
       {/* Break Even Visualization (Simple Gauge Concept) */}
       <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-1 flex flex-col justify-center items-center">
        <h3 className="text-lg font-semibold text-gray-800 mb-2 w-full text-left">Profitability Indicator</h3>
        <p className="text-sm text-gray-500 mb-6 w-full text-left">Visual representation of profit vs loss zones.</p>
        
        <div className="relative w-full h-12 bg-gray-200 rounded-full overflow-hidden">
          {/* Loss Zone */}
          <div className="absolute left-0 top-0 h-full bg-red-400 w-1/2 flex items-center justify-center text-xs font-bold text-white opacity-80">
            LOSS
          </div>
          {/* Profit Zone */}
          <div className="absolute right-0 top-0 h-full bg-green-400 w-1/2 flex items-center justify-center text-xs font-bold text-white opacity-80">
            PROFIT
          </div>
          {/* Break Even Marker */}
          <div className="absolute left-1/2 top-0 h-full w-1 bg-yellow-400 z-10 -ml-0.5"></div>
        </div>
        
        <div className="w-full mt-4">
           <div className="flex justify-between text-sm font-medium text-gray-600 mb-1">
             <span>Costs</span>
             <span>Revenue</span>
           </div>
           {/* Simple Progress Bar comparing Revenue to Costs */}
           {(() => {
             const totalRev = monthlyData.reduce((acc, curr) => acc + curr.revenue, 0);
             const totalCost = monthlyData.reduce((acc, curr) => acc + curr.costs, 0);
             const maxVal = Math.max(totalRev, totalCost) * 1.2; // Scaling
             const costPct = (totalCost / maxVal) * 100;
             const revPct = (totalRev / maxVal) * 100;

             return (
               <div className="space-y-3">
                 <div>
                   <div className="flex justify-between text-xs mb-1">
                      <span>Total Costs</span>
                      <span>PKR {totalCost.toLocaleString()}</span>
                   </div>
                   <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div style={{ width: `${Math.min(costPct, 100)}%` }} className="h-full bg-red-500 rounded-full"></div>
                   </div>
                 </div>
                 <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Total Revenue</span>
                      <span>PKR {totalRev.toLocaleString()}</span>
                   </div>
                   <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div style={{ width: `${Math.min(revPct, 100)}%` }} className="h-full bg-blue-500 rounded-full"></div>
                   </div>
                 </div>
               </div>
             )
           })()}
        </div>
      </div>
    </div>
  );
};