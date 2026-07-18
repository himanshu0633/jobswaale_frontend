import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { AlertCircle, CheckCircle2, MailCheck, Save, SlidersHorizontal, X } from 'lucide-react';
import { BASE_API_URL } from '../../../context/AuthContext';
import { getWithCache } from '../../../utils/apiCache';

const getTokenHeaders = () => {
  const token = localStorage.getItem('publicToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const emptySettings = {
  enabled: false,
  limit: 0,
  used: 0,
  remaining: 0,
  perJobLimit: 10,
  activeOnly: true,
  includeCurrentLocation: true,
  includePreferredLocation: true,
  includeAppliedLocation: false,
  locations: [],
  minExperience: '',
  maxExperience: ''
};

const experienceCountOptions = Array.from({ length: 11 }, (_, value) => ({
  value: String(value),
  label: value === 0 ? 'Fresher' : `${value}+ Years`
}));

const normalizeText = (value) => String(value || '').trim().toLowerCase();
const getCityValue = (city) => city?.cityName || city?.ctid || '';
const getCityLabel = (city) => city?.cityName || city?.ctid || '';

const normalizeSettings = (settings = {}) => ({
  ...emptySettings,
  ...settings,
  minExperience: settings.minExperience ?? '',
  maxExperience: settings.maxExperience ?? '',
  locations: Array.isArray(settings.locations) ? settings.locations : []
});

const SearchableMultiCitySelect = ({ label, values, onChange, options }) => {
  const [query, setQuery] = useState('');
  const selectedValues = values.map(value => normalizeText(value));
  const filtered = options
    .filter(city => getCityLabel(city).toLowerCase().includes(query.toLowerCase()))
    .filter(city => !selectedValues.includes(normalizeText(getCityValue(city))))
    .slice(0, 80);

  const addCity = (cityName) => {
    if (!cityName || selectedValues.includes(normalizeText(cityName))) return;
    onChange([...values, cityName]);
    setQuery('');
  };

  return (
    <div>
      <label className="mb-1.5 block text-sm font-bold text-slate-600">{label}</label>
      <div className="rounded-md border border-slate-200 p-3">
        <div className="flex flex-wrap items-center gap-2">
          {values.map(city => (
            <span
              key={city}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#e8e6fa] px-3 py-1 text-xs font-bold text-[#6658dd]"
            >
              {city}
              <button type="button" onClick={() => onChange(values.filter(item => item !== city))} aria-label={`Remove ${city}`}>
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          <div className="relative min-w-[180px] flex-1">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search city..."
              className="w-full border-none px-1 py-1 text-xs text-slate-700 focus:outline-none"
            />
            {query && (
              <div className="absolute left-0 right-0 top-8 z-30 max-h-56 overflow-y-auto rounded-md border border-slate-200 bg-white shadow-lg">
                {filtered.length > 0 ? filtered.map(city => (
                  <button
                    key={city.ctid || city.cityName}
                    type="button"
                    onClick={() => addCity(getCityValue(city))}
                    className="block w-full px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-[#f3f0ff]"
                  >
                    {getCityLabel(city)}
                  </button>
                )) : (
                  <div className="px-3 py-3 text-sm font-semibold text-slate-400">No cities found</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const EmployerAutoMail = () => {
  const [settings, setSettings] = useState(emptySettings);
  const [plan, setPlan] = useState(null);
  const [cities, setCities] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ type: '', text: '' });

  const usagePercent = useMemo(() => {
    const limit = Number(settings.limit || 0);
    if (!limit) return 0;
    return Math.min(Math.round((Number(settings.used || 0) / limit) * 100), 100);
  }, [settings.limit, settings.used]);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      axios.get(`${BASE_API_URL}/employer/auto-mail-settings`, { headers: getTokenHeaders() }),
      getWithCache(`${BASE_API_URL}/masters/cities`)
    ])
      .then(([response, cityRows]) => {
        if (cancelled) return;
        const nextSettings = normalizeSettings(response.data?.settings);
        setSettings(nextSettings);
        setPlan(response.data?.plan || null);
        setCities(cityRows || []);
      })
      .catch((error) => setAlert({ type: 'error', text: error.response?.data?.message || 'Auto mail settings load nahi ho paayi.' }))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const setValue = (key, value) => setSettings((current) => ({ ...current, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    setAlert({ type: '', text: '' });
    try {
      const payload = {
        ...settings,
        locations: settings.locations,
        perJobLimit: Number(settings.perJobLimit) || 0,
        minExperience: settings.minExperience === '' ? null : Number(settings.minExperience),
        maxExperience: settings.maxExperience === '' ? null : Number(settings.maxExperience)
      };
      const response = await axios.put(`${BASE_API_URL}/employer/auto-mail-settings`, payload, { headers: getTokenHeaders() });
      const nextSettings = normalizeSettings(response.data?.settings);
      setSettings(nextSettings);
      setAlert({ type: 'success', text: 'Auto mail settings saved successfully.' });
    } catch (error) {
      setAlert({ type: 'error', text: error.response?.data?.message || 'Settings save nahi ho paayi.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex min-h-[360px] items-center justify-center text-sm font-bold text-slate-400">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-extrabold text-[#3f4254] sm:text-xl">Auto Mail</h1>
          <p className="mt-1 text-sm font-semibold text-slate-400">{plan?.name || 'No Plan'} candidate mail quota</p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#6658dd] px-4 text-sm font-extrabold text-white transition hover:bg-[#5848d8] disabled:opacity-60"
        >
          <Save className="h-4 w-4" />
          {saving ? 'Saving' : 'Save Settings'}
        </button>
      </div>

      {alert.text && (
        <div className={`flex items-center gap-3 rounded-md px-4 py-3 text-sm font-bold ${alert.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
          {alert.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
          {alert.text}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-lg border border-slate-100 bg-white p-5 shadow-sm">
          <p className="text-xs font-black uppercase text-slate-400">Total Limit</p>
          <p className="mt-2 text-2xl font-black text-[#3f4254]">{settings.limit}</p>
        </div>
        <div className="rounded-lg border border-slate-100 bg-white p-5 shadow-sm">
          <p className="text-xs font-black uppercase text-slate-400">Used</p>
          <p className="mt-2 text-2xl font-black text-[#3f4254]">{settings.used}</p>
        </div>
        <div className="rounded-lg border border-slate-100 bg-white p-5 shadow-sm">
          <p className="text-xs font-black uppercase text-slate-400">Remaining</p>
          <p className="mt-2 text-2xl font-black text-[#3f4254]">{settings.remaining}</p>
        </div>
      </div>

      <div className="rounded-lg border border-slate-100 bg-white p-5 shadow-sm">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-[#e8e6fa] text-[#6658dd]">
              <MailCheck className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-base font-extrabold text-[#3f4254]">Campaign Control</h2>
              <p className="text-xs font-semibold text-slate-400">Job post hote hi category matched candidates ko mail jayegi.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setValue('enabled', !settings.enabled)}
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-600"
          >
            <span className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${settings.enabled ? 'bg-[#6658dd]' : 'bg-slate-300'}`}>
              <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${settings.enabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </span>
            Enabled
          </button>
        </div>

        <div className="mb-5">
          <div className="mb-2 flex items-center justify-between text-xs font-black text-slate-400">
            <span>Usage</span>
            <span>{usagePercent}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-[#6658dd]" style={{ width: `${usagePercent}%` }} />
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          <label className="block">
            <span className="mb-1.5 block text-sm font-bold text-slate-600">Mail Per Job</span>
            <input type="number" min="0" max={settings.remaining} value={settings.perJobLimit} onChange={(e) => setValue('perJobLimit', e.target.value)} className="w-full rounded-md border border-slate-200 px-3 py-2.5 text-sm focus:border-[#6658dd] focus:outline-none" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-bold text-slate-600">Min Experience</span>
            <select value={settings.minExperience} onChange={(e) => setValue('minExperience', e.target.value)} className="w-full rounded-md border border-slate-200 px-3 py-2.5 text-sm focus:border-[#6658dd] focus:outline-none">
              <option value="">Any</option>
              {experienceCountOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-bold text-slate-600">Max Experience</span>
            <select value={settings.maxExperience} onChange={(e) => setValue('maxExperience', e.target.value)} className="w-full rounded-md border border-slate-200 px-3 py-2.5 text-sm focus:border-[#6658dd] focus:outline-none">
              <option value="">Any</option>
              {experienceCountOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </label>
          <div className="lg:col-span-3">
            <SearchableMultiCitySelect
              label="Locations"
              values={settings.locations}
              onChange={(locations) => setValue('locations', locations)}
              options={cities}
            />
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-slate-100 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2 text-base font-extrabold text-[#3f4254]">
          <SlidersHorizontal className="h-5 w-5 text-[#6658dd]" />
          Candidate Filters
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            ['activeOnly', 'Only jobseekers looking for job'],
            ['includeCurrentLocation', 'Match current location'],
            ['includePreferredLocation', 'Match preferred location'],
            ['includeAppliedLocation', 'Match locations where candidate applied before']
          ].map(([key, label]) => (
            <label key={key} className="flex items-center gap-3 rounded-md border border-slate-100 px-4 py-3 text-sm font-bold text-slate-600">
              <input type="checkbox" checked={Boolean(settings[key])} onChange={(e) => setValue(key, e.target.checked)} className="h-4 w-4 rounded border-slate-300" />
              {label}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EmployerAutoMail;
