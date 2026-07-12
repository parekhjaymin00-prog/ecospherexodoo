import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import api from '../../services/api.js';
import StatCard from '../StatCard.jsx';
import ExportBar from './ExportBar.jsx';
import TableSkeleton from '../TableSkeleton.jsx';

const COLORS = ['#FFFFFF', '#A3A3A3', '#525252'];

export default function EnvironmentalReport() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchReport = async () => {
    setLoading(true);
    try { const res = await api.get('/reports/environmental', { params: { startDate, endDate } }); setData(res.data); } catch (err) { console.error(err); } finally { setLoading(false); }
  };
  useEffect(() => { fetchReport(); }, []);

  if (loading) return <TableSkeleton rows={8} cols={4} />;
  if (!data) return null;

  const exportData = data.monthlyTrend.map(t => ({ Month: t.month, Total: t.total, Scope1: t.scope1, Scope2: t.scope2, Scope3: t.scope3 }));

  return (
    <div className="space-y-6" id="env-report">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex gap-2 items-center">
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="px-3 py-1.5 text-xs bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white" />
          <span className="text-xs text-[#525252]">to</span>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="px-3 py-1.5 text-xs bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white" />
          <button onClick={fetchReport} className="px-3 py-1.5 text-xs bg-white text-black rounded-lg font-medium">Filter</button>
        </div>
        <ExportBar data={exportData} filename="environmental-report" reportId="env-report" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Emissions" value={`${data.totalEmissions} kg`} subtitle="CO₂ equivalent" />
        <StatCard title="Scope 1" value={`${data.byScope.find(s => s.scope === 1)?.total || 0} kg`} subtitle="Direct" />
        <StatCard title="Scope 2" value={`${data.byScope.find(s => s.scope === 2)?.total || 0} kg`} subtitle="Energy Indirect" />
        <StatCard title="Scope 3" value={`${data.byScope.find(s => s.scope === 3)?.total || 0} kg`} subtitle="Other Indirect" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {data.monthlyTrend.length > 0 && (
          <div className="bg-[#171717] border border-[#2A2A2A] rounded-lg p-4">
            <h3 className="text-sm font-medium text-white mb-3">Monthly Emissions</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.monthlyTrend}><CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" /><XAxis dataKey="month" tick={{ fill: '#737373', fontSize: 10 }} stroke="#2A2A2A" /><YAxis tick={{ fill: '#737373', fontSize: 10 }} stroke="#2A2A2A" /><Tooltip contentStyle={{ background: '#171717', border: '1px solid #2A2A2A', borderRadius: 8 }} /><Bar dataKey="scope1" name="Scope 1" fill="#FFFFFF" stackId="a" /><Bar dataKey="scope2" name="Scope 2" fill="#A3A3A3" stackId="a" /><Bar dataKey="scope3" name="Scope 3" fill="#525252" stackId="a" /></BarChart>
            </ResponsiveContainer>
          </div>
        )}
        {data.byScope.length > 0 && (
          <div className="bg-[#171717] border border-[#2A2A2A] rounded-lg p-4">
            <h3 className="text-sm font-medium text-white mb-3">Scope Distribution</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart><Pie data={data.byScope} dataKey="total" nameKey="scope" cx="50%" cy="50%" outerRadius={80} label={({ scope, total }) => `S${scope}: ${total}kg`}>{data.byScope.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip contentStyle={{ background: '#171717', border: '1px solid #2A2A2A', borderRadius: 8 }} /></PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {data.goals.length > 0 && (
        <div className="bg-[#171717] border border-[#2A2A2A] rounded-lg p-4">
          <h3 className="text-sm font-medium text-white mb-3">Environmental Goals</h3>
          <div className="space-y-3">
            {data.goals.map(g => (
              <div key={g.id} className="flex items-center gap-4">
                <div className="flex-1"><p className="text-sm text-white">{g.title}</p><div className="w-full bg-[#2A2A2A] rounded-full h-1.5 mt-1"><div className="h-1.5 rounded-full bg-white" style={{ width: `${g.progress}%` }} /></div></div>
                <span className="text-xs text-[#A3A3A3] w-12 text-right">{g.progress}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
