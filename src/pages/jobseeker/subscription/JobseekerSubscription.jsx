import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  ArrowUpCircle,
  CheckCircle2,
  Check,
  Gem,
  MessageSquareText,
  Minus,
  Receipt,
  TrendingUp,
  X,
  Zap
} from 'lucide-react';
import { BASE_API_URL } from '../../../context/AuthContext';

const benefits = [
  {
    icon: Zap,
    title: 'Priority Access',
    text: 'Get your profile seen by top recruiters faster with priority listing in search results.'
  },
  {
    icon: MessageSquareText,
    title: 'More Interviews',
    text: 'Unlock multiple interview opportunities with dedicated placement support.'
  },
  {
    icon: TrendingUp,
    title: 'Career Growth',
    text: 'Access training, certifications, and job assurance support to accelerate your career.'
  }
];

const featureIcon = {
  check: { Icon: Check, tone: 'text-[#10b981]' },
  minus: { Icon: Minus, tone: 'text-[#10b981] opacity-40' },
  cross: { Icon: X, tone: 'text-[#ef4444] opacity-40' }
};

export const JobseekerSubscription = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activePlan, setActivePlan] = useState({
    name: 'Free Plan',
    price: '₹0',
    period: 'lifetime',
    validity: 'Valid for lifetime · No expiry'
  });
  const [plans, setPlans] = useState([]);
  const [billingHistory, setBillingHistory] = useState([]);
  const [pendingPlan, setPendingPlan] = useState(null);

  const fetchSubscriptionDetails = async () => {
    try {
      const token = localStorage.getItem('publicToken');
      const res = await axios.get(`${BASE_API_URL}/jobseeker/subscription`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      
      const data = res.data || {};
      if (data.activePlan) setActivePlan(data.activePlan);
      if (data.plans) setPlans(data.plans);
      if (data.billingHistory) setBillingHistory(data.billingHistory);
    } catch (err) {
      console.error('Fetch subscription error:', err);
      setError('Failed to load subscription details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptionDetails();
  }, []);

  const requestUpgrade = (plan) => {
    setPendingPlan(plan);
  };

  const confirmUpgrade = async () => {
    if (!pendingPlan) return;
    setError('');
    try {
      const token = localStorage.getItem('publicToken');
      await axios.post(`${BASE_API_URL}/jobseeker/subscription/select-plan`, {
        planId: pendingPlan.id
      }, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setPendingPlan(null);
      setLoading(true);
      await fetchSubscriptionDetails();
    } catch (err) {
      console.error('Upgrade plan error:', err);
      setError(err.response?.data?.message || 'Upgrade request failed. Please try again.');
      setPendingPlan(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <div className="h-9 w-9 animate-spin rounded-full border-4 border-[#0047C7] border-t-transparent"/>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="mb-4 rounded-md border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
          {error}
        </div>
      )}

      {/* Current Plan Hero */}
      <div className="mb-8 flex flex-col items-center justify-between gap-6 rounded-xl bg-gradient-to-br from-[#001c3d] to-[#003366] p-8 text-center text-white md:flex-row md:text-left">
        <div className="flex flex-col items-center gap-6 text-center md:flex-row md:text-left">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white/15">
            <Gem className="h-7 w-7" />
          </div>
          <div>
            <div className="mb-[0.15rem] text-[1.4rem] font-bold">{activePlan.name}</div>
            <div className="mb-1 flex items-center justify-center gap-1 text-[0.85rem] opacity-80 md:justify-start">
              <CheckCircle2 className="h-4 w-4 text-[#10b981]" /> Active
            </div>
            <div className="text-[0.78rem] opacity-60">
              {activePlan.validity}
            </div>
          </div>
        </div>

        <div className="text-center md:text-right">
          <div className="text-[2rem] font-extrabold">
            {activePlan.price} <small className="text-[0.85rem] font-normal opacity-70">/ {activePlan.period}</small>
          </div>
          <div className="mt-2">
            <a
              href="#plansSection"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#ffc107] px-6 py-1 text-sm font-bold text-[#212529] transition hover:bg-[#ffca2c]"
            >
              <ArrowUpCircle className="h-4 w-4" /> Upgrade Now
            </a>
          </div>
        </div>
      </div>

      {/* Why Upgrade */}
      <div className="mb-5 flex items-center justify-between">
        <h4 className="text-[1.1rem] font-bold text-[#0f172a]">
          Why Upgrade Your Plan?
        </h4>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {benefits.map(item => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className="rounded-xl border border-[#e2e8f0] bg-white p-6 text-center"
            >
              <Icon className="mx-auto mb-3 h-8 w-8 text-[#0047C7]" />
              <h6 className="mb-1.5 text-[0.95rem] font-semibold text-[#0f172a]">
                {item.title}
              </h6>
              <p className="text-[0.82rem] text-[#94a3b8]">
                {item.text}
              </p>
            </div>
          );
        })}
      </div>

      {/* Plans Comparison */}
      <div id="plansSection" className="mb-5 flex items-center justify-between">
        <h4 className="text-[1.1rem] font-bold text-[#0f172a]">
          Compare Plans & Choose What Fits You
        </h4>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        {plans.map(plan => (
          <div
            key={plan.id}
            className={`relative flex flex-col rounded-xl border bg-white p-7 text-center transition-all hover:-translate-y-[3px] hover:shadow-[0_8px_25px_rgba(0,0,0,0.06)] ${
              plan.popular
                ? 'border-[#FF6B00] shadow-[0_0_0_1px_#FF6B00,0_8px_25px_rgba(255,107,0,0.1)]'
                : plan.current
                ? 'border-[#0047C7] bg-[#f8faff]'
                : 'border-[#e2e8f0]'
            }`}
          >
            {plan.popular && (
              <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#FF6B00] px-4 py-1 text-[0.7rem] font-bold text-white">
                Most Popular
              </span>
            )}

            {plan.current && (
              <span className="absolute right-3 top-3 rounded-full bg-[#0047C7] px-[0.6rem] py-[0.2rem] text-[0.6rem] font-bold text-white">
                Current Plan
              </span>
            )}

            <div className="mb-4 text-[1.1rem] font-bold uppercase text-[#0f172a]">
              {plan.name}
            </div>

            <div className="mb-1 text-[2.2rem] font-extrabold text-[#0f172a]">
              {plan.price} <small className="text-[0.85rem] font-medium text-[#94a3b8]">{plan.period}</small>
            </div>

            <div className="mb-5 text-[0.82rem] text-[#94a3b8]">
              {plan.desc}
            </div>

            <ul className="mb-6 flex-1 text-left">
              {plan.features.map(feature => {
                const { Icon, tone } = featureIcon[feature.state] || { Icon: Check, tone: 'text-[#10b981]' };
                return (
                  <li
                    key={feature.text}
                    className="flex items-center gap-2 border-b border-[#e2e8f0] py-[0.45rem] text-[0.82rem] text-[#475569] last:border-b-0"
                  >
                    <span className={`flex w-[18px] shrink-0 items-center justify-center ${tone}`}>
                      <Icon className="h-4 w-4" />
                    </span>
                    {feature.text}
                  </li>
                );
              })}
            </ul>

            {plan.current ? (
              <button
                type="button"
                disabled
                className="w-full cursor-default rounded-[10px] border-[1.5px] border-[#e2e8f0] bg-[#f8fafc] px-4 py-[0.6rem] text-[0.88rem] font-semibold text-[#94a3b8]"
              >
                <CheckCircle2 className="mr-1 inline h-4 w-4 -translate-y-px" /> Current Plan
              </button>
            ) : (
              <button
                type="button"
                onClick={() => requestUpgrade(plan)}
                className={`w-full rounded-[10px] border-[1.5px] px-4 py-[0.6rem] text-[0.88rem] font-semibold transition-all ${
                  plan.popular
                    ? 'border-[#0047C7] bg-[#0047C7] text-white hover:bg-[#0039a3]'
                    : 'border-[#e2e8f0] bg-white text-[#0f172a] hover:border-[#0047C7] hover:text-[#0047C7]'
                }`}
              >
                <ArrowUpCircle className="mr-1 inline h-4 w-4 -translate-y-px" /> Upgrade
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Billing History */}
      <div className="mb-5 rounded-xl border border-[#e2e8f0] bg-white p-6">
        <h5 className="mb-5 flex items-center border-b border-[#e2e8f0] pb-3 text-base font-bold text-[#0f172a]">
          <Receipt className="mr-2 h-[1.05rem] w-[1.05rem] text-[#0047C7]" /> Billing History
        </h5>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr>
                <th className="border-b border-[#e2e8f0] px-4 py-3 text-[0.75rem] font-bold uppercase tracking-[0.5px] text-[#94a3b8]">Date</th>
                <th className="border-b border-[#e2e8f0] px-4 py-3 text-[0.75rem] font-bold uppercase tracking-[0.5px] text-[#94a3b8]">Plan</th>
                <th className="border-b border-[#e2e8f0] px-4 py-3 text-[0.75rem] font-bold uppercase tracking-[0.5px] text-[#94a3b8]">Amount</th>
                <th className="border-b border-[#e2e8f0] px-4 py-3 text-[0.75rem] font-bold uppercase tracking-[0.5px] text-[#94a3b8]">Payment Method</th>
                <th className="border-b border-[#e2e8f0] px-4 py-3 text-[0.75rem] font-bold uppercase tracking-[0.5px] text-[#94a3b8]">Status</th>
                <th className="border-b border-[#e2e8f0] px-4 py-3 text-[0.75rem] font-bold uppercase tracking-[0.5px] text-[#94a3b8]">Invoice</th>
              </tr>
            </thead>
            <tbody>
              {billingHistory.map((row, index) => (
                <tr key={index} className="hover:bg-[#f8fafc]">
                  <td className={`px-4 py-[0.85rem] text-[0.85rem] text-[#475569] ${index === billingHistory.length - 1 ? '' : 'border-b border-[#e2e8f0]'}`}>{row.date}</td>
                  <td className={`px-4 py-[0.85rem] text-[0.85rem] text-[#475569] ${index === billingHistory.length - 1 ? '' : 'border-b border-[#e2e8f0]'}`}>{row.plan}</td>
                  <td className={`px-4 py-[0.85rem] text-[0.85rem] text-[#475569] ${index === billingHistory.length - 1 ? '' : 'border-b border-[#e2e8f0]'}`}>{row.amount}</td>
                  <td className={`px-4 py-[0.85rem] text-[0.85rem] text-[#475569] ${index === billingHistory.length - 1 ? '' : 'border-b border-[#e2e8f0]'}`}>{row.method}</td>
                  <td className={`px-4 py-[0.85rem] text-[0.85rem] text-[#475569] ${index === billingHistory.length - 1 ? '' : 'border-b border-[#e2e8f0]'}`}>
                    <span className="rounded-full bg-[#d1fae5] px-[0.6rem] py-[0.2rem] text-[0.7rem] font-semibold text-[#065f46]">
                      {row.status}
                    </span>
                  </td>
                  <td className={`px-4 py-[0.85rem] text-[0.85rem] text-[#475569] ${index === billingHistory.length - 1 ? '' : 'border-b border-[#e2e8f0]'}`}>
                    <span className="text-[0.85rem] text-slate-400">
                      {row.invoiceNo}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upgrade Confirmation Modal */}
      {pendingPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
            <h5 className="text-lg font-bold text-[#0f172a]">
              Upgrade to {pendingPlan.name}?
            </h5>
            <p className="mt-2 text-sm font-semibold text-[#94a3b8]">
              Confirm upgrade to {pendingPlan.name} for {pendingPlan.price} ({pendingPlan.period}).
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setPendingPlan(null)}
                className="rounded-md border border-[#e2e8f0] px-4 py-2 text-sm font-bold text-[#94a3b8] transition-colors hover:bg-[#f8fafc]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmUpgrade}
                className="rounded-md bg-[#0047C7] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[#0039a3]"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobseekerSubscription;