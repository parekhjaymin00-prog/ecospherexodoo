import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import api from '../services/api.js';

function ScoreCard({ title, score, weight, color, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="bg-[#171717] border border-[#2A2A2A] rounded-lg p-6"
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm text-[#A3A3A3] font-medium">{title}</h3>
        <span className="text-xs text-[#525252]">{weight}% weight</span>
      </div>
      <p className="text-3xl font-bold text-white">{score}</p>
      <div className="mt-3 w-full bg-[#2A2A2A] rounded-full h-1.5">
        <div
          className="h-1.5 rounded-full transition-all duration-500"
          style={{ width: `${Math.min(score, 100)}%`, backgroundColor: color }}
        />
      </div>
    </motion.div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-[#171717] border border-[#2A2A2A] rounded-lg p-3 text-sm">
      <p className="text-[#A3A3A3] mb-1">{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} style={{ color: entry.color }}>
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const [scores, setScores] = useState(null);
  const [trend, setTrend] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [scoresRes, trendRes] = await Promise.all([
          api.get('/dashboard/scores'),
          api.get('/dashboard/trend'),
        ]);
        setScores(scoresRes.data);
        setTrend(trendRes.data.trend);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#171717] border border-[#2A2A2A] rounded-lg p-6 text-center">
        <p className="text-[#A3A3A3]">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-3 px-4 py-2 bg-white text-black rounded-lg text-sm font-medium hover:bg-[#D4D4D4] transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page title */}
      <div>
        <h1 className="text-2xl font-bold text-white">ESG Dashboard</h1>
        <p className="text-sm text-[#737373] mt-1">Organization-wide ESG performance overview</p>
      </div>

      {/* Score cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ScoreCard
          title="Environmental"
          score={scores?.environmental || 0}
          weight={scores?.weights?.environmental || 40}
          color="#FFFFFF"
          delay={0}
        />
        <ScoreCard
          title="Social"
          score={scores?.social || 0}
          weight={scores?.weights?.social || 30}
          color="#D4D4D4"
          delay={0.1}
        />
        <ScoreCard
          title="Governance"
          score={scores?.governance || 0}
          weight={scores?.weights?.governance || 30}
          color="#A3A3A3"
          delay={0.2}
        />
        <ScoreCard
          title="Overall ESG"
          score={scores?.overall || 0}
          weight={100}
          color="#FFFFFF"
          delay={0.3}
        />
      </div>

      {/* Trend chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
        className="bg-[#171717] border border-[#2A2A2A] rounded-lg p-6"
      >
        <h2 className="text-lg font-semibold text-white mb-4">ESG Score Trend</h2>
        {trend.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
              <XAxis dataKey="month" stroke="#525252" tick={{ fill: '#737373', fontSize: 12 }} />
              <YAxis stroke="#525252" tick={{ fill: '#737373', fontSize: 12 }} domain={[0, 100]} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ color: '#A3A3A3', fontSize: 12 }} />
              <Line
                type="monotone"
                dataKey="environmental"
                name="Environmental"
                stroke="#FFFFFF"
                strokeWidth={2}
                dot={{ fill: '#FFFFFF', r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="social"
                name="Social"
                stroke="#D4D4D4"
                strokeWidth={2}
                dot={{ fill: '#D4D4D4', r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="governance"
                name="Governance"
                stroke="#737373"
                strokeWidth={2}
                dot={{ fill: '#737373', r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-[#525252] text-sm">No trend data available yet</p>
          </div>
        )}
      </motion.div>

      {/* Recent activity placeholder */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.5 }}
        className="bg-[#171717] border border-[#2A2A2A] rounded-lg p-6"
      >
        <h2 className="text-lg font-semibold text-white mb-4">Recent Activity</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3 py-3 border-b border-[#2A2A2A]">
            <div className="w-2 h-2 rounded-full bg-[#525252]" />
            <p className="text-sm text-[#737373]">No recent activity to display</p>
          </div>
          <p className="text-xs text-[#525252] text-center pt-2">
            Activity from modules will appear here once data is available
          </p>
        </div>
      </motion.div>
    </div>
  );
}
