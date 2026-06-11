import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BASE_API_URL } from '../context/AuthContext';
import { 
  AlertCircle, 
  CheckCircle2,
  Loader,
  X
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
    if (type === 'success') {
      setTimeout(() => setMessage({ type: '', text: '' }), 4000);
    }
  };

  const fetchData = async () => {
    try {
      const [resP, resF, resM] = await Promise.all([
        axios.get(`${BASE_API_URL}/masters/plans`),
        axios.get(`${BASE_API_URL}/masters/features`),
        axios.get(`${BASE_API_URL}/masters/plan-mappings`)
      ]);
      // Sort plans by displayOrder to ensure consistent column ordering matching mockup
      const sortedPlans = (resP.data || []).sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
      // Sort features by displayOrder to ensure consistent row ordering
      const sortedFeatures = (resF.data || []).sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
      
      setPlans(sortedPlans);
      setFeatures(sortedFeatures);

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
      showMessage('success', 'Success! Record added/updated successfully.');
    } catch (err) {
      console.error(err);
      showMessage('error', err.response?.data?.message || 'Oops! Something went wrong. Please try again.');
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
      
      {/* Title & Breadcrumb header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">
            Plan Mapping
          </h1>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 text-[0.9rem]">
          <span>Dashboard</span>
          <span>&gt;</span>
          <span className="text-indigo-600">Plan Mapping</span>
        </div>
      </div>

      {plans.length === 0 || features.length === 0 ? (
        <div className="p-8 border border-dashed border-slate-200 bg-white rounded-2xl text-center text-slate-500">
          Please add Plans in <strong className="text-slate-800">Plan Master</strong> and Features in <strong className="text-slate-800">Feature Master</strong> first to generate the mapping grid.
        </div>
      ) : (
        <div className="border border-slate-200 bg-white rounded-2xl shadow-sm overflow-hidden">
          
          {/* Card Header */}
          <div className="p-5 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-sm font-bold text-slate-800">
              Create Plan Mapping
            </h3>
          </div>
          
          {/* Card Content */}
          <div className="p-6">
            
            {/* Alert Boxes inside Card */}
            {message.text && (
              <div className="mb-5 relative animate-in fade-in slide-in-from-top-2 duration-200">
                <div className={`flex items-start gap-3 p-4 rounded-xl border text-sm font-semibold ${
                  message.type === 'success' 
                    ? 'bg-emerald-50 border-emerald-100 text-emerald-800' 
                    : 'bg-rose-50 border-rose-100 text-rose-800'
                }`}>
                  {message.type === 'success' ? (
                    <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
                  )}
                  <div className="flex-grow">{message.text}</div>
                  <button 
                    onClick={() => setMessage({ type: '', text: '' })}
                    className="p-0.5 rounded-lg hover:bg-slate-200/50 text-slate-400 hover:text-slate-600 transition-colors shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ── DESKTOP: Matrix Table (hidden on mobile) ── */}
            <div className="hidden md:block overflow-x-auto border border-slate-150 rounded-xl">
              <table className="w-full text-xs md:text-sm text-left border-collapse min-w-[640px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-xs text-slate-400 uppercase">
                    <th className="px-6 py-3.5 font-bold text-slate-600 border-r border-slate-100">Feature</th>
                    {plans.map(p => (
                      <th key={p._id} className="px-6 py-3.5 font-bold text-slate-600 text-center border-r border-slate-100">
                        {p.planName}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {features.map((f) => (
                    <tr key={f._id} className="odd:bg-[white] even:[slate-50]">
                      <td className="px-6 py-4 font-semibold text-slate-700 border-r border-slate-100">
                        {f.featureName}
                      </td>
                      {plans.map(p => {
                        const key = `${p._id}_${f._id}`;
                        const currentVal = mappings[key] || 'No';
                        return (
                          <td key={p._id} className="px-6 py-4 border-r border-slate-100 text-center">
                            <select
                              value={currentVal}
                              onChange={(e) => handleSelectChange(p._id, f._id, e.target.value)}
                              className="mx-auto block px-3 py-1.5 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-xs font-semibold bg-white cursor-pointer"
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

            {/* ── MOBILE: Per-plan cards (hidden on desktop) ── */}
            <div className="md:hidden space-y-4">
              {plans.map(p => (
                <div key={p._id} className="border border-slate-200 rounded-xl overflow-hidden">
                  {/* Plan name header */}
                  <div className="px-4 py-3 bg-indigo-50 border-b border-indigo-100">
                    <span className="text-sm font-bold text-indigo-700">{p.planName}</span>
                  </div>
                  {/* Feature rows */}
                  <div className="divide-y divide-slate-100">
                    {features.map(f => {
                      const key = `${p._id}_${f._id}`;
                      const currentVal = mappings[key] || 'No';
                      return (
                        <div key={f._id} className="flex items-center justify-between px-4 py-3 gap-3">
                          <span className="text-xs font-semibold text-slate-700 flex-1 leading-snug">
                            {f.featureName}
                          </span>
                          <select
                            value={currentVal}
                            onChange={(e) => handleSelectChange(p._id, f._id, e.target.value)}
                            className="shrink-0 px-2.5 py-1.5 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-xs font-semibold bg-white cursor-pointer"
                          >
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                            <option value="Limited">Limited</option>
                            <option value="Unlimited">Unlimited</option>
                            <option value="3 Months">3 Months</option>
                          </select>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Submit Button at Bottom Left */}
            <div className="pt-6">
              <button
                onClick={handleSave}
                disabled={saving || plans.length === 0 || features.length === 0}
                className="w-full sm:w-auto px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg shadow-md shadow-indigo-600/10 transition-colors text-sm disabled:bg-slate-300 disabled:shadow-none"
              >
                {saving ? 'Saving...' : 'Submit'}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default PlanMapping;