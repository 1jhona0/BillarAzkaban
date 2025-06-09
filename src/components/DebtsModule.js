import React, { useState, useEffect } from 'react';
import { db } from '../lib/database';
import { formatCurrency, formatDate } from '../utils/formatters';

const DebtsModule = () => {
  const [debts, setDebts] = useState([]);
  const [newDebt, setNewDebt] = useState({
    client: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [newPayment, setNewPayment] = useState({
    debtId: null,
    amount: '',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    const loadDebts = async () => {
      const debtsData = await db.getRecords('DEBTS');
      setDebts(debtsData);
    };
    loadDebts();
  }, []);

  const handleAddDebt = async (e) => {
    e.preventDefault();
    try {
      const debt = {
        ...newDebt,
        amount: parseFloat(newDebt.amount),
        remaining: parseFloat(newDebt.amount),
        payments: []
      };
      await db.addRecord('DEBTS', debt);
      setDebts([...debts, { ...debt, id: Date.now() }]);
      setNewDebt({
        client: '',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
      });
    } catch (error) {
      console.error('Error saving debt:', error);
    }
  };

  const handleAddPayment = async (e) => {
    e.preventDefault();
    try {
      const payment = {
        amount: parseFloat(newPayment.amount),
        date: newPayment.date
      };
      
      const updatedDebts = debts.map(debt => {
        if (debt.id === newPayment.debtId) {
          return {
            ...debt,
            payments: [...debt.payments, payment],
            remaining: debt.remaining - payment.amount
          };
        }
        return debt;
      });

      await db.addRecord('DEBTS', updatedDebts.find(d => d.id === newPayment.debtId));
      setDebts(updatedDebts);
      setNewPayment({
        debtId: null,
        amount: '',
        date: new Date().toISOString().split('T')[0]
      });
    } catch (error) {
      console.error('Error saving payment:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-4 dark:text-white">Registrar Nueva Deuda</h2>
        <form onSubmit={handleAddDebt} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cliente</label>
              <input
                type="text"
                value={newDebt.client}
                onChange={(e) => setNewDebt({...newDebt, client: e.target.value})}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Monto</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={newDebt.amount}
                onChange={(e) => setNewDebt({...newDebt, amount: e.target.value})}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha</label>
              <input
                type="date"
                value={newDebt.date}
                onChange={(e) => setNewDebt({...newDebt, date: e.target.value})}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción</label>
            <textarea
              value={newDebt.description}
              onChange={(e) => setNewDebt({...newDebt, description: e.target.value})}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              rows={3}
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Registrar Deuda
          </button>
        </form>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-4 dark:text-white">Registrar Pago</h2>
        <form onSubmit={handleAddPayment} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Deuda</label>
              <select
                value={newPayment.debtId || ''}
                onChange={(e) => setNewPayment({...newPayment, debtId: e.target.value ? parseInt(e.target.value) : null})}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              >
                <option value="">Seleccionar deuda</option>
                {debts.filter(d => d.remaining > 0).map(debt => (
                  <option key={debt.id} value={debt.id}>
                    {debt.client} - {formatCurrency(debt.remaining)} pendiente
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Monto</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={newPayment.amount}
                onChange={(e) => setNewPayment({...newPayment, amount: e.target.value})}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha</label>
              <input
                type="date"
                value={newPayment.date}
                onChange={(e) => setNewPayment({...newPayment, date: e.target.value})}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            disabled={!newPayment.debtId}
          >
            Registrar Pago
          </button>
        </form>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-4 dark:text-white">Historial de Deudas</h2>
        <div className="space-y-4">
          {debts.map(debt => (
            <div key={debt.id} className="border rounded-lg p-4 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium dark:text-white">{debt.client}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{debt.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold dark:text-white">{formatCurrency(debt.amount)}</p>
                  <p className={`text-sm ${debt.remaining > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {debt.remaining > 0 ? `${formatCurrency(debt.remaining)} pendiente` : 'Pagado completo'}
                  </p>
                </div>
              </div>
              
              {debt.payments.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2 dark:text-white">Pagos realizados:</h4>
                  <div className="space-y-2">
                    {debt.payments.map((payment, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                        <span className="text-sm dark:text-gray-300">{formatDate(payment.date)}</span>
                        <span className="text-sm font-medium dark:text-white">{formatCurrency(payment.amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DebtsModule;


// DONE