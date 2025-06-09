import React, { useState } from 'react';
import { useDebts } from '../../hooks/useDebts';
import { DebtForm, PaymentHistory, DebtStatus } from './components';

const DebtManagement = () => {
  const { debts, addDebt, addPayment } = useDebts();
  const [selectedDebt, setSelectedDebt] = useState(null);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DebtForm onSubmit={addDebt} />
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <DebtStatus debts={debts} />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4 dark:text-white">Deudas Activas</h3>
        <DebtsList 
          debts={debts.filter(d => d.remaining > 0)} 
          onSelect={setSelectedDebt}
        />
      </div>

      {selectedDebt && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <PaymentForm 
              debt={selectedDebt} 
              onSubmit={(payment) => addPayment(selectedDebt.id, payment)}
            />
          </div>
          <div>
            <PaymentHistory payments={selectedDebt.payments} />
          </div>
        </div>
      )}
    </div>
  );
};


// DONE