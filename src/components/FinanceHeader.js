import React from 'react';

const FinanceHeader = () => {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">FinControl</h1>
        <div className="flex space-x-4">
          <button className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors">
            Nuevo Registro
          </button>
        </div>
      </div>
    </header>
  );
};

export default FinanceHeader;