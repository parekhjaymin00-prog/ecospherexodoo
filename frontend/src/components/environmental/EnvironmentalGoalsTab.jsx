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

function GoalForm({ goal, onSave, onCancel }) {
  const [form, setForm] = useState({
    title: goal?.title || '', description: goal?.description || '',
    targetValue: goal?.targetValue || '', currentValue: goal?.currentValue || 0,
    unit: goal?.unit || '', startDate: goal?.startDate ? goal.startDate.slice(0, 10) : new Date().toISOString().slice(0, 10),
    endDate: goal?.endDate ? goal.endDate.slice(0, 10) : '', status: goal?.status || 'active',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.targetValue || !form.unit || !form.startDate || !form.endDate) { setError('Title, target, unit, and dates are required'); return; }
    setSaving(true); setError(null);
    try { await onSave(form); } catch (err) { setError(err.response?.data?.error || 'Failed to save'); } finally { setSaving(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-sm text-red-400 bg-red-400/10 p-3 rounded-lg">{error}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2"><label className="block text-xs text-[#A3A3A3] mb-1">Title *</label><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-3 py-2 text-sm bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:border-[#525252] focus:outline-none" /></div>
        <div><label className="block text-xs text-[#A3A3A3] mb-1">Target Value *</label><input type="number" step="0.01" value={form.targetValue} onChange={(e) => setForm({ ...form, targetValue: e.target.value })} className="w-full px-3 py-2 text-sm bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:border-[#525252] focus:outline-none" /></div>
        <div><label className="block text-xs text-[#A3A3A3] mb-1">Current Value</label><input type="number" step="0.01" value={form.currentValue} onChange={(e) => setForm({ ...form, currentValue: e.target.value })} className="w-full px-3 py-2 text-sm bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:border-[#525252] focus:outline-none" /></div>
        <div><label className="block text-xs text-[#A3A3A3] mb-1">Unit *</label><input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} className="w-full px-3 py-2 text-sm bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:border-[#525252] focus:outline-none" /></div>
        <div><label className="block text-xs text-[#A3A3A3] mb-1">Status</label>
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full px-3 py-2 text-sm bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:outline-none">
            <option value="active">Active</option><option value="completed">Completed</option><option value="missed">Missed</option><option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div><label className="block text-xs text-[#A3A3A3] mb-1">Start Date *</label><input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="w-full px-3 py-2 text-sm bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:border-[#525252] focus:outline-none" /></div>
        <div><label className="block text-xs text-[#A3A3A3] mb-1">End Date *</label><input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="w-full px-3 py-2 text-sm bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:border-[#525252] focus:outline-none" /></div>
      </div>
      <div><label className="block text-xs text-[#A3A3A3] mb-1">Description</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="w-full px-3 py-2 text-sm bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:border-[#525252] focus:outline-none resize-none" /></div>
      <div className="flex gap-3 justify-end pt-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm border border-[#2A2A2A] text-[#A3A3A3] rounded-lg hover:bg-[#1F1F1F]">Cancel</button>
        <button type="submit" disabled={saving} className="px-4 py-2 text-sm bg-white text-black font-medium rounded-lg hover:bg-[#D4D4D4] disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
      </div>
    </form>
  );
}

export default function EnvironmentalGoalsTab() {
  const [goals, setGoals] = useState([]);
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

  const fetchGoals = useCallback(async () => {
    setLoading(true);
    try {
      const [goalsRes, statsRes] = await Promise.all([
        api.get('/environmental-goals', { params: { page, limit: 10, search, status: statusFilter } }),
        api.get('/environmental-goals/stats'),
      ]);
      setGoals(goalsRes.data.goals);
      setPagination(goalsRes.data.pagination);
      setStats(statsRes.data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, [page, search, statusFilter]);

  useEffect(() => { fetchGoals(); }, [fetchGoals]);

  const handleSave = async (form) => {
    if (editing) { await api.put(`/environmental-goals/${editing.id}`, form); showToast('Goal updated'); }
    else { await api.post('/environmental-goals', form); showToast('Goal created'); }
    setModalOpen(false); setEditing(null); fetchGoals();
  };

  const handleDelete = async () => {
    setDeleting(true);
    try { await api.delete(`/environmental-goals/${deleteTarget.id}`); showToast('Goal deleted'); setDeleteTarget(null); fetchGoals(); }
    catch (err) { showToast(err.response?.data?.error || 'Failed to delete', 'error'); } finally { setDeleting(false); }
  };

  const getProgress = (goal) => goal.targetValue > 0 ? Math.min(Math.round((goal.currentValue / goal.targetValue) * 100), 100) : 0;

  return (
    <div className="space-y-6">
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Goals" value={stats.total} />
          <StatCard title="Active" value={stats.active} />
          <StatCard title="Completed" value={stats.completed} />
          <StatCard title="Avg Progress" value={`${stats.avgProgress}%`} />
        </div>
      )}

      <div className="flex justify-end"><button onClick={() => { setEditing(null); setModalOpen(true); }} className="px-4 py-2 text-sm bg-white text-black font-medium rounded-lg hover:bg-[#D4D4D4]">Add Goal</button></div>

      <div className="bg-[#171717] border border-[#2A2A2A] rounded-lg p-4">
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="flex-1"><SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search goals..." /></div>
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="px-3 py-2 text-sm bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:outline-none">
            <option value="">All Status</option><option value="active">Active</option><option value="completed">Completed</option><option value="missed">Missed</option>
          </select>
        </div>
        {loading ? <TableSkeleton /> : goals.length === 0 ? <EmptyState title="No goals" message="Set your first environmental goal" /> : (
          <div className="space-y-3">
            {goals.map((g) => (
              <div key={g.id} className="border border-[#2A2A2A] rounded-lg p-4 hover:bg-[#1F1F1F]">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm text-white font-medium">{g.title}</h4>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 text-xs rounded-full ${g.status === 'active' ? 'bg-green-500/10 text-green-400' : g.status === 'completed' ? 'bg-blue-500/10 text-blue-400' : 'bg-[#2A2A2A] text-[#737373]'}`}>{g.status}</span>
                    <button onClick={() => { setEditing(g); setModalOpen(true); }} className="text-[#A3A3A3] hover:text-white text-xs">Edit</button>
                    <button onClick={() => setDeleteTarget(g)} className="text-red-400 hover:text-red-300 text-xs">Delete</button>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-[#2A2A2A] rounded-full h-2">
                    <div className="h-2 rounded-full bg-white transition-all" style={{ width: `${getProgress(g)}%` }} />
                  </div>
                  <span className="text-xs text-[#A3A3A3] w-16 text-right">{g.currentValue}/{g.targetValue} {g.unit}</span>
                  <span className="text-xs text-white font-medium w-10 text-right">{getProgress(g)}%</span>
                </div>
                <p className="text-xs text-[#525252] mt-2">Deadline: {new Date(g.endDate).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}
        <Pagination pagination={pagination} onPageChange={setPage} />
      </div>

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditing(null); }} title={editing ? 'Edit Goal' : 'Add Goal'} size="lg">
        <GoalForm goal={editing} onSave={handleSave} onCancel={() => { setModalOpen(false); setEditing(null); }} />
      </Modal>
      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete Goal" message={`Delete "${deleteTarget?.title}"?`} loading={deleting} />
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </div>
  );
}
