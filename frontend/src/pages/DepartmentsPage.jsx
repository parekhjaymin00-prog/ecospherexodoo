import { useState, useEffect, useCallback } from 'react';
import api from '../services/api.js';
import StatCard from '../components/StatCard.jsx';
import SearchInput from '../components/SearchInput.jsx';
import Pagination from '../components/Pagination.jsx';
import EmptyState from '../components/EmptyState.jsx';
import TableSkeleton from '../components/TableSkeleton.jsx';
import Modal from '../components/Modal.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import Toast from '../components/Toast.jsx';
import { useToast } from '../hooks/useToast.js';

function DepartmentForm({ department, onSave, onCancel, allDepartments }) {
  const [form, setForm] = useState({
    name: department?.name || '',
    code: department?.code || '',
    headId: department?.headId || '',
    parentId: department?.parentId || '',
    employeeCount: department?.employeeCount || 0,
    status: department?.status || 'active',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.code) { setError('Name and code are required'); return; }
    setSaving(true);
    setError(null);
    try {
      await onSave(form);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-sm text-red-400 bg-red-400/10 p-3 rounded-lg">{error}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-[#A3A3A3] mb-1">Department Name *</label>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 text-sm bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:border-[#525252] focus:outline-none" />
        </div>
        <div>
          <label className="block text-xs text-[#A3A3A3] mb-1">Code *</label>
          <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} className="w-full px-3 py-2 text-sm bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:border-[#525252] focus:outline-none" />
        </div>
        <div>
          <label className="block text-xs text-[#A3A3A3] mb-1">Parent Department</label>
          <select value={form.parentId} onChange={(e) => setForm({ ...form, parentId: e.target.value })} className="w-full px-3 py-2 text-sm bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:outline-none">
            <option value="">None</option>
            {allDepartments.filter(d => d.id !== department?.id).map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-[#A3A3A3] mb-1">Employee Count</label>
          <input type="number" value={form.employeeCount} onChange={(e) => setForm({ ...form, employeeCount: e.target.value })} className="w-full px-3 py-2 text-sm bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:border-[#525252] focus:outline-none" />
        </div>
        <div>
          <label className="block text-xs text-[#A3A3A3] mb-1">Status</label>
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full px-3 py-2 text-sm bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:outline-none">
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>
      <div className="flex gap-3 justify-end pt-4">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm border border-[#2A2A2A] text-[#A3A3A3] rounded-lg hover:bg-[#1F1F1F]">Cancel</button>
        <button type="submit" disabled={saving} className="px-4 py-2 text-sm bg-white text-black font-medium rounded-lg hover:bg-[#D4D4D4] disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
      </div>
    </form>
  );
}

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState([]);
  const [allDepts, setAllDepts] = useState([]);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const { toast, showToast, hideToast } = useToast();

  const fetchDepartments = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10, search, status: statusFilter };
      const [deptRes, statsRes, allRes] = await Promise.all([
        api.get('/departments', { params }),
        api.get('/departments/stats'),
        api.get('/departments/all'),
      ]);
      setDepartments(deptRes.data.departments);
      setPagination(deptRes.data.pagination);
      setStats(statsRes.data);
      setAllDepts(allRes.data.departments);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => { fetchDepartments(); }, [fetchDepartments]);

  const handleSave = async (form) => {
    if (editingDept) {
      await api.put(`/departments/${editingDept.id}`, form);
      showToast('Department updated successfully');
    } else {
      await api.post('/departments', form);
      showToast('Department created successfully');
    }
    setModalOpen(false);
    setEditingDept(null);
    fetchDepartments();
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/departments/${deleteTarget.id}`);
      showToast('Department deleted successfully');
      setDeleteTarget(null);
      fetchDepartments();
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to delete', 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Departments</h1>
          <p className="text-sm text-[#737373] mt-1">Manage organization departments</p>
        </div>
        <button onClick={() => { setEditingDept(null); setModalOpen(true); }} className="px-4 py-2 text-sm bg-white text-black font-medium rounded-lg hover:bg-[#D4D4D4]">Add Department</button>
      </div>

      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard title="Total" value={stats.total} />
          <StatCard title="Active" value={stats.active} />
          <StatCard title="Inactive" value={stats.inactive} />
          <StatCard title="Total Employees" value={stats.totalEmployees} />
        </div>
      )}

      <div className="bg-[#171717] border border-[#2A2A2A] rounded-lg p-4">
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="flex-1"><SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search departments..." /></div>
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="px-3 py-2 text-sm bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:outline-none">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {loading ? <TableSkeleton rows={5} cols={5} /> : departments.length === 0 ? <EmptyState title="No departments found" message="Create your first department" /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[#737373] border-b border-[#2A2A2A]">
                  <th className="pb-3 font-medium">Name</th>
                  <th className="pb-3 font-medium">Code</th>
                  <th className="pb-3 font-medium hidden sm:table-cell">Head</th>
                  <th className="pb-3 font-medium hidden md:table-cell">Employees</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {departments.map((dept) => (
                  <tr key={dept.id} className="border-b border-[#2A2A2A] hover:bg-[#1F1F1F]">
                    <td className="py-3 text-white">{dept.name}</td>
                    <td className="py-3 text-[#A3A3A3]">{dept.code}</td>
                    <td className="py-3 text-[#A3A3A3] hidden sm:table-cell">{dept.head?.fullName || '—'}</td>
                    <td className="py-3 text-[#A3A3A3] hidden md:table-cell">{dept.employeeCount}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 text-xs rounded-full ${dept.status === 'active' ? 'bg-green-500/10 text-green-400' : 'bg-[#2A2A2A] text-[#737373]'}`}>{dept.status}</span>
                    </td>
                    <td className="py-3 text-right">
                      <button onClick={() => { setEditingDept(dept); setModalOpen(true); }} className="text-[#A3A3A3] hover:text-white mr-3 text-xs">Edit</button>
                      <button onClick={() => setDeleteTarget(dept)} className="text-red-400 hover:text-red-300 text-xs">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination pagination={pagination} onPageChange={setPage} />
      </div>

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditingDept(null); }} title={editingDept ? 'Edit Department' : 'Create Department'} size="lg">
        <DepartmentForm department={editingDept} allDepartments={allDepts} onSave={handleSave} onCancel={() => { setModalOpen(false); setEditingDept(null); }} />
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete Department" message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`} loading={deleting} />

      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </div>
  );
}
