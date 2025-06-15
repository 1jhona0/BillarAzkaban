import React from 'react';
import { formatCurrency } from '../utils/financeHelpers';
import { loadData } from '../utils/storage';
import FinanceCharts from './FinanceCharts';

const FinanceDashboard = () => {
  const sales = loadData('sales');
  const expenses = loadData('expenses');
  const debts = loadData('debts');

  const totalSales = sales.reduce((sum, sale) => sum + sale.amount, 0);
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const totalDebts = debts.reduce((sum, debt) => sum + debt.remaining, 0);
  const profit = totalSales - totalExpenses;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* KPIs actualizados para usar datos reales */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-500">Ventas Totales</h3>
          <p className="text-3xl font-bold">{formatCurrency(totalSales)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-500">Gastos Totales</h3>
          <p className="text-3xl font-bold text-red-600">-{formatCurrency(totalExpenses)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-500">Utilidad Neta</h3>
          <p className={`text-3xl font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(profit)}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-500">Deudas Pendientes</h3>
          <p className="text-3xl font-bold text-yellow-600">{formatCurrency(totalDebts)}</p>
        </div>
      </div>

      <FinanceCharts />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">Últimas Ventas</h3>
          {/* Lista condensada de últimas ventas */}
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">Gastos Recientes</h3>
          {/* Lista condensada de últimos gastos */}
        </div>
      </div>
    </div>
  );
};

export default FinanceDashboard;