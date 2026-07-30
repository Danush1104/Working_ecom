interface StatusBadgeProps {
  status: string;
  type?: 'order' | 'payment' | 'inventory';
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const getStyles = () => {
    const s = status.toLowerCase();
    
    // Success / Active
    if (['active', 'delivered', 'succeeded', 'success'].includes(s)) {
      return {
        bg: 'bg-green-500/10 border-green-500/20 text-green-400',
        dot: 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.8)]'
      };
    }
    
    // Processing / Pending
    if (['processing', 'shipped', 'pending'].includes(s)) {
      return {
        bg: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
        dot: 'bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]'
      };
    }
    
    // Failed / Out of Stock / Cancelled
    if (['cancelled', 'failed', 'out of stock', 'inactive'].includes(s)) {
      return {
        bg: 'bg-red-500/10 border-red-500/20 text-red-400',
        dot: 'bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.8)]'
      };
    }
    
    // Warning / Low Stock / Refunded
    if (['low stock', 'refunded'].includes(s)) {
      return {
        bg: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400',
        dot: 'bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.8)]'
      };
    }
    
    // Default
    return {
      bg: 'bg-white/5 border-border-subtle text-text-secondary',
      dot: 'bg-gray-400'
    };
  };

  const styles = getStyles();

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide border uppercase ${styles.bg}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${styles.dot}`}></span>
      {status}
    </span>
  );
}
