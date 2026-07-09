import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BASE_API_URL } from '../../../context/AuthContext';
import { 
  AlertCircle, 
  CheckCircle2,
  Loader,
  X
} from 'lucide-react';

export const PlanMapping = () => {
  const [plans, setPlans] = useState([]);
  const [features, setFeatures] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
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
        axios.get(`${BASE_API_URL}/masters/plans?category=Jobseeker`),
        axios.get(`${BASE_API_URL}/masters/features`),
        axios.get(`${BASE_API_URL}/masters/plan-mappings`)
      ]);
      
      const sortedPlans = (resP.data || []).sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
      const sortedFeatures = (resF.data || []).sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
      
      setPlans(sortedPlans);
      setFeatures(sortedFeatures);

      if (sortedPlans.length > 0) {
        setSelectedPlanId(sortedPlans[0]._id);
      }

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
      showMessage('success', 'Success! Mappings updated successfully.');
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

  const selectedPlan = plans.find(p => p._id === selectedPlanId);

  return (
    <div className="min-w-0 space-y-6">
      
      {/* Title & Breadcrumb header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">
            Plan Mapping
          </h1>
          <p className="text-sm text-slate-400 mt-1">Configure feature permissions for each subscription plan.</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 text-[0.9rem]">
          <span>Dashboard</span>
          <span>&gt;</span>
          <span className="text-indigo-600">Plan Mapping</span>
        </div>
      </div>

      {message.text && (
        <div className={`flex items-start gap-3 p-4 rounded-xl border text-sm font-semibold transition-all ${
          message.type === 'success' 
            ? 'bg-emerald-50 border-emerald-100 text-emerald-800 shadow-sm shadow-emerald-100/30' 
            : 'bg-rose-50 border-rose-100 text-rose-800 shadow-sm shadow-rose-100/30'
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
      )}

      {plans.length === 0 || features.length === 0 ? (
        <div className="p-8 border border-dashed border-slate-200 bg-white rounded-2xl text-center text-slate-500">
          Please add Plans in <strong className="text-slate-800">Plan Master</strong> and Features in <strong className="text-slate-800">Feature Master</strong> first to generate the mapping grid.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: List of Plans */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-150 p-5 shadow-sm">
              <h3 className="text-xs font-bold text-slate-400 mb-4 tracking-wide uppercase">
                Select Subscription Plan
              </h3>
              <div className="space-y-2">
                {plans.map(p => {
                  const activeCount = features.filter(f => {
                    const key = `${p._id}_${f._id}`;
                    return mappings[key] && mappings[key] !== 'No';
                  }).length;
                  const isSelected = selectedPlanId === p._id;

                  return (
                    <button
                      key={p._id}
                      onClick={() => setSelectedPlanId(p._id)}
                      className={`w-full text-left p-4 rounded-xl border transition-all flex flex-col gap-1 cursor-pointer ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-600/10'
                          : 'border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50/30'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className={`font-bold text-sm ${isSelected ? 'text-indigo-800' : 'text-slate-800'}`}>
                          {p.planName}
                        </span>
                        <span className={`text-[0.7rem] font-black px-2 py-0.5 rounded-full ${
                          isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'
                        }`}>
                          ₹{p.cost}
                        </span>
                      </div>
                      <div className="flex items-center justify-between w-full mt-2">
                        <span className="text-[0.7rem] text-slate-400 font-semibold">{p.planValidity}</span>
                        <span className="text-[0.7rem] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                          {activeCount} Features Active
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Manage Mapped Features for Selected Plan */}
          <div className="lg:col-span-8">
            {selectedPlan && (
              <div className="bg-white rounded-2xl border border-slate-150 shadow-sm overflow-hidden">
                
                {/* Panel Header */}
                <div className="p-5 border-b border-slate-150 bg-slate-50/50 flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">
                      Configure Features for: <span className="text-indigo-600">{selectedPlan.planName}</span>
                    </h3>
                    <p className="text-xs text-slate-400 font-semibold mt-0.5">Specify access level and details for each feature.</p>
                  </div>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg shadow-md shadow-indigo-600/10 transition-all text-xs cursor-pointer disabled:bg-slate-300 disabled:shadow-none"
                  >
                    {saving ? 'Saving...' : 'Save Mapping'}
                  </button>
                </div>

                {/* Features list table/grid */}
                <div className="p-6 divide-y divide-slate-100">
                  {features.map((f, index) => {
                    const key = `${selectedPlanId}_${f._id}`;
                    const currentVal = mappings[key] || 'No';

                    return (
                      <div key={f._id} className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 first:pt-0 last:pb-0">
                        <div className="max-w-md">
                          <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                            <span className="text-xs font-extrabold text-slate-300">#{index+1}</span>
                            {f.featureName}
                          </h4>
                          <p className="text-xs text-slate-400 mt-0.5">Toggle this feature's status for the {selectedPlan.planName} plan.</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <select
                            value={currentVal}
                            onChange={(e) => handleSelectChange(selectedPlanId, f._id, e.target.value)}
                            className="w-36 px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-xs font-semibold bg-white cursor-pointer hover:border-slate-300 transition-colors"
                          >
                            <option value="Yes">Yes (Enabled)</option>
                            <option value="No">No (Disabled)</option>
                            <option value="Limited">Limited</option>
                            <option value="Unlimited">Unlimited</option>
                            <option value="3 Months">3 Months</option>
                          </select>
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
};

export default PlanMapping;
