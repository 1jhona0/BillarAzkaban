import React, { useState, useEffect } from 'react';
import { formatCurrency } from '../utils/financeHelpers';
import { loadData, saveData } from '../utils/storage';

const SalesList = () => {
  const [sales, setSales] = useState([]);
  const [filter, setFilter] = useState({
    from: '',
    to: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    setSales(loadData('sales'));
  }, []);

  const filteredSales = sales.filter(sale => {
    if (filter.from && sale.date < filter.from) return false;
    if (filter.to && sale.date > filter.to) return false;
    return true;
  });

  const deleteSale = (id) => {
    const updatedSales = sales.filter(sale => sale.id !== id);
    setSales(updatedSales);
    saveData('sales', updatedSales);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">Historial de Ventas</h2>
        <div className="flex space-x-4">
          <input
            type="date"
            onChange={(e) => setFilter({...filter, from: e.target.value})}
            className="border rounded px-2 py-1"
          />
          <input
            type="date"
            value={filter.to}
            onChange={(e) => setFilter({...filter, to: e.target.value})}
            className="border rounded px-2 py-1"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredSales.map(sale => (
              <tr key={sale.id}>
                <td className="px-6 py-4 whitespace-nowrap">{sale.date}</td>
                <td className="px-6 py-4 whitespace-nowrap">{formatCurrency(sale.amount)}</td>
                <td className="px-6 py-4">{sale.description}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button 
                    onClick={() => deleteSale(sale.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SalesList;