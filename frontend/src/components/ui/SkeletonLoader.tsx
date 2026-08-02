export function SkeletonLoader({ className = ''}: { className?: string }) {
 return (
 <div className={`animate-pulse bg-bg-secondary rounded-xl ${className}`} />
 );
}
