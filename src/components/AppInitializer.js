import React, { useState, useEffect } from 'react';
import { storage } from '../lib/storage';

const AppInitializer = ({ children }) => {
  const [status, setStatus] = useState({ loading: true, error: null });

  useEffect(() => {
    // Inicialización inmediata con localStorage
    try {
      // Verificar que el almacenamiento funciona
      storage.getData();
      setStatus({ loading: false, error: null });
    } catch (error) {
      console.error('Storage error:', error);
      setStatus({
        loading: false,
        error: 'Error al acceder al almacenamiento local. Verifica la configuración de tu navegador.'
      });
    }
  }, []);

  if (status.error) {
    return (
      <div className="fixed inset-0 bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
          <h2 className="text-xl font-bold text-red-600 mb-2">Error</h2>
          <p className="mb-4">{status.error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
          >
            Recargar
          </button>
        </div>
      </div>
    );
  }

  if (status.loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p>Inicializando aplicación...</p>
        </div>
      </div>
    );
  }

  return children;
};

export default AppInitializer;