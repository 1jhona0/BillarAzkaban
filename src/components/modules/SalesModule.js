import React, { useState, useEffect } from 'react';
import storage from '../../lib/storage';
import { formatCurrency, formatDate } from '../../lib/utils';
import AnimatedCard from '../ui/AnimatedCard';
import Modal from '../ui/Modal';
import Alert from '../ui/Alert';
import SearchInput from '../ui/SearchInput';

const SalesModule = () => {
  const [sales, setSales] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSale, setEditingSale] = useState(null);
  const [alert, setAlert] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    description: '',
    client: ''
  });

  useEffect(() => {
    const loadSales = async () => {
      const salesData = await storage.getRecords('sales');
      setSales(salesData);
    };
    loadSales();
  }, []);

  const handleOpenModal = (sale = null) => {
    setEditingSale(sale);
    if (sale) {
      setFormData({
        date: sale.date,
        amount: sale.amount,
        description: sale.description,
        client: sale.client
      });
    } else {
      setFormData({
        date: new Date().toISOString().split('T')[0],
        amount: '',
        description: '',
        client: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSale(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let result;
      if (editingSale) {
        result = await storage.updateRecord('sales', editingSale.id, {
          ...formData,
          amount: parseFloat(formData.amount)
        });
        setSales(sales.map(s => s.id === editingSale.id ? result : s));
        setAlert({ message: 'Venta actualizada con éxito!', type: 'success' });
      } else {
        result = await storage.addRecord('sales', {
          ...formData,
          amount: parseFloat(formData.amount)
        });
        setSales([...sales, result]);
        setAlert({ message: 'Venta registrada con éxito!', type: 'success' });
      }
      handleCloseModal();
    } catch (error) {
      console.error('Error al guardar venta:', error);
      setAlert({ message: 'Error al guardar venta.', type: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta venta?')) {
      try {
        await storage.deleteRecord('sales', id);
        setSales(sales.filter(s => s.id !== id));
        setAlert({ message: 'Venta eliminada con éxito!', type: 'success' });
      } catch (error) {
        console.error('Error al eliminar venta:', error);
        setAlert({ message: 'Error al eliminar venta.', type: 'error' });
      }
    }
  };

  const filteredSales = sales.filter(sale =>
    sale.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    formatCurrency(sale.amount).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <AnimatedCard>
        <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center mb-4 space-y-4 md:space-y-0 md:space-x-4">
            <h2 className="text-xl font-semibold text-gray-800">Historial de Ventas</h2>
            <div className="flex space-x-4">
              <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="Buscar venta..." />
              <button
                onClick={() => handleOpenModal()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                + Nueva Venta
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSales.map((sale) => (
                  <tr key={sale.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{formatDate(sale.date)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{sale.client}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{formatCurrency(sale.amount)}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{sale.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleOpenModal(sale)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(sale.id)}
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

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingSale ? "Editar Venta" : "Registrar Nueva Venta"}>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
            <input
              type="text"
              value={formData.client}
              onChange={(e) => setFormData({...formData, client: e.target.value})}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-700"
              placeholder="Nombre del cliente"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-700"
              rows={3}
              placeholder="Detalles de la venta"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            {editingSale ? "Guardar Cambios" : "Registrar Venta"}
          </button>
        </form>
      </Modal>

      {alert && <Alert message={alert.message} type={alert.type} />}
    </div>
  );
};

export default SalesModule;