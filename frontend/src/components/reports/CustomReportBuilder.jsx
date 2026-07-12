import { useState, useEffect } from 'react';
import api from '../../services/api.js';
import ExportBar from './ExportBar.jsx';
import EmptyState from '../EmptyState.jsx';
import TableSkeleton from '../TableSkeleton.jsx';

export default function CustomReportBuilder() {
  const [filters, setFilters] = useState({ module: '', departmentId: '', employeeId: '', challengeId: '', esgCategory: '', startDate: '', endDate: '', status: '', groupBy: 'month' });
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get('/departments/all'),
      api.get('/challenges', { params: { limit: 100 } }),
    ]).then(([dRes, cRes]) => {
      setDepartments(dRes.data.departments || []);
      setChallenges(cRes.data.challenges || []);
    }).catch(console.error);
    // Load employees (users) - use leaderboard endpoint which returns all users
    api.get('/leaderboard').then(r => setEmployees(r.data.leaderboard || [])).catch(console.error);
  }, []);

  const generateReport = async () => {
    setLoading(true);
    try {
      const params = {};
      Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v; });
      const res = await api.get('/reports/custom', { params });
      setData(res.data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const exportData = data?.data?.map(d => ({ Module: d.module, Type: d.type, Date: new Date(d.date).toLocaleDateString(), Description: d.description, Value: d.value, Unit: d.unit, Department: d.department, Employee: d.employee })) || [];

  return (
    <div className="space-y-6">
      <div className="bg-[#171717] border border-[#2A2A2A] rounded-lg p-6">
        <h3 className="text-sm font-medium text-white mb-4">Report Filters</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div><label className="block text-xs text-[#A3A3A3] mb-1">Module</label><select value={filters.module} onChange={(e) => setFilters({...filters, module: e.target.value})} className="w-full px-3 py-2 text-sm bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:outline-none"><option value="">All Modules</option><option value="environmental">Environmental</option><option value="social">Social</option><option value="governance">Governance</option><option value="gamification">Gamification</option></select></div>
          <div><label className="block text-xs text-[#A3A3A3] mb-1">ESG Category</label><select value={filters.esgCategory} onChange={(e) => setFilters({...filters, esgCategory: e.target.value})} className="w-full px-3 py-2 text-sm bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:outline-none"><option value="">All</option><option value="environmental">Environmental</option><option value="social">Social</option><option value="governance">Governance</option></select></div>
          <div><label className="block text-xs text-[#A3A3A3] mb-1">Department</label><select value={filters.departmentId} onChange={(e) => setFilters({...filters, departmentId: e.target.value})} className="w-full px-3 py-2 text-sm bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:outline-none"><option value="">All Departments</option>{departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</select></div>
          <div><label className="block text-xs text-[#A3A3A3] mb-1">Employee</label><select value={filters.employeeId} onChange={(e) => setFilters({...filters, employeeId: e.target.value})} className="w-full px-3 py-2 text-sm bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:outline-none"><option value="">All Employees</option>{employees.map(e => <option key={e.id} value={e.id}>{e.fullName}</option>)}</select></div>
          <div><label className="block text-xs text-[#A3A3A3] mb-1">Challenge</label><select value={filters.challengeId} onChange={(e) => setFilters({...filters, challengeId: e.target.value})} className="w-full px-3 py-2 text-sm bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:outline-none"><option value="">All Challenges</option>{challenges.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}</select></div>
          <div><label className="block text-xs text-[#A3A3A3] mb-1">Status</label><input value={filters.status} onChange={(e) => setFilters({...filters, status: e.target.value})} placeholder="e.g. active, open" className="w-full px-3 py-2 text-sm bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white placeholder-[#525252] focus:border-[#525252] focus:outline-none" /></div>
          <div><label className="block text-xs text-[#A3A3A3] mb-1">Start Date</label><input type="date" value={filters.startDate} onChange={(e) => setFilters({...filters, startDate: e.target.value})} className="w-full px-3 py-2 text-sm bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:border-[#525252] focus:outline-none" /></div>
          <div><label className="block text-xs text-[#A3A3A3] mb-1">End Date</label><input type="date" value={filters.endDate} onChange={(e) => setFilters({...filters, endDate: e.target.value})} className="w-full px-3 py-2 text-sm bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:border-[#525252] focus:outline-none" /></div>
          <div><label className="block text-xs text-[#A3A3A3] mb-1">Group By</label><select value={filters.groupBy} onChange={(e) => setFilters({...filters, groupBy: e.target.value})} className="w-full px-3 py-2 text-sm bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:outline-none"><option value="month">Month</option><option value="none">No Grouping</option></select></div>
        </div>
        <button onClick={generateReport} disabled={loading} className="mt-4 px-6 py-2.5 text-sm bg-white text-black font-medium rounded-lg hover:bg-[#D4D4D4] disabled:opacity-50">{loading ? 'Generating...' : 'Generate Report'}</button>
      </div>

      {loading && <TableSkeleton rows={6} cols={5} />}

      {data && !loading && (
        <div className="space-y-4" id="custom-report">
          <div className="flex items-center justify-between">
            <p className="text-sm text-[#A3A3A3]">{data.total} records found</p>
            <ExportBar data={exportData} filename="custom-report" reportId="custom-report" />
          </div>
          {data.data.length === 0 ? <EmptyState title="No data matches your filters" /> : (
            <div className="bg-[#171717] border border-[#2A2A2A] rounded-lg p-4 overflow-x-auto">
              <table className="w-full text-sm"><thead><tr className="text-left text-[#737373] border-b border-[#2A2A2A]"><th className="pb-3 font-medium">Module</th><th className="pb-3 font-medium">Type</th><th className="pb-3 font-medium">Date</th><th className="pb-3 font-medium">Description</th><th className="pb-3 font-medium">Value</th><th className="pb-3 font-medium hidden md:table-cell">Dept</th><th className="pb-3 font-medium hidden lg:table-cell">Employee</th></tr></thead><tbody>
                {data.data.slice(0, 50).map((d, i) => (
                  <tr key={i} className="border-b border-[#2A2A2A] hover:bg-[#1F1F1F]"><td className="py-2 text-[#A3A3A3]">{d.module}</td><td className="py-2 text-white">{d.type}</td><td className="py-2 text-[#A3A3A3]">{new Date(d.date).toLocaleDateString()}</td><td className="py-2 text-white max-w-[200px] truncate">{d.description}</td><td className="py-2 text-white">{d.value} {d.unit}</td><td className="py-2 text-[#A3A3A3] hidden md:table-cell">{d.department}</td><td className="py-2 text-[#A3A3A3] hidden lg:table-cell">{d.employee || '—'}</td></tr>
                ))}
              </tbody></table>
              {data.total > 50 && <p className="text-xs text-[#525252] text-center mt-3">Showing 50 of {data.total}. Export for full data.</p>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
