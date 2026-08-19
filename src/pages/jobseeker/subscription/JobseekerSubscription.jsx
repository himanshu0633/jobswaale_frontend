import { useEffect, useState } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import logo from '../../../assets/logo.png';
import {
  ArrowUpRight,
  BadgeCheck,
  Check,
  ChevronLeft,
  ChevronRight,
  Gem,
  Minus,
  Receipt,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
  X,
  AlertCircle,
  CheckCircle,
  Loader
} from 'lucide-react';
import { BASE_API_URL } from '../../../context/AuthContext';
import PageSkeleton from '../../../components/SkeletonLoader';

const getTokenHeaders = () => {
  const token = localStorage.getItem('publicToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/* ----------------------------- content ----------------------------- */

const benefits = [
  {
    icon: Target,
    title: 'Priority access',
    text: 'Your profile surfaces first in recruiter searches, so you get seen before the crowd.'
  },
  {
    icon: Users,
    title: 'More interviews',
    text: 'Dedicated placement support lines up multiple interview opportunities for you.'
  },
  {
    icon: Sparkles,
    title: 'Career growth',
    text: 'Certified training and job-assurance support that move your career forward, not sideways.'
  }
];

const featureIcon = {
  check: { Icon: Check, tone: 'text-emerald-500 bg-emerald-50' },
  minus: { Icon: Minus, tone: 'text-slate-400 bg-slate-100' },
  cross: { Icon: X, tone: 'text-rose-400 bg-rose-50' }
};

/* ------------------------------ fonts ------------------------------ */

const FontLoader = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap');
    .jsw-root { font-family: 'Inter', ui-sans-serif, system-ui, sans-serif; }
    .jsw-display { font-family: 'Sora', ui-sans-serif, system-ui, sans-serif; }
    .jsw-scrollbar-none::-webkit-scrollbar { display: none; }
    .jsw-scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
  `}</style>
);

/* ------------------------------ component ------------------------------ */

export const JobseekerSubscription = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [pendingPlan, setPendingPlan] = useState(null);
  const [activeCard, setActiveCard] = useState(0);

  const loadSubscription = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${BASE_API_URL}/jobseeker/subscription`, { headers: getTokenHeaders() });
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

  useEffect(() => {
    if (pendingPlan) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [pendingPlan]);

  const confirmUpgrade = async () => {
    if (!pendingPlan) return;
    setError('');
    setSuccess('');
    setSubscribing(true);
    try {
      const response = await axios.post(
        `${BASE_API_URL}/jobseeker/subscription/select-plan`,
        { planId: pendingPlan.id },
        { headers: getTokenHeaders() }
      );
      setSuccess(response.data?.message || `Successfully upgraded to ${pendingPlan.name} Plan`);
      setPendingPlan(null);
      await loadSubscription();
    } catch (err) {
      setError(err.response?.data?.message || 'Plan upgrade failed. Please try again.');
      setPendingPlan(null);
    } finally {
      setSubscribing(false);
    }
  };

  const generateInvoicePDF = (row) => {
    // 1. Get client info from localStorage
    let clientName = 'Valued Candidate';
    let clientEmail = 'billing@jobswaale.com';
    let clientPhone = 'N/A';
    let clientLoc = 'India';

    try {
      const publicUser = JSON.parse(localStorage.getItem('publicUser')) || {};
      clientName = [publicUser.firstName, publicUser.lastName].filter(Boolean).join(' ') || 'Valued Candidate';
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

        const invoiceNo = row.invoiceNo || 'N/A';
        const planName = row.plan || 'N/A';
        const amountStr = String(row.amount || '').replace('₹', '').trim();
        const paidAmount = Number(amountStr) || 0;
        const paymentDate = row.date || 'N/A';
        const paymentStatus = row.status || 'Paid';
        const paymentMethod = row.method || 'Razorpay';

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

  const scrollToCard = (index) => {
    const el = document.getElementById(`plan-card-${index}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    setActiveCard(index);
  };

  if (loading) {
    return <PageSkeleton variant="subscription" />;
  }

  const activePlan = data?.activePlan || {
    name: 'Free Plan',
    price: '₹0',
    period: 'lifetime',
    validity: 'Valid for lifetime · No expiry'
  };
  const plans = data?.plans || [];
  const billingHistory = data?.billingHistory || [];

  return (
    <div className="jobseeker-plan-page jsw-root min-h-screen bg-[#F5F7FB] pb-16">
      <FontLoader />

      <div className="mx-auto max-w-8xl px-4 pt-6 sm:px-6 sm:pt-10 lg:px-8">

        {/* Notifications */}
        {error && (
          <div className="mb-6 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="mb-6 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 shrink-0 text-emerald-500" />
            <span>{success}</span>
          </div>
        )}

        {/* ---------------- Current Plan Hero ---------------- */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#001c3d] via-[#00265a] to-[#0047C7] p-6 text-white shadow-[0_20px_50px_-15px_rgba(0,28,61,0.5)] sm:p-8 md:p-10">

          {/* decorative rings */}
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -right-6 -top-6 h-40 w-40 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-white/5 blur-2xl" />

          <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

            <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:text-left">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20">
                <Gem className="h-6 w-6" strokeWidth={2} />
              </div>
              <div>
                <div className="mb-1 flex items-center justify-center gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-white/60 sm:justify-start">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Active plan
                </div>
                <div className="jsw-display text-2xl font-bold leading-tight sm:text-[1.7rem]">
                  {activePlan.name}
                </div>
                <div className="mt-1 text-[0.8rem] text-white/60">
                  {activePlan.validity}
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center gap-3 border-t border-white/10 pt-5 text-center md:items-end md:border-t-0 md:border-l md:pt-0 md:pl-8 md:text-right">
              <div className="jsw-display text-3xl font-extrabold sm:text-4xl">
                {activePlan.price} <span className="text-sm font-medium text-white/60">/ {activePlan.period}</span>
              </div>
              <a
                href="#plansSection"
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#FFC107] px-5 py-2.5 text-sm font-bold text-[#212529] shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:bg-[#ffca2c] active:translate-y-0"
              >
                Upgrade now <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>

          </div>
        </div>

        {/* ---------------- Why Upgrade ---------------- */}
        <div className="mt-10 sm:mt-12">
          <h4 className="jsw-display text-lg font-bold text-[#0f172a] sm:text-xl">
            Why upgrade your plan?
          </h4>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {benefits.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="plan-benefit-card group rounded-2xl border border-[#e6eaf2] bg-white p-5 transition hover:border-[#0047C7]/30 hover:shadow-[0_10px_30px_-12px_rgba(0,71,199,0.25)] sm:p-6"
                >
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#0047C7]/10 text-[#0047C7] transition group-hover:bg-[#0047C7] group-hover:text-white">
                    <Icon className="h-5 w-5" strokeWidth={2} />
                  </div>
                  <h6 className="jsw-display mb-1.5 text-[0.95rem] font-bold text-[#0f172a]">
                    {item.title}
                  </h6>
                  <p className="text-[0.83rem] leading-relaxed text-[#8592a6]">
                    {item.text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* ---------------- Plans ---------------- */}
        <div id="plansSection" className="mt-10 scroll-mt-6 sm:mt-12">
          <div className="mb-1 flex items-center justify-between">
            <h4 className="jsw-display text-lg font-bold text-[#0f172a] sm:text-xl">
              Compare plans & choose what fits you
            </h4>
          </div>
          <p className="mb-5 text-[0.83rem] text-[#8592a6]">
            One-time payment. No hidden renewals.
          </p>

          {/* mobile swipe hint dots */}
          <div className="mb-3 flex justify-center gap-1.5 sm:hidden">
            {plans.map((p, i) => (
              <button
                key={p.key}
                aria-label={`Go to ${p.name} plan`}
                onClick={() => scrollToCard(i)}
                className={`h-1.5 rounded-full transition-all ${
                  activeCard === i ? 'w-5 bg-[#0047C7]' : 'w-1.5 bg-[#cbd5e1]'
                }`}
              />
            ))}
          </div>

          <div
            className="jsw-scrollbar-none -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:snap-none sm:grid-cols-2 sm:overflow-visible sm:px-0"
            onScroll={(e) => {
              const el = e.currentTarget;
              const cardWidth = el.firstChild ? el.firstChild.offsetWidth + 16 : 1;
              const idx = Math.round(el.scrollLeft / cardWidth);
              if (idx !== activeCard) setActiveCard(idx);
              
            }}
            style={{
              gridTemplateColumns: `repeat(${plans.length}, minmax(0, 1fr))`,
            }}
          >
            {plans.map((plan, i) => (
              <div
                id={`plan-card-${i}`}
                key={plan.key}
                className={`plan-price-card relative flex w-[82vw] shrink-0 snap-center flex-col rounded-2xl border bg-white p-6 text-center transition-all sm:w-auto sm:shrink sm:hover:-translate-y-1 ${
                  plan.popular
                    ? 'border-[#FF6B00] shadow-[0_0_0_1.5px_#FF6B00,0_16px_40px_-16px_rgba(255,107,0,0.35)]'
                    : plan.current
                    ? 'border-[#0047C7]/40 bg-gradient-to-b from-[#F7FAFF] to-white'
                    : 'border-[#e6eaf2] sm:hover:border-[#0047C7]/30 sm:hover:shadow-[0_16px_40px_-18px_rgba(15,23,42,0.18)]'
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#FF6B00] px-4 py-1 text-[0.68rem] font-bold text-white shadow-md shadow-orange-900/20">
                    Most popular
                  </span>
                )}
                {plan.current && (
                  <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-[#0047C7]/10 px-2.5 py-1 text-[0.6rem] font-bold text-[#0047C7]">
                    <BadgeCheck className="h-3 w-3" /> Current
                  </span>
                )}

                <div className="jsw-display mb-3 mt-1 text-[0.95rem] font-bold uppercase tracking-wide text-[#0f172a]">
                  {plan.name}
                </div>

                <div className="jsw-display mb-1 text-[2rem] font-extrabold text-[#0f172a]">
                  {plan.price}
                  <span className="ml-1 text-[0.78rem] font-semibold text-[#94a3b8]">{plan.period}</span>
                </div>

                <div className="mb-5 text-[0.8rem] text-[#94a3b8]">{plan.desc}</div>

                <ul className="mb-6 flex-1 text-left">
                  {plan.features.map((feature) => {
                    const { Icon, tone } = featureIcon[feature.state];
                    return (
                      <li
                        key={feature.text}
                        className="flex items-start gap-2.5 border-b border-[#eef1f6] py-2.5 text-[0.8rem] leading-snug text-[#475569] last:border-b-0"
                      >
                        <span className={`mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full ${tone}`}>
                          <Icon className="h-3 w-3" strokeWidth={3} />
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
                    className="w-full cursor-default rounded-xl border border-[#e6eaf2] bg-[#f8fafc] px-4 py-2.5 text-[0.85rem] font-bold text-[#94a3b8]"
                  >
                    Current plan
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setPendingPlan(plan)}
                    className={`w-full rounded-xl border px-4 py-2.5 text-[0.85rem] font-bold transition-all ${
                      plan.popular
                        ? 'border-[#0047C7] bg-[#0047C7] text-white hover:bg-[#0039a3]'
                        : 'border-[#e6eaf2] bg-white text-[#0f172a] hover:border-[#0047C7] hover:text-[#0047C7]'
                    }`}
                  >
                    Upgrade to {plan.name}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ---------------- Billing History ---------------- */}
        <div className="plan-billing-card mt-10 rounded-2xl border border-[#e6eaf2] bg-white p-5 sm:mt-12 sm:p-6">
          <h5 className="jsw-display mb-4 flex items-center gap-2 border-b border-[#eef1f6] pb-3 text-[0.95rem] font-bold text-[#0f172a] sm:text-base">
            <Receipt className="h-[1.05rem] w-[1.05rem] text-[#0047C7]" /> Billing history
          </h5>

          {/* desktop table */}
          <div className="hidden overflow-x-auto sm:block">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr>
                  {['Date', 'Plan', 'Amount', 'Payment method', 'Status', 'Invoice'].map((h) => (
                    <th
                      key={h}
                      className="border-b border-[#eef1f6] px-4 py-3 text-[0.7rem] font-bold uppercase tracking-[0.08em] text-[#94a3b8]"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {billingHistory.map((row, index) => (
                  <tr key={index} className="transition hover:bg-[#f8fafc]">
                    {[row.date, row.plan, row.amount, row.method].map((val, ci) => (
                      <td
                        key={ci}
                        className={`px-4 py-3.5 text-[0.83rem] text-[#475569] ${
                          index === billingHistory.length - 1 ? '' : 'border-b border-[#eef1f6]'
                        }`}
                      >
                        {val}
                      </td>
                    ))}
                    <td
                      className={`px-4 py-3.5 text-[0.83rem] ${
                        index === billingHistory.length - 1 ? '' : 'border-b border-[#eef1f6]'
                      }`}
                    >
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[0.7rem] font-semibold text-emerald-700">
                        <ShieldCheck className="h-3 w-3" /> {row.status}
                      </span>
                    </td>
                    <td
                      className={`px-4 py-3.5 text-[0.83rem] ${
                        index === billingHistory.length - 1 ? '' : 'border-b border-[#eef1f6]'
                      }`}
                    >
                      <button
                        onClick={() => generateInvoicePDF(row)}
                        className="font-semibold text-[#0047C7] hover:underline cursor-pointer bg-transparent border-0 p-0"
                      >
                        Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* mobile cards */}
          <div className="flex flex-col gap-3 sm:hidden">
            {billingHistory.map((row, index) => (
              <div key={index} className="rounded-xl border border-[#eef1f6] p-4">
                <div className="mb-2 flex items-start justify-between">
                  <div>
                    <div className="text-[0.88rem] font-bold text-[#0f172a]">{row.plan}</div>
                    <div className="text-[0.75rem] text-[#94a3b8]">{row.date}</div>
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[0.68rem] font-semibold text-emerald-700">
                    <ShieldCheck className="h-3 w-3" /> {row.status}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-[#eef1f6] pt-2.5 text-[0.8rem]">
                  <span className="font-semibold text-[#475569]">{row.amount}</span>
                  <button
                    onClick={() => generateInvoicePDF(row)}
                    className="font-semibold text-[#0047C7] hover:underline cursor-pointer bg-transparent border-0 p-0"
                  >
                    Download invoice
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ---------------- Upgrade Confirmation Modal ---------------- */}
      {pendingPlan && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center sm:px-4">
          <div className="plan-modal-card w-full max-w-sm rounded-t-2xl bg-white p-6 shadow-xl sm:rounded-2xl">
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-slate-200 sm:hidden" />

            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#0047C7]/10 text-[#0047C7]">
              <Gem className="h-5 w-5" />
            </div>

            <h5 className="jsw-display text-lg font-bold text-[#0f172a]">
              Upgrade to {pendingPlan.name}?
            </h5>

            <p className="mt-2 text-[0.85rem] leading-relaxed text-[#8592a6]">
              You'll be redirected to the payment gateway to complete your upgrade for{' '}
              <span className="font-semibold text-[#0f172a]">{pendingPlan.price}</span> ({pendingPlan.period}).
            </p>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={subscribing}
                onClick={() => setPendingPlan(null)}
                className="rounded-xl border border-[#e6eaf2] px-4 py-2.5 text-sm font-bold text-[#8592a6] transition-colors hover:bg-[#f8fafc] disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={subscribing}
                onClick={confirmUpgrade}
                className="rounded-xl bg-[#0047C7] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#0039a3] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {subscribing && <Loader className="h-4 w-4 animate-spin" />}
                {subscribing ? 'Processing...' : 'Continue to payment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobseekerSubscription;
