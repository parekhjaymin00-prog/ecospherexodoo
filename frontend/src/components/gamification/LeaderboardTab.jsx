import { useState, useEffect } from 'react';
import api from '../../services/api.js';
import TableSkeleton from '../TableSkeleton.jsx';
import EmptyState from '../EmptyState.jsx';

export default function LeaderboardTab() {
  const [view, setView] = useState('employees');
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      setLoading(true);
      try {
        const [eRes, dRes] = await Promise.all([api.get('/leaderboard'), api.get('/leaderboard/departments')]);
        setEmployees(eRes.data.leaderboard);
        setDepartments(dRes.data.leaderboard);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    }
    fetch();
  }, []);

  if (loading) return <TableSkeleton rows={10} cols={4} />;

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button onClick={() => setView('employees')} className={`px-4 py-2 text-sm rounded-lg ${view === 'employees' ? 'bg-white text-black font-medium' : 'text-[#A3A3A3] border border-[#2A2A2A] hover:bg-[#1F1F1F]'}`}>Employees</button>
        <button onClick={() => setView('departments')} className={`px-4 py-2 text-sm rounded-lg ${view === 'departments' ? 'bg-white text-black font-medium' : 'text-[#A3A3A3] border border-[#2A2A2A] hover:bg-[#1F1F1F]'}`}>Departments</button>
      </div>

      {view === 'employees' && (
        <div className="bg-[#171717] border border-[#2A2A2A] rounded-lg p-4">
          {employees.length === 0 ? <EmptyState title="No data yet" /> : (
            <div className="space-y-2">
              {employees.map((e, i) => (
                <div key={e.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-[#1F1F1F]">
                  <span className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold ${i < 3 ? 'bg-white text-black' : 'bg-[#2A2A2A] text-[#A3A3A3]'}`}>{i + 1}</span>
                  <div className="flex-1">
                    <p className="text-sm text-white font-medium">{e.fullName}</p>
                    <p className="text-xs text-[#737373]">{e.department?.name || 'No department'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-white font-bold">{e.totalScore} pts</p>
                    <p className="text-xs text-[#525252]">{e.xp} XP · {e.points} pts</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {view === 'departments' && (
        <div className="bg-[#171717] border border-[#2A2A2A] rounded-lg p-4">
          {departments.length === 0 ? <EmptyState title="No data yet" /> : (
            <div className="space-y-2">
              {departments.map((d, i) => (
                <div key={d.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-[#1F1F1F]">
                  <span className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold ${i < 3 ? 'bg-white text-black' : 'bg-[#2A2A2A] text-[#A3A3A3]'}`}>{i + 1}</span>
                  <div className="flex-1">
                    <p className="text-sm text-white font-medium">{d.name}</p>
                    <p className="text-xs text-[#737373]">{d.code}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-white font-bold">{d.score.toFixed(1)}</p>
                    <p className="text-xs text-[#525252]">E:{d.environmental.toFixed(0)} S:{d.social.toFixed(0)} G:{d.governance.toFixed(0)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
