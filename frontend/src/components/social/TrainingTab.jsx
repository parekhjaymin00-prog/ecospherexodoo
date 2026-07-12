import { useState, useEffect, useCallback } from 'react';
import api from '../../services/api.js';
import SearchInput from '../SearchInput.jsx';
import Pagination from '../Pagination.jsx';
import EmptyState from '../EmptyState.jsx';
import TableSkeleton from '../TableSkeleton.jsx';
import Modal from '../Modal.jsx';
import ConfirmDialog from '../ConfirmDialog.jsx';
import Toast from '../Toast.jsx';
import { useToast } from '../../hooks/useToast.js';

export default function TrainingTab() {
  const [records, setRecords] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ trainingName: '', userId: '', status: 'not_started' });
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const { toast, showToast, hideToast } = useToast();

  const fetchData = useCallback(async () => { setLoading(true); try { const res = await api.get('/training', { params: { page, limit: 10, search, status: statusFilter } }); setRecords(res.data.records); setPagination(res.data.pagination); } catch (err) { console.error(err); } finally { setLoading(false); } }, [page, search, statusFilter]);
  useEffect(() => { fetchData(); }, [fetchData]);

  const handleCreate = async (e) => {
    e.preventDefault(); if (!form.trainingName) return; setSaving(true);
    try {
      // Use current user if no userId specified
      const meRes = await api.get('/auth/me');
      await api.post('/training', { ...form, userId: form.userId || meRes.data.user.id });
      showToast('Training record created'); setModalOpen(false); fetchData();
    } catch (err) { showToast(err.response?.data?.error || 'Failed', 'error'); } finally { setSaving(false); }
  };

  const handleStatusChange = async (id, newStatus) => {
    try { await api.put(`/training/${id}`, { status: newStatus }); showToast(`Marked as ${newStatus.replace('_', ' ')}`); fetchData(); } catch (err) { showToast('Failed', 'error'); }
  };

  const handleDelete = async () => { setDeleting(true); try { await api.delete(`/training/${deleteTarget.id}`); showToast('Deleted'); setDeleteTarget(null); fetchData(); } catch (err) { showToast('Failed', 'error'); } finally { setDeleting(false); } };

  const statusColors = { not_started: 'bg-[#2A2A2A] text-[#737373]', in_progress: 'bg-yellow-500/10 text-yellow-400', completed: 'bg-green-500/10 text-green-400' };

  return (
    <div className="space-y-4">
      <div className="flex justify-end"><button onClick={() => { setForm({ trainingName: '', userId: '', status: 'not_started' }); setModalOpen(true); }} className="px-4 py-2 text-sm bg-white text-black font-medium rounded-lg hover:bg-[#D4D4D4]">Add Training</button></div>
      <div className="bg-[#171717] border border-[#2A2A2A] rounded-lg p-4">
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="flex-1"><SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search training..." /></div>
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="px-3 py-2 text-sm bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:outline-none"><option value="">All Status</option><option value="not_started">Not Started</option><option value="in_progress">In Progress</option><option value="completed">Completed</option></select>
        </div>
        {loading ? <TableSkeleton /> : records.length === 0 ? <EmptyState title="No training records" message="Add training records for employees" /> : (
          <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="text-left text-[#737373] border-b border-[#2A2A2A]"><th className="pb-3 font-medium">Employee</th><th className="pb-3 font-medium">Training</th><th className="pb-3 font-medium">Status</th><th className="pb-3 font-medium hidden sm:table-cell">Completed</th><th className="pb-3 font-medium text-right">Actions</th></tr></thead><tbody>
            {records.map((r) => (
              <tr key={r.id} className="border-b border-[#2A2A2A] hover:bg-[#1F1F1F]">
                <td className="py-3 text-white">{r.user?.fullName}</td>
                <td className="py-3 text-[#A3A3A3]">{r.trainingName}</td>
                <td className="py-3"><span className={`px-2 py-0.5 text-xs rounded-full ${statusColors[r.status]}`}>{r.status.replace('_', ' ')}</span></td>
                <td className="py-3 text-[#A3A3A3] hidden sm:table-cell">{r.completionDate ? new Date(r.completionDate).toLocaleDateString() : '—'}</td>
                <td className="py-3 text-right space-x-1">
                  {r.status !== 'completed' && <button onClick={() => handleStatusChange(r.id, r.status === 'not_started' ? 'in_progress' : 'completed')} className="text-green-400 hover:text-green-300 text-xs">{r.status === 'not_started' ? 'Start' : 'Complete'}</button>}
                  <button onClick={() => setDeleteTarget(r)} className="text-red-400 hover:text-red-300 text-xs">Delete</button>
                </td>
              </tr>
            ))}
          </tbody></table></div>
        )}
        <Pagination pagination={pagination} onPageChange={setPage} />
      </div>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Training Record" size="sm">
        <form onSubmit={handleCreate} className="space-y-4">
          <div><label className="block text-xs text-[#A3A3A3] mb-1">Training/Course Name *</label><input value={form.trainingName} onChange={(e) => setForm({...form, trainingName: e.target.value})} className="w-full px-3 py-2 text-sm bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:border-[#525252] focus:outline-none" /></div>
          <div className="flex gap-3 justify-end"><button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm border border-[#2A2A2A] text-[#A3A3A3] rounded-lg">Cancel</button><button type="submit" disabled={saving} className="px-4 py-2 text-sm bg-white text-black font-medium rounded-lg disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button></div>
        </form>
      </Modal>
      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete Record" message="Delete this training record?" loading={deleting} />
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </div>
  );
}
