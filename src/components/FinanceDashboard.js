import React from 'react';
import { sales, expenses, debts } from '../mock/financeData';
import { formatCurrency, calculateTotals } from '../utils/financeHelpers';

const FinanceDashboard = () => {
  const totalSales = calculateTotals(sales);
  const totalExpenses = calculateTotals(expenses);
  const totalDebts = debts.reduce((sum, debt) => sum + debt.remaining, 0);
  const profit = totalSales - totalExpenses;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-500">Ventas Totales</h3>
          <p className="text-3xl font-bold">{formatCurrency(totalSales)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-500">Gastos Totales</h3>
          <p className="text-3xl font-bold text-red-600">-{formatCurrency(totalExpenses)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-500">Utilidad</h3>
          <p className={`text-3xl font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(profit)}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-500">Deudas Pendientes</h3>
          <p className="text-3xl font-bold text-yellow-600">{formatCurrency(totalDebts)}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-medium mb-4">Resumen Mensual</h2>
        {/* Aquí irían los gráficos */}
        <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
          <p className="text-gray-500">Gráfico de ventas vs gastos por mes</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium mb-4">Últimas Ventas</h2>
          {/* Lista de últimas ventas */}
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium mb-4">Gastos por Categoría</h2>
          {/* Gráfico de gastos por categoría */}
        </div>
      </div>
    </div>
  );
};

export default FinanceDashboard;