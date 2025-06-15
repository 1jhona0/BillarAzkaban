import React, { useState, useEffect } from 'react';
import { formatCurrency } from '../utils/financeHelpers';
import { loadData, saveData } from '../utils/storage';

const ExpensesList = () => {
  const [expenses, setExpenses] = useState([]);
  const [filter, setFilter] = useState({
    from: '',
    to: new Date().toISOString().split('T')[0],
    category: ''
  });

  useEffect(() => {
    setExpenses(loadData('expenses'));
  }, []);

  const categories = ['', 'Suministros', 'Salarios', 'Servicios', 'Impuestos', 'Otros'];

  const filteredExpenses = expenses.filter(expense => {
    if (filter.from && expense.date < filter.from) return false;
    if (filter.to && expense.date > filter.to) return false;
    if (filter.category && expense.category !== filter.category) return false;
    return true;
  });

  const deleteExpense = (id) => {
    const updatedExpenses = expenses.filter(expense => expense.id !== id);
    setExpenses(updatedExpenses);
    saveData('expenses', updatedExpenses);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">Historial de Gastos</h2>
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
          <select
            value={filter.category}
            onChange={(e) => setFilter({...filter, category: e.target.value})}
            className="border rounded px-2 py-1"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat || 'Todas las categorías'}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabla similar a SalesList pero para gastos */}
    </div>
  );
};

export default ExpensesList;