import { Loader2, ShoppingBag } from 'lucide-react';

export function Skeleton({ className = ''}: { className?: string }) {
  return (
    <div className={`relative overflow-hidden bg-bg-secondary dark:bg-bg-secondary rounded-md ${className}`}>
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/40 dark:via-white/10 to-transparent" />
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="group relative bg-bg-card dark:bg-bg-card rounded-2xl md:rounded-3xl shadow-sm border border-border-subtle dark:border-border-subtle overflow-hidden h-full flex flex-col">
      {/* Image Skeleton */}
      <Skeleton className="w-full aspect-[4/5] !rounded-none" />
      
      {/* Content */}
      <div className="p-4 md:p-6 flex flex-col flex-1">
        <Skeleton className="h-5 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2 mb-4" />
        
        <div className="mt-auto">
          <Skeleton className="h-6 w-1/3 mb-4" />
          <Skeleton className="h-10 w-full !rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function TableRowSkeleton({ cols = 5 }: { cols?: number }) {
  return (
    <tr className="border-b border-border-subtle animate-pulse">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="py-4 px-4">
          <Skeleton className="h-5 w-full max-w-[120px] rounded-lg" />
        </td>
      ))}
    </tr>
  );
}

export function TableSkeleton({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="w-full overflow-hidden rounded-2xl border border-border-subtle bg-bg-card p-4">
      <div className="mb-4 flex items-center justify-between">
        <Skeleton className="h-7 w-48 rounded-lg" />
        <Skeleton className="h-9 w-32 rounded-xl" />
      </div>
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-border-subtle">
            {Array.from({ length: cols }).map((_, i) => (
              <th key={i} className="py-3 px-4">
                <Skeleton className="h-4 w-20 rounded-md" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <TableRowSkeleton key={i} cols={cols} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function DashboardStatSkeleton() {
  return (
    <div className="p-6 rounded-3xl bg-bg-card border border-border-subtle flex items-center justify-between shadow-sm">
      <div className="space-y-2">
        <Skeleton className="h-4 w-28 rounded-md" />
        <Skeleton className="h-8 w-20 rounded-xl" />
        <Skeleton className="h-3 w-36 rounded-md" />
      </div>
      <Skeleton className="h-12 w-12 rounded-2xl" />
    </div>
  );
}

export function OrderCardSkeleton() {
  return (
    <div className="p-6 rounded-3xl bg-bg-card border border-border-subtle space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton className="h-6 w-36 rounded-lg" />
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>
      <div className="flex items-center space-x-4 py-2">
        <Skeleton className="h-16 w-16 rounded-2xl" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-5 w-1/2 rounded-md" />
          <Skeleton className="h-4 w-1/4 rounded-md" />
        </div>
        <Skeleton className="h-6 w-20 rounded-lg" />
      </div>
      <div className="pt-2 border-t border-border-subtle flex justify-between items-center">
        <Skeleton className="h-4 w-32 rounded-md" />
        <Skeleton className="h-9 w-28 rounded-xl" />
      </div>
    </div>
  );
}

export function GlobalPageLoader({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-bg-primary text-text-primary transition-colors duration-300">
      <div className="relative flex flex-col items-center space-y-6">
        {/* Glow Ring behind logo */}
        <div className="absolute -inset-4 bg-primary/20 rounded-full blur-xl animate-pulse" />
        
        {/* Brand Icon Box */}
        <div className="relative p-4 rounded-3xl bg-bg-card border border-border-subtle shadow-xl flex items-center justify-center">
          <ShoppingBag className="h-10 w-10 text-primary animate-bounce" />
        </div>

        {/* Spinner & Message */}
        <div className="flex flex-col items-center space-y-2">
          <div className="flex items-center space-x-3">
            <Loader2 className="h-5 w-5 text-primary animate-spin" />
            <span className="text-base font-semibold tracking-wide text-text-primary">{message}</span>
          </div>
          <p className="text-xs text-text-secondary">Securing your session...</p>
        </div>
      </div>
    </div>
  );
}
