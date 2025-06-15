import React, { useState, useEffect } from 'react';
import storage from '../lib/storage';
import MetricCard from './ui/MetricCard';
import AnimatedCard from './ui/AnimatedCard';
import FinancialChart from './charts/FinancialChart';

const Dashboard = () => {
  const [metrics, setMetrics] = useState({
    totalSales: 0,
    totalExpenses: 0,
    totalDebts: 0,
    profit: 0,
    loading: true,
    chartDataSalesExpenses: [],
    chartDataExpensesByCategory: []
  });

  const [timeRange, setTimeRange] = useState('monthly'); // 'weekly', 'monthly', 'range'
  const [customDateRange, setCustomDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const allSales = await storage.getRecords('sales');
        const allExpenses = await storage.getRecords('expenses');
        const allDebts = await storage.getRecords('debts');

        let filteredSales = allSales;
        let filteredExpenses = allExpenses;
        let filteredDebts = allDebts;

        const now = new Date();
        let startDateFilter = null;
        let endDateFilter = null;

        if (timeRange === 'weekly') {
          startDateFilter = new Date(now.setDate(now.getDate() - 7));
        } else if (timeRange === 'monthly') {
          startDateFilter = new Date(now.setMonth(now.getMonth() - 1));
        } else if (timeRange === 'range' && customDateRange.startDate && customDateRange.endDate) {
          startDateFilter = new Date(customDateRange.startDate);
          endDateFilter = new Date(customDateRange.endDate);
        } else if (timeRange === 'all') {
          // No filter
        }

        if (startDateFilter) {
          filteredSales = filteredSales.filter(s => new Date(s.date) >= startDateFilter);
          filteredExpenses = filteredExpenses.filter(e => new Date(e.date) >= startDateFilter);
          filteredDebts = filteredDebts.filter(d => new Date(d.date) >= startDateFilter);
        }
        if (endDateFilter) {
          filteredSales = filteredSales.filter(s => new Date(s.date) <= endDateFilter);
          filteredExpenses = filteredExpenses.filter(e => new Date(e.date) <= endDateFilter);
          filteredDebts = filteredDebts.filter(d => new Date(d.date) <= endDateFilter);
        }

        const totalSales = filteredSales.reduce((sum, sale) => sum + (parseFloat(sale.amount) || 0), 0);
        const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);
        const totalDebts = filteredDebts.reduce((sum, debt) => sum + (parseFloat(debt.remaining) || 0), 0);

        // Datos para el gráfico de ventas vs gastos (ejemplo simple por mes)
        const monthlySales = {};
        filteredSales.forEach(sale => {
          const month = new Date(sale.date).toLocaleString('es-MX', { month: 'short', year: '2-digit' });
          monthlySales[month] = (monthlySales[month] || 0) + parseFloat(sale.amount || 0);
        });

        const monthlyExpenses = {};
        filteredExpenses.forEach(exp => {
          const month = new Date(exp.date).toLocaleString('es-MX', { month: 'short', year: '2-digit' });
          monthlyExpenses[month] = (monthlyExpenses[month] || 0) + parseFloat(exp.amount || 0);
        });

        const chartDataSalesExpenses = Object.keys({ ...monthlySales, ...monthlyExpenses }).map(month => ({
          label: month,
          sales: monthlySales[month] || 0,
          expenses: monthlyExpenses[month] || 0
        }));

        // Datos para el gráfico de gastos por categoría
        const expensesByCategory = {};
        filteredExpenses.forEach(exp => {
          expensesByCategory[exp.category] = (expensesByCategory[exp.category] || 0) + parseFloat(exp.amount || 0);
        });

        const chartDataExpensesByCategory = Object.keys(expensesByCategory).map(category => ({
          label: category,
          value: expensesByCategory[category]
        }));

        setMetrics({
          totalSales,
          totalExpenses,
          totalDebts,
          profit: totalSales - totalExpenses,
          loading: false,
          chartDataSalesExpenses,
          chartDataExpensesByCategory
        });
      } catch (error) {
        console.error('Error al cargar datos del dashboard:', error);
        setMetrics(prev => ({ ...prev, loading: false }));
      }
    };

    loadData();
  }, [timeRange, customDateRange]);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Filtro de Tiempo</h2>
        <div className="flex flex-wrap gap-4 items-center">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
          >
            <option value="weekly">Últimos 7 días</option>
            <option value="monthly">Últimos 30 días</option>
            <option value="all">Todo el tiempo</option>
            <option value="range">Rango personalizado</option>
          </select>

          {timeRange === 'range' && (
            <>
              <input
                type="date"
                value={customDateRange.startDate}
                onChange={(e) => setCustomDateRange({...customDateRange, startDate: e.target.value})}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
              />
              <input
                type="date"
                value={customDateRange.endDate}
                onChange={(e) => setCustomDateRange({...customDateRange, endDate: e.target.value})}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
              />
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnimatedCard delay={100}>
          <MetricCard 
            title="Ventas Totales" 
            value={metrics.totalSales} 
            trend="up"
            icon="💰"
          />
        </AnimatedCard>
        
        <AnimatedCard delay={200}>
          <MetricCard 
            title="Gastos Totales" 
            value={metrics.totalExpenses} 
            trend="down"
            icon="💸"
          />
        </AnimatedCard>
        
        <AnimatedCard delay={300}>
          <MetricCard 
            title="Utilidad Neta" 
            value={metrics.profit} 
            trend={metrics.profit >= 0 ? "up" : "down"}
            icon="📊"
          />
        </AnimatedCard>
        
        <AnimatedCard delay={400}>
          <MetricCard 
            title="Deudas Pendientes" 
            value={metrics.totalDebts} 
            trend="neutral"
            icon="🧾"
          />
        </AnimatedCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnimatedCard delay={500}>
          <FinancialChart 
            title="Ventas vs Gastos Mensuales" 
            type="bar" 
            data={metrics.chartDataSalesExpenses}
          />
        </AnimatedCard>
        
        <AnimatedCard delay={600}>
          <FinancialChart 
            title="Gastos por Categoría" 
            type="pie" 
            data={metrics.chartDataExpensesByCategory}
          />
        </AnimatedCard>
      </div>
    </div>
  );
};

export default Dashboard;