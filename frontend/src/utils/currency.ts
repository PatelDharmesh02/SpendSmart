export const formatCurrency = (amount: number): string => {
  // Add commas as thousands separators
  const parts = amount.toFixed(2).split('.');
  const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `₹${integerPart}`;
};