import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { AlertCircle, CheckCircle, ClipboardList, Info, Loader, Mail, Save, ShieldCheck, User, X } from 'lucide-react';
import { BASE_API_URL } from '../../../context/AuthContext';
import { permissionGroups } from '../../../utils/permissions';
import { cleanPhoneInput } from '../../../utils/phone';

const AddUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    username: '',
    roleRef: '',
    accountMethod: 'invite',
    password: '',
    confirmPassword: '',
    status: 'active',
  });

  useEffect(() => {
    const load = async () => {
      try {
        const [rolesRes, userRes] = await Promise.all([
          axios.get(`${BASE_API_URL}/admin/roles`),
          id ? axios.get(`${BASE_API_URL}/admin/users/${id}`) : Promise.resolve({ data: null }),
        ]);
        setRoles(rolesRes.data.filter(role => role.status === 'active' || role._id === userRes.data?.roleRef?._id));
        if (userRes.data) {
          setForm({
            firstName: userRes.data.firstName || '',
            lastName: userRes.data.lastName || '',
            email: userRes.data.email || '',
            phone: userRes.data.phone || '',
            username: userRes.data.username || '',
            roleRef: userRes.data.roleRef?._id || '',
            accountMethod: 'manual',
            password: '',
            confirmPassword: '',
            status: userRes.data.status || 'active',
          });
        }
      } catch (error) {
        setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to load form data.' });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const selectedRole = useMemo(() => roles.find(role => role._id === form.roleRef), [roles, form.roleRef]);
  const selectedSummary = useMemo(() => {
    if (!selectedRole) return [];
    return permissionGroups.map(group => ({
      label: group.label,
      selected: group.permissions.filter(permission => selectedRole.permissions?.includes(permission.key)).length,
      total: group.permissions.length,
    })).filter(group => group.selected > 0);
  }, [selectedRole]);

  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const submit = async (e) => {
    e.preventDefault();
    setGeneratedPassword('');
    setSubmitting(true);
    try {
      if (id) {
        await axios.put(`${BASE_API_URL}/admin/users/${id}`, form);
        setMessage({ type: 'success', text: 'User updated successfully.' });
        setTimeout(() => navigate('/admin/users-roles/users'), 900);
      } else {
        const res = await axios.post(`${BASE_API_URL}/admin/users`, form);
        setGeneratedPassword(res.data.generatedPassword || '');
        setMessage({ type: 'success', text: res.data.message || 'User created successfully.' });
        if (!res.data.generatedPassword) setTimeout(() => navigate('/admin/users-roles/users'), 1200);
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Error saving user.' });
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls = 'w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm disabled:bg-slate-50';
  const labelCls = 'block text-sm font-medium text-slate-600 mb-1';

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader className="w-8 h-8 animate-spin text-indigo-600" /></div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h4 className="text-xl font-bold text-slate-800">{id ? 'Edit User' : 'Add User'}</h4>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 text-[0.9rem]">
          <Link to="/admin" className="hover:text-indigo-600">JobsWaale</Link>
          <span>&gt;</span>
          <Link to="/admin/users-roles" className="hover:text-indigo-600">Users & Roles</Link>
          <span>&gt;</span>
          <Link to="/admin/users-roles/users" className="hover:text-indigo-600">Users</Link>
          <span>&gt;</span>
          <Link to={id ? `/admin/users-roles/users/edit/${id}` : '/admin/users-roles/users/add'} className="text-indigo-600 hover:text-indigo-700">{id ? 'Edit User' : 'Add User'}</Link>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden -ml-3 lg:-ml-5">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h4 className="text-base font-bold text-slate-800">{id ? 'Edit User' : 'Create New User'}</h4>
          <Link to="/admin/users-roles/users" className="inline-flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg"><ClipboardList className="w-3.5 h-3.5" /> View All Users</Link>
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

        {generatedPassword && (
          <div className="mx-5 mt-5 p-4 rounded-lg border border-amber-200 bg-amber-50 text-sm text-amber-800">
            Email is not configured, so share this generated password manually: <strong>{generatedPassword}</strong>
          </div>
        )}

        <form onSubmit={submit} className="p-5">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5">
            <div className="space-y-4">
              <h5 className="flex items-center gap-2 bg-slate-50 text-slate-700 text-sm font-semibold px-3 py-2 rounded-lg"><User className="w-4 h-4" /> Personal Details</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className={labelCls}>First Name <span className="text-rose-500">*</span></label><input value={form.firstName} onChange={(e) => update('firstName', e.target.value)} className={inputCls} required /></div>
                <div><label className={labelCls}>Last Name <span className="text-rose-500">*</span></label><input value={form.lastName} onChange={(e) => update('lastName', e.target.value)} className={inputCls} required /></div>
                <div><label className={labelCls}>Email Address <span className="text-rose-500">*</span></label><input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} className={inputCls} disabled={Boolean(id)} required /></div>
                <div><label className={labelCls}>Phone Number <span className="text-rose-500">*</span></label><input value={form.phone} onChange={(e) => update('phone', cleanPhoneInput(e.target.value))} className={inputCls} placeholder="+91 1234567890" required /></div>
              </div>

              <h5 className="flex items-center gap-2 bg-slate-50 text-slate-700 text-sm font-semibold px-3 py-2 rounded-lg"><ShieldCheck className="w-4 h-4" /> Account Details</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className={labelCls}>Username <span className="text-rose-500">*</span></label><input value={form.username} onChange={(e) => update('username', e.target.value)} className={inputCls} required /></div>
                <div>
                  <label className={labelCls}>Role <span className="text-rose-500">*</span></label>
                  <select value={form.roleRef} onChange={(e) => update('roleRef', e.target.value)} className={inputCls} required>
                    <option value="">Select Role</option>
                    {roles.map(role => <option key={role._id} value={role._id}>{role.name}</option>)}
                  </select>
                </div>
              </div>

              {!id && (
                <div>
                  <label className={labelCls}>Account Setup Method <span className="text-rose-500">*</span></label>
                  <div className="flex gap-5 flex-wrap text-sm text-slate-600">
                    <label className="flex items-center gap-2"><input type="radio" checked={form.accountMethod === 'invite'} onChange={() => update('accountMethod', 'invite')} /> Send Invitation Email</label>
                    <label className="flex items-center gap-2"><input type="radio" checked={form.accountMethod === 'manual'} onChange={() => update('accountMethod', 'manual')} /> Set Password Manually</label>
                  </div>
                </div>
              )}

              {(form.accountMethod === 'manual' || id) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className={labelCls}>Password {id ? <span className="text-slate-400">(leave blank to keep)</span> : <span className="text-rose-500">*</span>}</label><input type="password" value={form.password} onChange={(e) => update('password', e.target.value)} className={inputCls} required={!id && form.accountMethod === 'manual'} /></div>
                  <div><label className={labelCls}>Confirm Password</label><input type="password" value={form.confirmPassword} onChange={(e) => update('confirmPassword', e.target.value)} className={inputCls} required={!id && form.accountMethod === 'manual'} /></div>
                </div>
              )}

              {form.accountMethod === 'invite' && !id && (
                <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-lg p-3 text-sm"><Mail className="w-4 h-4" /> An invitation email with login instructions will be sent. If SMTP is not configured, the generated password will appear here.</div>
              )}

              <h5 className="flex items-center gap-2 bg-slate-50 text-slate-700 text-sm font-semibold px-3 py-2 rounded-lg">Status</h5>
              <div className="md:w-1/2">
                <label className={labelCls}>Account Status <span className="text-rose-500">*</span></label>
                <select value={form.status} onChange={(e) => update('status', e.target.value)} className={inputCls}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button disabled={submitting} type="submit" className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold disabled:opacity-60"><Save className="w-4 h-4" /> {submitting ? 'Saving...' : id ? 'Update User' : 'Create User'}</button>
                <Link to="/admin/users-roles/users" className="inline-flex items-center gap-2 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg text-sm font-bold"><X className="w-4 h-4" /> Cancel</Link>
              </div>
            </div>

            <aside className="space-y-4">
              <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4">
                <h5 className="flex items-center gap-2 font-bold text-slate-800"><Info className="w-4 h-4 text-indigo-600" /> Quick Tips</h5>
                <ul className="mt-2 space-y-2 text-sm text-slate-600">
                  <li>Use a valid email address for invitation.</li>
                  <li>Assign role based on responsibilities.</li>
                  <li>Manual passwords should be at least 8 characters.</li>
                </ul>
              </div>
              <div className="bg-amber-50 border border-amber-100 rounded-lg p-4">
                <h5 className="font-bold text-slate-800">Permission Summary</h5>
                {selectedRole ? (
                  <div className="mt-2 text-sm text-slate-600">
                    <p className="font-semibold">{selectedRole.name}: {selectedRole.permissions?.length || 0} permissions</p>
                    <div className="mt-2 space-y-1 text-xs">{selectedSummary.map(group => <div key={group.label}>{group.label}: {group.selected}/{group.total}</div>)}</div>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 mt-2">Select a role to view permission summary.</p>
                )}
              </div>
            </aside>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUser;
