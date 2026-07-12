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

function PolicyForm({ policy, onSave, onCancel }) {
  const [form, setForm] = useState({ title: policy?.title || '', description: policy?.description || '', content: policy?.content || '', version: policy?.version || '1.0', status: policy?.status || 'draft', effectiveAt: policy?.effectiveAt ? policy.effectiveAt.slice(0, 10) : '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const handleSubmit = async (e) => { e.preventDefault(); if (!form.title || !form.content) { setError('Title and content are required'); return; } setSaving(true); setError(null); try { await onSave(form); } catch (err) { setError(err.response?.data?.error || 'Failed to save'); } finally { setSaving(false); } };
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-sm text-red-400 bg-red-400/10 p-3 rounded-lg">{error}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2"><label className="block text-xs text-[#A3A3A3] mb-1">Title *</label><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-3 py-2 text-sm bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:border-[#525252] focus:outline-none" /></div>
        <div><label className="block text-xs text-[#A3A3A3] mb-1">Version</label><input value={form.version} onChange={(e) => setForm({ ...form, version: e.target.value })} className="w-full px-3 py-2 text-sm bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:border-[#525252] focus:outline-none" /></div>
        <div><label className="block text-xs text-[#A3A3A3] mb-1">Status</label><select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full px-3 py-2 text-sm bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:outline-none"><option value="draft">Draft</option><option value="active">Active</option><option value="archived">Archived</option></select></div>
        <div><label className="block text-xs text-[#A3A3A3] mb-1">Effective Date</label><input type="date" value={form.effectiveAt} onChange={(e) => setForm({ ...form, effectiveAt: e.target.value })} className="w-full px-3 py-2 text-sm bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:border-[#525252] focus:outline-none" /></div>
        <div><label className="block text-xs text-[#A3A3A3] mb-1">Description</label><input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 text-sm bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:border-[#525252] focus:outline-none" /></div>
      </div>
      <div><label className="block text-xs text-[#A3A3A3] mb-1">Content *</label><textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={6} className="w-full px-3 py-2 text-sm bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:border-[#525252] focus:outline-none resize-none" /></div>
      <div className="flex gap-3 justify-end pt-2"><button type="button" onClick={onCancel} className="px-4 py-2 text-sm border border-[#2A2A2A] text-[#A3A3A3] rounded-lg hover:bg-[#1F1F1F]">Cancel</button><button type="submit" disabled={saving} className="px-4 py-2 text-sm bg-white text-black font-medium rounded-lg hover:bg-[#D4D4D4] disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button></div>
    </form>
  );
}

export default function PoliciesTab() {
  const [policies, setPolicies] = useState([]);
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

  const fetchData = useCallback(async () => { setLoading(true); try { const [pRes, sRes] = await Promise.all([api.get('/policies', { params: { page, limit: 10, search, status: statusFilter } }), api.get('/policies/stats')]); setPolicies(pRes.data.policies); setPagination(pRes.data.pagination); setStats(sRes.data); } catch (err) { console.error(err); } finally { setLoading(false); } }, [page, search, statusFilter]);
  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async (form) => { if (editing) { await api.put(`/policies/${editing.id}`, form); showToast('Policy updated'); } else { await api.post('/policies', form); showToast('Policy created'); } setModalOpen(false); setEditing(null); fetchData(); };
  const handleDelete = async () => { setDeleting(true); try { await api.delete(`/policies/${deleteTarget.id}`); showToast('Policy deleted'); setDeleteTarget(null); fetchData(); } catch (err) { showToast(err.response?.data?.error || 'Failed', 'error'); } finally { setDeleting(false); } };
  const handleAcknowledge = async (policyId) => { try { await api.post('/policies/acknowledge', { policyId }); showToast('Policy acknowledged'); fetchData(); } catch (err) { showToast(err.response?.data?.error || 'Failed', 'error'); } };

  const statusColors = { draft: 'bg-yellow-500/10 text-yellow-400', active: 'bg-green-500/10 text-green-400', archived: 'bg-[#2A2A2A] text-[#737373]' };

  return (
    <div className="space-y-6">
      {stats && <div className="grid grid-cols-2 lg:grid-cols-4 gap-4"><StatCard title="Total Policies" value={stats.total} /><StatCard title="Active" value={stats.active} /><StatCard title="Draft" value={stats.draft} /><StatCard title="Acknowledgements" value={stats.totalAcknowledgements} /></div>}
      <div className="flex justify-end"><button onClick={() => { setEditing(null); setModalOpen(true); }} className="px-4 py-2 text-sm bg-white text-black font-medium rounded-lg hover:bg-[#D4D4D4]">Add Policy</button></div>
      <div className="bg-[#171717] border border-[#2A2A2A] rounded-lg p-4">
        <div className="flex flex-col sm:flex-row gap-3 mb-4"><div className="flex-1"><SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search policies..." /></div><select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="px-3 py-2 text-sm bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:outline-none"><option value="">All</option><option value="active">Active</option><option value="draft">Draft</option><option value="archived">Archived</option></select></div>
        {loading ? <TableSkeleton /> : policies.length === 0 ? <EmptyState title="No policies" /> : (
          <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="text-left text-[#737373] border-b border-[#2A2A2A]"><th className="pb-3 font-medium">Title</th><th className="pb-3 font-medium hidden sm:table-cell">Version</th><th className="pb-3 font-medium">Status</th><th className="pb-3 font-medium hidden md:table-cell">Acks</th><th className="pb-3 font-medium text-right">Actions</th></tr></thead><tbody>
            {policies.map((p) => (<tr key={p.id} className="border-b border-[#2A2A2A] hover:bg-[#1F1F1F]"><td className="py-3 text-white">{p.title}</td><td className="py-3 text-[#A3A3A3] hidden sm:table-cell">v{p.version}</td><td className="py-3"><span className={`px-2 py-0.5 text-xs rounded-full ${statusColors[p.status]}`}>{p.status}</span></td><td className="py-3 text-[#A3A3A3] hidden md:table-cell">{p._count?.acknowledgements || 0}</td><td className="py-3 text-right space-x-2"><button onClick={() => handleAcknowledge(p.id)} className="text-green-400 hover:text-green-300 text-xs">Acknowledge</button><button onClick={() => { setEditing(p); setModalOpen(true); }} className="text-[#A3A3A3] hover:text-white text-xs">Edit</button><button onClick={() => setDeleteTarget(p)} className="text-red-400 hover:text-red-300 text-xs">Delete</button></td></tr>))}
          </tbody></table></div>
        )}
        <Pagination pagination={pagination} onPageChange={setPage} />
      </div>
      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditing(null); }} title={editing ? 'Edit Policy' : 'Create Policy'} size="lg"><PolicyForm policy={editing} onSave={handleSave} onCancel={() => { setModalOpen(false); setEditing(null); }} /></Modal>
      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete Policy" message={`Delete "${deleteTarget?.title}"?`} loading={deleting} />
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </div>
  );
}
