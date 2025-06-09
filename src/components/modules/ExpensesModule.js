import React, { useState, useEffect } from 'react';
import storage from '../../lib/storage';
import { formatCurrency, formatDate } from '../../lib/utils';
import AnimatedCard from '../ui/AnimatedCard';
import Modal from '../ui/Modal';
import Alert from '../ui/Alert';
import SearchInput from '../ui/SearchInput';

const ExpensesModule = () => {
  const [expenses, setExpenses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [alert, setAlert] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    category: 'Suministros',
    description: ''
  });

  const categories = ['Suministros', 'Salarios', 'Servicios', 'Impuestos', 'Otros'];

  useEffect(() => {
    const loadExpenses = async () => {
      const expensesData = await storage.getRecords('expenses');
      setExpenses(expensesData);
    };
    loadExpenses();
  }, []);

  const handleOpenModal = (expense = null) => {
    setEditingExpense(expense);
    if (expense) {
      setFormData({
        date: expense.date,
        amount: expense.amount,
        category: expense.category,
        description: expense.description
      });
    } else {
      setFormData({
        date: new Date().toISOString().split('T')[0],
        amount: '',
        category: 'Suministros',
        description: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingExpense(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let result;
      if (editingExpense) {
        result = await storage.updateRecord('expenses', editingExpense.id, {
          ...formData,
          amount: parseFloat(formData.amount)
        });
        setExpenses(expenses.map(e => e.id === editingExpense.id ? result : e));
        setAlert({ message: 'Gasto actualizado con éxito!', type: 'success' });
      } else {
        result = await storage.addRecord('expenses', {
          ...formData,
          amount: parseFloat(formData.amount)
        });
        setExpenses([...expenses, result]);
        setAlert({ message: 'Gasto registrado con éxito!', type: 'success' });
      }
      handleCloseModal();
    } catch (error) {
      console.error('Error al guardar gasto:', error);
      setAlert({ message: 'Error al guardar gasto.', type: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este gasto?')) {
      try {
        await storage.deleteRecord('expenses', id);
        setExpenses(expenses.filter(e => e.id !== id));
        setAlert({ message: 'Gasto eliminado con éxito!', type: 'success' });
      } catch (error) {
        console.error('Error al eliminar gasto:', error);
        setAlert({ message: 'Error al eliminar gasto.', type: 'error' });
      }
    }
  };

  const filteredExpenses = expenses.filter(expense =>
    expense.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    formatCurrency(expense.amount).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <AnimatedCard>
        <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center mb-4 space-y-4 md:space-y-0 md:space-x-4">
            <h2 className="text-xl font-semibold text-gray-800">Historial de Gastos</h2>
            <div className="flex space-x-4">
              <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="Buscar gasto..." />
              <button
                onClick={() => handleOpenModal()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                + Nuevo Gasto
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredExpenses.map((expense) => (
                  <tr key={expense.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{formatDate(expense.date)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{expense.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{formatCurrency(expense.amount)}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{expense.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleOpenModal(expense)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(expense.id)}
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

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingExpense ? "Editar Gasto" : "Registrar Nuevo Gasto"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-700"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-700"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Monto ($)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-700"
              placeholder="0.00"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-700"
              rows={3}
              placeholder="Detalles del gasto"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            {editingExpense ? "Guardar Cambios" : "Registrar Gasto"}
          </button>
        </form>
      </Modal>

      {alert && <Alert message={alert.message} type={alert.type} />}
    </div>
  );
};

export default ExpensesModule;