import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AlertCircle, CheckCircle, Edit2, Loader, Plus, Search, Trash2, User } from 'lucide-react';
import { BASE_API_URL } from '../../../context/AuthContext';

const statusLabel = (status) => status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Active';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const navigate = useNavigate();

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  useEffect(() => {
    const load = async () => {
      try {
        const [usersRes, rolesRes] = await Promise.all([
          axios.get(`${BASE_API_URL}/admin/users`),
          axios.get(`${BASE_API_URL}/admin/roles`),
        ]);
        setUsers(usersRes.data);
        setRoles(rolesRes.data);
      } catch (error) {
        showMessage('error', error.response?.data?.message || 'Failed to load users.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredUsers = useMemo(() => {
    const q = search.toLowerCase();
    return users.filter(user => {
      const fullName = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase();
      const matchesSearch = fullName.includes(q) || user.email.toLowerCase().includes(q) || (user.username || '').toLowerCase().includes(q);
      const matchesRole = !roleFilter || user.roleRef?._id === roleFilter;
      const matchesStatus = !statusFilter || user.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  const deleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await axios.delete(`${BASE_API_URL}/admin/users/${id}`);
      setUsers(users.filter(user => user._id !== id));
      showMessage('success', 'User deleted successfully.');
    } catch (error) {
      showMessage('error', error.response?.data?.message || 'Error deleting user.');
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader className="w-8 h-8 animate-spin text-indigo-600" /></div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h4 className="text-xl font-bold text-slate-800">Users</h4>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 text-[0.9rem]">
          <Link to="/admin" className="hover:text-indigo-600">JobsWaale</Link>
          <span>&gt;</span>
          <Link to="/admin/users-roles" className="hover:text-indigo-600">Users & Roles</Link>
          <span>&gt;</span>
          <Link to="/admin/users-roles/users" className="text-indigo-600 hover:text-indigo-700">Manage Users</Link>
        </div>
      </div>

      {message.text && (
        <div className={`flex items-center gap-2.5 p-3 rounded-lg border text-sm font-medium ${message.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-rose-50 border-rose-100 text-rose-800'}`}>
          {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{message.text}</span>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden -ml-3 lg:-ml-5">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h4 className="text-base font-bold text-slate-800">User Listings</h4>
          <Link to="/admin/users-roles/users/add" className="inline-flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg"><Plus className="w-3.5 h-3.5" /> Add User</Link>
        </div>

        <div className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
            <div className="relative md:col-span-2">
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, username or email..." className="pl-9 pr-4 py-2 w-full border border-slate-200 rounded-lg text-sm" />
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            </div>
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-lg text-sm">
              <option value="">All Roles</option>
              {roles.map(role => <option key={role._id} value={role._id}>{role.name}</option>)}
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-lg text-sm">
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left min-w-[820px]">
              <thead>
                <tr className="bg-slate-50 text-xs uppercase tracking-wide text-slate-400 font-semibold">
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Last Login</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.length === 0 ? (
                  <tr><td colSpan="7" className="px-4 py-8 text-center text-slate-400">No users found.</td></tr>
                ) : filteredUsers.map((user, index) => {
                  const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}` || 'U';
                  return (
                    <tr key={user._id} className="odd:bg-white even:bg-slate-50">
                      <td className="px-4 py-3 text-slate-400">{String(index + 1).padStart(3, '0')}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="w-9 h-9 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center font-bold">{initials.toUpperCase()}</span>
                          <div><div className="font-semibold text-slate-800">{user.firstName} {user.lastName}</div><div className="text-xs text-slate-400">@{user.username}</div></div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{user.email}</td>
                      <td className="px-4 py-3"><span className="px-2 py-1 rounded bg-indigo-50 text-indigo-600 text-xs font-bold">{user.roleRef?.name || user.role}</span></td>
                      <td className="px-4 py-3 text-slate-500">{user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}</td>
                      <td className="px-4 py-3"><span className={`px-2 py-1 rounded text-xs font-bold ${user.status === 'active' ? 'bg-emerald-50 text-emerald-700' : user.status === 'suspended' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'}`}>{statusLabel(user.status)}</span></td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => navigate(`/admin/users-roles/users/edit/${user._id}`)} className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => deleteUser(user._id)} className="w-8 h-8 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Users;
