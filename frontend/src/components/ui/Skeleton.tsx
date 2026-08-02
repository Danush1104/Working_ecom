
export function Skeleton({ className = ''}: { className?: string }) {
 return (
 <div
 className={`relative overflow-hidden bg-bg-secondary rounded-md ${className}`}
 >
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
