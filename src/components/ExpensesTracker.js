import React, { useState } from 'react';
import { expenses } from '../mock/financeData';
import { formatCurrency } from '../utils/financeHelpers';

const ExpensesTracker = () => {
  const [expense, setExpense] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    category: 'Suministros',
    description: ''
  });

  const categories = ['Suministros', 'Salarios', 'Servicios', 'Impuestos', 'Otros'];

  const handleSubmit = (e) => {
    e.preventDefault();
    const newExpense = {
      ...expense,
      id: Date.now(),
      amount: parseFloat(expense.amount)
    };
    expenses.push(newExpense);
    localStorage.setItem('expenses', JSON.stringify(expenses));
    setExpense({...expense, amount: '', description: ''});
    alert('Gasto registrado exitosamente!');
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-lg font-medium mb-4">Registrar Gasto</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Fecha</label>
          <input
            type="date"
            value={expense.date}
            onChange={(e) => setExpense({...expense, date: e.target.value})}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Categoría</label>
          <select
            value={expense.category}
            onChange={(e) => setExpense({...expense, category: e.target.value})}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black"
          >
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Monto</label>
          <input
            type="number"
            value={expense.amount}
            onChange={(e) => setExpense({...expense, amount: e.target.value})}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Descripción</label>
          <textarea
            value={expense.description}
            onChange={(e) => setExpense({...expense, description: e.target.value})}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black"
            rows={3}
          />
        </div>
        <button
          type="submit"
          className="w-full bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 transition-colors"
        >
          Registrar Gasto
        </button>
      </form>
    </div>
  );
};

export default ExpensesTracker;