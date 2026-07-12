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

function ActivityForm({ activity, categories, departments, onSave, onCancel }) {
  const [form, setForm] = useState({
    title: activity?.title || '', description: activity?.description || '',
    location: activity?.location || '', startDate: activity?.startDate ? activity.startDate.slice(0, 10) : '',
    endDate: activity?.endDate ? activity.endDate.slice(0, 10) : '', budget: activity?.budget || '',
    maxParticipants: activity?.maxParticipants || '', categoryId: activity?.categoryId || '',
    departmentId: activity?.departmentId || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.startDate || !form.endDate || !form.categoryId) { setError('Title, dates, and category are required'); return; }
    setSaving(true); setError(null);
    try { await onSave(form); } catch (err) { setError(err.response?.data?.error || 'Failed to save'); } finally { setSaving(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-sm text-red-400 bg-red-400/10 p-3 rounded-lg">{error}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2"><label className="block text-xs text-[#A3A3A3] mb-1">Title *</label><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-3 py-2 text-sm bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:border-[#525252] focus:outline-none" /></div>
        <div><label className="block text-xs text-[#A3A3A3] mb-1">Category *</label>
          <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className="w-full px-3 py-2 text-sm bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:outline-none">
            <option value="">Select category</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div><label className="block text-xs text-[#A3A3A3] mb-1">Department</label>
          <select value={form.departmentId} onChange={(e) => setForm({ ...form, departmentId: e.target.value })} className="w-full px-3 py-2 text-sm bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:outline-none">
            <option value="">None</option>
            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
        <div><label className="block text-xs text-[#A3A3A3] mb-1">Location</label><input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="w-full px-3 py-2 text-sm bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:border-[#525252] focus:outline-none" /></div>
        <div><label className="block text-xs text-[#A3A3A3] mb-1">Budget</label><input type="number" step="0.01" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} className="w-full px-3 py-2 text-sm bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:border-[#525252] focus:outline-none" /></div>
        <div><label className="block text-xs text-[#A3A3A3] mb-1">Start Date *</label><input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="w-full px-3 py-2 text-sm bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:border-[#525252] focus:outline-none" /></div>
        <div><label className="block text-xs text-[#A3A3A3] mb-1">End Date *</label><input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="w-full px-3 py-2 text-sm bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:border-[#525252] focus:outline-none" /></div>
        <div><label className="block text-xs text-[#A3A3A3] mb-1">Max Participants</label><input type="number" value={form.maxParticipants} onChange={(e) => setForm({ ...form, maxParticipants: e.target.value })} className="w-full px-3 py-2 text-sm bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:border-[#525252] focus:outline-none" /></div>
      </div>
      <div><label className="block text-xs text-[#A3A3A3] mb-1">Description</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="w-full px-3 py-2 text-sm bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:border-[#525252] focus:outline-none resize-none" /></div>
      <div className="flex gap-3 justify-end pt-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm border border-[#2A2A2A] text-[#A3A3A3] rounded-lg hover:bg-[#1F1F1F]">Cancel</button>
        <button type="submit" disabled={saving} className="px-4 py-2 text-sm bg-white text-black font-medium rounded-lg hover:bg-[#D4D4D4] disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
      </div>
    </form>
  );
}

export default function CSRActivitiesTab() {
  const [activities, setActivities] = useState([]);
  const [stats, setStats] = useState(null);
  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const { toast, showToast, hideToast } = useToast();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [actRes, statsRes, catRes, deptRes] = await Promise.all([
        api.get('/csr-activities', { params: { page, limit: 10, search } }),
        api.get('/csr-activities/stats'),
        api.get('/categories', { params: { type: 'CSR_ACTIVITY', status: 'active' } }),
        api.get('/departments/all'),
      ]);
      setActivities(actRes.data.activities);
      setPagination(actRes.data.pagination);
      setStats(statsRes.data);
      setCategories(catRes.data.categories);
      setDepartments(deptRes.data.departments);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async (form) => {
    if (editing) { await api.put(`/csr-activities/${editing.id}`, form); showToast('Activity updated'); }
    else { await api.post('/csr-activities', form); showToast('Activity created'); }
    setModalOpen(false); setEditing(null); fetchData();
  };

  const handleDelete = async () => {
    setDeleting(true);
    try { await api.delete(`/csr-activities/${deleteTarget.id}`); showToast('Activity deleted'); setDeleteTarget(null); fetchData(); }
    catch (err) { showToast(err.response?.data?.error || 'Failed to delete', 'error'); } finally { setDeleting(false); }
  };

  const handleJoin = async (activityId) => {
    try { await api.post('/participations/join', { activityId }); showToast('Joined activity!'); fetchData(); }
    catch (err) { showToast(err.response?.data?.error || 'Failed to join', 'error'); }
  };

  return (
    <div className="space-y-6">
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Activities" value={stats.total} />
          <StatCard title="Active Now" value={stats.active} />
          <StatCard title="Completed" value={stats.completed} />
          <StatCard title="Total Participations" value={stats.totalParticipations} />
        </div>
      )}

      <div className="flex justify-end"><button onClick={() => { setEditing(null); setModalOpen(true); }} className="px-4 py-2 text-sm bg-white text-black font-medium rounded-lg hover:bg-[#D4D4D4]">Add Activity</button></div>

      <div className="bg-[#171717] border border-[#2A2A2A] rounded-lg p-4">
        <div className="mb-4"><SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search activities..." /></div>
        {loading ? <TableSkeleton /> : activities.length === 0 ? <EmptyState title="No CSR activities" message="Create your first activity" /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-[#737373] border-b border-[#2A2A2A]"><th className="pb-3 font-medium">Title</th><th className="pb-3 font-medium hidden sm:table-cell">Category</th><th className="pb-3 font-medium hidden md:table-cell">Department</th><th className="pb-3 font-medium">Dates</th><th className="pb-3 font-medium hidden sm:table-cell">Participants</th><th className="pb-3 font-medium text-right">Actions</th></tr></thead>
              <tbody>
                {activities.map((a) => (
                  <tr key={a.id} className="border-b border-[#2A2A2A] hover:bg-[#1F1F1F]">
                    <td className="py-3 text-white">{a.title}</td>
                    <td className="py-3 text-[#A3A3A3] hidden sm:table-cell">{a.category?.name}</td>
                    <td className="py-3 text-[#A3A3A3] hidden md:table-cell">{a.department?.name || '—'}</td>
                    <td className="py-3 text-[#A3A3A3] text-xs">{new Date(a.startDate).toLocaleDateString()} - {new Date(a.endDate).toLocaleDateString()}</td>
                    <td className="py-3 text-[#A3A3A3] hidden sm:table-cell">{a._count?.participations || 0}{a.maxParticipants ? `/${a.maxParticipants}` : ''}</td>
                    <td className="py-3 text-right space-x-2">
                      <button onClick={() => handleJoin(a.id)} className="text-green-400 hover:text-green-300 text-xs">Join</button>
                      <button onClick={() => { setEditing(a); setModalOpen(true); }} className="text-[#A3A3A3] hover:text-white text-xs">Edit</button>
                      <button onClick={() => setDeleteTarget(a)} className="text-red-400 hover:text-red-300 text-xs">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination pagination={pagination} onPageChange={setPage} />
      </div>

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditing(null); }} title={editing ? 'Edit Activity' : 'Create Activity'} size="lg">
        <ActivityForm activity={editing} categories={categories} departments={departments} onSave={handleSave} onCancel={() => { setModalOpen(false); setEditing(null); }} />
      </Modal>
      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete Activity" message={`Delete "${deleteTarget?.title}"?`} loading={deleting} />
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </div>
  );
}
