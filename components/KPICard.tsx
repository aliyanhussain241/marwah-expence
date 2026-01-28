import React from 'react';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean; // true if good (green), false if bad (red)
  colorClass?: string;
}

export const KPICard: React.FC<KPICardProps> = ({ title, value, icon: Icon, trend, trendUp, colorClass = "bg-white" }) => {
  return (
    <div className={`${colorClass} rounded-xl shadow-sm p-6 border border-gray-100 transition-all hover:shadow-md`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-bold mt-1 text-gray-900">{value}</h3>
        </div>
        <div className={`p-3 rounded-full ${colorClass === 'bg-white' ? 'bg-blue-50 text-blue-600' : 'bg-white/20 text-white'}`}>
          <Icon size={24} />
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center text-sm">
          <span className={`font-semibold ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
            {trend}
          </span>
          <span className="text-gray-400 ml-2">vs last month</span>
        </div>
      )}
    </div>
  );
};