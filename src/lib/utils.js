export const formatCurrency = (value) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

export const formatDate = (dateString) => {
  const options = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  return new Date(dateString).toLocaleDateString('es-MX', options);
};

export const validateForm = (fields) => {
  const errors = {};
  
  if (!fields.amount || isNaN(fields.amount)) {
    errors.amount = 'Ingrese un monto válido';
  }
  
  if (fields.date && new Date(fields.date) > new Date()) {
    errors.date = 'La fecha no puede ser futura';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};


// DONE