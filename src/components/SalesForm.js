import React, { useState } from 'react';
import { sales } from '../mock/financeData';
import { formatCurrency } from '../utils/financeHelpers';

const SalesForm = () => {
  const [sale, setSale] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    description: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const newSale = {
      ...sale,
      id: Date.now(),
      amount: parseFloat(sale.amount)
    };
    sales.push(newSale);
    localStorage.setItem('sales', JSON.stringify(sales));
    setSale({...sale, amount: '', description: ''});
    alert('Venta registrada exitosamente!');
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-lg font-medium mb-4">Registrar Venta</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Fecha</label>
          <input
            type="date"
            value={sale.date}
            onChange={(e) => setSale({...sale, date: e.target.value})}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Monto</label>
          <input
            type="number"
            value={sale.amount}
            onChange={(e) => setSale({...sale, amount: e.target.value})}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Descripción</label>
          <textarea
            value={sale.description}
            onChange={(e) => setSale({...sale, description: e.target.value})}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black"
            rows={3}
          />
        </div>
        <button
          type="submit"
          className="w-full bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 transition-colors"
        >
          Registrar Venta
        </button>
      </form>
    </div>
  );
};

export default SalesForm;