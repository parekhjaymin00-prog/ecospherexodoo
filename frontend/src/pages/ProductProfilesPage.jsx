import { useState, useEffect, useCallback } from 'react';
import api from '../services/api.js';
import SearchInput from '../components/SearchInput.jsx';
import Pagination from '../components/Pagination.jsx';
import EmptyState from '../components/EmptyState.jsx';
import TableSkeleton from '../components/TableSkeleton.jsx';
import Modal from '../components/Modal.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import Toast from '../components/Toast.jsx';
import { useToast } from '../hooks/useToast.js';

function ProductForm({ product, onSave, onCancel }) {
  const [form, setForm] = useState({ productName: product?.productName || '', description: product?.description || '', environmentalScore: product?.environmentalScore || 0, socialScore: product?.socialScore || 0, governanceScore: product?.governanceScore || 0, certifications: product?.certifications?.join(', ') || '', sustainableMaterials: product?.sustainableMaterials?.join(', ') || '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const handleSubmit = async (e) => { e.preventDefault(); if (!form.productName) { setError('Product name is required'); return; } setSaving(true); setError(null); try { await onSave({ ...form, certifications: form.certifications ? form.certifications.split(',').map(s => s.trim()).filter(Boolean) : [], sustainableMaterials: form.sustainableMaterials ? form.sustainableMaterials.split(',').map(s => s.trim()).filter(Boolean) : [] }); } catch (err) { setError(err.response?.data?.error || 'Failed'); } finally { setSaving(false); } };
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-sm text-red-400 bg-red-400/10 p-3 rounded-lg">{error}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2"><label className="block text-xs text-[#A3A3A3] mb-1">Product Name *</label><input value={form.productName} onChange={(e) => setForm({...form, productName: e.target.value})} className="w-full px-3 py-2 text-sm bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:border-[#525252] focus:outline-none" /></div>
        <div><label className="block text-xs text-[#A3A3A3] mb-1">Environmental Score (0-100)</label><input type="number" min="0" max="100" value={form.environmentalScore} onChange={(e) => setForm({...form, environmentalScore: e.target.value})} className="w-full px-3 py-2 text-sm bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:border-[#525252] focus:outline-none" /></div>
        <div><label className="block text-xs text-[#A3A3A3] mb-1">Social Score (0-100)</label><input type="number" min="0" max="100" value={form.socialScore} onChange={(e) => setForm({...form, socialScore: e.target.value})} className="w-full px-3 py-2 text-sm bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:border-[#525252] focus:outline-none" /></div>
        <div><label className="block text-xs text-[#A3A3A3] mb-1">Governance Score (0-100)</label><input type="number" min="0" max="100" value={form.governanceScore} onChange={(e) => setForm({...form, governanceScore: e.target.value})} className="w-full px-3 py-2 text-sm bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:border-[#525252] focus:outline-none" /></div>
        <div><label className="block text-xs text-[#A3A3A3] mb-1">Certifications (comma separated)</label><input value={form.certifications} onChange={(e) => setForm({...form, certifications: e.target.value})} className="w-full px-3 py-2 text-sm bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:border-[#525252] focus:outline-none" /></div>
      </div>
      <div><label className="block text-xs text-[#A3A3A3] mb-1">Description</label><textarea value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} rows={2} className="w-full px-3 py-2 text-sm bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:border-[#525252] focus:outline-none resize-none" /></div>
      <div className="flex gap-3 justify-end pt-2"><button type="button" onClick={onCancel} className="px-4 py-2 text-sm border border-[#2A2A2A] text-[#A3A3A3] rounded-lg hover:bg-[#1F1F1F]">Cancel</button><button type="submit" disabled={saving} className="px-4 py-2 text-sm bg-white text-black font-medium rounded-lg hover:bg-[#D4D4D4] disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button></div>
    </form>
  );
}

export default function ProductProfilesPage() {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const { toast, showToast, hideToast } = useToast();

  const fetchData = useCallback(async () => { setLoading(true); try { const res = await api.get('/product-profiles', { params: { page, limit: 10, search } }); setProducts(res.data.products); setPagination(res.data.pagination); } catch (err) { console.error(err); } finally { setLoading(false); } }, [page, search]);
  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async (form) => { if (editing) { await api.put(`/product-profiles/${editing.id}`, form); showToast('Product updated'); } else { await api.post('/product-profiles', form); showToast('Product created'); } setModalOpen(false); setEditing(null); fetchData(); };
  const handleDelete = async () => { setDeleting(true); try { await api.delete(`/product-profiles/${deleteTarget.id}`); showToast('Product deleted'); setDeleteTarget(null); fetchData(); } catch (err) { showToast('Failed', 'error'); } finally { setDeleting(false); } };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><div><h1 className="text-2xl font-bold text-white">Product ESG Profiles</h1><p className="text-sm text-[#737373] mt-1">Manage product sustainability scores</p></div><button onClick={() => { setEditing(null); setModalOpen(true); }} className="px-4 py-2 text-sm bg-white text-black font-medium rounded-lg hover:bg-[#D4D4D4]">Add Product</button></div>
      <div className="bg-[#171717] border border-[#2A2A2A] rounded-lg p-4">
        <div className="mb-4"><SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search products..." /></div>
        {loading ? <TableSkeleton /> : products.length === 0 ? <EmptyState title="No products" message="Add your first product ESG profile" /> : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((p) => (
              <div key={p.id} className="border border-[#2A2A2A] rounded-lg p-4 hover:bg-[#1F1F1F]">
                <h4 className="text-sm text-white font-medium mb-2">{p.productName}</h4>
                <div className="space-y-1.5 mb-3">
                  <div className="flex justify-between text-xs"><span className="text-[#737373]">Environmental</span><span className="text-white">{p.environmentalScore}</span></div>
                  <div className="w-full bg-[#2A2A2A] rounded-full h-1"><div className="h-1 rounded-full bg-white" style={{width:`${p.environmentalScore}%`}}/></div>
                  <div className="flex justify-between text-xs"><span className="text-[#737373]">Social</span><span className="text-white">{p.socialScore}</span></div>
                  <div className="w-full bg-[#2A2A2A] rounded-full h-1"><div className="h-1 rounded-full bg-[#A3A3A3]" style={{width:`${p.socialScore}%`}}/></div>
                  <div className="flex justify-between text-xs"><span className="text-[#737373]">Governance</span><span className="text-white">{p.governanceScore}</span></div>
                  <div className="w-full bg-[#2A2A2A] rounded-full h-1"><div className="h-1 rounded-full bg-[#525252]" style={{width:`${p.governanceScore}%`}}/></div>
                </div>
                <div className="flex items-center justify-between"><span className="text-xs text-[#A3A3A3]">Overall: <span className="text-white font-bold">{p.overallScore}</span></span><div className="flex gap-2"><button onClick={() => { setEditing(p); setModalOpen(true); }} className="text-[#A3A3A3] hover:text-white text-xs">Edit</button><button onClick={() => setDeleteTarget(p)} className="text-red-400 hover:text-red-300 text-xs">Delete</button></div></div>
                {p.certifications?.length > 0 && <div className="flex flex-wrap gap-1 mt-2">{p.certifications.map((c,i) => <span key={i} className="px-1.5 py-0.5 text-[10px] bg-[#2A2A2A] text-[#A3A3A3] rounded">{c}</span>)}</div>}
              </div>
            ))}
          </div>
        )}
        <Pagination pagination={pagination} onPageChange={setPage} />
      </div>
      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditing(null); }} title={editing ? 'Edit Product' : 'Add Product'} size="lg"><ProductForm product={editing} onSave={handleSave} onCancel={() => { setModalOpen(false); setEditing(null); }} /></Modal>
      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete Product" message={`Delete "${deleteTarget?.productName}"?`} loading={deleting} />
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </div>
  );
}
