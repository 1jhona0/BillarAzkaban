import React, { useState, useEffect } from 'react';
import { formatCurrency } from '../utils/financeHelpers';
import { loadData, saveData } from '../utils/storage';
import DebtDetails from './DebtDetails';

const DebtManager = () => {
  const [debts, setDebts] = useState([]);
  const [newDebt, setNewDebt] = useState({
    client: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [selectedDebt, setSelectedDebt] = useState(null);

  useEffect(() => {
    setDebts(loadData('debts'));
  }, []);

  const handleAddDebt = (e) => {
    e.preventDefault();
    const debt = {
      ...newDebt,
      id: Date.now(),
      amount: parseFloat(newDebt.amount),
      remaining: parseFloat(newDebt.amount),
      payments: []
    };
    const updatedDebts = [...debts, debt];
    setDebts(updatedDebts);
    saveData('debts', updatedDebts);
    setNewDebt({
      client: '',
      amount: '',
      description: '',
      date: new Date().toISOString().split('T')[0]
    });
  };

  const handleAddPayment = (debtId, amount, date) => {
    const updatedDebts = debts.map(debt => {
      if (debt.id === debtId) {
        const payment = { id: Date.now(), amount, date };
        return {
          ...debt,
          payments: [...debt.payments, payment],
          remaining: debt.remaining - amount
        };
      }
      return debt;
    });
    setDebts(updatedDebts);
    saveData('debts', updatedDebts);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-medium mb-4">Registrar Nueva Deuda</h2>
        <form onSubmit={handleAddDebt} className="space-y-4">
          {/* Formulario similar a los anteriores */}
        </form>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-medium mb-4">Deudas Activas</h2>
        <div className="space-y-4">
          {debts.filter(d => d.remaining > 0).map(debt => (
            <div key={debt.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">{debt.client}</h3>
                  <p className="text-sm text-gray-600">{debt.description}</p>
                </div>
                <button
                  onClick={() => setSelectedDebt(selectedDebt?.id === debt.id ? null : debt)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  {selectedDebt?.id === debt.id ? 'Ocultar' : 'Ver detalles'}
                </button>
              </div>
              {selectedDebt?.id === debt.id && (
                <DebtDetails 
                  debt={debt} 
                  onAddPayment={handleAddPayment} 
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DebtManager;