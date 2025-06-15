const STORAGE_KEY = 'fincontrol_pro_data';

const defaultData = {
  version: 1,
  sales: [],
  expenses: [],
  debts: [],
  categories: ['Suministros', 'Salarios', 'Servicios', 'Impuestos', 'Otros'] // Categorías por defecto
};

const storage = {
  getData() {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (!savedData) return { ...defaultData };
      
      const parsed = JSON.parse(savedData);
      // Asegurar que todas las colecciones existan y que las categorías se carguen
      return {
        ...defaultData,
        ...parsed,
        sales: parsed.sales || [],
        expenses: parsed.expenses || [],
        debts: parsed.debts || [],
        categories: parsed.categories || defaultData.categories // Cargar categorías guardadas o usar default
      };
    } catch (error) {
      console.error('Error al cargar datos:', error);
      return { ...defaultData };
    }
  },

  saveData(data) {
    try {
      const toSave = {
        ...data,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
      return true;
    } catch (error) {
      console.error('Error al guardar datos:', error);
      return false;
    }
  },

  async getRecords(collection, filters = {}) {
    const data = this.getData();
    let records = data[collection] || [];
    
    // Aplicar filtros
    if (filters.dateFrom || filters.dateTo) {
      records = records.filter(record => {
        const recordDate = new Date(record.date);
        if (filters.dateFrom && recordDate < new Date(filters.dateFrom)) return false;
        if (filters.dateTo && recordDate > new Date(filters.dateTo)) return false;
        return true;
      });
    }
    
    return records;
  },

  async addRecord(collection, record) {
    const data = this.getData();
    const newRecord = { 
      ...record, 
      id: Date.now(),
      createdAt: new Date().toISOString() 
    };
    
    data[collection] = [...data[collection], newRecord];
    this.saveData(data);
    return newRecord;
  },

  async updateRecord(collection, id, updates) {
    const data = this.getData();
    const index = data[collection].findIndex(r => r.id === id);
    if (index !== -1) {
      data[collection][index] = { ...data[collection][index], ...updates };
      this.saveData(data);
      return data[collection][index];
    }
    return null;
  },

  async deleteRecord(collection, id) {
    const data = this.getData();
    data[collection] = data[collection].filter(r => r.id !== id);
    this.saveData(data);
  }
};

export default storage;