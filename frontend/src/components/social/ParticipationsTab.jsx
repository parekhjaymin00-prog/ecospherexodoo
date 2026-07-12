import { useState, useEffect, useCallback } from 'react';
import api from '../../services/api.js';
import SearchInput from '../SearchInput.jsx';
import Pagination from '../Pagination.jsx';
import EmptyState from '../EmptyState.jsx';
import TableSkeleton from '../TableSkeleton.jsx';
import Toast from '../Toast.jsx';
import { useToast } from '../../hooks/useToast.js';

export default function ParticipationsTab() {
  const [participations, setParticipations] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const { toast, showToast, hideToast } = useToast();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/participations', { params: { page, limit: 10, search, status: statusFilter } });
      setParticipations(res.data.participations);
      setPagination(res.data.pagination);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, [page, search, statusFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleApprove = async (id, status) => {
    try {
      await api.put(`/participations/${id}/approve`, { approvalStatus: status, pointsEarned: 10 });
      showToast(`Participation ${status}`);
      fetchData();
    } catch (err) { showToast(err.response?.data?.error || 'Failed', 'error'); }
  };

  const statusColors = {
    pending: 'bg-yellow-500/10 text-yellow-400',
    approved: 'bg-green-500/10 text-green-400',
    rejected: 'bg-red-500/10 text-red-400',
  };

  return (
    <div className="space-y-4">
      <div className="bg-[#171717] border border-[#2A2A2A] rounded-lg p-4">
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="flex-1"><SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search participations..." /></div>
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="px-3 py-2 text-sm bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:outline-none">
            <option value="">All Status</option><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option>
          </select>
        </div>
        {loading ? <TableSkeleton /> : participations.length === 0 ? <EmptyState title="No participations" message="Employees will appear here when they join activities" /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-[#737373] border-b border-[#2A2A2A]"><th className="pb-3 font-medium">Employee</th><th className="pb-3 font-medium">Activity</th><th className="pb-3 font-medium hidden sm:table-cell">Points</th><th className="pb-3 font-medium">Status</th><th className="pb-3 font-medium hidden md:table-cell">Completed</th><th className="pb-3 font-medium text-right">Actions</th></tr></thead>
              <tbody>
                {participations.map((p) => (
                  <tr key={p.id} className="border-b border-[#2A2A2A] hover:bg-[#1F1F1F]">
                    <td className="py-3 text-white">{p.user?.fullName}</td>
                    <td className="py-3 text-[#A3A3A3]">{p.activity?.title}</td>
                    <td className="py-3 text-[#A3A3A3] hidden sm:table-cell">{p.pointsEarned}</td>
                    <td className="py-3"><span className={`px-2 py-0.5 text-xs rounded-full ${statusColors[p.approvalStatus]}`}>{p.approvalStatus}</span></td>
                    <td className="py-3 text-[#A3A3A3] hidden md:table-cell">{p.completionDate ? new Date(p.completionDate).toLocaleDateString() : '—'}</td>
                    <td className="py-3 text-right">
                      {p.approvalStatus === 'pending' && (
                        <>
                          <button onClick={() => handleApprove(p.id, 'approved')} className="text-green-400 hover:text-green-300 text-xs mr-2">Approve</button>
                          <button onClick={() => handleApprove(p.id, 'rejected')} className="text-red-400 hover:text-red-300 text-xs">Reject</button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination pagination={pagination} onPageChange={setPage} />
      </div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </div>
  );
}
