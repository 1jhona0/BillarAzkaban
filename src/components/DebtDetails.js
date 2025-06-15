import React from 'react';
import { formatCurrency } from '../utils/financeHelpers';

const DebtDetails = ({ debt, onAddPayment }) => {
  const [payment, setPayment] = useState({
    amount: '',
    date: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (payment.amount > 0 && payment.amount <= debt.remaining) {
      onAddPayment(debt.id, parseFloat(payment.amount), payment.date);
      setPayment({ amount: '', date: new Date().toISOString().split('T')[0] });
    }
  };

  return (
    <div className="mt-6 bg-gray-50 p-4 rounded-lg">
      <h3 className="font-medium">Detalles de la deuda</h3>
      <div className="grid grid-cols-4 gap-4 mt-2">
        <div>
          <p className="text-sm text-gray-500">Monto total</p>
          <p>{formatCurrency(debt.amount)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Pagado</p>
          <p>{formatCurrency(debt.amount - debt.remaining)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Pendiente</p>
          <p className={debt.remaining > 0 ? 'text-red-600' : 'text-green-600'}>
            {formatCurrency(debt.remaining)}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Fecha</p>
          <p>{debt.date}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <div className="flex space-x-4">
          <input
            type="number"
            value={payment.amount}
            onChange={(e) => setPayment({...payment, amount: e.target.value})}
            placeholder="Monto a abonar"
            className="flex-1 border rounded px-3 py-2"
            step="0.01"
            min="0"
            max={debt.remaining}
          />
          <input
            type="date"
            value={payment.date}
            onChange={(e) => setPayment({...payment, date: e.target.value})}
            className="border rounded px-3 py-2"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          disabled={!payment.amount || payment.amount <= 0}
        >
          Registrar Pago
        </button>
      </form>

      {debt.payments.length > 0 && (
        <div className="mt-6">
          <h4 className="font-medium mb-2">Historial de Pagos</h4>
          <div className="space-y-2">
            {debt.payments.map(payment => (
              <div key={payment.id} className="flex justify-between items-center p-2 bg-white rounded">
                <span>{payment.date}</span>
                <span className="font-medium">{formatCurrency(payment.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DebtDetails;