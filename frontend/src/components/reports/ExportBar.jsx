import { exportToCSV, exportToExcel, exportToPDF } from '../../utils/exportUtils.js';

export default function ExportBar({ data, filename, reportId }) {
  return (
    <div className="flex flex-wrap gap-2">
      <button onClick={() => exportToCSV(data, filename)} className="px-3 py-1.5 text-xs border border-[#2A2A2A] text-[#A3A3A3] rounded-lg hover:bg-[#1F1F1F] hover:text-white">Export CSV</button>
      <button onClick={() => exportToExcel(data, filename)} className="px-3 py-1.5 text-xs border border-[#2A2A2A] text-[#A3A3A3] rounded-lg hover:bg-[#1F1F1F] hover:text-white">Export Excel</button>
      <button onClick={() => exportToPDF(reportId, filename)} className="px-3 py-1.5 text-xs border border-[#2A2A2A] text-[#A3A3A3] rounded-lg hover:bg-[#1F1F1F] hover:text-white">Print / PDF</button>
    </div>
  );
}
