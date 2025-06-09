import React from 'react';
import { formatCurrency } from '../../../utils/formatters';
import { TrendIndicator } from '../../ui';

const SummaryCard = ({ title, value, trend, icon }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
      <div className="flex justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-3xl font-semibold mt-2 dark:text-white">
            {formatCurrency(value)}
          </p>
          <TrendIndicator value={trend} />
        </div>
        <div className="h-12 w-12 bg-blue-50 dark:bg-blue-900 rounded-full flex items-center justify-center">
          {icon}
        </div>
      </div>
    </div>
  );
};

export const SummaryCards = ({ metrics }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <SummaryCard 
        title="Ventas Totales" 
        value={metrics.totalSales} 
        trend={metrics.salesTrend}
        icon={<DollarIcon />}
      />
      {/* Más cards */}
    </div>
  );
};