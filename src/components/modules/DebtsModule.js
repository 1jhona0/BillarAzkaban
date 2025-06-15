import React, { useState, useEffect } from 'react';
import storage from '../../lib/storage';
import { formatCurrency, formatDate } from '../../lib/utils';
import AnimatedCard from '../ui/AnimatedCard';
import Modal from '../ui/Modal';
import Alert from '../ui/Alert';
import SearchInput from '../ui/SearchInput';

// Componente para el historial de un cliente/deudor
const ClientHistoryModal = ({ isOpen, onClose, clientName, clientDebts, allSales, allExpenses }) => {
  const clientSales = allSales.filter(sale => sale.client && sale.client.toLowerCase() === clientName.toLowerCase());
  const clientExpenses = allExpenses.filter(expense => expense.client && expense.client.toLowerCase() === clientName.toLowerCase()); // Asumiendo que los gastos también pueden asociarse a un cliente

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Historial de ${clientName}`}>
      <div className="space-y-6">
        {/* Sección de Deudas */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Deudas y Pagos</h3>
          {clientDebts.length > 0 ? (
            <div className="space-y-3">
              {clientDebts.map(debt => (
                <div key={debt.id} className="p-3 border border-gray-200 rounded-lg bg-gray-50">
                  <p className="font-medium text-gray-800">Deuda Original: {formatCurrency(debt.amount)}</p>
                  <p className="text-sm text-gray-600">Descripción Inicial: {debt.description}</p>
                  <p className="text-sm text-gray-600">Fecha de Inicio: {formatDate(debt.date)}</p>
                  <p className={`text-sm font-semibold ${debt.remaining > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    Pendiente: {formatCurrency(debt.remaining)}
                  </p>
                  
                  {debt.transactions && debt.transactions.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm font-medium text-gray-700">Movimientos:</p>
                      <ul className="list-disc list-inside text-sm text-gray-600">
                        {debt.transactions
                          .sort((a, b) => new Date(a.date) - new Date(b.date)) // Ordenar por fecha
                          .map((transaction, idx) => (
                          <li key={idx} className="mb-1">
                            <span className="font-semibold">
                              {transaction.type === 'payment' ? 'Pago' : 'Aumento'}:
                            </span> 
                            {formatCurrency(transaction.amount)} el {formatDate(transaction.date)}
                            {transaction.description && ` - ${transaction.description}`}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No hay deudas registradas para este cliente.</p>
          )}
        </div>

        {/* Sección de Ventas */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Ventas Realizadas</h3>
          {clientSales.length > 0 ? (
            <div className="space-y-3">
              {clientSales.map(sale => (
                <div key={sale.id} className="p-3 border border-gray-200 rounded-lg bg-gray-50">
                  <p className="font-medium text-gray-800">Venta: {formatCurrency(sale.amount)}</p>
                  <p className="text-sm text-gray-600">Descripción: {sale.description}</p>
                  <p className="text-sm text-gray-600">Fecha: {formatDate(sale.date)}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No hay ventas registradas para este cliente.</p>
          )}
        </div>

        {/* Sección de Gastos (si aplica) */}
        {/* <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Gastos Asociados</h3>
          {clientExpenses.length > 0 ? (
            <div className="space-y-3">
              {clientExpenses.map(expense => (
                <div key={expense.id} className="p-3 border border-gray-200 rounded-lg bg-gray-50">
                  <p className="font-medium text-gray-800">Gasto: {formatCurrency(expense.amount)}</p>
                  <p className="text-sm text-gray-600">Categoría: {expense.category}</p>
                  <p className="text-sm text-gray-600">Descripción: {expense.description}</p>
                  <p className="text-sm text-gray-600">Fecha: {formatDate(expense.date)}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No hay gastos asociados a este cliente.</p>
          )}
        </div> */}
      </div>
    </Modal>
  );
};


const DebtsModule = () => {
  const [debts, setDebts] = useState([]);
  const [allSales, setAllSales] = useState([]); // Para el historial de ventas del cliente
  const [allExpenses, setAllExpenses] = useState([]); // Para el historial de gastos del cliente

  const [isDebtModalOpen, setIsDebtModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isAddMoreDebtModalOpen, setIsAddMoreDebtModalOpen] = useState(false);
  const [isClientHistoryModalOpen, setIsClientHistoryModalOpen] = useState(false); 
  
  const [editingDebt, setEditingDebt] = useState(null);
  const [selectedClientForHistory, setSelectedClientForHistory] = useState(null); 
  
  const [alert, setAlert] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [debtFormData, setDebtFormData] = useState({
    client: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  const [paymentFormData, setPaymentFormData] = useState({
    debtId: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: '' 
  });

  const [addMoreDebtFormData, setAddMoreDebtFormData] = useState({
    debtId: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    const loadData = async () => {
      const debtsData = await storage.getRecords('debts');
      const salesData = await storage.getRecords('sales');
      const expensesData = await storage.getRecords('expenses');
      setDebts(debtsData);
      setAllSales(salesData);
      setAllExpenses(expensesData);
    };
    loadData();
  }, []);

  const handleOpenDebtModal = (debt = null) => {
    setEditingDebt(debt);
    if (debt) {
      setDebtFormData({
        client: debt.client,
        amount: debt.amount,
        description: debt.description,
        date: debt.date
      });
    } else {
      setDebtFormData({
        client: '',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
      });
    }
    setIsDebtModalOpen(true);
  };

  const handleCloseDebtModal = () => {
    setIsDebtModalOpen(false);
    setEditingDebt(null);
  };

  const handleOpenPaymentModal = () => {
    setPaymentFormData({
      debtId: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      description: ''
    });
    setIsPaymentModalOpen(true);
  };

  const handleClosePaymentModal = () => {
    setIsPaymentModalOpen(false);
  };

  const handleOpenAddMoreDebtModal = () => {
    setAddMoreDebtFormData({
      debtId: '',
      amount: '',
      description: '',
      date: new Date().toISOString().split('T')[0]
    });
    setIsAddMoreDebtModalOpen(true);
  };

  const handleCloseAddMoreDebtModal = () => {
    setIsAddMoreDebtModalOpen(false);
  };

  const handleOpenClientHistoryModal = (clientName) => {
    setSelectedClientForHistory(clientName);
    setIsClientHistoryModalOpen(true);
  };

  const handleCloseClientHistoryModal = () => {
    setIsClientHistoryModalOpen(false);
    setSelectedClientForHistory(null);
  };

  const handleAddDebt = async (e) => {
    e.preventDefault();
    try {
      if (!editingDebt) {
        const existingDebt = debts.find(d => d.client.toLowerCase() === debtFormData.client.toLowerCase() && d.remaining > 0);
        if (existingDebt) {
          setAlert({ message: `Ya existe una deuda pendiente para ${debtFormData.client}.`, type: 'error' });
          return;
        }
      }

      let result;
      if (editingDebt) {
        result = await storage.updateRecord('debts', editingDebt.id, {
          ...debtFormData,
          amount: parseFloat(debtFormData.amount)
        });
        setDebts(debts.map(d => d.id === editingDebt.id ? result : d));
        setAlert({ message: 'Deuda actualizada con éxito!', type: 'success' });
      } else {
        const debt = {
          ...debtFormData,
          amount: parseFloat(debtFormData.amount),
          remaining: parseFloat(debtFormData.amount),
          payments: [],
          transactions: [] // Inicializar transacciones
        };
        result = await storage.addRecord('debts', debt);
        setDebts([...debts, result]);
        setAlert({ message: 'Deuda registrada con éxito!', type: 'success' });
      }
      handleCloseDebtModal();
    } catch (error) {
      console.error('Error al guardar deuda:', error);
      setAlert({ message: 'Error al guardar deuda.', type: 'error' });
    }
  };

  const handleAddPayment = async (e) => {
    e.preventDefault();
    try {
      const payment = {
        type: 'payment',
        amount: parseFloat(paymentFormData.amount),
        date: paymentFormData.date,
        description: paymentFormData.description 
      };
      
      const updatedDebts = debts.map(debt => {
        if (debt.id === parseInt(paymentFormData.debtId)) {
          const updatedRemaining = debt.remaining - payment.amount;
          return {
            ...debt,
            payments: [...debt.payments, payment], 
            transactions: [...(debt.transactions || []), payment], 
            remaining: updatedRemaining < 0 ? 0 : updatedRemaining
          };
        }
        return debt;
      });

      const debtToUpdate = updatedDebts.find(d => d.id === parseInt(paymentFormData.debtId));
      if (debtToUpdate) {
        await storage.updateRecord('debts', debtToUpdate.id, debtToUpdate);
        setDebts(updatedDebts);
        setAlert({ message: 'Pago registrado con éxito!', type: 'success' });
        handleClosePaymentModal();
      }
    } catch (error) {
      console.error('Error al registrar pago:', error);
      setAlert({ message: 'Error al registrar pago.', type: 'error' });
    }
  };

  const handleAddMoreDebt = async (e) => {
    e.preventDefault();
    try {
      const debtToModify = debts.find(d => d.id === parseInt(addMoreDebtFormData.debtId));
      if (!debtToModify) {
        setAlert({ message: 'Deuda no encontrada.', type: 'error' });
        return;
      }

      const additionalAmount = parseFloat(addMoreDebtFormData.amount);
      const updatedAmount = debtToModify.amount + additionalAmount;
      const updatedRemaining = debtToModify.remaining + additionalAmount;

      const newTransaction = {
        type: 'increase',
        amount: additionalAmount,
        date: addMoreDebtFormData.date,
        description: addMoreDebtFormData.description 
      };

      const updatedDebts = debts.map(d => {
        if (d.id === debtToModify.id) {
          return {
            ...d,
            amount: updatedAmount,
            remaining: updatedRemaining,
            transactions: [...(d.transactions || []), newTransaction] 
          };
        }
        return d;
      });

      await storage.updateRecord('debts', debtToModify.id, updatedDebts.find(d => d.id === debtToModify.id));
      setDebts(updatedDebts);
      setAlert({ message: 'Deuda aumentada con éxito!', type: 'success' });
      handleCloseAddMoreDebtModal();
    } catch (error) {
      console.error('Error al aumentar deuda:', error);
      setAlert({ message: 'Error al aumentar deuda.', type: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta deuda?')) {
      try {
        await storage.deleteRecord('debts', id);
        setDebts(debts.filter(d => d.id !== id));
        setAlert({ message: 'Deuda eliminada con éxito!', type: 'success' });
      } catch (error) {
        console.error('Error al eliminar deuda:', error);
        setAlert({ message: 'Error al eliminar deuda.', type: 'error' });
      }
    }
  };

  const filteredDebts = debts.filter(debt =>
    debt.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
    debt.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    formatCurrency(debt.amount).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <AnimatedCard>
        <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center mb-4 space-y-4 md:space-y-0 md:space-x-4">
            <h2 className="text-xl font-semibold text-gray-800">Historial de Deudas</h2>
            <div className="flex space-x-4">
              <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="Buscar deuda..." />
              <button
                onClick={() => handleOpenDebtModal()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                + Nueva Deuda
              </button>
              <button
                onClick={handleOpenPaymentModal}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                + Registrar Pago
              </button>
              <button
                onClick={handleOpenAddMoreDebtModal}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                + Más Deuda
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pendiente</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDebts.map((debt) => (
                  <tr key={debt.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{formatDate(debt.date)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      <button 
                        onClick={() => handleOpenClientHistoryModal(debt.client)}
                        className="text-blue-600 hover:underline"
                      >
                        {debt.client}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{formatCurrency(debt.amount)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <span className={debt.remaining > 0 ? 'text-red-600' : 'text-green-600'}>
                        {formatCurrency(debt.remaining)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleOpenDebtModal(debt)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(debt.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </AnimatedCard>

      <Modal isOpen={isDebtModalOpen} onClose={handleCloseDebtModal} title={editingDebt ? "Editar Deuda" : "Registrar Nueva Deuda"}>
        <form onSubmit={handleAddDebt} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
            <input
              type="text"
              value={debtFormData.client}
              onChange={(e) => setDebtFormData({...debtFormData, client: e.target.value})}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-700"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Monto ($)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={debtFormData.amount}
              onChange={(e) => setDebtFormData({...debtFormData, amount: e.target.value})}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-700"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
            <input
              type="date"
              value={debtFormData.date}
              onChange={(e) => setDebtFormData({...debtFormData, date: e.target.value})}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-700"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea
              value={debtFormData.description}
              onChange={(e) => setDebtFormData({...debtFormData, description: e.target.value})}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-700"
              rows={3}
              placeholder="Detalles de la deuda"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            {editingDebt ? "Guardar Cambios" : "Registrar Deuda"}
          </button>
        </form>
      </Modal>

      <Modal isOpen={isPaymentModalOpen} onClose={handleClosePaymentModal} title="Registrar Pago">
        <form onSubmit={handleAddPayment} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Deuda</label>
            <select
              value={paymentFormData.debtId}
              onChange={(e) => setPaymentFormData({...paymentFormData, debtId: e.target.value})}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-700"
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Monto ($)</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={paymentFormData.amount}
              onChange={(e) => setPaymentFormData({...paymentFormData, amount: e.target.value})}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-700"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
            <input
              type="date"
              value={paymentFormData.date}
              onChange={(e) => setPaymentFormData({...paymentFormData, date: e.target.value})}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-700"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción (opcional)</label>
            <textarea
              value={paymentFormData.description}
              onChange={(e) => setPaymentFormData({...paymentFormData, description: e.target.value})}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-700"
              rows={2}
              placeholder="Ej: Pago en efectivo, transferencia"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            disabled={!paymentFormData.debtId}
          >
            Registrar Pago
          </button>
        </form>
      </Modal>

      <Modal isOpen={isAddMoreDebtModalOpen} onClose={handleCloseAddMoreDebtModal} title="Agregar Más Deuda a Cliente">
        <form onSubmit={handleAddMoreDebt} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Deuda Existente</label>
            <select
              value={addMoreDebtFormData.debtId}
              onChange={(e) => setAddMoreDebtFormData({...addMoreDebtFormData, debtId: e.target.value})}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-700"
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Monto Adicional ($)</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={addMoreDebtFormData.amount}
              onChange={(e) => setAddMoreDebtFormData({...addMoreDebtFormData, amount: e.target.value})}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-700"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción Adicional (opcional)</label>
            <textarea
              value={addMoreDebtFormData.description}
              onChange={(e) => setAddMoreDebtFormData({...addMoreDebtFormData, description: e.target.value})}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-700"
              rows={2}
              placeholder="Ej: Compra adicional, servicio extra"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Adición</label>
            <input
              type="date"
              value={addMoreDebtFormData.date}
              onChange={(e) => setAddMoreDebtFormData({...addMoreDebtFormData, date: e.target.value})}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-700"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            disabled={!addMoreDebtFormData.debtId}
          >
            Aumentar Deuda
          </button>
        </form>
      </Modal>

      {selectedClientForHistory && (
        <ClientHistoryModal
          isOpen={isClientHistoryModalOpen}
          onClose={handleCloseClientHistoryModal}
          clientName={selectedClientForHistory}
          clientDebts={debts.filter(d => d.client.toLowerCase() === selectedClientForHistory.toLowerCase())}
          allSales={allSales}
          allExpenses={allExpenses}
        />
      )}

      {alert && <Alert message={alert.message} type={alert.type} />}
    </div>
  );
};

export default DebtsModule;