import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import api from '../services/api.js';
import StatCard from '../components/StatCard.jsx';

export default function DashboardPage() {
  const [scores, setScores] = useState(null);
  const [trend, setTrend] = useState([]);
  const [carbonStats, setCarbonStats] = useState(null);
  const [csrStats, setCsrStats] = useState(null);
  const [policyStats, setPolicyStats] = useState(null);
  const [auditStats, setAuditStats] = useState(null);
  const [complianceStats, setComplianceStats] = useState(null);
  const [challengeStats, setChallengeStats] = useState(null);
  const [goalStats, setGoalStats] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [deptLeaderboard, setDeptLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const results = await Promise.allSettled([
          api.get('/dashboard/scores'),
          api.get('/dashboard/trend'),
          api.get('/carbon-transactions/stats'),
          api.get('/csr-activities/stats'),
          api.get('/policies/stats'),
          api.get('/audits/stats'),
          api.get('/compliance-issues/stats'),
          api.get('/challenges/stats'),
          api.get('/environmental-goals/stats'),
          api.get('/leaderboard'),
          api.get('/leaderboard/departments'),
        ]);
        if (results[0].status === 'fulfilled') setScores(results[0].value.data);
        if (results[1].status === 'fulfilled') setTrend(results[1].value.data.trend);
        if (results[2].status === 'fulfilled') setCarbonStats(results[2].value.data);
        if (results[3].status === 'fulfilled') setCsrStats(results[3].value.data);
        if (results[4].status === 'fulfilled') setPolicyStats(results[4].value.data);
        if (results[5].status === 'fulfilled') setAuditStats(results[5].value.data);
        if (results[6].status === 'fulfilled') setComplianceStats(results[6].value.data);
        if (results[7].status === 'fulfilled') setChallengeStats(results[7].value.data);
        if (results[8].status === 'fulfilled') setGoalStats(results[8].value.data);
        if (results[9].status === 'fulfilled') setLeaderboard(results[9].value.data.leaderboard.slice(0, 5));
        if (results[10].status === 'fulfilled') setDeptLeaderboard(results[10].value.data.leaderboard.slice(0, 5));
      } catch (err) { console.error(err); } finally { setLoading(false); }
    }
    fetchData();
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-white">ESG Dashboard</h1><p className="text-sm text-[#737373] mt-1">Organization-wide performance overview</p></div>

      {/* ESG Scores */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Environmental" value={scores?.environmental || 0} subtitle={`${scores?.weights?.environmental || 40}% weight`} />
        <StatCard title="Social" value={scores?.social || 0} subtitle={`${scores?.weights?.social || 30}% weight`} />
        <StatCard title="Governance" value={scores?.governance || 0} subtitle={`${scores?.weights?.governance || 30}% weight`} />
        <StatCard title="Overall ESG" value={scores?.overall || 0} subtitle="Weighted average" />
      </div>

      {/* Environmental + Social + Governance row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Carbon Emissions" value={`${carbonStats?.totalCarbon || 0} kg`} subtitle="Total CO₂e" />
        <StatCard title="Goals Progress" value={`${goalStats?.avgProgress || 0}%`} subtitle={`${goalStats?.active || 0} active goals`} />
        <StatCard title="CSR Activities" value={csrStats?.total || 0} subtitle={`${csrStats?.active || 0} active`} />
        <StatCard title="Participations" value={csrStats?.totalParticipations || 0} />
      </div>

      {/* Governance + Gamification row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Active Policies" value={policyStats?.active || 0} subtitle={`${policyStats?.totalAcknowledgements || 0} acks`} />
        <StatCard title="Audits" value={auditStats?.total || 0} subtitle={`${auditStats?.completed || 0} completed`} />
        <StatCard title="Compliance Issues" value={complianceStats?.open || 0} subtitle={`${complianceStats?.overdue || 0} overdue`} />
        <StatCard title="Challenges" value={challengeStats?.active || 0} subtitle={`${challengeStats?.totalXPAwarded || 0} XP awarded`} />
      </div>

      {/* Trend Chart */}
      {trend.length > 0 && (
        <div className="bg-[#171717] border border-[#2A2A2A] rounded-lg p-6">
          <h2 className="text-sm font-medium text-white mb-4">ESG Score Trend</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
              <XAxis dataKey="month" tick={{ fill: '#737373', fontSize: 11 }} stroke="#2A2A2A" />
              <YAxis tick={{ fill: '#737373', fontSize: 11 }} stroke="#2A2A2A" domain={[0, 100]} />
              <Tooltip contentStyle={{ background: '#171717', border: '1px solid #2A2A2A', borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="environmental" name="Environmental" stroke="#FFFFFF" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="social" name="Social" stroke="#A3A3A3" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="governance" name="Governance" stroke="#525252" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Leaderboards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-[#171717] border border-[#2A2A2A] rounded-lg p-4">
          <h3 className="text-sm font-medium text-white mb-3">Top Employees</h3>
          {leaderboard.length === 0 ? <p className="text-xs text-[#525252]">No data yet</p> : (
            <div className="space-y-2">
              {leaderboard.map((e, i) => (
                <div key={e.id} className="flex items-center gap-3">
                  <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${i < 3 ? 'bg-white text-black' : 'bg-[#2A2A2A] text-[#737373]'}`}>{i + 1}</span>
                  <span className="text-sm text-white flex-1">{e.fullName}</span>
                  <span className="text-xs text-[#A3A3A3]">{e.totalScore} pts</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="bg-[#171717] border border-[#2A2A2A] rounded-lg p-4">
          <h3 className="text-sm font-medium text-white mb-3">Top Departments</h3>
          {deptLeaderboard.length === 0 ? <p className="text-xs text-[#525252]">No data yet</p> : (
            <div className="space-y-2">
              {deptLeaderboard.map((d, i) => (
                <div key={d.id} className="flex items-center gap-3">
                  <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${i < 3 ? 'bg-white text-black' : 'bg-[#2A2A2A] text-[#737373]'}`}>{i + 1}</span>
                  <span className="text-sm text-white flex-1">{d.name}</span>
                  <span className="text-xs text-[#A3A3A3]">{d.score.toFixed(1)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
