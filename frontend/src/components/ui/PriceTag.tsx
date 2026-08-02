interface PriceTagProps {
 price: number;
 originalPrice?: number;
 className?: string;
 size?: 'sm'| 'md'| 'lg';
}

export function PriceTag({ price, originalPrice, className = '', size = 'md'}: PriceTagProps) {
 const sizeClasses = {
 sm: 'text-sm',
 md: 'text-lg',
 lg: 'text-2xl md:text-3xl'
 };
 
 const originalSizeClasses = {
 sm: 'text-xs',
 md: 'text-sm',
 lg: 'text-lg'
 };

 const formatPrice = (p: number) => {
 return new Intl.NumberFormat('en-IN', {
 style: 'currency',
 currency: 'INR',
 }).format(p);
 };

 return (
 <div className={`flex items-baseline gap-2 ${className}`}>
 <span className={`font-bold text-text-primary ${sizeClasses[size]}`}>
 {formatPrice(price)}
 </span>
 {originalPrice && originalPrice > price && (
 <span className={`font-medium text-text-secondary line-through ${originalSizeClasses[size]}`}>
 {formatPrice(originalPrice)}
 </span>
 )}
 </div>
 );
}
