import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export function exportToCSV(data, filename) {
  const ws = XLSX.utils.json_to_sheet(data);
  const csv = XLSX.utils.sheet_to_csv(ws);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  saveAs(blob, `${filename}.csv`);
}

export function exportToExcel(data, filename, sheetName = 'Report') {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `${filename}.xlsx`);
}

export function exportToPDF(elementId, filename) {
  const content = document.getElementById(elementId);
  if (!content) return;
  const printWindow = window.open('', '_blank');
  printWindow.document.write(`<html><head><title>${filename}</title><style>body{font-family:sans-serif;padding:20px;color:#333}table{width:100%;border-collapse:collapse;margin:16px 0}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f5f5f5;font-weight:600}.stat{display:inline-block;margin:8px 16px 8px 0;padding:12px;border:1px solid #ddd;border-radius:8px;min-width:120px}.stat-label{font-size:12px;color:#666}.stat-value{font-size:24px;font-weight:700}</style></head><body>`);
  printWindow.document.write(content.innerHTML);
  printWindow.document.write('</body></html>');
  printWindow.document.close();
  setTimeout(() => { printWindow.print(); }, 500);
}

export function printReport(elementId) {
  exportToPDF(elementId, 'report');
}
