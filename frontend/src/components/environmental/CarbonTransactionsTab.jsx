import { useState, useEffect, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
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

function TransactionForm({ transaction, factors, onSave, onCancel }) {
  const [form, setForm] = useState({
    description: transaction?.description || '', quantity: transaction?.quantity || '',
    unit: transaction?.unit || '', emissionFactorId: transaction?.emissionFactorId || '',
    scope: transaction?.scope || 1, transactionDate: transaction?.transactionDate ? transaction.transactionDate.slice(0, 10) : new Date().toISOString().slice(0, 10),
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.quantity || !form.unit || !form.emissionFactorId || !form.transactionDate) { setError('Quantity, unit, emission factor, and date are required'); return; }
    setSaving(true); setError(null);
    try { await onSave(form); } catch (err) { setError(err.response?.data?.error || 'Failed to save'); } finally { setSaving(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-sm text-red-400 bg-red-400/10 p-3 rounded-lg">{error}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div><label className="block text-xs text-[#A3A3A3] mb-1">Emission Factor *</label>
          <select value={form.emissionFactorId} onChange={(e) => setForm({ ...form, emissionFactorId: e.target.value })} className="w-full px-3 py-2 text-sm bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:outline-none">
            <option value="">Select factor</option>
            {factors.map(f => <option key={f.id} value={f.id}>{f.name} ({f.factor} {f.unit})</option>)}
          </select>
        </div>
        <div><label className="block text-xs text-[#A3A3A3] mb-1">Quantity *</label><input type="number" step="0.01" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} className="w-full px-3 py-2 text-sm bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:border-[#525252] focus:outline-none" /></div>
        <div><label className="block text-xs text-[#A3A3A3] mb-1">Unit *</label><input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} className="w-full px-3 py-2 text-sm bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:border-[#525252] focus:outline-none" /></div>
        <div><label className="block text-xs text-[#A3A3A3] mb-1">Scope *</label>
          <select value={form.scope} onChange={(e) => setForm({ ...form, scope: parseInt(e.target.value) })} className="w-full px-3 py-2 text-sm bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:outline-none">
            <option value={1}>Scope 1 - Direct</option><option value={2}>Scope 2 - Indirect Energy</option><option value={3}>Scope 3 - Other Indirect</option>
          </select>
        </div>
        <div><label className="block text-xs text-[#A3A3A3] mb-1">Date *</label><input type="date" value={form.transactionDate} onChange={(e) => setForm({ ...form, transactionDate: e.target.value })} className="w-full px-3 py-2 text-sm bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:border-[#525252] focus:outline-none" /></div>
        <div><label className="block text-xs text-[#A3A3A3] mb-1">Description</label><input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 text-sm bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:border-[#525252] focus:outline-none" /></div>
      </div>
      <div className="flex gap-3 justify-end pt-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm border border-[#2A2A2A] text-[#A3A3A3] rounded-lg hover:bg-[#1F1F1F]">Cancel</button>
        <button type="submit" disabled={saving} className="px-4 py-2 text-sm bg-white text-black font-medium rounded-lg hover:bg-[#D4D4D4] disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
      </div>
    </form>
  );
}

const COLORS = ['#FFFFFF', '#A3A3A3', '#525252'];

export default function CarbonTransactionsTab() {
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState(null);
  const [trend, setTrend] = useState([]);
  const [byScope, setByScope] = useState([]);
  const [factors, setFactors] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [scopeFilter, setScopeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const { toast, showToast, hideToast } = useToast();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10, search, scope: scopeFilter };
      const [txRes, statsRes, trendRes, scopeRes, factorsRes] = await Promise.all([
        api.get('/carbon-transactions', { params }),
        api.get('/carbon-transactions/stats'),
        api.get('/carbon-transactions/trend'),
        api.get('/carbon-transactions/by-scope'),
        api.get('/emission-factors/all'),
      ]);
      setTransactions(txRes.data.transactions);
      setPagination(txRes.data.pagination);
      setStats(statsRes.data);
      setTrend(trendRes.data.trend);
      setByScope(scopeRes.data.byScope);
      setFactors(factorsRes.data.factors);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, [page, search, scopeFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async (form) => {
    if (editing) { await api.put(`/carbon-transactions/${editing.id}`, form); showToast('Transaction updated'); }
    else { await api.post('/carbon-transactions', form); showToast('Transaction created'); }
    setModalOpen(false); setEditing(null); fetchData();
  };

  const handleDelete = async () => {
    setDeleting(true);
    try { await api.delete(`/carbon-transactions/${deleteTarget.id}`); showToast('Transaction deleted'); setDeleteTarget(null); fetchData(); }
    catch (err) { showToast(err.response?.data?.error || 'Failed to delete', 'error'); } finally { setDeleting(false); }
  };

  return (
    <div className="space-y-6">
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Emissions" value={`${stats.totalCarbon} kg`} subtitle="CO₂ equivalent" />
          <StatCard title="Monthly" value={`${stats.monthlyCarbon} kg`} subtitle="This month" />
          <StatCard title="Average" value={`${stats.averageCarbon} kg`} subtitle="Per transaction" />
          <StatCard title="Transactions" value={stats.totalTransactions} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {trend.length > 0 && (
          <div className="bg-[#171717] border border-[#2A2A2A] rounded-lg p-4">
            <h3 className="text-sm font-medium text-white mb-3">Monthly Trend</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
                <XAxis dataKey="month" tick={{ fill: '#737373', fontSize: 11 }} stroke="#2A2A2A" />
                <YAxis tick={{ fill: '#737373', fontSize: 11 }} stroke="#2A2A2A" />
                <Tooltip contentStyle={{ background: '#171717', border: '1px solid #2A2A2A', borderRadius: 8 }} labelStyle={{ color: '#A3A3A3' }} />
                <Line type="monotone" dataKey="emissions" stroke="#FFFFFF" strokeWidth={2} dot={{ fill: '#FFFFFF', r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
        {byScope.length > 0 && (
          <div className="bg-[#171717] border border-[#2A2A2A] rounded-lg p-4">
            <h3 className="text-sm font-medium text-white mb-3">By Scope</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={byScope} dataKey="total" nameKey="scope" cx="50%" cy="50%" outerRadius={70} label={({ scope, total }) => `Scope ${scope}: ${total}kg`}>
                  {byScope.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#171717', border: '1px solid #2A2A2A', borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="flex justify-end"><button onClick={() => { setEditing(null); setModalOpen(true); }} className="px-4 py-2 text-sm bg-white text-black font-medium rounded-lg hover:bg-[#D4D4D4]">Add Transaction</button></div>

      <div className="bg-[#171717] border border-[#2A2A2A] rounded-lg p-4">
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="flex-1"><SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search transactions..." /></div>
          <select value={scopeFilter} onChange={(e) => { setScopeFilter(e.target.value); setPage(1); }} className="px-3 py-2 text-sm bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:outline-none">
            <option value="">All Scopes</option><option value="1">Scope 1</option><option value="2">Scope 2</option><option value="3">Scope 3</option>
          </select>
        </div>
        {loading ? <TableSkeleton /> : transactions.length === 0 ? <EmptyState title="No transactions" message="Record your first carbon transaction" /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-[#737373] border-b border-[#2A2A2A]"><th className="pb-3 font-medium">Date</th><th className="pb-3 font-medium">Description</th><th className="pb-3 font-medium hidden sm:table-cell">Factor</th><th className="pb-3 font-medium">Qty</th><th className="pb-3 font-medium">Emissions</th><th className="pb-3 font-medium hidden md:table-cell">Scope</th><th className="pb-3 font-medium text-right">Actions</th></tr></thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t.id} className="border-b border-[#2A2A2A] hover:bg-[#1F1F1F]">
                    <td className="py-3 text-[#A3A3A3]">{new Date(t.transactionDate).toLocaleDateString()}</td>
                    <td className="py-3 text-white">{t.description || '—'}</td>
                    <td className="py-3 text-[#A3A3A3] hidden sm:table-cell">{t.emissionFactor?.name}</td>
                    <td className="py-3 text-white">{t.quantity} {t.unit}</td>
                    <td className="py-3 text-white font-medium">{t.emissionAmount.toFixed(2)} kg</td>
                    <td className="py-3 hidden md:table-cell"><span className="px-2 py-0.5 text-xs rounded-full bg-[#2A2A2A] text-[#A3A3A3]">Scope {t.scope}</span></td>
                    <td className="py-3 text-right">
                      <button onClick={() => { setEditing(t); setModalOpen(true); }} className="text-[#A3A3A3] hover:text-white mr-3 text-xs">Edit</button>
                      <button onClick={() => setDeleteTarget(t)} className="text-red-400 hover:text-red-300 text-xs">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination pagination={pagination} onPageChange={setPage} />
      </div>

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditing(null); }} title={editing ? 'Edit Transaction' : 'Add Transaction'} size="lg">
        <TransactionForm transaction={editing} factors={factors} onSave={handleSave} onCancel={() => { setModalOpen(false); setEditing(null); }} />
      </Modal>
      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete Transaction" message="Delete this carbon transaction?" loading={deleting} />
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </div>
  );
}
