export function safeFormatDate(dateStr: string | undefined | null, options?: Intl.DateTimeFormatOptions): string {
  if (!dateStr) return 'Unknown Date';
  
  const date = new Date(dateStr);
  
  // Check if date is invalid
  if (isNaN(date.getTime())) {
    return 'Invalid Date';
  }
  
  return date.toLocaleDateString(undefined, options || { year: 'numeric', month: 'long', day: 'numeric' });
}
