import { useState, useEffect, useCallback } from 'react';
import api from '../../services/api.js';
import SearchInput from '../SearchInput.jsx';
import Pagination from '../Pagination.jsx';
import EmptyState from '../EmptyState.jsx';
import Modal from '../Modal.jsx';
import ConfirmDialog from '../ConfirmDialog.jsx';
import Toast from '../Toast.jsx';
import { useToast } from '../../hooks/useToast.js';

export default function CategoryManagementTab() {
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', type: 'CSR_ACTIVITY', status: 'active' });
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const { toast, showToast, hideToast } = useToast();

  const fetchData = useCallback(async () => { setLoading(true); try { const res = await api.get('/settings/categories', { params: { page, limit: 10, search, type: typeFilter } }); setCategories(res.data.categories); setPagination(res.data.pagination); } catch (err) { console.error(err); } finally { setLoading(false); } }, [page, search, typeFilter]);
  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => { setEditing(null); setForm({ name: '', type: 'CSR_ACTIVITY', status: 'active' }); setModalOpen(true); };
  const openEdit = (c) => { setEditing(c); setForm({ name: c.name, type: c.type, status: c.status }); setModalOpen(true); };

  const handleSave = async (e) => {
    e.preventDefault(); if (!form.name) return; setSaving(true);
    try { if (editing) { await api.put(`/settings/categories/${editing.id}`, form); showToast('Category updated'); } else { await api.post('/settings/categories', form); showToast('Category created'); } setModalOpen(false); fetchData(); } catch (err) { showToast(err.response?.data?.error || 'Failed', 'error'); } finally { setSaving(false); }
  };
  const handleDelete = async () => { setDeleting(true); try { await api.delete(`/settings/categories/${deleteTarget.id}`); showToast('Category deleted'); setDeleteTarget(null); fetchData(); } catch (err) { showToast(err.response?.data?.error || 'Failed', 'error'); } finally { setDeleting(false); } };

  return (
    <div className="space-y-4">
      <div className="flex justify-end"><button onClick={openCreate} className="px-4 py-2 text-sm bg-white text-black font-medium rounded-lg hover:bg-[#D4D4D4]">Add Category</button></div>
      <div className="bg-[#171717] border border-[#2A2A2A] rounded-lg p-4">
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="flex-1"><SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search categories..." /></div>
          <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }} className="px-3 py-2 text-sm bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:outline-none"><option value="">All Types</option><option value="CSR_ACTIVITY">CSR Activity</option><option value="CHALLENGE">Challenge</option></select>
        </div>
        {loading ? <div className="animate-pulse space-y-3">{Array.from({length:5}).map((_,i)=><div key={i} className="h-10 bg-[#2A2A2A] rounded"/>)}</div> : categories.length === 0 ? <EmptyState title="No categories" /> : (
          <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="text-left text-[#737373] border-b border-[#2A2A2A]"><th className="pb-3 font-medium">Name</th><th className="pb-3 font-medium">Type</th><th className="pb-3 font-medium">Status</th><th className="pb-3 font-medium text-right">Actions</th></tr></thead><tbody>
            {categories.map((c) => (<tr key={c.id} className="border-b border-[#2A2A2A] hover:bg-[#1F1F1F]"><td className="py-3 text-white">{c.name}</td><td className="py-3 text-[#A3A3A3]">{c.type === 'CSR_ACTIVITY' ? 'CSR' : 'Challenge'}</td><td className="py-3"><span className={`px-2 py-0.5 text-xs rounded-full ${c.status === 'active' ? 'bg-green-500/10 text-green-400' : 'bg-[#2A2A2A] text-[#737373]'}`}>{c.status}</span></td><td className="py-3 text-right"><button onClick={() => openEdit(c)} className="text-[#A3A3A3] hover:text-white mr-3 text-xs">Edit</button><button onClick={() => setDeleteTarget(c)} className="text-red-400 hover:text-red-300 text-xs">Delete</button></td></tr>))}
          </tbody></table></div>
        )}
        <Pagination pagination={pagination} onPageChange={setPage} />
      </div>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Category' : 'Create Category'} size="sm">
        <form onSubmit={handleSave} className="space-y-4">
          <div><label className="block text-xs text-[#A3A3A3] mb-1">Name *</label><input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="w-full px-3 py-2 text-sm bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:border-[#525252] focus:outline-none" /></div>
          {!editing && <div><label className="block text-xs text-[#A3A3A3] mb-1">Type</label><select value={form.type} onChange={(e) => setForm({...form, type: e.target.value})} className="w-full px-3 py-2 text-sm bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:outline-none"><option value="CSR_ACTIVITY">CSR Activity</option><option value="CHALLENGE">Challenge</option></select></div>}
          <div><label className="block text-xs text-[#A3A3A3] mb-1">Status</label><select value={form.status} onChange={(e) => setForm({...form, status: e.target.value})} className="w-full px-3 py-2 text-sm bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:outline-none"><option value="active">Active</option><option value="inactive">Inactive</option></select></div>
          <div className="flex gap-3 justify-end"><button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm border border-[#2A2A2A] text-[#A3A3A3] rounded-lg">Cancel</button><button type="submit" disabled={saving} className="px-4 py-2 text-sm bg-white text-black font-medium rounded-lg disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button></div>
        </form>
      </Modal>
      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete Category" message={`Delete "${deleteTarget?.name}"?`} loading={deleting} />
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </div>
  );
}
