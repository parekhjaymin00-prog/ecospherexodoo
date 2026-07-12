import { useState, useEffect, useCallback } from 'react';
import api from '../../services/api.js';
import StatCard from '../StatCard.jsx';
import SearchInput from '../SearchInput.jsx';
import Pagination from '../Pagination.jsx';
import EmptyState from '../EmptyState.jsx';
import TableSkeleton from '../TableSkeleton.jsx';
import Modal from '../Modal.jsx';
import ConfirmDialog from '../ConfirmDialog.jsx';
import Toast from '../Toast.jsx';
import { useToast } from '../../hooks/useToast.js';

function AuditForm({ audit, onSave, onCancel }) {
  const [form, setForm] = useState({ title: audit?.title || '', description: audit?.description || '', auditDate: audit?.auditDate ? audit.auditDate.slice(0, 10) : '', status: audit?.status || 'scheduled', findings: audit?.findings || '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const handleSubmit = async (e) => { e.preventDefault(); if (!form.title || !form.auditDate) { setError('Title and date are required'); return; } setSaving(true); setError(null); try { await onSave(form); } catch (err) { setError(err.response?.data?.error || 'Failed'); } finally { setSaving(false); } };
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-sm text-red-400 bg-red-400/10 p-3 rounded-lg">{error}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2"><label className="block text-xs text-[#A3A3A3] mb-1">Title *</label><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-3 py-2 text-sm bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:border-[#525252] focus:outline-none" /></div>
        <div><label className="block text-xs text-[#A3A3A3] mb-1">Audit Date *</label><input type="date" value={form.auditDate} onChange={(e) => setForm({ ...form, auditDate: e.target.value })} className="w-full px-3 py-2 text-sm bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:border-[#525252] focus:outline-none" /></div>
        <div><label className="block text-xs text-[#A3A3A3] mb-1">Status</label><select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full px-3 py-2 text-sm bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:outline-none"><option value="scheduled">Scheduled</option><option value="in_progress">In Progress</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select></div>
      </div>
      <div><label className="block text-xs text-[#A3A3A3] mb-1">Description</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="w-full px-3 py-2 text-sm bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:border-[#525252] focus:outline-none resize-none" /></div>
      <div><label className="block text-xs text-[#A3A3A3] mb-1">Findings</label><textarea value={form.findings} onChange={(e) => setForm({ ...form, findings: e.target.value })} rows={3} className="w-full px-3 py-2 text-sm bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:border-[#525252] focus:outline-none resize-none" /></div>
      <div className="flex gap-3 justify-end pt-2"><button type="button" onClick={onCancel} className="px-4 py-2 text-sm border border-[#2A2A2A] text-[#A3A3A3] rounded-lg hover:bg-[#1F1F1F]">Cancel</button><button type="submit" disabled={saving} className="px-4 py-2 text-sm bg-white text-black font-medium rounded-lg hover:bg-[#D4D4D4] disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button></div>
    </form>
  );
}

export default function AuditsTab() {
  const [audits, setAudits] = useState([]);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const { toast, showToast, hideToast } = useToast();

  const fetchData = useCallback(async () => { setLoading(true); try { const [aRes, sRes] = await Promise.all([api.get('/audits', { params: { page, limit: 10, search, status: statusFilter } }), api.get('/audits/stats')]); setAudits(aRes.data.audits); setPagination(aRes.data.pagination); setStats(sRes.data); } catch (err) { console.error(err); } finally { setLoading(false); } }, [page, search, statusFilter]);
  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async (form) => { if (editing) { await api.put(`/audits/${editing.id}`, form); showToast('Audit updated'); } else { await api.post('/audits', form); showToast('Audit created'); } setModalOpen(false); setEditing(null); fetchData(); };
  const handleDelete = async () => { setDeleting(true); try { await api.delete(`/audits/${deleteTarget.id}`); showToast('Audit deleted'); setDeleteTarget(null); fetchData(); } catch (err) { showToast(err.response?.data?.error || 'Failed', 'error'); } finally { setDeleting(false); } };

  const statusColors = { scheduled: 'bg-blue-500/10 text-blue-400', in_progress: 'bg-yellow-500/10 text-yellow-400', completed: 'bg-green-500/10 text-green-400', cancelled: 'bg-[#2A2A2A] text-[#737373]' };

  return (
    <div className="space-y-6">
      {stats && <div className="grid grid-cols-2 lg:grid-cols-4 gap-4"><StatCard title="Total Audits" value={stats.total} /><StatCard title="Scheduled" value={stats.scheduled} /><StatCard title="In Progress" value={stats.inProgress} /><StatCard title="Completed" value={stats.completed} /></div>}
      <div className="flex justify-end"><button onClick={() => { setEditing(null); setModalOpen(true); }} className="px-4 py-2 text-sm bg-white text-black font-medium rounded-lg hover:bg-[#D4D4D4]">Add Audit</button></div>
      <div className="bg-[#171717] border border-[#2A2A2A] rounded-lg p-4">
        <div className="flex flex-col sm:flex-row gap-3 mb-4"><div className="flex-1"><SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search audits..." /></div><select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="px-3 py-2 text-sm bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:outline-none"><option value="">All</option><option value="scheduled">Scheduled</option><option value="in_progress">In Progress</option><option value="completed">Completed</option></select></div>
        {loading ? <TableSkeleton /> : audits.length === 0 ? <EmptyState title="No audits" /> : (
          <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="text-left text-[#737373] border-b border-[#2A2A2A]"><th className="pb-3 font-medium">Title</th><th className="pb-3 font-medium hidden sm:table-cell">Date</th><th className="pb-3 font-medium">Status</th><th className="pb-3 font-medium hidden md:table-cell">Lead</th><th className="pb-3 font-medium hidden md:table-cell">Issues</th><th className="pb-3 font-medium text-right">Actions</th></tr></thead><tbody>
            {audits.map((a) => (<tr key={a.id} className="border-b border-[#2A2A2A] hover:bg-[#1F1F1F]"><td className="py-3 text-white">{a.title}</td><td className="py-3 text-[#A3A3A3] hidden sm:table-cell">{new Date(a.auditDate).toLocaleDateString()}</td><td className="py-3"><span className={`px-2 py-0.5 text-xs rounded-full ${statusColors[a.status]}`}>{a.status.replace('_', ' ')}</span></td><td className="py-3 text-[#A3A3A3] hidden md:table-cell">{a.lead?.fullName}</td><td className="py-3 text-[#A3A3A3] hidden md:table-cell">{a._count?.complianceIssues || 0}</td><td className="py-3 text-right"><button onClick={() => { setEditing(a); setModalOpen(true); }} className="text-[#A3A3A3] hover:text-white mr-3 text-xs">Edit</button><button onClick={() => setDeleteTarget(a)} className="text-red-400 hover:text-red-300 text-xs">Delete</button></td></tr>))}
          </tbody></table></div>
        )}
        <Pagination pagination={pagination} onPageChange={setPage} />
      </div>
      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditing(null); }} title={editing ? 'Edit Audit' : 'Create Audit'} size="lg"><AuditForm audit={editing} onSave={handleSave} onCancel={() => { setModalOpen(false); setEditing(null); }} /></Modal>
      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete Audit" message={`Delete "${deleteTarget?.title}"?`} loading={deleting} />
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </div>
  );
}
