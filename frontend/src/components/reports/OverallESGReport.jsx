import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import api from '../../services/api.js';
import StatCard from '../StatCard.jsx';
import ExportBar from './ExportBar.jsx';
import TableSkeleton from '../TableSkeleton.jsx';

export default function OverallESGReport() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.get('/reports/overall').then(r => setData(r.data)).catch(console.error).finally(() => setLoading(false)); }, []);
  if (loading) return <TableSkeleton rows={8} cols={4} />;
  if (!data) return null;

  const exportData = [
    { Metric: 'Overall ESG', Value: data.overall },
    { Metric: 'Environmental', Value: data.environmental },
    { Metric: 'Social', Value: data.social },
    { Metric: 'Governance', Value: data.governance },
    ...data.topDepartments.map(d => ({ Metric: `Dept: ${d.name}`, Value: d.score })),
    ...data.topEmployees.map(e => ({ Metric: `Employee: ${e.name}`, Value: e.score })),
  ];

  return (
    <div className="space-y-6" id="overall-report">
      <div className="flex justify-end"><ExportBar data={exportData} filename="esg-overall-report" reportId="overall-report" /></div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Overall ESG Score" value={data.overall} />
        <StatCard title="Environmental" value={data.environmental} subtitle={`${data.weights.environmentalWeight}% weight`} />
        <StatCard title="Social" value={data.social} subtitle={`${data.weights.socialWeight}% weight`} />
        <StatCard title="Governance" value={data.governance} subtitle={`${data.weights.governanceWeight}% weight`} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Carbon" value={`${data.summary.carbon} kg`} />
        <StatCard title="CSR Activities" value={data.summary.csrActivities} />
        <StatCard title="Active Policies" value={data.summary.policies} />
        <StatCard title="Active Challenges" value={data.summary.challenges} />
      </div>

      {data.monthlyTrend.length > 0 && (
        <div className="bg-[#171717] border border-[#2A2A2A] rounded-lg p-4">
          <h3 className="text-sm font-medium text-white mb-3">ESG Monthly Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data.monthlyTrend}><CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" /><XAxis dataKey="month" tick={{ fill: '#737373', fontSize: 10 }} stroke="#2A2A2A" /><YAxis tick={{ fill: '#737373', fontSize: 10 }} stroke="#2A2A2A" domain={[0, 100]} /><Tooltip contentStyle={{ background: '#171717', border: '1px solid #2A2A2A', borderRadius: 8 }} /><Legend wrapperStyle={{ fontSize: 11 }} /><Line type="monotone" dataKey="environmental" name="Environmental" stroke="#FFFFFF" strokeWidth={2} dot={false} /><Line type="monotone" dataKey="social" name="Social" stroke="#A3A3A3" strokeWidth={2} dot={false} /><Line type="monotone" dataKey="governance" name="Governance" stroke="#525252" strokeWidth={2} dot={false} /></LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-[#171717] border border-[#2A2A2A] rounded-lg p-4">
          <h3 className="text-sm font-medium text-white mb-3">Top Departments</h3>
          {data.topDepartments.length === 0 ? <p className="text-xs text-[#525252]">No data</p> : (
            <div className="space-y-2">{data.topDepartments.map((d, i) => (<div key={i} className="flex items-center gap-3"><span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${i < 3 ? 'bg-white text-black' : 'bg-[#2A2A2A] text-[#737373]'}`}>{i + 1}</span><span className="text-sm text-white flex-1">{d.name}</span><span className="text-xs text-[#A3A3A3]">{d.score}</span></div>))}</div>
          )}
        </div>
        <div className="bg-[#171717] border border-[#2A2A2A] rounded-lg p-4">
          <h3 className="text-sm font-medium text-white mb-3">Top Employees</h3>
          {data.topEmployees.length === 0 ? <p className="text-xs text-[#525252]">No data</p> : (
            <div className="space-y-2">{data.topEmployees.map((e, i) => (<div key={i} className="flex items-center gap-3"><span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${i < 3 ? 'bg-white text-black' : 'bg-[#2A2A2A] text-[#737373]'}`}>{i + 1}</span><div className="flex-1"><p className="text-sm text-white">{e.name}</p><p className="text-xs text-[#525252]">{e.department || 'No dept'}</p></div><span className="text-xs text-[#A3A3A3]">{e.score} pts</span></div>))}</div>
          )}
        </div>
      </div>
    </div>
  );
}
