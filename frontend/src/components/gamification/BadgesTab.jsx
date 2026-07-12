import { useState, useEffect } from 'react';
import api from '../../services/api.js';
import Modal from '../Modal.jsx';
import ConfirmDialog from '../ConfirmDialog.jsx';
import Toast from '../Toast.jsx';
import EmptyState from '../EmptyState.jsx';
import { useToast } from '../../hooks/useToast.js';

export default function BadgesTab() {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', unlockRule: '', icon: '' });
  const [saving, setSaving] = useState(false);
  const { toast, showToast, hideToast } = useToast();

  const fetchBadges = async () => { setLoading(true); try { const res = await api.get('/badges'); setBadges(res.data.badges); } catch (err) { console.error(err); } finally { setLoading(false); } };
  useEffect(() => { fetchBadges(); }, []);

  const openCreate = () => { setEditing(null); setForm({ name: '', description: '', unlockRule: '', icon: '' }); setModalOpen(true); };
  const openEdit = (b) => { setEditing(b); setForm({ name: b.name, description: b.description || '', unlockRule: b.unlockRule, icon: b.icon || '' }); setModalOpen(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name || !form.unlockRule) return;
    setSaving(true);
    try { if (editing) { await api.put(`/badges/${editing.id}`, form); showToast('Badge updated'); } else { await api.post('/badges', form); showToast('Badge created'); } setModalOpen(false); fetchBadges(); } catch (err) { showToast(err.response?.data?.error || 'Failed', 'error'); } finally { setSaving(false); }
  };

  const handleDelete = async () => { setDeleting(true); try { await api.delete(`/badges/${deleteTarget.id}`); showToast('Badge deleted'); setDeleteTarget(null); fetchBadges(); } catch (err) { showToast('Failed', 'error'); } finally { setDeleting(false); } };

  return (
    <div className="space-y-4">
      <div className="flex justify-end"><button onClick={openCreate} className="px-4 py-2 text-sm bg-white text-black font-medium rounded-lg hover:bg-[#D4D4D4]">Add Badge</button></div>
      {loading ? <div className="animate-pulse grid grid-cols-2 md:grid-cols-4 gap-4">{Array.from({length:4}).map((_,i)=><div key={i} className="h-32 bg-[#2A2A2A] rounded-lg"/>)}</div> : badges.length === 0 ? <EmptyState title="No badges" message="Create your first badge" /> : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {badges.map((b) => (
            <div key={b.id} className="bg-[#171717] border border-[#2A2A2A] rounded-lg p-4 text-center hover:bg-[#1F1F1F]">
              <div className="w-12 h-12 mx-auto mb-2 bg-[#2A2A2A] rounded-full flex items-center justify-center text-xl">{b.icon || '🏆'}</div>
              <h4 className="text-sm text-white font-medium">{b.name}</h4>
              <p className="text-xs text-[#737373] mt-1 line-clamp-2">{b.description || b.unlockRule}</p>
              <div className="flex gap-2 justify-center mt-3">
                <button onClick={() => openEdit(b)} className="text-[#A3A3A3] hover:text-white text-xs">Edit</button>
                <button onClick={() => setDeleteTarget(b)} className="text-red-400 hover:text-red-300 text-xs">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Badge' : 'Create Badge'} size="md">
        <form onSubmit={handleSave} className="space-y-4">
          <div><label className="block text-xs text-[#A3A3A3] mb-1">Name *</label><input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="w-full px-3 py-2 text-sm bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:border-[#525252] focus:outline-none" /></div>
          <div><label className="block text-xs text-[#A3A3A3] mb-1">Unlock Rule *</label><input value={form.unlockRule} onChange={(e) => setForm({...form, unlockRule: e.target.value})} className="w-full px-3 py-2 text-sm bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:border-[#525252] focus:outline-none" /></div>
          <div><label className="block text-xs text-[#A3A3A3] mb-1">Icon (emoji)</label><input value={form.icon} onChange={(e) => setForm({...form, icon: e.target.value})} className="w-full px-3 py-2 text-sm bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:border-[#525252] focus:outline-none" /></div>
          <div><label className="block text-xs text-[#A3A3A3] mb-1">Description</label><textarea value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} rows={2} className="w-full px-3 py-2 text-sm bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:border-[#525252] focus:outline-none resize-none" /></div>
          <div className="flex gap-3 justify-end"><button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm border border-[#2A2A2A] text-[#A3A3A3] rounded-lg">Cancel</button><button type="submit" disabled={saving} className="px-4 py-2 text-sm bg-white text-black font-medium rounded-lg disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button></div>
        </form>
      </Modal>
      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete Badge" message={`Delete "${deleteTarget?.name}"?`} loading={deleting} />
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </div>
  );
}
