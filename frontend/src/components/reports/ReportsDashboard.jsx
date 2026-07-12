import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import api from '../../services/api.js';
import StatCard from '../StatCard.jsx';
import TableSkeleton from '../TableSkeleton.jsx';

export default function ReportsDashboard() {
  const [data, setData] = useState(null);
  const [trend, setTrend] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      try {
        const [dashRes, trendRes] = await Promise.all([api.get('/reports/dashboard'), api.get('/dashboard/trend')]);
        setData(dashRes.data);
        setTrend(trendRes.data.trend || []);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    }
    fetch();
  }, []);

  if (loading) return <TableSkeleton rows={8} cols={4} />;
  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <StatCard title="Overall ESG" value={data.overallESG} subtitle="Weighted score" />
        <StatCard title="Environmental" value={data.environmental} />
        <StatCard title="Social" value={data.social} />
        <StatCard title="Governance" value={data.governance} />
        <StatCard title="Carbon (kg CO₂e)" value={data.carbon} />
        <StatCard title="CSR Activities" value={data.csrActivities} />
        <StatCard title="Active Policies" value={data.activePolicies} />
        <StatCard title="Audits" value={data.audits} />
        <StatCard title="Active Challenges" value={data.activeChallenges} />
        <StatCard title="Employees" value={data.employees} />
        <StatCard title="Departments" value={data.departments} />
        <StatCard title="Open Compliance" value={data.openCompliance} />
      </div>

      {trend.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-[#171717] border border-[#2A2A2A] rounded-lg p-4">
            <h3 className="text-sm font-medium text-white mb-3">ESG Score Trend</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={trend}><CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" /><XAxis dataKey="month" tick={{ fill: '#737373', fontSize: 10 }} stroke="#2A2A2A" /><YAxis tick={{ fill: '#737373', fontSize: 10 }} stroke="#2A2A2A" domain={[0, 100]} /><Tooltip contentStyle={{ background: '#171717', border: '1px solid #2A2A2A', borderRadius: 8 }} /><Legend wrapperStyle={{ fontSize: 10 }} /><Line type="monotone" dataKey="environmental" name="Env" stroke="#FFFFFF" strokeWidth={2} dot={false} /><Line type="monotone" dataKey="social" name="Social" stroke="#A3A3A3" strokeWidth={2} dot={false} /><Line type="monotone" dataKey="governance" name="Gov" stroke="#525252" strokeWidth={2} dot={false} /></LineChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-[#171717] border border-[#2A2A2A] rounded-lg p-4">
            <h3 className="text-sm font-medium text-white mb-3">Score Comparison</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={trend}><CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" /><XAxis dataKey="month" tick={{ fill: '#737373', fontSize: 10 }} stroke="#2A2A2A" /><YAxis tick={{ fill: '#737373', fontSize: 10 }} stroke="#2A2A2A" /><Tooltip contentStyle={{ background: '#171717', border: '1px solid #2A2A2A', borderRadius: 8 }} /><Bar dataKey="environmental" name="Env" fill="#FFFFFF" /><Bar dataKey="social" name="Social" fill="#A3A3A3" /><Bar dataKey="governance" name="Gov" fill="#525252" /></BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
