import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BASE_API_URL } from '../context/AuthContext';
import { 
  Sparkles, 
  Save, 
  AlertCircle, 
  CheckCircle,
  Loader
} from 'lucide-react';

export const PlanMapping = () => {
  const [plans, setPlans] = useState([]);
  const [features, setFeatures] = useState([]);
  const [mappings, setMappings] = useState({}); // Stores mapping as key: planId_featureId, value: String
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  const fetchData = async () => {
    try {
      const [resP, resF, resM] = await Promise.all([
        axios.get(`${BASE_API_URL}/masters/plans`),
        axios.get(`${BASE_API_URL}/masters/features`),
        axios.get(`${BASE_API_URL}/masters/plan-mappings`)
      ]);
      setPlans(resP.data);
      setFeatures(resF.data);

      // Build key-value map for quick lookup
      const mapObj = {};
      resM.data.forEach(item => {
        const key = `${item.plan?._id || item.plan}_${item.feature?._id || item.feature}`;
        mapObj[key] = item.value;
      });
      setMappings(mapObj);
    } catch (err) {
      console.error(err);
      showMessage('error', 'Error loading plan mapping databases.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSelectChange = (planId, featureId, val) => {
    const key = `${planId}_${featureId}`;
    setMappings(prev => ({
      ...prev,
      [key]: val
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Convert mapping object back to array of { plan, feature, value }
      const payload = [];
      plans.forEach(p => {
        features.forEach(f => {
          const key = `${p._id}_${f._id}`;
          payload.push({
            plan: p._id,
            feature: f._id,
            value: mappings[key] || 'No'
          });
        });
      });

      await axios.post(`${BASE_API_URL}/masters/plan-mappings`, payload);
      showMessage('success', 'Plan mappings saved successfully.');
    } catch (err) {
      console.error(err);
      showMessage('error', err.response?.data?.message || 'Error saving mapping data.');
    } finally {
      setSaving(false);
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 md:text-3xl">
            Plan Mapping Configuration
          </h1>
          <p className="text-sm text-slate-500">
            Map specific features and limits across your registered subscription plans.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || plans.length === 0 || features.length === 0}
          className="flex items-center justify-center gap-2 py-2 px-5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-md shadow-indigo-600/10 transition-colors text-sm disabled:bg-slate-300 disabled:shadow-none"
        >
          {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
        </button>
      </div>

      {message.text && (
        <div className={`flex items-center gap-2.5 p-4 rounded-xl border text-sm font-medium transition-all ${
          message.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-rose-50 border-rose-100 text-rose-800'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      {plans.length === 0 || features.length === 0 ? (
        <div className="p-8 border border-dashed border-slate-200 bg-white rounded-2xl text-center text-slate-500">
          Please add Plans in <strong className="text-slate-800">Plan Master</strong> and Features in <strong className="text-slate-800">Feature Master</strong> first to generate the mapping grid.
        </div>
      ) : (
        <div className="border border-slate-200 bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              Plan Mapping Matrix
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 font-bold text-slate-700 w-1/3 border-r border-slate-100">Feature Details</th>
                  {plans.map(p => (
                    <th key={p._id} className="px-6 py-4 font-bold text-slate-700 text-center border-r border-slate-100">
                      <div>{p.planName}</div>
                      <div className="text-xs font-normal text-slate-400 mt-0.5">
                        {p.category} | Rs. {p.cost}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {features.map(f => (
                  <tr key={f._id} className="hover:bg-slate-50/30">
                    <td className="px-6 py-4 font-semibold text-slate-800 border-r border-slate-100">
                      {f.featureName}
                      <span className="block text-[10px] text-slate-400 font-normal uppercase tracking-wider mt-0.5">
                        Code: {f.id} | Order: {f.displayOrder}
                      </span>
                    </td>
                    {plans.map(p => {
                      const key = `${p._id}_${f._id}`;
                      const currentVal = mappings[key] || 'No';
                      return (
                        <td key={p._id} className="px-6 py-4 border-r border-slate-100 text-center">
                          <select
                            value={currentVal}
                            onChange={(e) => handleSelectChange(p._id, f._id, e.target.value)}
                            className="mx-auto block px-3 py-1.5 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-xs font-semibold bg-white"
                          >
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                            <option value="Limited">Limited</option>
                            <option value="Unlimited">Unlimited</option>
                            <option value="3 Months">3 Months</option>
                          </select>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
export default PlanMapping;
