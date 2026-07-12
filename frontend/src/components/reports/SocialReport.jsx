import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../services/api.js';
import StatCard from '../StatCard.jsx';
import ExportBar from './ExportBar.jsx';
import TableSkeleton from '../TableSkeleton.jsx';

export default function SocialReport() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.get('/reports/social').then(r => setData(r.data)).catch(console.error).finally(() => setLoading(false)); }, []);
  if (loading) return <TableSkeleton rows={6} cols={4} />;
  if (!data) return null;

  const exportData = data.monthlyActivity.map(m => ({ Month: m.month, Activities: m.count }));

  return (
    <div className="space-y-6" id="social-report">
      <div className="flex justify-end"><ExportBar data={exportData} filename="social-report" reportId="social-report" /></div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Activities" value={data.totalActivities} />
        <StatCard title="Active" value={data.activeActivities} />
        <StatCard title="Completed" value={data.completedActivities} />
        <StatCard title="Participations" value={data.totalParticipations} />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard title="Total Budget" value={`$${data.totalBudget.toLocaleString()}`} />
        <StatCard title="Avg Participation" value={data.participationRate} subtitle="Per activity" />
      </div>
      {data.monthlyActivity.length > 0 && (
        <div className="bg-[#171717] border border-[#2A2A2A] rounded-lg p-4">
          <h3 className="text-sm font-medium text-white mb-3">Monthly Activity Count</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.monthlyActivity}><CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" /><XAxis dataKey="month" tick={{ fill: '#737373', fontSize: 10 }} stroke="#2A2A2A" /><YAxis tick={{ fill: '#737373', fontSize: 10 }} stroke="#2A2A2A" /><Tooltip contentStyle={{ background: '#171717', border: '1px solid #2A2A2A', borderRadius: 8 }} /><Bar dataKey="count" fill="#FFFFFF" radius={[4, 4, 0, 0]} /></BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
