import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BASE_API_URL } from '../context/AuthContext';
import { 
  Building2, 
  Plus, 
  Edit2, 
  X, 
  Save, 
  AlertCircle, 
  CheckCircle,
  Loader
} from 'lucide-react';

export const City = () => {
  // Master lists
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [form, setForm] = useState({ 
    cid: '', 
    sid: '', 
    did: '', 
    ctid: '', 
    cityName: '', 
    status: 'active' 
  });
  
  // Selection states for filtering the table or form cascading
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  const fetchData = async () => {
    try {
      const [resC, resS, resD, resCt] = await Promise.all([
        axios.get(`${BASE_API_URL}/masters/countries`),
        axios.get(`${BASE_API_URL}/masters/states`),
        axios.get(`${BASE_API_URL}/masters/districts`),
        axios.get(`${BASE_API_URL}/masters/cities`)
      ]);
      setCountries(resC.data);
      setStates(resS.data);
      setDistricts(resD.data);
      setCities(resCt.data);
    } catch (err) {
      console.error(err);
      showMessage('error', 'Error fetching location data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { cid, sid, did, ctid, cityName, status } = form;
    if (!cid || !sid || !did || !ctid || !cityName) {
      showMessage('error', 'Please fill in all required fields.');
      return;
    }

    try {
      if (editingId) {
        const response = await axios.put(`${BASE_API_URL}/masters/cities/${editingId}`, form);
        setCities(cities.map(item => item._id === editingId ? response.data : item));
        showMessage('success', 'City updated successfully.');
        setEditingId(null);
      } else {
        const response = await axios.post(`${BASE_API_URL}/masters/cities`, form);
        setCities([...cities, response.data]);
        showMessage('success', 'City added successfully.');
      }
      setForm({ cid: '', sid: '', did: '', ctid: '', cityName: '', status: 'active' });
    } catch (err) {
      showMessage('error', err.response?.data?.message || 'Error processing record.');
    }
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setForm({ 
      cid: item.cid, 
      sid: item.sid, 
      did: item.did, 
      ctid: item.ctid, 
      cityName: item.cityName, 
      status: item.status 
    });
  };

  const handleDelete = async (uid) => {
    if (!window.confirm('Delete this city?')) return;
    try {
      await axios.delete(`${BASE_API_URL}/masters/cities/${uid}`);
      setCities(cities.filter(item => item._id !== uid));
      showMessage('success', 'City deleted successfully.');
    } catch (err) {
      showMessage('error', 'Error deleting city.');
    }
  };

  // Cascading lists based on form selections
  const availableStates = form.cid ? states.filter(s => s.cid === form.cid) : [];
  const availableDistricts = form.sid ? districts.filter(d => d.sid === form.sid) : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 md:text-3xl">
          City Master
        </h1>
        <p className="text-sm text-slate-500">
          Configure default cities grouped under country, state, and district branches.
        </p>
      </div>

      {message.text && (
        <div className={`flex items-center gap-2.5 p-4 rounded-xl border text-sm font-medium transition-all ${
          message.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-rose-50 border-rose-100 text-rose-800'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Form Panel */}
        <div className="lg:col-span-1 border border-slate-200 bg-white rounded-2xl shadow-sm h-fit">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 rounded-t-2xl">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-600" />
              {editingId ? 'Edit City' : 'Add City'}
            </h3>
          </div>
          
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Country
                </label>
                <select
                  value={form.cid}
                  onChange={(e) => setForm({ ...form, cid: e.target.value, sid: '', did: '' })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                >
                  <option value="">-- Choose Country --</option>
                  {countries.map(c => (
                    <option key={c.cid} value={c.cid}>{c.countryName} ({c.cid})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  State
                </label>
                <select
                  disabled={!form.cid}
                  value={form.sid}
                  onChange={(e) => setForm({ ...form, sid: e.target.value, did: '' })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm disabled:bg-slate-50"
                >
                  <option value="">-- Choose State --</option>
                  {availableStates.map(s => (
                    <option key={s.sid} value={s.sid}>{s.stateName} ({s.sid})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  District
                </label>
                <select
                  disabled={!form.sid}
                  value={form.did}
                  onChange={(e) => setForm({ ...form, did: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm disabled:bg-slate-50"
                >
                  <option value="">-- Choose District --</option>
                  {availableDistricts.map(d => (
                    <option key={d.did} value={d.did}>{d.districtName} ({d.did})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  City ID (Unique Code)
                </label>
                <input
                  type="text"
                  required
                  disabled={!!editingId}
                  placeholder="e.g. NDEL, MUM"
                  value={form.ctid}
                  onChange={(e) => setForm({ ...form, ctid: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm disabled:bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  City Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. New Delhi"
                  value={form.cityName}
                  onChange={(e) => setForm({ ...form, cityName: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Status
                </label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-md shadow-indigo-600/10 transition-colors text-sm"
                >
                  {editingId ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  <span>{editingId ? 'Save Changes' : 'Add Record'}</span>
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(null);
                      setForm({ cid: '', sid: '', did: '', ctid: '', cityName: '', status: 'active' });
                    }}
                    className="p-2 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-xl"
                  >
                    <X className="w-4.5 h-4.5" />
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* List Table Panel */}
        <div className="lg:col-span-2 border border-slate-200 bg-white rounded-2xl shadow-sm">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 rounded-t-2xl">
            <h3 className="text-lg font-bold text-slate-800">City Listings</h3>
          </div>
          
          <div className="p-6 overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-500">
              <thead className="text-xs uppercase bg-slate-50 text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-semibold">City ID</th>
                  <th className="px-4 py-3 font-semibold">Location (Country / State / District)</th>
                  <th className="px-4 py-3 font-semibold">City Name</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cities.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-4 py-8 text-center text-slate-400">No cities defined yet.</td>
                  </tr>
                ) : (
                  cities.map((item) => (
                    <tr key={item._id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-bold text-slate-800 uppercase">{item.ctid}</td>
                      <td className="px-4 py-3 text-slate-500">
                        {item.cid} / {item.sid} / {item.did}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-700">{item.cityName}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          item.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
export default City;
