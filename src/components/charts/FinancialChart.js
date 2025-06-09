import React, { useState, useEffect } from 'react';
import { formatCurrency } from '../../lib/utils';
import Legend from './Legend';

const FinancialChart = ({ title, type, data = [] }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [chartDataProcessed, setChartDataProcessed] = useState([]);

  useEffect(() => {
    const processChartData = () => {
      if (type === 'bar') {
        // Para barras, esperamos un array de objetos con { label, sales, expenses }
        return data.map(item => ({
          label: item.label,
          sales: item.sales,
          expenses: item.expenses,
          salesColor: 'bg-blue-500',
          expensesColor: 'bg-red-500'
        }));
      } else if (type === 'pie') {
        // Para pastel, esperamos un array de objetos con { label, value }
        const colors = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500'];
        return data.map((item, index) => ({
          label: item.label,
          value: item.value,
          color: colors[index % colors.length]
        }));
      }
      return [];
    };

    setIsLoading(true);
    setTimeout(() => { // Simular carga
      setChartDataProcessed(processChartData());
      setIsLoading(false);
    }, 300);
  }, [type, data]);

  const maxValue = type === 'bar' 
    ? Math.max(...chartDataProcessed.flatMap(item => [item.sales, item.expenses]), 0)
    : Math.max(...chartDataProcessed.map(item => item.value), 0);

  const totalPieValue = chartDataProcessed.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
      <h3 className="text-lg font-medium mb-4 text-gray-800">{title}</h3>
      
      {isLoading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="animate-pulse flex space-x-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      ) : (
        <div className="relative h-64">
          {type === 'bar' ? (
            <div className="flex items-end h-full space-x-4">
              {chartDataProcessed.map((item, index) => (
                <div key={index} className="flex-1 flex flex-col items-center justify-end h-full">
                  <div className="flex w-full h-full items-end space-x-1">
                    <div 
                      className={`${item.salesColor} w-1/2 rounded-t transition-all duration-500`}
                      style={{ height: `${(item.sales / maxValue) * 100}%` }}
                    ></div>
                    <div 
                      className={`${item.expensesColor} w-1/2 rounded-t transition-all duration-500`}
                      style={{ height: `${(item.expenses / maxValue) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-xs mt-2 text-gray-600">{item.label}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="relative w-48 h-48 mx-auto">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                {chartDataProcessed.reduce((acc, item, index) => {
                  const percent = totalPieValue > 0 ? (item.value / totalPieValue) * 100 : 0;
                  let offset = acc.offset;
                  
                  // Ajustar el offset para que los segmentos se dibujen correctamente
                  if (index > 0) {
                    const prevPercent = totalPieValue > 0 ? (chartDataProcessed[index - 1].value / totalPieValue) * 100 : 0;
                    offset = acc.offset - prevPercent;
                  }
                  
                  return {
                    elements: [
                      ...acc.elements,
                      <circle
                        key={index}
                        cx="50"
                        cy="50"
                        r="40"
                        fill="transparent"
                        stroke="currentColor"
                        className={`${item.color}`}
                        strokeWidth="20"
                        strokeDasharray={`${percent} ${100 - percent}`}
                        strokeDashoffset={offset}
                        transform="rotate(-90 50 50)" // Iniciar desde arriba
                      />
                    ],
                    offset: offset // El offset para el siguiente segmento es el mismo
                  };
                }, { elements: [], offset: 0 }).elements}
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-lg font-medium text-gray-800">
                  {formatCurrency(totalPieValue)}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
      {type === 'pie' && !isLoading && (
        <Legend items={chartDataProcessed.map(item => ({
          label: item.label,
          color: item.color,
          percentage: totalPieValue > 0 ? ((item.value / totalPieValue) * 100).toFixed(1) : 0
        }))} />
      )}
      {type === 'bar' && !isLoading && (
        <div className="flex justify-center mt-4 space-x-4">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
            <span className="text-sm text-gray-600">Ventas</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
            <span className="text-sm text-gray-600">Gastos</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialChart;