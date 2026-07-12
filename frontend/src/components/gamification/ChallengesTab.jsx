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

function ChallengeForm({ challenge, categories, onSave, onCancel }) {
  const [form, setForm] = useState({ title: challenge?.title || '', description: challenge?.description || '', xpReward: challenge?.xpReward || 50, difficulty: challenge?.difficulty || 'medium', evidenceRequired: challenge?.evidenceRequired || false, deadline: challenge?.deadline ? challenge.deadline.slice(0, 10) : '', status: challenge?.status || 'draft', categoryId: challenge?.categoryId || '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const handleSubmit = async (e) => { e.preventDefault(); if (!form.title || !form.categoryId) { setError('Title and category are required'); return; } setSaving(true); setError(null); try { await onSave(form); } catch (err) { setError(err.response?.data?.error || 'Failed'); } finally { setSaving(false); } };
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-sm text-red-400 bg-red-400/10 p-3 rounded-lg">{error}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2"><label className="block text-xs text-[#A3A3A3] mb-1">Title *</label><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-3 py-2 text-sm bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:border-[#525252] focus:outline-none" /></div>
        <div><label className="block text-xs text-[#A3A3A3] mb-1">Category *</label><select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className="w-full px-3 py-2 text-sm bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:outline-none"><option value="">Select</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
        <div><label className="block text-xs text-[#A3A3A3] mb-1">XP Reward</label><input type="number" value={form.xpReward} onChange={(e) => setForm({ ...form, xpReward: e.target.value })} className="w-full px-3 py-2 text-sm bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:border-[#525252] focus:outline-none" /></div>
        <div><label className="block text-xs text-[#A3A3A3] mb-1">Difficulty</label><select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })} className="w-full px-3 py-2 text-sm bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:outline-none"><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option><option value="expert">Expert</option></select></div>
        <div><label className="block text-xs text-[#A3A3A3] mb-1">Status</label><select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full px-3 py-2 text-sm bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:outline-none"><option value="draft">Draft</option><option value="active">Active</option><option value="under_review">Under Review</option><option value="completed">Completed</option><option value="archived">Archived</option></select></div>
        <div><label className="block text-xs text-[#A3A3A3] mb-1">Deadline</label><input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} className="w-full px-3 py-2 text-sm bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:border-[#525252] focus:outline-none" /></div>
        <div className="flex items-center gap-2 pt-5"><input type="checkbox" checked={form.evidenceRequired} onChange={(e) => setForm({ ...form, evidenceRequired: e.target.checked })} className="w-4 h-4" /><label className="text-xs text-[#A3A3A3]">Evidence Required</label></div>
      </div>
      <div><label className="block text-xs text-[#A3A3A3] mb-1">Description</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="w-full px-3 py-2 text-sm bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:border-[#525252] focus:outline-none resize-none" /></div>
      <div className="flex gap-3 justify-end pt-2"><button type="button" onClick={onCancel} className="px-4 py-2 text-sm border border-[#2A2A2A] text-[#A3A3A3] rounded-lg hover:bg-[#1F1F1F]">Cancel</button><button type="submit" disabled={saving} className="px-4 py-2 text-sm bg-white text-black font-medium rounded-lg hover:bg-[#D4D4D4] disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button></div>
    </form>
  );
}

export default function ChallengesTab() {
  const [challenges, setChallenges] = useState([]);
  const [stats, setStats] = useState(null);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const { toast, showToast, hideToast } = useToast();

  const fetchData = useCallback(async () => { setLoading(true); try { const [cRes, sRes, catRes] = await Promise.all([api.get('/challenges', { params: { page, limit: 10, search } }), api.get('/challenges/stats'), api.get('/categories', { params: { type: 'CHALLENGE' } })]); setChallenges(cRes.data.challenges); setPagination(cRes.data.pagination); setStats(sRes.data); setCategories(catRes.data.categories); } catch (err) { console.error(err); } finally { setLoading(false); } }, [page, search]);
  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async (form) => { if (editing) { await api.put(`/challenges/${editing.id}`, form); showToast('Challenge updated'); } else { await api.post('/challenges', form); showToast('Challenge created'); } setModalOpen(false); setEditing(null); fetchData(); };
  const handleDelete = async () => { setDeleting(true); try { await api.delete(`/challenges/${deleteTarget.id}`); showToast('Challenge deleted'); setDeleteTarget(null); fetchData(); } catch (err) { showToast(err.response?.data?.error || 'Failed', 'error'); } finally { setDeleting(false); } };
  const handleJoin = async (challengeId) => { try { await api.post('/challenges/join', { challengeId }); showToast('Joined challenge!'); fetchData(); } catch (err) { showToast(err.response?.data?.error || 'Failed', 'error'); } };

  const diffColors = { easy: 'bg-green-500/10 text-green-400', medium: 'bg-yellow-500/10 text-yellow-400', hard: 'bg-orange-500/10 text-orange-400', expert: 'bg-red-500/10 text-red-400' };

  return (
    <div className="space-y-6">
      {stats && <div className="grid grid-cols-2 lg:grid-cols-4 gap-4"><StatCard title="Total Challenges" value={stats.total} /><StatCard title="Active" value={stats.active} /><StatCard title="Participants" value={stats.totalParticipants} /><StatCard title="Total XP Awarded" value={stats.totalXPAwarded} /></div>}
      <div className="flex justify-end"><button onClick={() => { setEditing(null); setModalOpen(true); }} className="px-4 py-2 text-sm bg-white text-black font-medium rounded-lg hover:bg-[#D4D4D4]">Add Challenge</button></div>
      <div className="bg-[#171717] border border-[#2A2A2A] rounded-lg p-4">
        <div className="mb-4"><SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search challenges..." /></div>
        {loading ? <TableSkeleton /> : challenges.length === 0 ? <EmptyState title="No challenges" /> : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {challenges.map((c) => (
              <div key={c.id} className="border border-[#2A2A2A] rounded-lg p-4 hover:bg-[#1F1F1F]">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-sm text-white font-medium">{c.title}</h4>
                  <span className={`px-2 py-0.5 text-xs rounded-full ${diffColors[c.difficulty]}`}>{c.difficulty}</span>
                </div>
                <p className="text-xs text-[#737373] mb-3 line-clamp-2">{c.description || 'No description'}</p>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex gap-3 text-[#A3A3A3]"><span>{c.xpReward} XP</span><span>{c._count?.participations || 0} joined</span></div>
                  <div className="flex gap-2">
                    {c.status === 'active' && <button onClick={() => handleJoin(c.id)} className="text-green-400 hover:text-green-300">Join</button>}
                    <button onClick={() => { setEditing(c); setModalOpen(true); }} className="text-[#A3A3A3] hover:text-white">Edit</button>
                    <button onClick={() => setDeleteTarget(c)} className="text-red-400 hover:text-red-300">Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        <Pagination pagination={pagination} onPageChange={setPage} />
      </div>
      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditing(null); }} title={editing ? 'Edit Challenge' : 'Create Challenge'} size="lg"><ChallengeForm challenge={editing} categories={categories} onSave={handleSave} onCancel={() => { setModalOpen(false); setEditing(null); }} /></Modal>
      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete Challenge" message={`Delete "${deleteTarget?.title}"?`} loading={deleting} />
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </div>
  );
}
