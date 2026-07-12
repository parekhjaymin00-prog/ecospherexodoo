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

function FactorForm({ factor, onSave, onCancel }) {
  const [form, setForm] = useState({
    name: factor?.name || '', category: factor?.category || '', unit: factor?.unit || '',
    factor: factor?.factor || '', source: factor?.source || '', year: factor?.year || new Date().getFullYear(),
    description: factor?.description || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.category || !form.unit || !form.factor || !form.year) { setError('Name, category, unit, factor, and year are required'); return; }
    setSaving(true); setError(null);
    try { await onSave(form); } catch (err) { setError(err.response?.data?.error || 'Failed to save'); } finally { setSaving(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-sm text-red-400 bg-red-400/10 p-3 rounded-lg">{error}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div><label className="block text-xs text-[#A3A3A3] mb-1">Name *</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 text-sm bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:border-[#525252] focus:outline-none" /></div>
        <div><label className="block text-xs text-[#A3A3A3] mb-1">Category *</label><input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2 text-sm bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:border-[#525252] focus:outline-none" /></div>
        <div><label className="block text-xs text-[#A3A3A3] mb-1">Unit *</label><input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} className="w-full px-3 py-2 text-sm bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:border-[#525252] focus:outline-none" /></div>
        <div><label className="block text-xs text-[#A3A3A3] mb-1">Factor (kg CO₂e) *</label><input type="number" step="0.001" value={form.factor} onChange={(e) => setForm({ ...form, factor: e.target.value })} className="w-full px-3 py-2 text-sm bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:border-[#525252] focus:outline-none" /></div>
        <div><label className="block text-xs text-[#A3A3A3] mb-1">Source</label><input value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} className="w-full px-3 py-2 text-sm bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:border-[#525252] focus:outline-none" /></div>
        <div><label className="block text-xs text-[#A3A3A3] mb-1">Year *</label><input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} className="w-full px-3 py-2 text-sm bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:border-[#525252] focus:outline-none" /></div>
      </div>
      <div><label className="block text-xs text-[#A3A3A3] mb-1">Description</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="w-full px-3 py-2 text-sm bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:border-[#525252] focus:outline-none resize-none" /></div>
      <div className="flex gap-3 justify-end pt-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm border border-[#2A2A2A] text-[#A3A3A3] rounded-lg hover:bg-[#1F1F1F]">Cancel</button>
        <button type="submit" disabled={saving} className="px-4 py-2 text-sm bg-white text-black font-medium rounded-lg hover:bg-[#D4D4D4] disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
      </div>
    </form>
  );
}

export default function EmissionFactorsTab() {
  const [factors, setFactors] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const { toast, showToast, hideToast } = useToast();

  const fetchFactors = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/emission-factors', { params: { page, limit: 10, search } });
      setFactors(res.data.factors);
      setPagination(res.data.pagination);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { fetchFactors(); }, [fetchFactors]);

  const handleSave = async (form) => {
    if (editing) { await api.put(`/emission-factors/${editing.id}`, form); showToast('Emission factor updated'); }
    else { await api.post('/emission-factors', form); showToast('Emission factor created'); }
    setModalOpen(false); setEditing(null); fetchFactors();
  };

  const handleDelete = async () => {
    setDeleting(true);
    try { await api.delete(`/emission-factors/${deleteTarget.id}`); showToast('Emission factor deleted'); setDeleteTarget(null); fetchFactors(); }
    catch (err) { showToast(err.response?.data?.error || 'Failed to delete', 'error'); } finally { setDeleting(false); }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end"><button onClick={() => { setEditing(null); setModalOpen(true); }} className="px-4 py-2 text-sm bg-white text-black font-medium rounded-lg hover:bg-[#D4D4D4]">Add Factor</button></div>
      <div className="bg-[#171717] border border-[#2A2A2A] rounded-lg p-4">
        <div className="mb-4"><SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search factors..." /></div>
        {loading ? <TableSkeleton /> : factors.length === 0 ? <EmptyState title="No emission factors" message="Add your first emission factor" /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-[#737373] border-b border-[#2A2A2A]"><th className="pb-3 font-medium">Name</th><th className="pb-3 font-medium">Category</th><th className="pb-3 font-medium hidden sm:table-cell">Unit</th><th className="pb-3 font-medium">Factor</th><th className="pb-3 font-medium hidden md:table-cell">Year</th><th className="pb-3 font-medium text-right">Actions</th></tr></thead>
              <tbody>
                {factors.map((f) => (
                  <tr key={f.id} className="border-b border-[#2A2A2A] hover:bg-[#1F1F1F]">
                    <td className="py-3 text-white">{f.name}</td>
                    <td className="py-3 text-[#A3A3A3]">{f.category}</td>
                    <td className="py-3 text-[#A3A3A3] hidden sm:table-cell">{f.unit}</td>
                    <td className="py-3 text-white">{f.factor}</td>
                    <td className="py-3 text-[#A3A3A3] hidden md:table-cell">{f.year}</td>
                    <td className="py-3 text-right">
                      <button onClick={() => { setEditing(f); setModalOpen(true); }} className="text-[#A3A3A3] hover:text-white mr-3 text-xs">Edit</button>
                      <button onClick={() => setDeleteTarget(f)} className="text-red-400 hover:text-red-300 text-xs">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination pagination={pagination} onPageChange={setPage} />
      </div>
      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditing(null); }} title={editing ? 'Edit Emission Factor' : 'Add Emission Factor'} size="lg">
        <FactorForm factor={editing} onSave={handleSave} onCancel={() => { setModalOpen(false); setEditing(null); }} />
      </Modal>
      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete Emission Factor" message={`Delete "${deleteTarget?.name}"?`} loading={deleting} />
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </div>
  );
}
