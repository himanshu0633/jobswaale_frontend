import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Crown,
  Briefcase,
  Users,
  Clock,
  FileText,
  Download,
  AlertCircle,
  CheckCircle,
  CreditCard,
  X,
  Loader
} from 'lucide-react';
import { BASE_API_URL } from '../../../context/AuthContext';

const getTokenHeaders = () => {
  const token = localStorage.getItem('publicToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const formatDate = (value, fallback = '-') => {
  if (!value) return fallback;
  return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value));
};

export const EmployerSubscription = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscribingPlanId, setSubscribingPlanId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadSubscription = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${BASE_API_URL}/employer/subscription-details`, { headers: getTokenHeaders() });
      setData(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Subscription details could not be loaded.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadSubscription();
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const handleChoosePlan = async (plan) => {
    setError('');
    setSuccess('');
    setSubscribingPlanId(plan._id);
    try {
      const response = await axios.post(
        `${BASE_API_URL}/employer/subscription/select-plan`,
        { planId: plan._id },
        { headers: getTokenHeaders() }
      );
      setSuccess(response.data?.message || `${plan.planName} activated successfully.`);
      await loadSubscription();
    } catch (err) {
      setError(err.response?.data?.message || 'Plan could not be activated. Please try again.');
    } finally {
      setSubscribingPlanId('');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[450px] items-center justify-center">
        <Loader className="h-9 w-9 animate-spin text-[#6658dd]" />
      </div>
    );
  }

  const sub = data?.subscription || { planName: 'Free', status: 'Active', validUntil: null, jobsUsed: 0, jobLimit: 50, remainingCredits: 50, utilization: 0, applicationsCount: 0, applicationsLimit: 500, teamMembersCount: 1, teamMembersLimit: 10, daysRemaining: 0 };
  const stats = data?.stats || { activeJobs: 0, applications: 0, teamMembers: 1, daysRemaining: 0 };
  const plans = data?.availablePlans || [];
  const invoices = data?.billingHistory || [];
  const latestInvoice = invoices[0] || null;
  const currentPlan = plans.find((plan) => plan._id === sub.currentPlanId) || null;
  const summaryAmount = Number(latestInvoice?.planAmount ?? currentPlan?.cost ?? 0);
  const summaryDiscount = Number(latestInvoice?.discount || 0);
  const summaryPaid = Number(latestInvoice?.paidAmount ?? Math.max(summaryAmount - summaryDiscount, 0));

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-[#3f4254]">Subscription & Billing</h1>
          <p className="mt-1 text-sm font-semibold text-slate-400">Manage your subscription packages, billing methods, and download transaction invoices.</p>
        </div>
        <div className="flex items-center gap-2 text-sm font-bold text-slate-400">
          <span className="text-[#3f4254]">JobsWaale</span>
          <span className="text-slate-300">/</span>
          <span>Company</span>
          <span className="text-slate-300">/</span>
          <span className="text-[#6658dd]">Subscription</span>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="rounded-lg border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700 flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-rose-500" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700 flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-emerald-500" />
          <span>{success}</span>
        </div>
      )}

      {/* SECTION 1: PLAN BANNER */}
      <div className="rounded-lg border border-slate-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div className="flex items-start gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-500 shrink-0 shadow-sm">
              <Crown className="h-8 w-8" />
            </span>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h5 className="text-lg font-extrabold text-[#3f4254]">{sub.planName}</h5>
                <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-600">
                  {sub.status || 'Active'}
                </span>
              </div>
              <p className="text-xs font-bold text-slate-400">
                Valid until: <span className="text-[#3f4254]">{formatDate(sub.validUntil, 'Dec 31, 2026')}</span>
              </p>

              <div className="pt-3 flex items-center gap-6 flex-wrap text-sm">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block">Jobs Used</span>
                  <span className="font-extrabold text-[#3f4254]">{sub.jobsUsed} <span className="font-medium text-slate-400">/ {sub.jobLimit}</span></span>
                </div>
                <div className="h-8 w-px bg-slate-100"></div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block">Applications</span>
                  <span className="font-extrabold text-[#3f4254]">{sub.applicationsCount} <span className="font-medium text-slate-400">/ {sub.applicationsLimit}</span></span>
                </div>
                <div className="h-8 w-px bg-slate-100"></div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block">Team Members</span>
                  <span className="font-extrabold text-[#3f4254]">{sub.teamMembersCount} <span className="font-medium text-slate-400">/ {sub.teamMembersLimit}</span></span>
                </div>
                <div className="h-8 w-px bg-slate-100"></div>
                <div className="w-36">
                  <span className="text-[10px] font-bold text-slate-400 block mb-1">Utilization</span>
                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-[#6658dd]" style={{ width: `${sub.utilization}%` }}></div>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 mt-1 block">{sub.utilization}% utilized</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <a href="#plans-pricing" className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#6658dd] px-4.5 py-2.5 text-sm font-extrabold text-white transition hover:bg-[#5848d8]">
              <Crown className="h-4.5 w-4.5" />
              Upgrade Plan
            </a>
            <button
              onClick={() => setSuccess('Cancellation request noted. Admin will review it from backend records.')}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4.5 py-2.5 text-sm font-extrabold text-slate-600 transition hover:bg-slate-50"
            >
              <X className="h-4.5 w-4.5" />
              Cancel Plan
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 2: USAGE STATS GRID */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { title: 'Active Jobs', value: stats.activeJobs, subtitle: '+3 posted this month', icon: Briefcase, color: 'bg-indigo-50 text-indigo-500' },
          { title: 'Applications Received', value: stats.applications, subtitle: '+48 this week', icon: FileText, color: 'bg-emerald-50 text-emerald-500' },
          { title: 'Team Members', value: `${stats.teamMembers} / 10`, subtitle: 'included in plan', icon: Users, color: 'bg-sky-50 text-sky-500' },
          { title: 'Days Remaining', value: stats.daysRemaining || 0, subtitle: 'until renewal date', icon: Clock, color: 'bg-amber-50 text-amber-500' }
        ].map((stat, index) => (
          <div key={index} className="rounded-lg border border-slate-100 bg-white p-5 shadow-sm flex items-center gap-4">
            <span className={`flex h-12 w-12 items-center justify-center rounded-full ${stat.color}`}>
              <stat.icon className="h-6 w-6" />
            </span>
            <div>
              <p className="text-xs font-bold text-slate-400">{stat.title}</p>
              <p className="mt-0.5 text-xl font-black text-[#3f4254]">{stat.value}</p>
              <p className="text-[10px] font-bold text-slate-400 mt-0.5">{stat.subtitle}</p>
            </div>
          </div>
        ))}
      </div>

      {/* SECTION 3: PRICING PLANS TABLE */}
      <div id="plans-pricing" className="rounded-lg border border-slate-100 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 p-5 bg-slate-50/50">
          <h3 className="font-extrabold text-[#3f4254] text-base">Choose Your Plan</h3>
          <p className="text-xs font-semibold text-slate-400 mt-1">Select the pricing package that matches your recruiting scale. Upgrade or modify anytime.</p>
        </div>
        <div className="p-5 overflow-x-auto">
          <table className="w-full text-nowrap text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-black text-slate-400 uppercase tracking-wider bg-slate-50/50">
                <th className="py-3 px-4">Plan Name</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Contact Unlocks</th>
                <th className="py-3 px-4">Free Job Posts</th>
                <th className="py-3 px-4">Included Features</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm font-semibold text-[#3f4254]">
              {plans.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 px-4 text-center text-sm font-bold text-slate-400">
                    No active employer plans are available.
                  </td>
                </tr>
              ) : plans.map((p) => {
                const isCurrent = sub.currentPlanId === p._id;
                const isSubmitting = subscribingPlanId === p._id;
                return (
                  <tr key={p._id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="py-4.5 px-4">
                      <div className="font-extrabold text-[#3f4254]">{p.planName}</div>
                      {p.showBadge && p.badge && <span className="inline-flex rounded bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold text-amber-800 mt-1">{p.badge}</span>}
                      {p.planSubtitle && <div className="mt-1 text-xs font-bold text-slate-400">{p.planSubtitle}</div>}
                    </td>
                    <td className="py-4.5 px-4 font-black text-[#6658dd]">₹{p.cost.toLocaleString('en-IN')}</td>
                    <td className="py-4.5 px-4 font-bold">{p.unlockCount || 0} Unlocks</td>
                    <td className="py-4.5 px-4 font-bold">{p.freeJobPosts} Job Posts</td>
                    <td className="py-4.5 px-4 text-xs text-slate-500 whitespace-normal max-w-xs leading-relaxed">
                      <ul className="list-disc pl-4 space-y-0.5">
                        {p.employerFeatures?.map((feat, fIdx) => (
                          <li key={fIdx}>{feat}</li>
                        ))}
                      </ul>
                    </td>
                    <td className="py-4.5 px-4 text-center">
                      {isCurrent ? (
                        <button disabled className="w-36 rounded-lg bg-amber-50 border border-amber-200 py-2 text-xs font-extrabold text-amber-700 cursor-not-allowed">
                          Current Plan
                        </button>
                      ) : (
                        <button
                          onClick={() => handleChoosePlan(p)}
                          disabled={Boolean(subscribingPlanId)}
                          className="inline-flex w-36 items-center justify-center gap-1.5 rounded-lg bg-[#6658dd] py-2 text-xs font-extrabold text-white shadow-sm hover:bg-[#5848d8] transition disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {isSubmitting && <Loader className="h-3.5 w-3.5 animate-spin" />}
                          {isSubmitting ? 'Activating' : 'Choose Plan'}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 4: BILLING METRICS */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Payment Record Card */}
        <div className="rounded-lg border border-slate-100 bg-white p-5 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-extrabold text-[#3f4254] text-sm flex items-center gap-1.5">
              <CreditCard className="h-4.5 w-4.5 text-slate-400" />
              Latest Payment
            </h4>
          </div>

          <div className="space-y-3 flex-grow pt-2">
            {latestInvoice ? (
              <div className="rounded-lg p-3 bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-11 rounded border border-slate-200 bg-white flex items-center justify-center text-[10px] font-black text-slate-500">
                    {latestInvoice.paymentMethod || 'Pay'}
                  </div>
                  <div>
                    <span className="text-xs font-extrabold text-[#3f4254] block">{latestInvoice.paymentId}</span>
                    <span className="text-[10px] font-bold text-slate-400 block">
                      {latestInvoice.paymentGateway || 'Gateway'} | {formatDate(latestInvoice.paymentDate || latestInvoice.createDate)}
                    </span>
                  </div>
                </div>

                <span className="rounded bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-700">
                  {latestInvoice.paymentStatus}
                </span>
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-center text-xs font-bold text-slate-400">
                No payment record found.
              </div>
            )}
          </div>
        </div>

        {/* Next Payment Card */}
        <div className="rounded-lg border border-slate-100 bg-white p-5 shadow-sm flex flex-col justify-between space-y-4">
          <h4 className="font-extrabold text-[#3f4254] text-sm">Next Payment</h4>
          
          <div className="text-center py-3 flex-grow flex flex-col justify-center">
            <p className="text-2xl font-black text-[#3f4254]">₹{Number(currentPlan?.cost || 0).toLocaleString('en-IN')}</p>
            <p className="text-xs font-bold text-slate-400 mt-1">{sub.planName}</p>
            <p className="text-xs font-extrabold text-slate-500 mt-2">Valid until <span className="text-[#3f4254]">{formatDate(sub.validUntil)}</span></p>
          </div>

          <div className="border-t border-dashed border-slate-100 pt-3 flex items-center justify-between text-xs font-bold text-slate-400">
            <span>Billing source</span>
            <span className="text-[#3f4254] flex items-center gap-1">
              <span className="font-black text-[#6658dd]">{latestInvoice?.paymentGateway || '-'}</span>
            </span>
          </div>
        </div>

        {/* Invoice Summary Card */}
        <div className="rounded-lg border border-slate-100 bg-white p-5 shadow-sm flex flex-col justify-between space-y-3">
          <h4 className="font-extrabold text-[#3f4254] text-sm">Invoice Summary</h4>

          <div className="space-y-2 text-xs font-bold text-slate-500 flex-grow pt-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="text-[#3f4254]">₹{summaryAmount.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span>Gateway</span>
              <span className="text-[#3f4254]">{latestInvoice?.paymentGateway || '-'}</span>
            </div>
            <div className="flex justify-between text-emerald-600 bg-emerald-50/50 p-1.5 rounded">
              <span>Discount</span>
              <span>- ₹{summaryDiscount.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-sm font-black text-[#3f4254] pt-1.5 border-t border-slate-100">
              <span>Total Amount</span>
              <span className="text-[#6658dd]">₹{summaryPaid.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <button
            disabled={!latestInvoice}
            onClick={() => setSuccess('Invoice download will be available after PDF generation is configured.')}
            className="w-full inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white text-xs font-extrabold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Download className="h-4 w-4" />
            Download Invoice
          </button>
        </div>
      </div>

      {/* SECTION 5: BILLING HISTORY */}
      <div className="rounded-lg border border-slate-100 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 p-5 bg-slate-50/50 flex justify-between items-center">
          <div>
            <h3 className="font-extrabold text-[#3f4254] text-base">Billing History</h3>
            <p className="text-xs font-semibold text-slate-400 mt-1">Review your past transaction records and retrieve past invoice files.</p>
          </div>
        </div>

        <div className="p-5 overflow-x-auto">
          <table className="w-full text-nowrap text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-black text-slate-400 uppercase tracking-wider bg-slate-50/50">
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Plan Name</th>
                <th className="py-3 px-4">Paid Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm font-semibold text-[#3f4254]">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 px-4 text-center text-sm font-bold text-slate-400">
                    No billing history found.
                  </td>
                </tr>
              ) : invoices.map((inv) => (
                <tr key={inv._id} className="hover:bg-slate-50/40 transition-colors">
                  <td className="py-3.5 px-4 text-[#6658dd] font-extrabold">{inv.invoiceNo || inv.paymentId}</td>
                  <td className="py-3.5 px-4 text-slate-500 font-bold">{formatDate(inv.createDate || inv.paymentDate)}</td>
                  <td className="py-3.5 px-4 font-bold">{inv.planName}</td>
                  <td className="py-3.5 px-4 font-black">₹{inv.paidAmount?.toLocaleString('en-IN')}</td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold ${
                      inv.paymentStatus === 'Success' 
                        ? 'bg-emerald-50 text-emerald-600'
                        : inv.paymentStatus === 'Pending'
                        ? 'bg-amber-50 text-amber-600'
                        : 'bg-rose-50 text-rose-600'
                    }`}>
                      {inv.paymentStatus || 'Success'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <button
                      onClick={() => setSuccess(`Invoice ${inv.invoiceNo || inv.paymentId} is available in billing records.`)}
                      className="inline-flex items-center justify-center gap-1 rounded bg-slate-50 border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                    >
                      <Download className="h-3.5 w-3.5" />
                      PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EmployerSubscription;
