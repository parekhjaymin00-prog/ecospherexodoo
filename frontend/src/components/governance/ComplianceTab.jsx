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

function IssueForm({ issue, audits, onSave, onCancel }) {
  const [form, setForm] = useState({ description: issue?.description || '', severity: issue?.severity || 'medium', dueDate: issue?.dueDate ? issue.dueDate.slice(0, 10) : '', status: issue?.status || 'open', auditId: issue?.auditId || '', ownerId: issue?.ownerId || '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const handleSubmit = async (e) => { e.preventDefault(); if (!form.description || !form.severity || !form.dueDate || !form.auditId) { setError('Description, severity, due date, and audit are required'); return; } setSaving(true); setError(null); try { await onSave(form); } catch (err) { setError(err.response?.data?.error || 'Failed'); } finally { setSaving(false); } };
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-sm text-red-400 bg-red-400/10 p-3 rounded-lg">{error}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2"><label className="block text-xs text-[#A3A3A3] mb-1">Description *</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full px-3 py-2 text-sm bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:border-[#525252] focus:outline-none resize-none" /></div>
        <div><label className="block text-xs text-[#A3A3A3] mb-1">Severity *</label><select value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })} className="w-full px-3 py-2 text-sm bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:outline-none"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option></select></div>
        <div><label className="block text-xs text-[#A3A3A3] mb-1">Status</label><select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full px-3 py-2 text-sm bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:outline-none"><option value="open">Open</option><option value="in_progress">In Progress</option><option value="resolved">Resolved</option><option value="overdue">Overdue</option></select></div>
        <div><label className="block text-xs text-[#A3A3A3] mb-1">Due Date *</label><input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className="w-full px-3 py-2 text-sm bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:border-[#525252] focus:outline-none" /></div>
        <div><label className="block text-xs text-[#A3A3A3] mb-1">Audit *</label><select value={form.auditId} onChange={(e) => setForm({ ...form, auditId: e.target.value })} className="w-full px-3 py-2 text-sm bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:outline-none"><option value="">Select audit</option>{audits.map(a => <option key={a.id} value={a.id}>{a.title}</option>)}</select></div>
      </div>
      <div className="flex gap-3 justify-end pt-2"><button type="button" onClick={onCancel} className="px-4 py-2 text-sm border border-[#2A2A2A] text-[#A3A3A3] rounded-lg hover:bg-[#1F1F1F]">Cancel</button><button type="submit" disabled={saving} className="px-4 py-2 text-sm bg-white text-black font-medium rounded-lg hover:bg-[#D4D4D4] disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button></div>
    </form>
  );
}

export default function ComplianceTab() {
  const [issues, setIssues] = useState([]);
  const [stats, setStats] = useState(null);
  const [audits, setAudits] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const { toast, showToast, hideToast } = useToast();

  const fetchData = useCallback(async () => { setLoading(true); try { const [iRes, sRes, aRes] = await Promise.all([api.get('/compliance-issues', { params: { page, limit: 10, search, severity: severityFilter } }), api.get('/compliance-issues/stats'), api.get('/audits', { params: { limit: 100 } })]); setIssues(iRes.data.issues); setPagination(iRes.data.pagination); setStats(sRes.data); setAudits(aRes.data.audits); } catch (err) { console.error(err); } finally { setLoading(false); } }, [page, search, severityFilter]);
  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async (form) => { const data = { ...form, ownerId: form.ownerId || undefined }; if (editing) { await api.put(`/compliance-issues/${editing.id}`, data); showToast('Issue updated'); } else { if (!data.ownerId) { data.ownerId = (await api.get('/auth/me')).data.user.id; } await api.post('/compliance-issues', data); showToast('Issue created'); } setModalOpen(false); setEditing(null); fetchData(); };
  const handleDelete = async () => { setDeleting(true); try { await api.delete(`/compliance-issues/${deleteTarget.id}`); showToast('Issue deleted'); setDeleteTarget(null); fetchData(); } catch (err) { showToast(err.response?.data?.error || 'Failed', 'error'); } finally { setDeleting(false); } };

  const severityColors = { low: 'bg-blue-500/10 text-blue-400', medium: 'bg-yellow-500/10 text-yellow-400', high: 'bg-orange-500/10 text-orange-400', critical: 'bg-red-500/10 text-red-400' };

  return (
    <div className="space-y-6">
      {stats && <div className="grid grid-cols-2 lg:grid-cols-4 gap-4"><StatCard title="Total Issues" value={stats.total} /><StatCard title="Open" value={stats.open} /><StatCard title="Resolved" value={stats.resolved} /><StatCard title="Overdue" value={stats.overdue} /></div>}
      <div className="flex justify-end"><button onClick={() => { setEditing(null); setModalOpen(true); }} className="px-4 py-2 text-sm bg-white text-black font-medium rounded-lg hover:bg-[#D4D4D4]">Add Issue</button></div>
      <div className="bg-[#171717] border border-[#2A2A2A] rounded-lg p-4">
        <div className="flex flex-col sm:flex-row gap-3 mb-4"><div className="flex-1"><SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search issues..." /></div><select value={severityFilter} onChange={(e) => { setSeverityFilter(e.target.value); setPage(1); }} className="px-3 py-2 text-sm bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:outline-none"><option value="">All Severity</option><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option></select></div>
        {loading ? <TableSkeleton /> : issues.length === 0 ? <EmptyState title="No compliance issues" /> : (
          <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="text-left text-[#737373] border-b border-[#2A2A2A]"><th className="pb-3 font-medium">Description</th><th className="pb-3 font-medium">Severity</th><th className="pb-3 font-medium hidden sm:table-cell">Status</th><th className="pb-3 font-medium hidden md:table-cell">Due</th><th className="pb-3 font-medium hidden md:table-cell">Owner</th><th className="pb-3 font-medium text-right">Actions</th></tr></thead><tbody>
            {issues.map((i) => (<tr key={i.id} className="border-b border-[#2A2A2A] hover:bg-[#1F1F1F]"><td className="py-3 text-white max-w-[200px] truncate">{i.description}</td><td className="py-3"><span className={`px-2 py-0.5 text-xs rounded-full ${severityColors[i.severity]}`}>{i.severity}</span></td><td className="py-3 text-[#A3A3A3] hidden sm:table-cell">{i.status.replace('_', ' ')}</td><td className="py-3 text-[#A3A3A3] hidden md:table-cell">{new Date(i.dueDate).toLocaleDateString()}</td><td className="py-3 text-[#A3A3A3] hidden md:table-cell">{i.owner?.fullName}</td><td className="py-3 text-right"><button onClick={() => { setEditing(i); setModalOpen(true); }} className="text-[#A3A3A3] hover:text-white mr-3 text-xs">Edit</button><button onClick={() => setDeleteTarget(i)} className="text-red-400 hover:text-red-300 text-xs">Delete</button></td></tr>))}
          </tbody></table></div>
        )}
        <Pagination pagination={pagination} onPageChange={setPage} />
      </div>
      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditing(null); }} title={editing ? 'Edit Issue' : 'Create Issue'} size="lg"><IssueForm issue={editing} audits={audits} onSave={handleSave} onCancel={() => { setModalOpen(false); setEditing(null); }} /></Modal>
      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete Issue" message="Delete this compliance issue?" loading={deleting} />
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </div>
  );
}
