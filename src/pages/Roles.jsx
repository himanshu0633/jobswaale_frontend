import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AlertCircle, CheckCircle, Edit2, Loader, Plus, Search, Shield, Trash2 } from 'lucide-react';
import { BASE_API_URL } from '../context/AuthContext';

const Roles = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const navigate = useNavigate();

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  const fetchRoles = async () => {
    try {
      const res = await axios.get(`${BASE_API_URL}/admin/roles`);
      setRoles(res.data);
    } catch (error) {
      showMessage('error', error.response?.data?.message || 'Failed to load roles.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const filteredRoles = useMemo(() => {
    const q = search.toLowerCase();
    return roles.filter(role =>
      role.name.toLowerCase().includes(q) ||
      (role.description || '').toLowerCase().includes(q)
    );
  }, [roles, search]);

  const deleteRole = async (id) => {
    if (!window.confirm('Are you sure you want to delete this role?')) return;
    try {
      await axios.delete(`${BASE_API_URL}/admin/roles/${id}`);
      setRoles(roles.filter(role => role._id !== id));
      showMessage('success', 'Role deleted successfully.');
    } catch (error) {
      showMessage('error', error.response?.data?.message || 'Error deleting role.');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Loader className="w-8 h-8 animate-spin text-indigo-600" /></div>;
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h4 className="text-xl font-bold text-slate-800">Roles</h4>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 text-[0.9rem]">
          <Link to="/admin" className="hover:text-indigo-600">JobsWaale</Link>
          <span>&gt;</span>
          <Link to="/admin/users-roles" className="hover:text-indigo-600">Users & Roles</Link>
          <span>&gt;</span>
          <Link to="/admin/users-roles/roles" className="text-indigo-600 hover:text-indigo-700">Manage Roles</Link>
        </div>
      </div>

      {message.text && (
        <div className={`flex items-center gap-2.5 p-3 rounded-lg border text-sm font-medium ${message.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-rose-50 border-rose-100 text-rose-800'}`}>
          {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{message.text}</span>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h4 className="text-base font-bold text-slate-800">Role Listings</h4>
          <Link to="/admin/users-roles/roles/add" className="inline-flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg">
            <Plus className="w-3.5 h-3.5" /> Add Role
          </Link>
        </div>

        <div className="p-5">
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <div className="relative">
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search role or description..." className="pl-9 pr-4 py-2 w-72 border border-slate-200 rounded-lg text-sm" />
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            </div>
            <span className="ml-auto text-xs text-slate-400 font-medium">Showing {filteredRoles.length} of {roles.length} roles</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left min-w-[760px]">
              <thead>
                <tr className="bg-slate-50 text-xs uppercase tracking-wide text-slate-400 font-semibold">
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Role Name</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Users</th>
                  <th className="px-4 py-3">Permissions</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRoles.length === 0 ? (
                  <tr><td colSpan="7" className="px-4 py-8 text-center text-slate-400">No roles found.</td></tr>
                ) : filteredRoles.map((role, index) => (
                  <tr key={role._id} className="odd:bg-white even:bg-slate-50">
                    <td className="px-4 py-3 text-slate-400">{String(index + 1).padStart(3, '0')}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="w-9 h-9 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center"><Shield className="w-4 h-4" /></span>
                        <span className="font-semibold text-slate-800">{role.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{role.description || 'N/A'}</td>
                    <td className="px-4 py-3 font-semibold">{role.userCount || 0}</td>
                    <td className="px-4 py-3"><span className="px-2 py-1 rounded bg-indigo-50 text-indigo-600 text-xs font-bold">{role.permissions?.length || 0} Permissions</span></td>
                    <td className="px-4 py-3"><span className={`px-2 py-1 rounded text-xs font-bold ${role.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{role.status === 'active' ? 'Active' : 'Inactive'}</span></td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => navigate(`/admin/users-roles/roles/edit/${encodeURIComponent(role.name)}`)} className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => deleteRole(role._id)} className="w-8 h-8 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Roles;
