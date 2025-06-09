import React, { useState } from 'react';
import { debts } from '../mock/financeData';
import { formatCurrency } from '../utils/financeHelpers';

const DebtManager = () => {
  const [debt, setDebt] = useState({
    client: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  const [payment, setPayment] = useState({
    amount: '',
    date: new Date().toISOString().split('T')[0],
    debtId: null
  });

  const handleAddDebt = (e) => {
    e.preventDefault();
    const newDebt = {
      ...debt,
      id: Date.now(),
      amount: parseFloat(debt.amount),
      payments: [],
      remaining: parseFloat(debt.amount)
    };
    debts.push(newDebt);
    localStorage.setItem('debts', JSON.stringify(debts));
    setDebt({...debt, client: '', amount: '', description: ''});
    alert('Deuda registrada exitosamente!');
  };

  const handleAddPayment = (e) => {
    e.preventDefault();
    const debtIndex = debts.findIndex(d => d.id === payment.debtId);
    if (debtIndex !== -1) {
      const paymentAmount = parseFloat(payment.amount);
      debts[debtIndex].payments.push({
        ...payment,
        id: Date.now(),
        amount: paymentAmount
      });
      debts[debtIndex].remaining -= paymentAmount;
      localStorage.setItem('debts', JSON.stringify(debts));
      setPayment({...payment, amount: '', debtId: null});
      alert('Pago registrado exitosamente!');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-medium mb-4">Registrar Deuda</h2>
        <form onSubmit={handleAddDebt} className="space-y-4">
          {/* Formulario de deuda similar a los anteriores */}
        </form>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-medium mb-4">Registrar Pago</h2>
        <form onSubmit={handleAddPayment} className="space-y-4">
          {/* Formulario de pago */}
        </form>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-medium mb-4">Lista de Deudas</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pagado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pendiente</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {debts.map(debt => (
                <tr key={debt.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{debt.client}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{formatCurrency(debt.amount)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{formatCurrency(debt.amount - debt.remaining)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{formatCurrency(debt.remaining)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DebtManager;