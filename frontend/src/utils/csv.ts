export function exportToCSV(data: any[], filename: string) {
  if (!data || !data.length) {
    return;
  }

  // Extract headers
  const headers = Object.keys(data[0]);

  // Map rows
  const rows = data.map(obj => {
    return headers.map(header => {
      let val = obj[header];
      if (val === null || val === undefined) {
        val = '';
      }
      // Escape strings and quotes for CSV
      if (typeof val === 'string') {
        val = val.replace(/"/g, '""');
        return `"${val}"`;
      }
      if (typeof val === 'object') {
        val = JSON.stringify(val).replace(/"/g, '""');
        return `"${val}"`;
      }
      return val;
    }).join(',');
  });

  // Combine headers and rows
  const csvContent = [headers.join(','), ...rows].join('\n');

  // Create a Blob and trigger download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
