import React, { useState, useEffect } from 'react';
import storage from '../../lib/storage';
import { formatCurrency, formatDate } from '../../lib/utils';
import AnimatedCard from '../ui/AnimatedCard';
import Modal from '../ui/Modal';
import Alert from '../ui/Alert';
import SearchInput from '../ui/SearchInput';

const ExpensesModule = () => {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]); // Estado para categorías dinámicas
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false); // Nuevo modal para categorías
  const [editingExpense, setEditingExpense] = useState(null);
  const [alert, setAlert] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newCategoryName, setNewCategoryName] = useState(''); // Estado para nueva categoría

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    category: '', // Categoría inicial vacía
    description: ''
  });

  useEffect(() => {
    const loadData = async () => {
      const expensesData = await storage.getRecords('expenses');
      const categoriesData = await storage.getRecords('categories'); // Cargar categorías
      setExpenses(expensesData);
      setCategories(categoriesData.length > 0 ? categoriesData : ['Suministros', 'Salarios', 'Servicios', 'Impuestos', 'Otros']); // Si no hay, usar default
      // Asegurar que la categoría por defecto del formulario sea una existente
      setFormData(prev => ({ ...prev, category: categoriesData[0] || 'Suministros' }));
    };
    loadData();
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
        category: categories[0] || '', // Usar la primera categoría disponible
        description: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingExpense(null);
  };

  const handleOpenCategoryModal = () => {
    setIsCategoryModalOpen(true);
  };

  const handleCloseCategoryModal = () => {
    setIsCategoryModalOpen(false);
    setNewCategoryName('');
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (newCategoryName.trim() === '') {
      setAlert({ message: 'El nombre de la categoría no puede estar vacío.', type: 'error' });
      return;
    }
    if (categories.includes(newCategoryName.trim())) {
      setAlert({ message: 'Esa categoría ya existe.', type: 'error' });
      return;
    }
    const updatedCategories = [...categories, newCategoryName.trim()];
    setCategories(updatedCategories);
    await storage.saveData({ ...storage.getData(), categories: updatedCategories }); // Guardar en storage
    setAlert({ message: 'Categoría agregada con éxito!', type: 'success' });
    handleCloseCategoryModal();
  };

  const handleDeleteCategory = async (categoryToDelete) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar la categoría "${categoryToDelete}"? Los gastos asociados no se eliminarán.`)) {
      const updatedCategories = categories.filter(cat => cat !== categoryToDelete);
      setCategories(updatedCategories);
      await storage.saveData({ ...storage.getData(), categories: updatedCategories }); // Guardar en storage
      setAlert({ message: 'Categoría eliminada con éxito!', type: 'success' });
    }
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
              <button
                onClick={handleOpenCategoryModal}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Gestionar Categorías
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

      <Modal isOpen={isCategoryModalOpen} onClose={handleCloseCategoryModal} title="Gestionar Categorías de Gastos">
        <form onSubmit={handleAddCategory} className="space-y-4 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Nueva Categoría</label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="flex-grow rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-700"
              placeholder="Nombre de la categoría"
              required
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Agregar
            </button>
          </div>
        </form>

        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Categorías Existentes</h3>
          <ul className="space-y-2">
            {categories.map(category => (
              <li key={category} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg border border-gray-200">
                <span className="text-gray-800">{category}</span>
                <button
                  onClick={() => handleDeleteCategory(category)}
                  className="text-red-600 hover:text-red-900 text-sm"
                >
                  Eliminar
                </button>
              </li>
            ))}
          </ul>
        </div>
      </Modal>

      {alert && <Alert message={alert.message} type={alert.type} />}
    </div>
  );
};

export default ExpensesModule;