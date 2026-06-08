import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BASE_API_URL } from '../context/AuthContext';
import { 
  CreditCard, 
  Plus, 
  Edit2, 
  X, 
  Save, 
  AlertCircle, 
  CheckCircle,
  Loader
} from 'lucide-react';

export const PlanMaster = () => {
  const [plans, setPlans] = useState([]);
  const [featuresList, setFeaturesList] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [form, setForm] = useState({
    category: 'Jobseeker',
    planName: '',
    cost: 0,
    planValidity: 'Monthly',
    startingDate: '',
    endDate: '',
    features: [], // array of feature ids
    status: 'active'
  });

  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  const fetchData = async () => {
    try {
      const [resPlans, resFeats] = await Promise.all([
        axios.get(`${BASE_API_URL}/masters/plans`),
        axios.get(`${BASE_API_URL}/masters/features`)
      ]);
      setPlans(resPlans.data);
      setFeaturesList(resFeats.data.filter(f => f.status === 'active'));
    } catch (err) {
      console.error(err);
      showMessage('error', 'Error retrieving plans or features database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCheckboxChange = (featureId) => {
    const isChecked = form.features.includes(featureId);
    if (isChecked) {
      setForm({
        ...form,
        features: form.features.filter(id => id !== featureId)
      });
    } else {
      setForm({
        ...form,
        features: [...form.features, featureId]
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.planName || form.cost === undefined) return;

    try {
      if (editingId) {
        const response = await axios.put(`${BASE_API_URL}/masters/plans/${editingId}`, form);
        setPlans(plans.map(item => item._id === editingId ? response.data : item));
        showMessage('success', 'Plan updated successfully.');
        setEditingId(null);
      } else {
        const response = await axios.post(`${BASE_API_URL}/masters/plans`, form);
        setPlans([...plans, response.data]);
        showMessage('success', 'Plan added successfully.');
      }
      setForm({
        category: 'Jobseeker',
        planName: '',
        cost: 0,
        planValidity: 'Monthly',
        startingDate: '',
        endDate: '',
        features: [],
        status: 'active'
      });
    } catch (err) {
      showMessage('error', err.response?.data?.message || 'Error processing plan action.');
    }
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setForm({
      category: item.category,
      planName: item.planName,
      cost: item.cost,
      planValidity: item.planValidity,
      startingDate: item.startingDate ? new Date(item.startingDate).toISOString().split('T')[0] : '',
      endDate: item.endDate ? new Date(item.endDate).toISOString().split('T')[0] : '',
      features: item.features.map(f => f._id || f),
      status: item.status
    });
  };

  const handleDelete = async (uid) => {
    if (!window.confirm('Delete this plan?')) return;
    try {
      await axios.delete(`${BASE_API_URL}/masters/plans/${uid}`);
      setPlans(plans.filter(item => item._id !== uid));
      showMessage('success', 'Plan deleted successfully.');
    } catch (err) {
      showMessage('error', 'Error deleting plan.');
    }
  };

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
          Plan Master (Packages)
        </h1>
        <p className="text-sm text-slate-500">
          Configure subscription packages for Jobseekers and Employers, mapping multiple active entitlements.
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

      {/* Grid: Form and Listings */}
      <div className="grid gap-6 xl:grid-cols-3">
        {/* Form Panel */}
        <div className="xl:col-span-1 border border-slate-200 bg-white rounded-2xl shadow-sm h-fit">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 rounded-t-2xl">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-indigo-600" />
              {editingId ? 'Edit Plan Package' : 'Create Plan Package'}
            </h3>
          </div>
          
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Target Category
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                  >
                    <option value="Jobseeker">Jobseeker</option>
                    <option value="Employer">Employer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Plan Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Premium Pro"
                    value={form.planName}
                    onChange={(e) => setForm({ ...form, planName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Cost (Rs.)
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="0"
                    value={form.cost}
                    onChange={(e) => setForm({ ...form, cost: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Plan Validity
                  </label>
                  <select
                    value={form.planValidity}
                    onChange={(e) => setForm({ ...form, planValidity: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                  >
                    <option value="One Time">One Time</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Half-Yearly">Half-Yearly</option>
                    <option value="Yearly">Yearly</option>
                    <option value="Always Free">Always Free</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Starting Date
                  </label>
                  <input
                    type="date"
                    value={form.startingDate}
                    onChange={(e) => setForm({ ...form, startingDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Ending Date
                  </label>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                  />
                </div>
              </div>

              {/* Multi Select Features Checklist */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Multi-Select Features
                </label>
                {featuresList.length === 0 ? (
                  <p className="text-xs text-slate-400 border border-dashed rounded-xl p-3 text-center">
                    No active features available in Feature Master.
                  </p>
                ) : (
                  <div className="border border-slate-200 rounded-xl p-3 max-h-40 overflow-y-auto space-y-2.5 bg-slate-50/30">
                    {featuresList.map((f) => (
                      <label key={f._id} className="flex items-center gap-2.5 text-sm text-slate-700 font-medium cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.features.includes(f._id)}
                          onChange={() => handleCheckboxChange(f._id)}
                          className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer"
                        />
                        <span>{f.featureName}</span>
                      </label>
                    ))}
                  </div>
                )}
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
                  <span>{editingId ? 'Save Package' : 'Create Package'}</span>
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(null);
                      setForm({
                        category: 'Jobseeker',
                        planName: '',
                        cost: 0,
                        planValidity: 'Monthly',
                        startingDate: '',
                        endDate: '',
                        features: [],
                        status: 'active'
                      });
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

        {/* Listings Panel */}
        <div className="xl:col-span-2 border border-slate-200 bg-white rounded-2xl shadow-sm">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 rounded-t-2xl">
            <h3 className="text-lg font-bold text-slate-800">Plan Packages Listings</h3>
          </div>
          
          <div className="p-6 overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-500">
              <thead className="text-xs uppercase bg-slate-50 text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-semibold">Category</th>
                  <th className="px-4 py-3 font-semibold">Plan Name</th>
                  <th className="px-4 py-3 font-semibold">Price</th>
                  <th className="px-4 py-3 font-semibold">Validity</th>
                  <th className="px-4 py-3 font-semibold">Mapped Entitlements</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {plans.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-8 text-center text-slate-400">No plan packages defined yet.</td>
                  </tr>
                ) : (
                  plans.map((item) => (
                    <tr key={item._id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                          item.category === 'Jobseeker' ? 'bg-indigo-55 bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-600'
                        }`}>
                          {item.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-800">{item.planName}</td>
                      <td className="px-4 py-3 font-semibold text-slate-900">₹{item.cost}</td>
                      <td className="px-4 py-3 text-slate-600 text-xs">{item.planValidity}</td>
                      <td className="px-4 py-3 max-w-[200px]">
                        <div className="flex flex-wrap gap-1">
                          {item.features && item.features.length > 0 ? (
                            item.features.map(f => (
                              <span key={f._id || f} className="px-1.5 py-0.5 text-[9px] bg-slate-100 rounded text-slate-600">
                                {f.featureName || 'Entitled'}
                              </span>
                            ))
                          ) : (
                            <span className="text-[10px] text-slate-400">No features</span>
                          )}
                        </div>
                      </td>
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
export default PlanMaster;
