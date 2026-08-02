import { Minus, Plus } from 'lucide-react';

interface QuantitySelectorProps {
 quantity: number;
 maxQuantity?: number;
 onChange: (newQuantity: number) => void;
 className?: string;
}

export function QuantitySelector({ quantity, maxQuantity = 99, onChange, className = ''}: QuantitySelectorProps) {
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
 <div className={`inline-flex items-center rounded-lg border border-border-subtle bg-bg-card ${className}`}>
 <button 
 type="button"
 onClick={handleDecrement}
 disabled={quantity <= 1}
 className="p-2 text-text-secondary hover:text-text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
 >
 <Minus className="h-4 w-4" />
 </button>
 <div className="w-10 text-center text-sm font-medium text-text-primary">
 {quantity}
 </div>
 <button 
 type="button"
 onClick={handleIncrement}
 disabled={quantity >= maxQuantity}
 className="p-2 text-text-secondary hover:text-text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
 >
 <Plus className="h-4 w-4" />
 </button>
 </div>
 );
}
