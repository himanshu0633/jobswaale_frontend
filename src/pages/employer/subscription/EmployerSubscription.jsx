import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Crown,
  Briefcase,
  Users,
  Clock,
  FileText,
  PlusCircle,
  Download,
  AlertCircle,
  Gem,
  CheckCircle,
  CreditCard,
  Trash2,
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
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Payment methods list modal state
  const [showAddCard, setShowAddCard] = useState(false);
  const [newCard, setNewCard] = useState({ name: '', number: '', expiry: '', brand: 'Visa' });
  const [paymentMethods, setPaymentMethods] = useState([
    { id: '1', brand: 'Visa', last4: '4242', expiry: '08/2027', isPrimary: true },
    { id: '2', brand: 'Mastercard', last4: '8888', expiry: '10/2028', isPrimary: false }
  ]);

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
    loadSubscription();
  }, []);

  const handleAddCard = (e) => {
    e.preventDefault();
    if (!newCard.name.trim() || newCard.number.length < 16) {
      alert('Please fill out card holder name and 16-digit card number.');
      return;
    }
    const last4 = newCard.number.slice(-4);
    const added = {
      id: Date.now().toString(),
      brand: newCard.brand,
      last4,
      expiry: newCard.expiry || '12/2030',
      isPrimary: false
    };
    setPaymentMethods([...paymentMethods, added]);
    setShowAddCard(false);
    setNewCard({ name: '', number: '', expiry: '', brand: 'Visa' });
    setSuccess('New payment method added successfully.');
  };

  const handleSetPrimaryCard = (id) => {
    setPaymentMethods(paymentMethods.map(pm => ({
      ...pm,
      isPrimary: pm.id === id
    })));
    setSuccess('Primary payment method updated.');
  };

  const handleDeleteCard = (id) => {
    const card = paymentMethods.find(pm => pm.id === id);
    if (card?.isPrimary) {
      alert('Cannot delete primary payment method.');
      return;
    }
    setPaymentMethods(paymentMethods.filter(pm => pm.id !== id));
    setSuccess('Payment method removed.');
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

  // Fallback plans if none in database
  const plans = data?.availablePlans && data.availablePlans.length > 0 ? data.availablePlans : [
    { _id: 'w1', planName: 'Weekly Plan', cost: 149, unlockCount: '10', freeJobPosts: 0, employerFeatures: ['Direct Contact Access', '7 Days Validity', 'Employer Dashboard'] },
    { _id: 'w2', planName: 'Weekly Plan (Pro)', cost: 249, unlockCount: '20', freeJobPosts: 2, employerFeatures: ['Direct Contact Access', '7 Days Validity', 'Employer Dashboard'] },
    { _id: 'm1', planName: 'Monthly Plan', cost: 499, unlockCount: '40', freeJobPosts: 3, employerFeatures: ['Direct Contact Access', 'Employer Dashboard', 'Priority Support'] },
    { _id: 'm2', planName: 'Monthly Plan (Best)', cost: 999, unlockCount: '80', freeJobPosts: 5, employerFeatures: ['Direct Contact Access', 'Employer Dashboard', 'Priority Support'] },
    { _id: 'q1', planName: 'Quarterly Plan', cost: 1299, unlockCount: '75', freeJobPosts: 3, employerFeatures: ['Lower Cost Per Unlock', 'Priority Support', 'Candidate Tracking', 'Detailed Insights'] },
    { _id: 'q2', planName: 'Quarterly Plan (Value)', cost: 2499, unlockCount: '150', freeJobPosts: 5, employerFeatures: ['Lower Cost Per Unlock', 'Priority Support', 'Candidate Tracking', 'Detailed Insights'] },
    { _id: 'y1', planName: 'Yearly Plan', cost: 4999, unlockCount: '250', freeJobPosts: 5, employerFeatures: ['Lowest Cost Per Unlock', 'Dedicated Account Manager', 'Recruitment Reports', 'Advanced Insights'] }
  ];

  // Fallback invoices if none in database
  const invoices = data?.billingHistory && data.billingHistory.length > 0 ? data.billingHistory : [
    { _id: 'inv1', invoiceNo: 'INV-2026-001', createDate: '2026-01-01', planName: 'Premium Plan - Monthly', paidAmount: 3539, paymentStatus: 'Success' },
    { _id: 'inv2', invoiceNo: 'INV-2026-002', createDate: '2026-05-01', planName: 'Premium Plan - Monthly', paidAmount: 3539, paymentStatus: 'Success' },
    { _id: 'inv3', invoiceNo: 'INV-2026-003', createDate: '2026-04-01', planName: 'Premium Plan - Monthly', paidAmount: 3539, paymentStatus: 'Success' }
  ];

  const primaryCard = paymentMethods.find(pm => pm.isPrimary) || { brand: 'Visa', last4: '4242' };

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
                  Active
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
              onClick={() => alert('Cancellation request submitted. Our team will verify and contact you via email.')}
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
          { title: 'Days Remaining', value: stats.daysRemaining || 188, subtitle: 'until renewal date', icon: Clock, color: 'bg-amber-50 text-amber-500' }
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
              {plans.map((p) => {
                const isCurrent = sub.planName.toLowerCase().includes(p.planName.toLowerCase()) || (p.cost === 249 && sub.planName === 'Premium Plan');
                return (
                  <tr key={p._id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="py-4.5 px-4">
                      <div className="font-extrabold text-[#3f4254]">{p.planName}</div>
                      {p.cost === 999 && <span className="inline-flex rounded bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold text-amber-800 mt-1">Most Popular</span>}
                      {p.cost === 2499 && <span className="inline-flex rounded bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold text-emerald-800 mt-1">Best Value</span>}
                    </td>
                    <td className="py-4.5 px-4 font-black text-[#6658dd]">₹{p.cost.toLocaleString('en-IN')}</td>
                    <td className="py-4.5 px-4 font-bold">{p.unlockCount} Unlocks</td>
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
                          onClick={() => alert(`Initiating payment for ${p.planName} (Amount: ₹${p.cost}).`)}
                          className="w-36 rounded-lg bg-[#6658dd] py-2 text-xs font-extrabold text-white shadow-sm hover:bg-[#5848d8] transition"
                        >
                          Upgrade Now
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
        {/* Payment Methods Card */}
        <div className="rounded-lg border border-slate-100 bg-white p-5 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-extrabold text-[#3f4254] text-sm flex items-center gap-1.5">
              <CreditCard className="h-4.5 w-4.5 text-slate-400" />
              Payment Methods
            </h4>
            <button
              onClick={() => setShowAddCard(true)}
              className="inline-flex items-center gap-1 text-xs font-extrabold text-[#6658dd] hover:underline"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              Add Card
            </button>
          </div>

          <div className="space-y-3 flex-grow pt-2">
            {paymentMethods.map(pm => (
              <div key={pm.id} className="rounded-lg p-3 bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-11 rounded border border-slate-200 bg-white flex items-center justify-center text-[10px] font-black text-slate-500">
                    {pm.brand}
                  </div>
                  <div>
                    <span className="text-xs font-extrabold text-[#3f4254] block">•••• {pm.last4}</span>
                    <span className="text-[10px] font-bold text-slate-400 block">Expires {pm.expiry}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {pm.isPrimary ? (
                    <span className="rounded bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-700">Primary</span>
                  ) : (
                    <>
                      <button
                        onClick={() => handleSetPrimaryCard(pm.id)}
                        className="rounded bg-white border border-slate-200 px-2 py-1 text-[9px] font-bold text-slate-600 hover:bg-slate-100 transition"
                      >
                        Set Primary
                      </button>
                      <button
                        onClick={() => handleDeleteCard(pm.id)}
                        className="p-1 rounded text-rose-500 hover:bg-rose-50 transition"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Next Payment Card */}
        <div className="rounded-lg border border-slate-100 bg-white p-5 shadow-sm flex flex-col justify-between space-y-4">
          <h4 className="font-extrabold text-[#3f4254] text-sm">Next Payment</h4>
          
          <div className="text-center py-3 flex-grow flex flex-col justify-center">
            <p className="text-2xl font-black text-[#3f4254]">₹2,999</p>
            <p className="text-xs font-bold text-slate-400 mt-1">Professional Plan - Monthly</p>
            <p className="text-xs font-extrabold text-slate-500 mt-2">Due on <span className="text-[#3f4254]">July 1, 2026</span></p>
          </div>

          <div className="border-t border-dashed border-slate-100 pt-3 flex items-center justify-between text-xs font-bold text-slate-400">
            <span>Billing card</span>
            <span className="text-[#3f4254] flex items-center gap-1">
              <span className="font-black text-[#6658dd]">{primaryCard.brand}</span> •••• {primaryCard.last4}
            </span>
          </div>
        </div>

        {/* Invoice Summary Card */}
        <div className="rounded-lg border border-slate-100 bg-white p-5 shadow-sm flex flex-col justify-between space-y-3">
          <h4 className="font-extrabold text-[#3f4254] text-sm">Invoice Summary</h4>

          <div className="space-y-2 text-xs font-bold text-slate-500 flex-grow pt-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="text-[#3f4254]">₹2,999.00</span>
            </div>
            <div className="flex justify-between">
              <span>GST (18%)</span>
              <span className="text-[#3f4254]">₹539.82</span>
            </div>
            <div className="flex justify-between text-emerald-600 bg-emerald-50/50 p-1.5 rounded">
              <span>Discount</span>
              <span>- ₹0.00</span>
            </div>
            <div className="flex justify-between text-sm font-black text-[#3f4254] pt-1.5 border-t border-slate-100">
              <span>Total Amount</span>
              <span className="text-[#6658dd]">₹3,538.82</span>
            </div>
          </div>

          <button
            onClick={() => alert('Downloading invoice PDF.')}
            className="w-full inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white text-xs font-extrabold text-slate-600 transition hover:bg-slate-50"
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
          <button
            onClick={() => alert('Initiated batch download for all invoices.')}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 text-xs font-extrabold text-slate-600 hover:bg-slate-50 transition"
          >
            <Download className="h-4 w-4" />
            Download All
          </button>
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
              {invoices.map((inv) => (
                <tr key={inv._id} className="hover:bg-slate-50/40 transition-colors">
                  <td className="py-3.5 px-4 text-[#6658dd] font-extrabold">{inv.invoiceNo || 'INV-2026-000'}</td>
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
                      onClick={() => alert(`Downloading PDF for invoice: ${inv.invoiceNo}`)}
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

      {/* ADD CARD MODAL */}
      {showAddCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h3 className="font-black text-lg text-[#3f4254]">Add Payment Card</h3>
              <button onClick={() => setShowAddCard(false)} className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAddCard} className="p-6 space-y-4 text-xs font-bold text-slate-500">
              <div>
                <label className="block text-xs font-black text-slate-500 mb-1">Card Holder Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nitika Sharma"
                  className="w-full rounded border border-slate-200 px-3 py-2 text-sm text-[#3f4254] focus:border-[#6658dd] outline-none"
                  value={newCard.name}
                  onChange={e => setNewCard({ ...newCard, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-500 mb-1">Card Number *</label>
                <input
                  type="text"
                  required
                  maxLength="16"
                  placeholder="16-digit card number"
                  className="w-full rounded border border-slate-200 px-3 py-2 text-sm text-[#3f4254] focus:border-[#6658dd] outline-none"
                  value={newCard.number}
                  onChange={e => setNewCard({ ...newCard, number: e.target.value.replace(/\D/g, '') })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-500 mb-1">Expiry Date *</label>
                  <input
                    type="text"
                    required
                    placeholder="MM/YYYY"
                    className="w-full rounded border border-slate-200 px-3 py-2 text-sm text-[#3f4254] focus:border-[#6658dd] outline-none"
                    value={newCard.expiry}
                    onChange={e => setNewCard({ ...newCard, expiry: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 mb-1">Card Brand</label>
                  <select
                    className="w-full rounded border border-slate-200 px-3 py-2 text-sm text-[#3f4254] bg-white focus:border-[#6658dd] outline-none"
                    value={newCard.brand}
                    onChange={e => setNewCard({ ...newCard, brand: e.target.value })}
                  >
                    <option value="Visa">Visa</option>
                    <option value="Mastercard">Mastercard</option>
                    <option value="Amex">Amex</option>
                    <option value="Rupay">Rupay</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddCard(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-extrabold text-slate-600 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#6658dd] px-4 py-2.5 text-sm font-extrabold text-white shadow-sm transition hover:bg-[#5848d8] flex items-center gap-1.5"
                >
                  <CheckCircle className="h-4.5 w-4.5" />
                  Save Payment Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployerSubscription;
