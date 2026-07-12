import { useState, useEffect, useCallback } from 'react';
import api from '../../services/api.js';
import Pagination from '../Pagination.jsx';
import EmptyState from '../EmptyState.jsx';
import Modal from '../Modal.jsx';
import ConfirmDialog from '../ConfirmDialog.jsx';
import Toast from '../Toast.jsx';
import { useToast } from '../../hooks/useToast.js';

export default function RewardsTab() {
  const [rewards, setRewards] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', pointsRequired: '', stock: '', status: 'active' });
  const [saving, setSaving] = useState(false);
  const { toast, showToast, hideToast } = useToast();

  const fetchRewards = useCallback(async () => { setLoading(true); try { const res = await api.get('/rewards', { params: { page, limit: 12 } }); setRewards(res.data.rewards); setPagination(res.data.pagination); } catch (err) { console.error(err); } finally { setLoading(false); } }, [page]);
  useEffect(() => { fetchRewards(); }, [fetchRewards]);

  const openCreate = () => { setEditing(null); setForm({ name: '', description: '', pointsRequired: '', stock: '', status: 'active' }); setModalOpen(true); };
  const openEdit = (r) => { setEditing(r); setForm({ name: r.name, description: r.description || '', pointsRequired: r.pointsRequired, stock: r.stock, status: r.status }); setModalOpen(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name || !form.pointsRequired) return;
    setSaving(true);
    try { if (editing) { await api.put(`/rewards/${editing.id}`, form); showToast('Reward updated'); } else { await api.post('/rewards', form); showToast('Reward created'); } setModalOpen(false); fetchRewards(); } catch (err) { showToast(err.response?.data?.error || 'Failed', 'error'); } finally { setSaving(false); }
  };

  const handleDelete = async () => { setDeleting(true); try { await api.delete(`/rewards/${deleteTarget.id}`); showToast('Reward deleted'); setDeleteTarget(null); fetchRewards(); } catch (err) { showToast('Failed', 'error'); } finally { setDeleting(false); } };

  const statusColors = { active: 'bg-green-500/10 text-green-400', inactive: 'bg-[#2A2A2A] text-[#737373]', out_of_stock: 'bg-red-500/10 text-red-400' };

  return (
    <div className="space-y-4">
      <div className="flex justify-end"><button onClick={openCreate} className="px-4 py-2 text-sm bg-white text-black font-medium rounded-lg hover:bg-[#D4D4D4]">Add Reward</button></div>
      {loading ? <div className="animate-pulse grid grid-cols-1 md:grid-cols-3 gap-4">{Array.from({length:3}).map((_,i)=><div key={i} className="h-40 bg-[#2A2A2A] rounded-lg"/>)}</div> : rewards.length === 0 ? <EmptyState title="No rewards" message="Create your first reward" /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rewards.map((r) => (
            <div key={r.id} className="bg-[#171717] border border-[#2A2A2A] rounded-lg p-5">
              <div className="flex items-start justify-between mb-2">
                <h4 className="text-sm text-white font-medium">{r.name}</h4>
                <span className={`px-2 py-0.5 text-xs rounded-full ${statusColors[r.status]}`}>{r.status.replace('_', ' ')}</span>
              </div>
              <p className="text-xs text-[#737373] mb-3">{r.description || 'No description'}</p>
              <div className="flex items-center justify-between">
                <div><p className="text-lg text-white font-bold">{r.pointsRequired} pts</p><p className="text-xs text-[#525252]">{r.stock} in stock</p></div>
                <div className="flex gap-2"><button onClick={() => openEdit(r)} className="text-[#A3A3A3] hover:text-white text-xs">Edit</button><button onClick={() => setDeleteTarget(r)} className="text-red-400 hover:text-red-300 text-xs">Delete</button></div>
              </div>
            </div>
          ))}
        </div>
      )}
      <Pagination pagination={pagination} onPageChange={setPage} />
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Reward' : 'Create Reward'} size="md">
        <form onSubmit={handleSave} className="space-y-4">
          <div><label className="block text-xs text-[#A3A3A3] mb-1">Name *</label><input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="w-full px-3 py-2 text-sm bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:border-[#525252] focus:outline-none" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-xs text-[#A3A3A3] mb-1">Points Required *</label><input type="number" value={form.pointsRequired} onChange={(e) => setForm({...form, pointsRequired: e.target.value})} className="w-full px-3 py-2 text-sm bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:border-[#525252] focus:outline-none" /></div>
            <div><label className="block text-xs text-[#A3A3A3] mb-1">Stock</label><input type="number" value={form.stock} onChange={(e) => setForm({...form, stock: e.target.value})} className="w-full px-3 py-2 text-sm bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:border-[#525252] focus:outline-none" /></div>
          </div>
          <div><label className="block text-xs text-[#A3A3A3] mb-1">Status</label><select value={form.status} onChange={(e) => setForm({...form, status: e.target.value})} className="w-full px-3 py-2 text-sm bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:outline-none"><option value="active">Active</option><option value="inactive">Inactive</option><option value="out_of_stock">Out of Stock</option></select></div>
          <div><label className="block text-xs text-[#A3A3A3] mb-1">Description</label><textarea value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} rows={2} className="w-full px-3 py-2 text-sm bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:border-[#525252] focus:outline-none resize-none" /></div>
          <div className="flex gap-3 justify-end"><button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm border border-[#2A2A2A] text-[#A3A3A3] rounded-lg">Cancel</button><button type="submit" disabled={saving} className="px-4 py-2 text-sm bg-white text-black font-medium rounded-lg disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button></div>
        </form>
      </Modal>
      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete Reward" message={`Delete "${deleteTarget?.name}"?`} loading={deleting} />
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </div>
  );
}
