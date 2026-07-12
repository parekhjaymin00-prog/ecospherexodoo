import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import api from '../../services/api.js';
import StatCard from '../StatCard.jsx';
import ExportBar from './ExportBar.jsx';
import TableSkeleton from '../TableSkeleton.jsx';

const COLORS = ['#FFFFFF', '#A3A3A3', '#525252', '#737373'];

export default function GovernanceReport() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.get('/reports/governance').then(r => setData(r.data)).catch(console.error).finally(() => setLoading(false)); }, []);
  if (loading) return <TableSkeleton rows={6} cols={4} />;
  if (!data) return null;

  const complianceByStatus = data.compliance.byStatus.map(s => ({ name: s.status.replace('_', ' '), count: s._count }));
  const complianceBySeverity = data.compliance.bySeverity.map(s => ({ name: s.severity, count: s._count }));
  const exportData = [...complianceByStatus.map(c => ({ Type: 'Status', Name: c.name, Count: c.count })), ...complianceBySeverity.map(c => ({ Type: 'Severity', Name: c.name, Count: c.count }))];

  return (
    <div className="space-y-6" id="gov-report">
      <div className="flex justify-end"><ExportBar data={exportData} filename="governance-report" reportId="gov-report" /></div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Active Policies" value={data.policies.activePolicies} />
        <StatCard title="Acknowledgement Rate" value={`${data.policies.acknowledgementRate}%`} />
        <StatCard title="Total Audits" value={data.audits.recent.length} />
        <StatCard title="Compliance Issues" value={complianceByStatus.reduce((s, c) => s + c.count, 0)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {complianceByStatus.length > 0 && (
          <div className="bg-[#171717] border border-[#2A2A2A] rounded-lg p-4">
            <h3 className="text-sm font-medium text-white mb-3">Issues by Status</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart><Pie data={complianceByStatus} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, count }) => `${name}: ${count}`}>{complianceByStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip contentStyle={{ background: '#171717', border: '1px solid #2A2A2A', borderRadius: 8 }} /></PieChart>
            </ResponsiveContainer>
          </div>
        )}
        {complianceBySeverity.length > 0 && (
          <div className="bg-[#171717] border border-[#2A2A2A] rounded-lg p-4">
            <h3 className="text-sm font-medium text-white mb-3">Issues by Severity</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={complianceBySeverity}><CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" /><XAxis dataKey="name" tick={{ fill: '#737373', fontSize: 10 }} stroke="#2A2A2A" /><YAxis tick={{ fill: '#737373', fontSize: 10 }} stroke="#2A2A2A" /><Tooltip contentStyle={{ background: '#171717', border: '1px solid #2A2A2A', borderRadius: 8 }} /><Bar dataKey="count" fill="#FFFFFF" radius={[4, 4, 0, 0]} /></BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
