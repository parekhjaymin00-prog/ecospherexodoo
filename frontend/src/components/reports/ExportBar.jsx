import { exportToCSV, exportToExcel, exportToPDF } from '../../utils/exportUtils.js';

export default function ExportBar({ data, filename, title }) {
  const hasData = data && data.length > 0;
  return (
    <div className="flex flex-wrap gap-2">
      <button onClick={() => exportToCSV(data, filename)} disabled={!hasData} className="px-3 py-1.5 text-xs border border-[#2A2A2A] text-[#A3A3A3] rounded-lg hover:bg-[#1F1F1F] hover:text-white disabled:opacity-30">Export CSV</button>
      <button onClick={() => exportToExcel(data, filename)} disabled={!hasData} className="px-3 py-1.5 text-xs border border-[#2A2A2A] text-[#A3A3A3] rounded-lg hover:bg-[#1F1F1F] hover:text-white disabled:opacity-30">Export Excel</button>
      <button onClick={() => exportToPDF(data, filename, title || filename)} disabled={!hasData} className="px-3 py-1.5 text-xs border border-[#2A2A2A] text-[#A3A3A3] rounded-lg hover:bg-[#1F1F1F] hover:text-white disabled:opacity-30">Export PDF</button>
    </div>
  );
}
