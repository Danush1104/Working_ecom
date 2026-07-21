interface StockBadgeProps {
  stock: number;
  className?: string;
}

export function StockBadge({ stock, className = '' }: StockBadgeProps) {
  if (stock > 10) {
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 ${className}`}>
        In Stock
      </span>
    );
  }
  
  if (stock > 0 && stock <= 10) {
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 ${className}`}>
        Low Stock ({stock} left)
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 ${className}`}>
      Out of Stock
    </span>
  );
}
