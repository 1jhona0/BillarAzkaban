class FinControlDB {
  constructor() {
    this.dbName = 'FinControlDB';
    this.version = 3; // Versión incrementada
    this.stores = {
      SALES: 'sales',
      EXPENSES: 'expenses',
      DEBTS: 'debts'
    };
    this.db = null;
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        if (!db.objectStoreNames.contains(this.stores.SALES)) {
          const salesStore = db.createObjectStore(this.stores.SALES, { keyPath: 'id', autoIncrement: true });
          salesStore.createIndex('date', 'date', { unique: false });
        }

        if (!db.objectStoreNames.contains(this.stores.EXPENSES)) {
          const expensesStore = db.createObjectStore(this.stores.EXPENSES, { keyPath: 'id', autoIncrement: true });
          expensesStore.createIndex('date', 'date', { unique: false });
          expensesStore.createIndex('category', 'category', { unique: false });
        }

        if (!db.objectStoreNames.contains(this.stores.DEBTS)) {
          const debtsStore = db.createObjectStore(this.stores.DEBTS, { keyPath: 'id', autoIncrement: true });
          debtsStore.createIndex('client', 'client', { unique: false });
          debtsStore.createIndex('date', 'date', { unique: false });
        }
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve(this.db);
      };

      request.onerror = (event) => {
        reject(event.target.error);
      };
    });
  }

  async getRecords(storeName) {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async addRecord(storeName, data) {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.add(data);

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }
}

export const db = new FinControlDB();