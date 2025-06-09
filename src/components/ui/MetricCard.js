import React from 'react';
import { formatCurrency } from '../../lib/utils';

const MetricCard = ({ title, value, trend = 'neutral', icon }) => {
  const trendConfig = {
    up: { color: 'text-green-600', icon: '↑' },
    down: { color: 'text-red-600', icon: '↓' },
    neutral: { color: 'text-blue-600', icon: '→' }
  };

  return (
    <div 
      className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow"
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className={`text-2xl font-semibold ${trendConfig[trend].color}`}>
            {formatCurrency(value)}
          </p>
        </div>
        <div className="flex items-center">
          <span className="text-gray-500 mr-1">{trendConfig[trend].icon}</span>
          {icon && (
            <span className="bg-blue-100 text-blue-600 p-2 rounded-lg">
              {icon}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MetricCard;