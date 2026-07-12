import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import api from '../../services/api.js';
import StatCard from '../StatCard.jsx';
import TableSkeleton from '../TableSkeleton.jsx';

const COLORS = ['#FFFFFF', '#A3A3A3', '#525252', '#737373', '#2A2A2A'];

export default function DiversityTab() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.get('/training/diversity').then(r => setData(r.data)).catch(console.error).finally(() => setLoading(false)); }, []);

  if (loading) return <TableSkeleton rows={4} cols={3} />;
  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Employees" value={data.total} />
        <StatCard title="Departments" value={data.byDepartment.length} />
        <StatCard title="Gender Groups" value={data.byGender.length} />
        <StatCard title="Employment Types" value={data.byEmploymentType.length} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-[#171717] border border-[#2A2A2A] rounded-lg p-4">
          <h3 className="text-sm font-medium text-white mb-3">By Gender</h3>
          {data.byGender.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart><Pie data={data.byGender} dataKey="count" nameKey="gender" cx="50%" cy="50%" outerRadius={70} label={({ gender, count }) => `${gender}: ${count}`}>{data.byGender.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip contentStyle={{ background: '#171717', border: '1px solid #2A2A2A', borderRadius: 8 }} /></PieChart>
            </ResponsiveContainer>
          ) : <p className="text-xs text-[#525252] text-center py-8">No gender data available</p>}
        </div>

        <div className="bg-[#171717] border border-[#2A2A2A] rounded-lg p-4">
          <h3 className="text-sm font-medium text-white mb-3">By Department</h3>
          {data.byDepartment.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data.byDepartment}><CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" /><XAxis dataKey="department" tick={{ fill: '#737373', fontSize: 9 }} stroke="#2A2A2A" /><YAxis tick={{ fill: '#737373', fontSize: 10 }} stroke="#2A2A2A" /><Tooltip contentStyle={{ background: '#171717', border: '1px solid #2A2A2A', borderRadius: 8 }} /><Bar dataKey="count" fill="#FFFFFF" radius={[4, 4, 0, 0]} /></BarChart>
            </ResponsiveContainer>
          ) : <p className="text-xs text-[#525252] text-center py-8">No department data</p>}
        </div>
      </div>
    </div>
  );
}
