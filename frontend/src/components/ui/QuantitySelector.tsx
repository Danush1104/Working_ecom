import { Minus, Plus } from 'lucide-react';

interface QuantitySelectorProps {
  quantity: number;
  maxQuantity?: number;
  onChange: (newQuantity: number) => void;
  className?: string;
}

export function QuantitySelector({ quantity, maxQuantity = 99, onChange, className = '' }: QuantitySelectorProps) {
  const handleDecrement = () => {
    if (quantity > 1) {
      onChange(quantity - 1);
    }
  };

  const handleIncrement = () => {
    if (quantity < maxQuantity) {
      onChange(quantity + 1);
    }
  };

  return (
    <div className={`inline-flex items-center rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 ${className}`}>
      <button 
        type="button"
        onClick={handleDecrement}
        disabled={quantity <= 1}
        className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <Minus className="h-4 w-4" />
      </button>
      <div className="w-10 text-center text-sm font-medium text-gray-900 dark:text-white">
        {quantity}
      </div>
      <button 
        type="button"
        onClick={handleIncrement}
        disabled={quantity >= maxQuantity}
        className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
