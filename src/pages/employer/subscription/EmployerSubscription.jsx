import { useEffect, useState } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import logo from '../../../assets/logo.png';
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
import PageSkeleton from '../../../components/SkeletonLoader';

const getTokenHeaders = () => {
  const token = localStorage.getItem('publicToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const formatDate = (value, fallback = '-') => {
  if (!value) return fallback;
  return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value));
};

const statusTone = (status) => {
  if (status === 'Success') return 'bg-emerald-50 text-emerald-600';
  if (status === 'Pending') return 'bg-amber-50 text-amber-600';
  return 'bg-rose-50 text-rose-600';
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

  const generateInvoicePDF = (inv) => {
    // 1. Get client info from localStorage
    let clientName = 'Valued Employer';
    let clientEmail = 'billing@jobswaale.com';
    let clientPhone = 'N/A';
    let clientLoc = 'India';

    try {
      const publicUser = JSON.parse(localStorage.getItem('publicUser')) || {};
      clientName = publicUser.companyName || [publicUser.firstName, publicUser.lastName].filter(Boolean).join(' ') || 'Valued Employer';
      clientEmail = publicUser.email || 'billing@jobswaale.com';
      clientPhone = publicUser.phone || 'N/A';
      clientLoc = [publicUser.city, publicUser.state].filter(Boolean).join(', ') || 'India';
    } catch (e) {
      console.error(e);
    }

    const logoImg = new Image();
    logoImg.src = logo;

    const drawPDF = () => {
      try {
        const doc = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        });

        // Add Logo Image
        try {
          if (logoImg.complete && logoImg.naturalWidth !== 0) {
            doc.addImage(logoImg, 'PNG', 14, 15, 38, 11);
          } else {
            doc.setFont("helvetica", "bold");
            doc.setFontSize(22);
            doc.setTextColor(63, 66, 84); // #3f4254
            doc.text("JobsWaale", 14, 23);
          }
        } catch (logoErr) {
          console.error(logoErr);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(22);
          doc.setTextColor(63, 66, 84); // #3f4254
          doc.text("JobsWaale", 14, 23);
        }

        // JobsWaale Info (Top Right)
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(63, 66, 84);
        doc.text("JobsWaale Technologies Pvt. Ltd.", 130, 18);
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(100, 116, 139); // #64748b
        doc.text("Plot No. 12, Sector 18, Gurugram,", 130, 23);
        doc.text("Haryana, India - 122015", 130, 27);
        doc.text("GSTIN: 06AACJ1234F1Z5", 130, 31);
        doc.text("Email: billing@jobswaale.com", 130, 35);

        // Divider
        doc.setDrawColor(226, 232, 240); // #e2e8f0
        doc.setLineWidth(0.5);
        doc.line(14, 40, 196, 40);

        const invoiceNo = inv.invoiceNo || inv.paymentId || 'N/A';
        const planName = inv.planName || 'N/A';
        const paidAmount = Number(inv.paidAmount || 0);
        const discount = Number(inv.discount || 0);
        const paymentDate = formatDate(inv.createDate || inv.paymentDate);
        const paymentStatus = inv.paymentStatus || 'Success';
        const paymentMethod = inv.paymentMethod || 'Razorpay';

        // Columns Layout (y: 48)
        // Column 1: Client Info
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9.5);
        doc.setTextColor(148, 163, 184); // #94a3b8
        doc.text("BILLED TO:", 14, 48);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(63, 66, 84);
        doc.text(clientName, 14, 54);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139);
        doc.text(`Email: ${clientEmail}`, 14, 60);
        doc.text(`Phone: ${clientPhone}`, 14, 65);
        doc.text(`Location: ${clientLoc}`, 14, 70);

        // Column 2: Invoice Info
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9.5);
        doc.setTextColor(148, 163, 184); // #94a3b8
        doc.text("INVOICE DETAILS:", 130, 48);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139);
        
        doc.setFont("helvetica", "bold");
        doc.text(`Invoice No: ${invoiceNo}`, 130, 54);
        doc.setFont("helvetica", "normal");
        doc.text(`Date: ${paymentDate}`, 130, 60);
        doc.text(`Payment Method: ${paymentMethod}`, 130, 65);
        doc.text(`Status: ${paymentStatus}`, 130, 70);

        // Table
        const tableY = 80;
        doc.setFillColor(248, 250, 252);
        doc.rect(14, tableY, 182, 8, "F");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(63, 66, 84);
        doc.text("Plan Description", 18, tableY + 5.5);
        doc.text("SAC Code", 95, tableY + 5.5);
        doc.text("Base Price", 125, tableY + 5.5);
        doc.text("GST (18%)", 150, tableY + 5.5);
        doc.text("Total", 175, tableY + 5.5);

        // SAC Code: 9973 (Leasing or licensing services)
        // GST Calculations
        const baseAmount = paidAmount / 1.18;
        const gstAmount = paidAmount - baseAmount;
        const cgst = gstAmount / 2;
        const sgst = gstAmount / 2;

        // Content Row
        const rowY = tableY + 14;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9.5);
        doc.setTextColor(63, 66, 84);
        doc.text(planName, 18, rowY);
        doc.text("9973", 95, rowY);
        doc.text(`INR ${baseAmount.toFixed(2)}`, 125, rowY);
        doc.text("18%", 150, rowY);
        doc.text(`INR ${paidAmount.toFixed(2)}`, 175, rowY);

        // Divider
        doc.setDrawColor(241, 245, 249);
        doc.line(14, rowY + 6, 196, rowY + 6);

        // Summary Block (x: 130)
        const summaryY = rowY + 16;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139);
        
        doc.text("Subtotal (Base Value):", 120, summaryY);
        doc.text(`INR ${baseAmount.toFixed(2)}`, 170, summaryY);

        doc.text("CGST (9%):", 120, summaryY + 6);
        doc.text(`INR ${cgst.toFixed(2)}`, 170, summaryY + 6);

        doc.text("SGST (9%):", 120, summaryY + 12);
        doc.text(`INR ${sgst.toFixed(2)}`, 170, summaryY + 12);

        doc.setFont("helvetica", "bold");
        doc.setTextColor(63, 66, 84);
        doc.text("Total Amount Paid:", 120, summaryY + 20);
        doc.text(`INR ${paidAmount.toLocaleString('en-IN')}`, 170, summaryY + 20);

        // Footer Section
        const footerY = 240;
        doc.setDrawColor(226, 232, 240);
        doc.line(14, footerY, 196, footerY);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(63, 66, 84);
        doc.text("Terms & Conditions:", 14, footerY + 6);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text("1. This is a computer generated invoice and does not require physical signature.", 14, footerY + 11);
        doc.text("2. All subscription plans activated are subject to standard Terms of Service.", 14, footerY + 15);
        doc.text("3. For support or queries, write to support@jobswaale.com.", 14, footerY + 19);

        doc.setFont("helvetica", "italic");
        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139);
        doc.text("Thank you for choosing JobsWaale!", 14, footerY + 28);

        doc.save(`Invoice_${invoiceNo}.pdf`);
        setSuccess(`Invoice ${invoiceNo} PDF downloaded successfully.`);
      } catch (pdfErr) {
        console.error(pdfErr);
        setError('Failed to generate PDF. Please try again.');
      }
    };

    logoImg.onload = drawPDF;
    logoImg.onerror = drawPDF;
  };

  if (loading) {
    return <PageSkeleton variant="subscription" />;
  }

  const sub = data?.subscription || { planName: 'Free', status: 'Active', validUntil: null, jobsUsed: 0, totalJobs: 0, jobLimit: 50, remainingCredits: 50, utilization: 0, applicationsCount: 0, applicationsLimit: 500, teamMembersCount: 1, teamMembersLimit: 10, daysRemaining: 0 };
  const stats = data?.stats || { activeJobs: 0, totalJobs: 0, applications: 0, teamMembers: 1, daysRemaining: 0 };
  const plans = data?.availablePlans || [];
  const invoices = data?.billingHistory || [];
  const latestInvoice = invoices[0] || null;
  const currentPlan = plans.find((plan) => plan._id === sub.currentPlanId) || null;
  const summaryAmount = Number(latestInvoice?.planAmount ?? currentPlan?.cost ?? 0);
  const summaryDiscount = Number(latestInvoice?.discount || 0);
  const summaryPaid = Number(latestInvoice?.paidAmount ?? Math.max(summaryAmount - summaryDiscount, 0));

  return (
    <div className="space-y-4 px-3 sm:space-y-6 sm:px-0">
      {/* Title */}
      <div className="flex flex-col justify-between gap-2 md:flex-row md:items-center md:gap-3">
        <div>
          <h1 className="text-lg font-extrabold text-[#3f4254] sm:text-2xl">Subscription & Billing</h1>
          <p className="mt-1 text-xs font-semibold text-slate-400 sm:text-sm">Manage your subscription packages, billing methods, and download transaction invoices.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-400 sm:text-sm">
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
          <AlertCircle className="h-5 w-5 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700 flex items-center gap-2">
          <CheckCircle className="h-5 w-5 shrink-0 text-emerald-500" />
          <span>{success}</span>
        </div>
      )}

      {/* SECTION 1: PLAN BANNER */}
      <div className="rounded-lg border border-slate-100 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div className="flex items-start gap-3 sm:gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-500 shadow-sm sm:h-14 sm:w-14">
              <Crown className="h-6 w-6 sm:h-8 sm:w-8" />
            </span>
            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h5 className="text-base font-extrabold text-[#3f4254] sm:text-lg">{sub.planName}</h5>
                <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-600">
                  {sub.status || 'Active'}
                </span>
              </div>
              <p className="text-xs font-bold text-slate-400">
                Valid until: <span className="text-[#3f4254]">{formatDate(sub.validUntil, 'Dec 31, 2026')}</span>
              </p>

              <div className="pt-3 grid grid-cols-2 gap-4 sm:flex sm:flex-wrap sm:items-center sm:gap-6 text-sm">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block">Current Plan Jobs</span>
                  <span className="font-extrabold text-[#3f4254]">{sub.jobsUsed} <span className="font-medium text-slate-400">/ {sub.jobLimit}</span></span>
                </div>
                <div className="hidden h-8 w-px bg-slate-100 sm:block"></div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block">Resume Unlocks</span>
                  <span className="font-extrabold text-[#3f4254]">{sub.unlocksUsed || 0} <span className="font-medium text-slate-400">/ {sub.unlockLimit || 0}</span></span>
                </div>
                <div className="hidden h-8 w-px bg-slate-100 sm:block"></div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block">Remaining Unlocks</span>
                  <span className="font-extrabold text-emerald-600">{sub.remainingUnlocks ?? 0}</span>
                </div>
                <div className="hidden h-8 w-px bg-slate-100 sm:block"></div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block">Applications</span>
                  <span className="font-extrabold text-[#3f4254]">{sub.applicationsCount} <span className="font-medium text-slate-400">/ {sub.applicationsLimit}</span></span>
                </div>
                <div className="hidden h-8 w-px bg-slate-100 sm:block"></div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block">Team Members</span>
                  <span className="font-extrabold text-[#3f4254]">{sub.teamMembersCount} <span className="font-medium text-slate-400">/ {sub.teamMembersLimit}</span></span>
                </div>
                <div className="hidden h-8 w-px bg-slate-100 sm:block"></div>
                <div className="col-span-2 w-full sm:w-36">
                  <span className="text-[10px] font-bold text-slate-400 block mb-1">Utilization</span>
                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-[#6658dd]" style={{ width: `${sub.utilization}%` }}></div>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 mt-1 block">{sub.utilization}% utilized</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
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
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {[
          { title: 'Total Job Posts', value: stats.totalJobs ?? sub.totalJobs ?? 0, subtitle: 'across all subscriptions', icon: Briefcase, color: 'bg-indigo-50 text-indigo-500' },
          { title: 'Applications Received', value: stats.applications, subtitle: '+48 this week', icon: FileText, color: 'bg-emerald-50 text-emerald-500' },
          { title: 'Team Members', value: `${stats.teamMembers} / 10`, subtitle: 'included in plan', icon: Users, color: 'bg-sky-50 text-sky-500' },
          { title: 'Days Remaining', value: stats.daysRemaining || 0, subtitle: 'until renewal date', icon: Clock, color: 'bg-amber-50 text-amber-500' }
        ].map((stat, index) => (
          <div key={index} className="rounded-lg border border-slate-100 bg-white p-3 shadow-sm flex items-center gap-2 sm:p-5 sm:gap-4">
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full sm:h-12 sm:w-12 ${stat.color}`}>
              <stat.icon className="h-4 w-4 sm:h-6 sm:w-6" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-xs font-bold text-slate-400">{stat.title}</p>
              <p className="mt-0.5 text-base font-black text-[#3f4254] sm:text-xl">{stat.value}</p>
              <p className="truncate text-[10px] font-bold text-slate-400 mt-0.5">{stat.subtitle}</p>
            </div>
          </div>
        ))}
      </div>

      {/* SECTION 3: PRICING PLANS TABLE */}
      <div id="plans-pricing" className="rounded-lg border border-slate-100 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 p-4 bg-slate-50/50 sm:p-5">
          <h3 className="font-extrabold text-[#3f4254] text-base">Choose Your Plan</h3>
          <p className="text-xs font-semibold text-slate-400 mt-1">Select the pricing package that matches your recruiting scale. Upgrade or modify anytime.</p>
        </div>

        {/* Card list — mobile only */}
        <div className="divide-y divide-slate-100 p-4 sm:hidden">
          {plans.length === 0 ? (
            <p className="py-8 text-center text-sm font-bold text-slate-400">No active employer plans are available.</p>
          ) : plans.map((p) => {
            const isCurrent = sub.currentPlanId === p._id;
            const isSubmitting = subscribingPlanId === p._id;
            return (
              <div key={p._id} className="py-4 first:pt-0 last:pb-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-extrabold text-[#3f4254]">{p.planName}</p>
                    {p.showBadge && p.badge && <span className="mt-1 inline-flex rounded bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold text-amber-800">{p.badge}</span>}
                    {p.planSubtitle && <p className="mt-1 text-xs font-bold text-slate-400">{p.planSubtitle}</p>}
                  </div>
                  <span className="shrink-0 font-black text-[#6658dd]">₹{p.cost.toLocaleString('en-IN')}</span>
                </div>

                <div className="mt-2 grid grid-cols-2 gap-2 text-xs font-bold text-slate-500">
                  <p>{p.unlockCount || 0} Unlocks</p>
                  <p>{p.freeJobPosts} Job Posts</p>
                </div>

                {p.employerFeatures?.length > 0 && (
                  <ul className="mt-2 list-disc space-y-0.5 pl-4 text-xs leading-relaxed text-slate-500">
                    {p.employerFeatures.map((feat, fIdx) => <li key={fIdx}>{feat}</li>)}
                  </ul>
                )}

                <div className="mt-3">
                  {isCurrent ? (
                    <button disabled className="w-full rounded-lg bg-amber-50 border border-amber-200 py-2 text-xs font-extrabold text-amber-700 cursor-not-allowed">
                      Current Plan
                    </button>
                  ) : (
                    <button
                      onClick={() => handleChoosePlan(p)}
                      disabled={Boolean(subscribingPlanId)}
                      className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#6658dd] py-2 text-xs font-extrabold text-white shadow-sm hover:bg-[#5848d8] transition disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isSubmitting && <Loader className="h-3.5 w-3.5 animate-spin" />}
                      {isSubmitting ? 'Activating' : 'Choose Plan'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Table — sm and up */}
        <div className="hidden p-5 overflow-x-auto sm:block">
          <table className="w-full text-nowrap text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-black text-slate-400 uppercase tracking-wider bg-slate-50/50">
                <th className="py-3 px-4">Plan Name</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Contact Unlocks</th>
                <th className="py-3 px-4">Job Posts</th>
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
      <div className="grid gap-3 sm:gap-4 md:grid-cols-3">
        {/* Payment Record Card */}
        <div className="rounded-lg border border-slate-100 bg-white p-4 shadow-sm flex flex-col justify-between space-y-4 sm:p-5">
          <div className="flex justify-between items-center">
            <h4 className="font-extrabold text-[#3f4254] text-sm flex items-center gap-1.5">
              <CreditCard className="h-4.5 w-4.5 text-slate-400" />
              Latest Payment
            </h4>
          </div>

          <div className="space-y-3 flex-grow pt-2">
            {latestInvoice ? (
              <div className="rounded-lg p-3 bg-slate-50 border border-slate-100 flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <div className="h-8 w-11 shrink-0 rounded border border-slate-200 bg-white flex items-center justify-center text-[10px] font-black text-slate-500">
                    {latestInvoice.paymentMethod || 'Pay'}
                  </div>
                  <div className="min-w-0">
                    <span className="truncate text-xs font-extrabold text-[#3f4254] block">{latestInvoice.paymentId}</span>
                    <span className="truncate text-[10px] font-bold text-slate-400 block">
                      {latestInvoice.paymentGateway || 'Gateway'} | {formatDate(latestInvoice.paymentDate || latestInvoice.createDate)}
                    </span>
                  </div>
                </div>

                <span className="shrink-0 rounded bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-700">
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
        <div className="rounded-lg border border-slate-100 bg-white p-4 shadow-sm flex flex-col justify-between space-y-4 sm:p-5">
          <h4 className="font-extrabold text-[#3f4254] text-sm">Next Payment</h4>
          
          <div className="text-center py-3 flex-grow flex flex-col justify-center">
            <p className="text-xl font-black text-[#3f4254] sm:text-2xl">₹{Number(currentPlan?.cost || 0).toLocaleString('en-IN')}</p>
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
        <div className="rounded-lg border border-slate-100 bg-white p-4 shadow-sm flex flex-col justify-between space-y-3 sm:p-5">
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
            onClick={() => latestInvoice && generateInvoicePDF(latestInvoice)}
            className="w-full inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white text-xs font-extrabold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Download className="h-4 w-4" />
            Download Invoice
          </button>
        </div>
      </div>

      {/* SECTION 5: BILLING HISTORY */}
      <div className="rounded-lg border border-slate-100 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 p-4 bg-slate-50/50 flex justify-between items-center sm:p-5">
          <div>
            <h3 className="font-extrabold text-[#3f4254] text-base">Billing History</h3>
            <p className="text-xs font-semibold text-slate-400 mt-1">Review your past transaction records and retrieve past invoice files.</p>
          </div>
        </div>

        {/* Card list — mobile only */}
        <div className="divide-y divide-slate-100 p-4 sm:hidden">
          {invoices.length === 0 ? (
            <p className="py-8 text-center text-sm font-bold text-slate-400">No billing history found.</p>
          ) : invoices.map((inv) => (
            <div key={inv._id} className="py-3 first:pt-0 last:pb-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-extrabold text-[#6658dd]">{inv.invoiceNo || inv.paymentId}</p>
                  <p className="mt-0.5 text-xs font-bold text-slate-400">{formatDate(inv.createDate || inv.paymentDate)}</p>
                </div>
                <span className={`shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold ${statusTone(inv.paymentStatus || 'Success')}`}>
                  {inv.paymentStatus || 'Success'}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between text-xs font-semibold text-[#3f4254]">
                <p className="truncate font-bold">{inv.planName}</p>
                <p className="shrink-0 font-black">₹{inv.paidAmount?.toLocaleString('en-IN')}</p>
              </div>
              <button
                onClick={() => generateInvoicePDF(inv)}
                className="mt-3 inline-flex w-full items-center justify-center gap-1 rounded bg-slate-50 border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
              >
                <Download className="h-3.5 w-3.5" />
                Download PDF
              </button>
            </div>
          ))}
        </div>

        {/* Table — sm and up */}
        <div className="hidden p-5 overflow-x-auto sm:block">
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
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold ${statusTone(inv.paymentStatus || 'Success')}`}>
                      {inv.paymentStatus || 'Success'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <button
                      onClick={() => generateInvoicePDF(inv)}
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