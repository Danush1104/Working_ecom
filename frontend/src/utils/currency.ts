/**
 * Shared currency formatter for the entire application.
 * All prices are displayed in Indian Rupees (INR).
 */
export const formatCurrency = (amount: number | string | undefined | null): string => {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(num);
};
