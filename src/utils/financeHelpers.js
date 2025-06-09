export const formatCurrency = (value) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(value);
};

export const calculateTotals = (items) => {
  return items.reduce((sum, item) => sum + Number(item.amount), 0);
};