import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BASE_API_URL } from '../context/AuthContext';
import { 
  Globe, 
  Map, 
  MapPin, 
  Plus, 
  Edit2, 
  X, 
  Save, 
  AlertCircle,
  CheckCircle,
  Loader
} from 'lucide-react';

export const Locations = () => {
  // Lists
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selection states (for cascading filters)
  const [activeCountryCid, setActiveCountryCid] = useState('');
  const [activeStateSid, setActiveStateSid] = useState('');

  // Form states
  const [countryForm, setCountryForm] = useState({ cid: '', countryName: '', status: 'active' });
  const [stateForm, setStateForm] = useState({ sid: '', stateName: '', cid: '', status: 'active' });
  const [districtForm, setDistrictForm] = useState({ did: '', districtName: '', sid: '', status: 'active' });

  // Edit states (if editing)
  const [editingCountryId, setEditingCountryId] = useState(null);
  const [editingStateId, setEditingStateId] = useState(null);
  const [editingDistrictId, setEditingDistrictId] = useState(null);

  // Messages
  const [message, setMessage] = useState({ type: '', text: '' });

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  // Fetch all lists
  const fetchData = async () => {
    try {
      const [resC, resS, resD] = await Promise.all([
        axios.get(`${BASE_API_URL}/masters/countries`),
        axios.get(`${BASE_API_URL}/masters/states`),
        axios.get(`${BASE_API_URL}/masters/districts`)
      ]);
      setCountries(resC.data);
      setStates(resS.data);
      setDistricts(resD.data);
    } catch (err) {
      console.error('Error fetching locations', err);
      showMessage('error', 'Failed to retrieve location databases.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- COUNTRY CRUD ---
  const handleCountrySubmit = async (e) => {
    e.preventDefault();
    if (!countryForm.cid || !countryForm.countryName) return;

    try {
      if (editingCountryId) {
        const res = await axios.put(`${BASE_API_URL}/masters/countries/${editingCountryId}`, countryForm);
        setCountries(countries.map(c => c._id === editingCountryId ? res.data : c));
        showMessage('success', 'Country updated successfully.');
        setEditingCountryId(null);
      } else {
        const res = await axios.post(`${BASE_API_URL}/masters/countries`, countryForm);
        setCountries([...countries, res.data]);
        showMessage('success', 'Country created successfully.');
      }
      setCountryForm({ cid: '', countryName: '', status: 'active' });
    } catch (err) {
      showMessage('error', err.response?.data?.message || 'Error processing Country action.');
    }
  };

  const handleCountryEdit = (country) => {
    setEditingCountryId(country._id);
    setCountryForm({ cid: country.cid, countryName: country.countryName, status: country.status });
  };

  const handleCountryDelete = async (id, cid) => {
    if (!window.confirm('Delete this country? This will also remove filter links.')) return;
    try {
      await axios.delete(`${BASE_API_URL}/masters/countries/${id}`);
      setCountries(countries.filter(c => c._id !== id));
      // Reset active country if deleted
      if (activeCountryCid === cid) {
        setActiveCountryCid('');
        setActiveStateSid('');
      }
      showMessage('success', 'Country deleted successfully.');
    } catch (err) {
      showMessage('error', err.response?.data?.message || 'Error deleting Country.');
    }
  };

  // --- STATE CRUD ---
  const handleStateSubmit = async (e) => {
    e.preventDefault();
    const targetCid = stateForm.cid || activeCountryCid;
    if (!stateForm.sid || !stateForm.stateName || !targetCid) {
      showMessage('error', 'Select a country first or specify it in the form.');
      return;
    }

    try {
      const payload = { ...stateForm, cid: targetCid };
      if (editingStateId) {
        const res = await axios.put(`${BASE_API_URL}/masters/states/${editingStateId}`, payload);
        setStates(states.map(s => s._id === editingStateId ? res.data : s));
        showMessage('success', 'State updated successfully.');
        setEditingStateId(null);
      } else {
        const res = await axios.post(`${BASE_API_URL}/masters/states`, payload);
        setStates([...states, res.data]);
        showMessage('success', 'State created successfully.');
      }
      setStateForm({ sid: '', stateName: '', cid: '', status: 'active' });
    } catch (err) {
      showMessage('error', err.response?.data?.message || 'Error processing State action.');
    }
  };

  const handleStateEdit = (state) => {
    setEditingStateId(state._id);
    setStateForm({ sid: state.sid, stateName: state.stateName, cid: state.cid, status: state.status });
  };

  const handleStateDelete = async (id, sid) => {
    if (!window.confirm('Delete this state?')) return;
    try {
      await axios.delete(`${BASE_API_URL}/masters/states/${id}`);
      setStates(states.filter(s => s._id !== id));
      if (activeStateSid === sid) {
        setActiveStateSid('');
      }
      showMessage('success', 'State deleted successfully.');
    } catch (err) {
      showMessage('error', err.response?.data?.message || 'Error deleting State.');
    }
  };

  // --- DISTRICT CRUD ---
  const handleDistrictSubmit = async (e) => {
    e.preventDefault();
    const targetSid = districtForm.sid || activeStateSid;
    if (!districtForm.did || !districtForm.districtName || !targetSid) {
      showMessage('error', 'Select a state first or specify it in the form.');
      return;
    }

    try {
      const payload = { ...districtForm, sid: targetSid };
      if (editingDistrictId) {
        const res = await axios.put(`${BASE_API_URL}/masters/districts/${editingDistrictId}`, payload);
        setDistricts(districts.map(d => d._id === editingDistrictId ? res.data : d));
        showMessage('success', 'District updated successfully.');
        setEditingDistrictId(null);
      } else {
        const res = await axios.post(`${BASE_API_URL}/masters/districts`, payload);
        setDistricts([...districts, res.data]);
        showMessage('success', 'District created successfully.');
      }
      setDistrictForm({ did: '', districtName: '', sid: '', status: 'active' });
    } catch (err) {
      showMessage('error', err.response?.data?.message || 'Error processing District action.');
    }
  };

  const handleDistrictEdit = (district) => {
    setEditingDistrictId(district._id);
    setDistrictForm({ did: district.did, districtName: district.districtName, sid: district.sid, status: district.status });
  };

  const handleDistrictDelete = async (id) => {
    if (!window.confirm('Delete this district?')) return;
    try {
      await axios.delete(`${BASE_API_URL}/masters/districts/${id}`);
      setDistricts(districts.filter(d => d._id !== id));
      showMessage('success', 'District deleted successfully.');
    } catch (err) {
      showMessage('error', err.response?.data?.message || 'Error deleting District.');
    }
  };

  // --- Filters ---
  const filteredStates = activeCountryCid 
    ? states.filter(s => s.cid === activeCountryCid) 
    : states;

  const filteredDistricts = activeStateSid 
    ? districts.filter(d => d.sid === activeStateSid) 
    : districts;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 md:text-3xl">
            Locations Master Configuration
          </h1>
          <p className="text-sm text-slate-500">
            Link and manage Country, State, and District structures. Click a row to filter child categories.
          </p>
        </div>
      </div>

      {/* Notifications */}
      {message.text && (
        <div className={`flex items-center gap-2.5 p-4 rounded-xl border text-sm font-medium transition-all ${
          message.type === 'success' 
            ? 'bg-emerald-50 border-emerald-100 text-emerald-800' 
            : 'bg-rose-50 border-rose-100 text-rose-800'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Grid Layout (3 Columns Cascading) */}
      <div className="grid gap-6 xl:grid-cols-3">
        
        {/* ============================================================== */}
        {/* COLUMN 1: Country Master */}
        {/* ============================================================== */}
        <div className="border border-slate-200 bg-white rounded-2xl shadow-sm flex flex-col h-[750px]">
          
          <div className="p-5 border-b border-slate-100 bg-slate-50/50 rounded-t-2xl">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Globe className="w-5 h-5 text-indigo-600" />
              1. Country Master
            </h3>
            <p className="text-xs text-slate-400 mt-1">Configure global countries</p>
          </div>

          {/* Form */}
          <div className="p-5 border-b border-slate-100">
            <form onSubmit={handleCountrySubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                    Country ID (Cid)
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!!editingCountryId}
                    placeholder="e.g. IND"
                    value={countryForm.cid}
                    onChange={(e) => setCountryForm({ ...countryForm, cid: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 text-sm disabled:bg-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                    Country Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="India"
                    value={countryForm.countryName}
                    onChange={(e) => setCountryForm({ ...countryForm, countryName: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 text-sm"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                    Status
                  </label>
                  <select
                    value={countryForm.status}
                    onChange={(e) => setCountryForm({ ...countryForm, status: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-indigo-500 text-sm"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div className="flex items-end gap-1 mt-5">
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm"
                  >
                    {editingCountryId ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    <span>{editingCountryId ? 'Save' : 'Add'}</span>
                  </button>
                  {editingCountryId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCountryId(null);
                        setCountryForm({ cid: '', countryName: '', status: 'active' });
                      }}
                      className="p-1.5 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {countries.map((c) => (
              <div 
                key={c._id}
                onClick={() => {
                  setActiveCountryCid(c.cid);
                  setActiveStateSid(''); // Reset sub selection
                }}
                className={`p-3.5 border rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                  activeCountryCid === c.cid 
                    ? 'border-indigo-500 bg-indigo-50/30 ring-1 ring-indigo-500/50' 
                    : 'border-slate-100 bg-white hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 uppercase">
                      {c.cid}
                    </span>
                    <h4 className="font-semibold text-slate-800">{c.countryName}</h4>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    IP: {c.ip || '127.0.0.1'} | Login: {c.login?.email ? c.login.email.split('@')[0] : 'System'}
                  </p>
                </div>
                <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    c.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {c.status}
                  </span>
                  <button 
                    onClick={() => handleCountryEdit(c)}
                    className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* ============================================================== */}
        {/* COLUMN 2: State Master */}
        {/* ============================================================== */}
        <div className="border border-slate-200 bg-white rounded-2xl shadow-sm flex flex-col h-[750px]">
          
          <div className="p-5 border-b border-slate-100 bg-slate-50/50 rounded-t-2xl">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Map className="w-5 h-5 text-indigo-600" />
              2. State Master
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {activeCountryCid ? `Showing states under Country ID: ${activeCountryCid}` : 'Showing all states. Select a country to filter.'}
            </p>
          </div>

          {/* Form */}
          <div className="p-5 border-b border-slate-100">
            <form onSubmit={handleStateSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                    Country Cid
                  </label>
                  <select
                    value={stateForm.cid || activeCountryCid}
                    onChange={(e) => setStateForm({ ...stateForm, cid: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-indigo-500 text-sm"
                  >
                    <option value="">-- Choose Country --</option>
                    {countries.map(c => <option key={c.cid} value={c.cid}>{c.countryName} ({c.cid})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                    State ID (Sid)
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!!editingStateId}
                    placeholder="e.g. MH"
                    value={stateForm.sid}
                    onChange={(e) => setStateForm({ ...stateForm, sid: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 text-sm disabled:bg-slate-100"
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                    State Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Maharashtra"
                    value={stateForm.stateName}
                    onChange={(e) => setStateForm({ ...stateForm, stateName: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 text-sm"
                  />
                </div>
                <div className="w-1/3">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                    Status
                  </label>
                  <select
                    value={stateForm.status}
                    onChange={(e) => setStateForm({ ...stateForm, status: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-indigo-500 text-sm"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-1 pt-1">
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm"
                >
                  {editingStateId ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  <span>{editingStateId ? 'Save' : 'Add'}</span>
                </button>
                {editingStateId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingStateId(null);
                      setStateForm({ sid: '', stateName: '', cid: '', status: 'active' });
                    }}
                    className="p-1.5 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {filteredStates.length === 0 ? (
              <p className="text-center text-xs text-slate-400 pt-10">No states found. Select another country or add one.</p>
            ) : (
              filteredStates.map((s) => (
                <div 
                  key={s._id}
                  onClick={() => setActiveStateSid(s.sid)}
                  className={`p-3.5 border rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                    activeStateSid === s.sid 
                      ? 'border-indigo-500 bg-indigo-50/30 ring-1 ring-indigo-500/50' 
                      : 'border-slate-100 bg-white hover:border-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 uppercase">
                        {s.sid}
                      </span>
                      <h4 className="font-semibold text-slate-800">{s.stateName}</h4>
                      <span className="text-[10px] text-slate-400 uppercase">({s.cid})</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                      IP: {s.ip || '127.0.0.1'} | Login: {s.login?.email ? s.login.email.split('@')[0] : 'System'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      s.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {s.status}
                    </span>
                    <button 
                      onClick={() => handleStateEdit(s)}
                      className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>

        {/* ============================================================== */}
        {/* COLUMN 3: District Master */}
        {/* ============================================================== */}
        <div className="border border-slate-200 bg-white rounded-2xl shadow-sm flex flex-col h-[750px]">
          
          <div className="p-5 border-b border-slate-100 bg-slate-50/50 rounded-t-2xl">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-indigo-600" />
              3. District Master
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {activeStateSid ? `Showing districts under State ID: ${activeStateSid}` : 'Showing all districts. Select a state to filter.'}
            </p>
          </div>

          {/* Form */}
          <div className="p-5 border-b border-slate-100">
            <form onSubmit={handleDistrictSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                    State Sid
                  </label>
                  <select
                    value={districtForm.sid || activeStateSid}
                    onChange={(e) => setDistrictForm({ ...districtForm, sid: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-indigo-500 text-sm"
                  >
                    <option value="">-- Choose State --</option>
                    {states.map(s => <option key={s.sid} value={s.sid}>{s.stateName} ({s.sid})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                    District ID (Did)
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!!editingDistrictId}
                    placeholder="e.g. PUNE"
                    value={districtForm.did}
                    onChange={(e) => setDistrictForm({ ...districtForm, did: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 text-sm disabled:bg-slate-100"
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                    District Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Pune District"
                    value={districtForm.districtName}
                    onChange={(e) => setDistrictForm({ ...districtForm, districtName: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 text-sm"
                  />
                </div>
                <div className="w-1/3">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                    Status
                  </label>
                  <select
                    value={districtForm.status}
                    onChange={(e) => setDistrictForm({ ...districtForm, status: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-indigo-500 text-sm"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-1 pt-1">
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm"
                >
                  {editingDistrictId ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  <span>{editingDistrictId ? 'Save' : 'Add'}</span>
                </button>
                {editingDistrictId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingDistrictId(null);
                      setDistrictForm({ did: '', districtName: '', sid: '', status: 'active' });
                    }}
                    className="p-1.5 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {filteredDistricts.length === 0 ? (
              <p className="text-center text-xs text-slate-400 pt-10">No districts found. Select another state or add one.</p>
            ) : (
              filteredDistricts.map((d) => (
                <div 
                  key={d._id}
                  className="p-3.5 border border-slate-100 bg-white rounded-xl flex items-center justify-between hover:border-slate-300 transition-all"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 uppercase">
                        {d.did}
                      </span>
                      <h4 className="font-semibold text-slate-800">{d.districtName}</h4>
                      <span className="text-[10px] text-slate-400 uppercase">({d.sid})</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                      IP: {d.ip || '127.0.0.1'} | Login: {d.login?.email ? d.login.email.split('@')[0] : 'System'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      d.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {d.status}
                    </span>
                    <button 
                      onClick={() => handleDistrictEdit(d)}
                      className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
export default Locations;
