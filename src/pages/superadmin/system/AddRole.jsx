import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { AlertCircle, CheckCircle, ClipboardList, Info, Loader, LockOpen, Save, Shield, X } from 'lucide-react';
import { BASE_API_URL } from '../../../context/AuthContext';
import { allPermissions, permissionGroups, presets } from '../../../utils/permissions';

const AddRole = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(Boolean(id));
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [form, setForm] = useState({ name: '', status: 'active', description: '', permissions: presets.admin });
  const [existingRoleNames, setExistingRoleNames] = useState([]);
  const [existingRoles, setExistingRoles] = useState([]);
  const [customRoleName, setCustomRoleName] = useState('');

  useEffect(() => {
    const loadRoleData = async () => {
      try {
        const rolesRes = await axios.get(`${BASE_API_URL}/admin/roles`);
        setExistingRoles(rolesRes.data || []);
        setExistingRoleNames(rolesRes.data.map(role => role.name).filter(Boolean));

        if (id) {
          const res = await axios.get(`${BASE_API_URL}/admin/roles/${encodeURIComponent(id)}`);
          const roleName = res.data.name || '';
          setForm({
            name: roleName,
            status: res.data.status || 'active',
            description: res.data.description || '',
            permissions: res.data.permissions || [],
          });
        }
      } catch (error) {
        setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to load role data.' });
      } finally {
        setLoading(false);
      }
    };
    loadRoleData();
  }, [id]);

  const roleChoices = useMemo(() => {
    const names = [...new Set(existingRoleNames)].filter(name => name && name !== 'Other');
    return [...names, 'Other'];
  }, [existingRoleNames]);

  const rolePresetButtons = useMemo(() => (
    existingRoles.filter(role => role._id !== id && role.permissions?.length)
  ), [existingRoles, id]);

  const groupCounts = useMemo(() => permissionGroups.map(group => ({
    label: group.label,
    count: group.permissions.filter(permission => form.permissions.includes(permission.key)).length,
    total: group.permissions.length,
  })), [form.permissions]);

  const togglePermission = (key) => {
    setForm(prev => ({
      ...prev,
      permissions: prev.permissions.includes(key)
        ? prev.permissions.filter(permission => permission !== key)
        : [...prev.permissions, key],
    }));
  };

  const toggleGroup = (group, enabled = true) => {
    const keys = group.permissions.map(permission => permission.key);
    setForm(prev => ({
      ...prev,
      permissions: enabled
        ? [...new Set([...prev.permissions, ...keys])]
        : prev.permissions.filter(permission => !keys.includes(permission)),
    }));
  };

  const submit = async (e) => {
    e.preventDefault();
    const roleName = form.name === 'Other' ? customRoleName.trim() : form.name.trim();
    if (!roleName) {
      setMessage({ type: 'error', text: 'Please select a role name.' });
      return;
    }
    const payload = { ...form, name: roleName };
    setSubmitting(true);
    try {
      if (id) {
        await axios.put(`${BASE_API_URL}/admin/roles/${encodeURIComponent(id)}`, payload);
        setMessage({ type: 'success', text: 'Role updated successfully.' });
      } else {
        await axios.post(`${BASE_API_URL}/admin/roles`, payload);
        setMessage({ type: 'success', text: 'Role created successfully.' });
      }
      setTimeout(() => navigate('/admin/users-roles/roles'), 900);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Error saving role.' });
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls = 'w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm';
  const labelCls = 'block text-sm font-medium text-slate-600 mb-1';

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader className="w-8 h-8 animate-spin text-indigo-600" /></div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h4 className="text-xl font-bold text-slate-800">{id ? 'Edit Role' : 'Add New Role'}</h4>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 text-[0.9rem]">
          <Link to="/admin" className="hover:text-indigo-600">JobsWaale</Link>
          <span>&gt;</span>
          <Link to="/admin/users-roles" className="hover:text-indigo-600">Users & Roles</Link>
          <span>&gt;</span>
          <Link to="/admin/users-roles/roles" className="hover:text-indigo-600">Roles</Link>
          <span>&gt;</span>
          <Link to={id ? `/admin/users-roles/roles/edit/${encodeURIComponent(id)}` : '/admin/users-roles/roles/add'} className="text-indigo-600 hover:text-indigo-700">{id ? 'Edit Role' : 'Add Role'}</Link>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden -ml-3 lg:-ml-5">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h4 className="text-base font-bold text-slate-800">{id ? 'Edit Role' : 'Create New Role'}</h4>
          <Link to="/admin/users-roles/roles" className="inline-flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg"><ClipboardList className="w-3.5 h-3.5" /> View All Roles</Link>
        </div>

        {message.text && (
          <div className={`flex items-center gap-2.5 px-5 py-3 border-b text-sm font-medium ${message.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-rose-50 border-rose-100 text-rose-800'}`}>
            {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{message.text}</span>
            <button type="button" onClick={() => setMessage({ type: '', text: '' })} className="ml-auto rounded-full p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <form onSubmit={submit} className="p-5">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5">
            <div className="space-y-4">
              <h5 className="flex items-center gap-2 bg-slate-50 text-slate-700 text-sm font-semibold px-3 py-2 rounded-lg"><Shield className="w-4 h-4" /> Role Details</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Role Name <span className="text-rose-500">*</span></label>
                  <select value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} required>
                    <option value="">Select a role</option>
                    {roleChoices.map(option => <option key={option} value={option}>{option}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Status <span className="text-rose-500">*</span></label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={inputCls}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              {form.name === 'Other' && (
                <div>
                  <label className={labelCls}>Other Role Name <span className="text-rose-500">*</span></label>
                  <input
                    value={customRoleName}
                    onChange={(e) => setCustomRoleName(e.target.value)}
                    className={inputCls}
                    placeholder="Enter custom role name"
                    required
                  />
                </div>
              )}
              <div>
                <label className={labelCls}>Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows="2" className={inputCls} placeholder="Brief description of this role's responsibilities" />
              </div>

              <div className="flex items-center justify-between flex-wrap gap-3">
                <h5 className="flex items-center gap-2 bg-slate-50 text-slate-700 text-sm font-semibold px-3 py-2 rounded-lg flex-1"><LockOpen className="w-4 h-4" /> Role Permissions</h5>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setForm({ ...form, permissions: allPermissions })} className="px-3 py-2 border border-emerald-200 text-emerald-700 rounded-lg text-xs font-bold">Grant All</button>
                  <button type="button" onClick={() => setForm({ ...form, permissions: [] })} className="px-3 py-2 border border-rose-200 text-rose-600 rounded-lg text-xs font-bold">Revoke All</button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {permissionGroups.map(group => (
                  <div key={group.key} className="border border-slate-200 rounded-lg overflow-hidden">
                    <div className="flex items-center justify-between bg-slate-50 px-3 py-2">
                      <span className="font-bold text-sm text-slate-700">{group.label}</span>
                      <button type="button" onClick={() => toggleGroup(group, true)} className="text-xs font-bold text-slate-500 hover:text-indigo-600">Select All</button>
                    </div>
                    <div className="divide-y divide-slate-100">
                      {group.permissions.map(permission => (
                        <label key={permission.key} className="flex items-center justify-between px-3 py-2 text-sm">
                          <span>{permission.label}</span>
                          <input type="checkbox" checked={form.permissions.includes(permission.key)} onChange={() => togglePermission(permission.key)} className="w-4 h-4" />
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-2">
                <button disabled={submitting} type="submit" className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold disabled:opacity-60"><Save className="w-4 h-4" /> {submitting ? 'Saving...' : id ? 'Update Role' : 'Create Role'}</button>
                <Link to="/admin/users-roles/roles" className="inline-flex items-center gap-2 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg text-sm font-bold"><X className="w-4 h-4" /> Cancel</Link>
              </div>
            </div>

            <aside className="space-y-4">
              <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4">
                <h5 className="flex items-center gap-2 font-bold text-slate-800"><Info className="w-4 h-4 text-indigo-600" /> Permission Tips</h5>
                <ul className="mt-2 space-y-2 text-sm text-slate-600">
                  <li>Grant only necessary permissions.</li>
                  <li>Use Select All per group for quick setup.</li>
                  <li>Changes take effect on next user login.</li>
                </ul>
              </div>
              <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4">
                <h5 className="font-bold text-slate-800">Permission Summary</h5>
                <p className="text-sm mt-2"><strong>{form.permissions.length}</strong> permissions selected</p>
                <div className="mt-2 space-y-1 text-xs text-slate-500">{groupCounts.map(group => <div key={group.label}>{group.label}: {group.count}/{group.total}</div>)}</div>
              </div>
              <div className="bg-amber-50 border border-amber-100 rounded-lg p-4">
                <h5 className="font-bold text-slate-800">Role Presets</h5>
                <div className="flex flex-wrap gap-2 mt-3">
                  {rolePresetButtons.map(role => (
                    <button
                      key={role._id}
                      type="button"
                      onClick={() => setForm({ ...form, permissions: role.permissions || [] })}
                      className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-bold"
                    >
                      {role.name}
                    </button>
                  ))}
                </div>
                {rolePresetButtons.length > 0 && (
                  <p className="text-xs text-slate-500 mt-3">Saved roles appear here as reusable permission presets.</p>
                )}
              </div>
            </aside>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddRole;
