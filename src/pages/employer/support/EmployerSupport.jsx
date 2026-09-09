import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { BASE_API_URL, useAuth } from '../../../context/AuthContext';
import ClearFilterButton from '../../../components/ClearFilterButton';
import {
  LifeBuoy,
  Search,
  Rocket,
  Briefcase,
  FileText,
  CalendarCheck,
  CreditCard,
  Settings,
  ChevronDown,
  ChevronUp,
  Mail,
  MessageSquare,
  Clock,
  Phone,
  ArrowRight,
  Send,
  HelpCircle,
  FileUp,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  X,
  Eye,
  Paperclip,
  ExternalLink,
  PlusCircle,
  MessageCircle,
  ShieldCheck,
  Check,
  Download,
  Inbox
} from 'lucide-react';

const getTokenHeaders = () => {
  const token = localStorage.getItem('publicToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Help Category Guide contents for interactive modals
const CATEGORY_GUIDES = {
  'Getting Started': {
    title: 'Getting Started with JobsWaale',
    desc: 'Complete onboarding walkthrough for new employers on JobsWaale.',
    icon: Rocket,
    color: 'bg-indigo-50 text-indigo-600',
    steps: [
      { title: '1. Complete Your Company Profile', desc: 'Navigate to Company Profile from the sidebar. Upload your company logo, cover banner, description, headquarters location, website, and industry category to establish credibility.' },
      { title: '2. Verify Your Contact Information', desc: 'Ensure your official recruiter email and direct phone numbers are confirmed in Settings so candidates and the verification team can reach you.' },
      { title: '3. Select an Active Subscription Plan', desc: 'Visit the Subscription tab to choose a plan matching your hiring volume. Plans unlock job postings, candidate profile views, and direct messaging credits.' },
      { title: '4. Post Your First Job Listing', desc: 'Click "Post a Job", fill in key requirements, location mode (Remote/On-site/Hybrid), and salary range to start attracting relevant applicants immediately.' }
    ],
    actionLink: '/employer/company',
    actionText: 'Open Company Profile'
  },
  'Managing Jobs': {
    title: 'Managing Your Job Postings',
    desc: 'Tips and controls for posting, updating, pausing, and closing jobs.',
    icon: Briefcase,
    color: 'bg-emerald-50 text-emerald-600',
    steps: [
      { title: '1. Editing Live Job Details', desc: 'Go to Jobs List, click the 3-dots action menu next to any listing, and select "Edit" to modify role requirements, salary, or experience needed.' },
      { title: '2. Pausing or Re-opening Listings', desc: 'If you have enough applicants or need to temporarily pause hiring, toggle the job status to "Paused". You can reactivate it anytime without using an extra job post credit.' },
      { title: '3. Boosting Job Visibility', desc: 'Mark listings as "Featured" or "Urgent Hiring" in your plan settings to prioritize display in search results.' },
      { title: '4. Tracking Application Inflow', desc: 'View real-time applicant counts directly on your Jobs dashboard and track application trends over time.' }
    ],
    actionLink: '/employer/jobs',
    actionText: 'Go to Jobs Management'
  },
  'Applications & Screening': {
    title: 'Reviewing Applications & Screening',
    desc: 'Organize candidate pipelines, shortlist top talent, and filter applications.',
    icon: FileText,
    color: 'bg-sky-50 text-sky-600',
    steps: [
      { title: '1. Filtering Incoming Applications', desc: 'Use filters by job title, date applied, candidate experience, or education to isolate the most qualified candidates quickly.' },
      { title: '2. Viewing Candidate Profiles & Resumes', desc: 'Click "View Profile" on any candidate to inspect their verified profile, work history, and portfolio. Viewing an applicant unlocks their details for that plan cycle.' },
      { title: '3. Shortlisting and Pipeline Stages', desc: 'Move applicants through stages: "Applied" -> "Shortlisted" -> "Interview Scheduled" -> "Hired" or "Rejected" to keep your team aligned.' },
      { title: '4. Talent Pool Archiving', desc: 'Save promising profiles directly to your Talent Pool for future roles without having to re-source them.' }
    ],
    actionLink: '/employer/applications',
    actionText: 'View Applications'
  },
  'Interviews & Selection': {
    title: 'Scheduling Interviews & Final Selection',
    desc: 'Seamlessly schedule interviews and issue offer letters.',
    icon: CalendarCheck,
    color: 'bg-amber-50 text-amber-600',
    steps: [
      { title: '1. Direct Candidate Communication', desc: 'Use the integrated messaging system to send interview questions, request availability, and share meeting links.' },
      { title: '2. Interview Scheduling', desc: 'Specify interview dates, video call links (Google Meet / Zoom), and recruiter notes directly from the candidate detail card.' },
      { title: '3. Candidate Evaluation Notes', desc: 'Record interviewer feedback and rating scores to ensure consistent hiring decisions across your team.' },
      { title: '4. Issuing Offer Letters', desc: 'Generate and upload formal offer letters with joining dates and compensation details directly through the portal.' }
    ],
    actionLink: '/employer/interviews',
    actionText: 'Go to Interviews'
  },
  'Billing & Subscription': {
    title: 'Subscription Plans & Invoicing',
    desc: 'Understand package limits, profile view unlocks, and billing history.',
    icon: CreditCard,
    color: 'bg-rose-50 text-rose-600',
    steps: [
      { title: '1. Understanding Plan Cycles & Unlocks', desc: 'Each active plan comes with a set quota of job posts and candidate profile unlocks. Unlocks are active for the duration of your current plan cycle.' },
      { title: '2. Single Deduction Guarantee', desc: 'Once you unlock a candidate in your active cycle, viewing their profile across multiple jobs or downloading their resume does NOT deduct additional credits.' },
      { title: '3. Instant Upgrades', desc: 'You can upgrade to a higher tier at any time. New plan credits start fresh immediately upon purchase.' },
      { title: '4. GST Invoices & Tax Receipts', desc: 'Download official GST-compliant tax invoices in PDF format anytime from the Billing History section.' }
    ],
    actionLink: '/employer/subscription',
    actionText: 'Manage Subscription'
  },
  'Account & Settings': {
    title: 'Account Settings & Security',
    desc: 'Update password, configure two-factor authentication, and notifications.',
    icon: Settings,
    color: 'bg-slate-50 text-slate-600',
    steps: [
      { title: '1. Update Recruiter Details & Logo', desc: 'Change your display photo, corporate email, and backup email anytime from Settings -> Profile tab.' },
      { title: '2. Security & Password Changes', desc: 'Keep your account secure by rotating your password regularly under the Security tab.' },
      { title: '3. Two-Factor Authentication (2FA)', desc: 'Enable 2FA via SMS OTP, Email OTP, or Authenticator App for enterprise-grade account protection.' },
      { title: '4. Notification Preferences', desc: 'Configure instant email alerts for new applicants, interview confirmations, and system updates.' }
    ],
    actionLink: '/employer/settings',
    actionText: 'Open Settings'
  }
};

// Popular article detailed contents
const ARTICLE_DETAILS = {
  'art1': {
    title: 'Setting Up Your Company Profile for Maximum Applicant Trust',
    category: 'Getting Started',
    readTime: '4 min read',
    content: `
      An attractive, verified company profile increases application rates by up to 300%. Candidates want to know who they are applying to, company culture, work perks, and office locations.

      Key Best Practices:
      1. High-Resolution Logo: Upload a square, clear company logo (at least 300x300 px) in PNG or JPEG format.
      2. Compelling About Section: Summarize your company's mission, what products/services you build, and why people love working with your team.
      3. Office Locations & Social Links: Add your physical headquarters, branch offices, LinkedIn page, and website URL.
      4. Work Culture & Benefits: Mention perks such as flexible remote work, medical insurance, annual bonuses, or learning allowances.
    `
  },
  'art2': {
    title: 'How to Write an Effective Job Description That Converts',
    category: 'Job Management',
    readTime: '5 min read',
    content: `
      Vague job postings attract irrelevant candidates. A crisp, well-structured listing brings high-intent, qualified applicants.

      Recommended Structure:
      - Role Overview: 2-3 sentences describing the high-level purpose of this role.
      - Key Responsibilities: 5-7 bullet points of day-to-day responsibilities.
      - Required Qualifications: Essential skills, minimum years of experience, and mandatory tech stack.
      - Nice-to-have Skills: Differentiating skills that are a bonus but not mandatory.
      - Compensation & Perks: Disclosing salary ranges significantly increases qualified applicant volume.
    `
  },
  'art3': {
    title: 'Understanding Your Invoices, Credits & Plan Cycles',
    category: 'Billing',
    readTime: '3 min read',
    content: `
      Learn how plan quotas and profile unlock credits work together on JobsWaale:

      1. Plan Quota Allocation: Upon subscribing to a plan, your account is credited with a fixed number of Job Postings and Candidate Profile Unlocks.
      2. No Double Deductions: When you view a candidate's profile, 1 unlock credit is deducted. Viewing them again from another job application or downloading their resume never incurs a second deduction during that plan cycle.
      3. Invoice Downloads: All transactions generate a GST invoice available immediately for download under your Subscription dashboard.
    `
  },
  'art4': {
    title: 'Managing Team Members & Role Permissions',
    category: 'Account',
    readTime: '4 min read',
    content: `
      Collaborate smoothly across your recruiting team while keeping sensitive billing data restricted:

      - Owners / Admins: Full access to billing, company profile settings, job posting, and candidate shortlisting.
      - Recruiters / Members: Access to create job postings, review applicants, and schedule interviews without access to company billing methods.
      - Audit Trails: Track which team member shortlisted or contacted a candidate.
    `
  },
  'art5': {
    title: 'Posting Your First Job: A Step-by-Step Guide',
    category: 'Job Management',
    readTime: '6 min read',
    content: `
      Step 1: Navigate to 'Post a Job' from your sidebar.
      Step 2: Enter the standard Job Title, Department, and Employment Type (Full-Time, Part-Time, Contract, Internship).
      Step 3: Choose Workplace Type: Remote, Hybrid, or On-site with location details.
      Step 4: Specify Minimum and Maximum Experience, Education Level, and Salary bracket.
      Step 5: Enter the job description and click 'Publish Job'. Your job is live immediately!
    `
  },
  'art6': {
    title: 'Comparing Pricing Plans: Starter vs Professional vs Premium',
    category: 'Getting Started',
    readTime: '5 min read',
    content: `
      Choose the best plan for your company's growth phase:

      - Starter: Ideal for early-stage startups and small businesses hiring for 1-2 urgent positions.
      - Professional: Best for growing companies with ongoing monthly hiring needs, multiple recruiters, and advanced filtering.
      - Premium Enterprise: Designed for large hiring volumes with unlimited talent pool access, dedicated account manager, and priority 24/7 phone support.
    `
  }
};

export const EmployerSupport = () => {
  const { user } = useAuth();
  
  // Navigation tabs: 'kb' (Knowledge Base), 'tickets' (My Tickets), 'new-ticket' (Submit Ticket)
  const [activeTab, setActiveTab] = useState('kb');

  // Search & Filter state for Knowledge Base
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFaq, setActiveFaq] = useState('faq1');
  const [faqCategory, setFaqCategory] = useState('all'); // all, general, billing, technical
  const [articleFilter, setArticleFilter] = useState('all'); // all, started, jobs, account

  // Modals state
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [selectedTicketDetail, setSelectedTicketDetail] = useState(null);

  // Tickets state
  const [tickets, setTickets] = useState([]);
  const [ticketStats, setTicketStats] = useState({ total: 0, open: 0, inProgress: 0, resolved: 0, closed: 0 });
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [ticketStatusFilter, setTicketStatusFilter] = useState('all');
  const [ticketPriorityFilter, setTicketPriorityFilter] = useState('all');
  const [ticketSearchQuery, setTicketSearchQuery] = useState('');

  // Submit Ticket Form state
  const [ticketForm, setTicketForm] = useState({
    category: 'Billing & Pricing',
    priority: 'Medium',
    subject: '',
    message: '',
    attachment: '',
    fileName: ''
  });
  const [submittingTicket, setSubmittingTicket] = useState(false);
  const [ticketSuccessMsg, setTicketSuccessMsg] = useState('');
  const [ticketErrorMsg, setTicketErrorMsg] = useState('');

  // Ticket Conversation Reply state
  const [replyMessage, setReplyMessage] = useState('');
  const [replySubmitting, setReplySubmitting] = useState(false);

  // Fetch employer tickets
  const fetchTickets = useCallback(async () => {
    setLoadingTickets(true);
    try {
      const res = await axios.get(`${BASE_API_URL}/employer/support/tickets`, {
        headers: getTokenHeaders()
      });
      if (res.data?.success) {
        setTickets(res.data.tickets || []);
        if (res.data.stats) {
          setTicketStats(res.data.stats);
        }
      }
    } catch (err) {
      console.error('Failed to load tickets:', err);
    } finally {
      setLoadingTickets(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  // Submit new ticket
  const handleTicketSubmit = async (e) => {
    e.preventDefault();
    setTicketErrorMsg('');
    setTicketSuccessMsg('');

    if (!ticketForm.subject.trim() || !ticketForm.message.trim()) {
      setTicketErrorMsg('Please fill in both the Subject and Details fields.');
      return;
    }

    setSubmittingTicket(true);
    try {
      const res = await axios.post(`${BASE_API_URL}/employer/support/ticket`, {
        category: ticketForm.category,
        priority: ticketForm.priority,
        subject: ticketForm.subject.trim(),
        message: ticketForm.message.trim(),
        attachment: ticketForm.attachment || '',
        attachmentOriginalName: ticketForm.fileName || ''
      }, { headers: getTokenHeaders() });

      if (res.data?.success || res.data?.ticket) {
        const createdId = res.data.ticket?.ticketId || 'New';
        setTicketSuccessMsg(`Support ticket #${createdId} submitted successfully! Our team will respond shortly.`);
        setTicketForm({
          category: 'Billing & Pricing',
          priority: 'Medium',
          subject: '',
          message: '',
          attachment: '',
          fileName: ''
        });
        await fetchTickets();
        // Switch to tickets tab after brief moment
        setTimeout(() => {
          setActiveTab('tickets');
          setTicketSuccessMsg('');
        }, 2200);
      }
    } catch (err) {
      setTicketErrorMsg(err.response?.data?.message || 'Failed to submit support ticket. Please try again.');
    } finally {
      setSubmittingTicket(false);
    }
  };

  // Handle file attachment for ticket submission
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setTicketErrorMsg('Attachment file size cannot exceed 5 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setTicketForm(prev => ({
        ...prev,
        fileName: file.name,
        attachment: reader.result
      }));
      setTicketErrorMsg('');
    };
    reader.onerror = () => {
      setTicketErrorMsg('Failed to process file attachment.');
    };
    reader.readAsDataURL(file);
  };

  // Reply to ticket
  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!selectedTicketDetail || !replyMessage.trim()) return;

    setReplySubmitting(true);
    try {
      const res = await axios.post(
        `${BASE_API_URL}/employer/support/tickets/${selectedTicketDetail._id}/reply`,
        { message: replyMessage.trim() },
        { headers: getTokenHeaders() }
      );
      if (res.data?.success) {
        setReplyMessage('');
        setSelectedTicketDetail(res.data.ticket);
        await fetchTickets();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send reply.');
    } finally {
      setReplySubmitting(false);
    }
  };

  // Close ticket
  const handleCloseTicket = async (ticketId) => {
    if (!window.confirm('Are you sure you want to mark this support ticket as closed?')) return;
    try {
      const res = await axios.patch(
        `${BASE_API_URL}/employer/support/tickets/${ticketId}/close`,
        {},
        { headers: getTokenHeaders() }
      );
      if (res.data?.success) {
        if (selectedTicketDetail && selectedTicketDetail._id === ticketId) {
          setSelectedTicketDetail(res.data.ticket);
        }
        await fetchTickets();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to close ticket.');
    }
  };

  // FAQs data
  const faqs = [
    { id: 'faq1', cat: 'general', question: 'How do I post a new job?', answer: 'Go to the "Post a Job" section from the sidebar. Fill in the job title, description, department, requirements, and job location details. Once completed, click "Publish" to display it on the public jobs board.' },
    { id: 'faq2', cat: 'general', question: 'How do I review candidate applications?', answer: 'Navigate to "Applications" in the sidebar menu. You can filter applicant pools by job title, active dates, or selection status. Click on a candidate to view their complete profile, contact options, and screening details.' },
    { id: 'faq3', cat: 'general', question: 'How do I shortlist a candidate?', answer: 'While viewing an application, click the "Shortlist" button. This updates the candidate status and moves their details to the Shortlisted list for convenient tracking.' },
    { id: 'faq4', cat: 'general', question: 'How does profile unlocking and resume download work?', answer: 'When you view an applied candidate profile, 1 unlock credit is deducted from your active subscription plan. Once unlocked in your active plan cycle, you can view the candidate anytime across any job, and downloading their resume will NOT deduct another credit.' },
    
    { id: 'faq5', cat: 'billing', question: 'How do I upgrade my plan?', answer: 'Visit the "Subscription" tab in the sidebar, view available packages inside the pricing grid, and click "Upgrade Now" on the plan of your choice. Billing upgrades are processed instantly.' },
    { id: 'faq6', cat: 'billing', question: 'What payment methods are accepted?', answer: 'We support Visa, Mastercard, American Express, PayPal, NetBanking, and UPI options via secure payment gateways.' },
    { id: 'faq7', cat: 'billing', question: 'How do I download my GST invoices?', answer: 'Billing statements and GST invoices are recorded at the bottom of the "Subscription" dashboard in the "Billing History" table. Click "Download Invoice" to save them as PDFs.' },
    { id: 'faq8', cat: 'billing', question: 'What happens when my subscription plan expires?', answer: 'When your plan expires, remaining job posting credits and unlocks expire. Simply renew or upgrade your plan to receive fresh credits with a zeroed-out counter.' },
    
    { id: 'faq9', cat: 'technical', question: 'How do I reset or update my password?', answer: 'Navigate to Settings -> Security tab. Enter your active password, provide your new password twice, and click "Update Password" to save changes securely.' },
    { id: 'faq10', cat: 'technical', question: 'How do I enable two-factor authentication (2FA)?', answer: 'Go to Settings -> Security tab. Toggle "Enable 2FA via Authenticator App" or "Email OTP" to secure your employer account against unauthorized logins.' },
    { id: 'faq11', cat: 'technical', question: 'Which web browsers are supported?', answer: 'JobsWaale is optimized for Google Chrome, Mozilla Firefox, Apple Safari, and Microsoft Edge on desktop and tablet.' },
    { id: 'faq12', cat: 'technical', question: 'How do I update company logo and profile details?', answer: 'Access Company Profile from the sidebar or Settings. You can upload your corporate logo, cover banner, and company bio directly.' }
  ];

  // Popular articles list
  const popularArticles = [
    { id: 'art1', cat: 'started', title: 'Setting Up Your Company Profile', desc: 'Learn how to upload logos, add banner taglines, founder metrics, and verify corporate details.', readTime: '4 min read' },
    { id: 'art2', cat: 'jobs', title: 'How to Write an Effective Job Description', desc: 'Tips and templates to write descriptions that attract high-quality candidates.', readTime: '5 min read' },
    { id: 'art3', cat: 'account', title: 'Understanding Invoices & Billing Cycles', desc: 'A complete breakdown of monthly plan limits, renewals, GST billing invoices, and payment logs.', readTime: '3 min read' },
    { id: 'art4', cat: 'account', title: 'Managing Team Members & Access Roles', desc: 'Invite recruiters to your team and set up appropriate Admin vs Member restrictions.', readTime: '4 min read' },
    { id: 'art5', cat: 'jobs', title: 'Posting Your First Job: Step-by-Step', desc: 'Walkthrough of creating job titles, matching candidate profiles, and publishing listings.', readTime: '6 min read' },
    { id: 'art6', cat: 'started', title: 'Comparing Pricing Plans: Which One is Right?', desc: 'Discover differences between Starter, Professional, and Premium enterprise packages.', readTime: '5 min read' }
  ];

  // Filter FAQs
  const filteredFaqs = faqs.filter(faq => {
    const matchesCat = faqCategory === 'all' || faq.cat === faqCategory;
    const matchesSearch = searchQuery === '' || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // Filter articles
  const filteredArticles = popularArticles.filter(art => {
    return articleFilter === 'all' || art.cat === articleFilter;
  });

  // Filter tickets
  const filteredTickets = tickets.filter(t => {
    const matchesStatus = ticketStatusFilter === 'all' || t.status === ticketStatusFilter;
    const matchesPriority = ticketPriorityFilter === 'all' || t.priority === ticketPriorityFilter;
    const matchesSearch = !ticketSearchQuery.trim() ||
      t.ticketId?.toLowerCase().includes(ticketSearchQuery.toLowerCase()) ||
      t.subject?.toLowerCase().includes(ticketSearchQuery.toLowerCase()) ||
      t.category?.toLowerCase().includes(ticketSearchQuery.toLowerCase()) ||
      t.message?.toLowerCase().includes(ticketSearchQuery.toLowerCase());
    return matchesStatus && matchesPriority && matchesSearch;
  });

  // Active filter checks
  const hasActiveFaqFilters = Boolean(searchQuery || faqCategory !== 'all' || articleFilter !== 'all');
  const resetFaqFilters = () => {
    setSearchQuery('');
    setFaqCategory('all');
    setArticleFilter('all');
  };

  // Helper for status badge styling
  const getStatusBadge = (status) => {
    switch (status) {
      case 'open':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-black bg-sky-50 text-sky-700 border border-sky-200"><span className="h-1.5 w-1.5 rounded-full bg-sky-500 animate-pulse"></span>Open</span>;
      case 'in-progress':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-50 text-amber-700 border border-amber-200"><span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>In Progress</span>;
      case 'resolved':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200"><Check className="h-3 w-3" />Resolved</span>;
      case 'closed':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-black bg-slate-100 text-slate-600 border border-slate-200">Closed</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-slate-100 text-slate-600">{status}</span>;
    }
  };

  // Helper for priority badge styling
  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'Urgent':
        return <span className="px-2 py-0.5 rounded text-[10px] font-black bg-rose-50 text-rose-600 border border-rose-200">Urgent</span>;
      case 'High':
        return <span className="px-2 py-0.5 rounded text-[10px] font-black bg-orange-50 text-orange-600 border border-orange-200">High</span>;
      case 'Medium':
        return <span className="px-2 py-0.5 rounded text-[10px] font-black bg-indigo-50 text-indigo-600 border border-indigo-200">Medium</span>;
      case 'Low':
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-black bg-slate-100 text-slate-600 border border-slate-200">Low</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Main Tabs */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-[#3f4254]">Support & Help Center</h1>
          <p className="mt-1 text-sm font-semibold text-slate-400">
            Browse knowledge base guides, submit support inquiries, or track your active tickets.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl shadow-inner shrink-0">
          <button
            onClick={() => setActiveTab('kb')}
            className={`px-3.5 py-2 text-xs font-extrabold rounded-lg transition ${
              activeTab === 'kb' ? 'bg-white text-[#6658dd] shadow-sm' : 'text-slate-500 hover:text-[#3f4254]'
            }`}
          >
            Help & FAQs
          </button>
          <button
            onClick={() => setActiveTab('tickets')}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-extrabold rounded-lg transition ${
              activeTab === 'tickets' ? 'bg-white text-[#6658dd] shadow-sm' : 'text-slate-500 hover:text-[#3f4254]'
            }`}
          >
            <span>My Tickets</span>
            {ticketStats.open + ticketStats.inProgress > 0 && (
              <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#6658dd] px-1.5 text-[10px] font-black text-white">
                {ticketStats.open + ticketStats.inProgress}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('new-ticket')}
            className={`flex items-center gap-1 px-3.5 py-2 text-xs font-extrabold rounded-lg transition ${
              activeTab === 'new-ticket' ? 'bg-white text-[#6658dd] shadow-sm' : 'text-slate-500 hover:text-[#3f4254]'
            }`}
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span>Submit Ticket</span>
          </button>
        </div>
      </div>

      {/* ===================== TAB 1: KNOWLEDGE BASE & FAQS ===================== */}
      {activeTab === 'kb' && (
        <div className="space-y-6">
          {/* HERO SEARCH BANNER */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#6658dd] via-indigo-600 to-purple-700 p-6 md:p-10 shadow-sm text-white">
            <div className="absolute right-0 top-0 h-48 w-48 -translate-y-12 translate-x-12 rounded-full bg-white/10 blur-xl pointer-events-none"></div>
            <div className="absolute left-1/3 bottom-0 h-28 w-28 translate-y-8 rounded-full bg-purple-400/20 blur-lg pointer-events-none"></div>

            <div className="relative z-10 grid gap-6 lg:grid-cols-12 lg:items-center">
              <div className="lg:col-span-8 space-y-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 text-white shrink-0 shadow-inner backdrop-blur-sm">
                    <LifeBuoy className="h-6 w-6" />
                  </span>
                  <div>
                    <h2 className="text-xl md:text-2xl font-black">How can we assist your hiring today?</h2>
                    <p className="text-xs md:text-sm font-semibold text-white/80 mt-0.5">
                      Instant answers, step-by-step documentation, or direct support ticket escalation.
                    </p>
                  </div>
                </div>

                <div className="relative max-w-lg">
                  <input
                    type="text"
                    className="w-full rounded-full border-0 bg-white pl-11 pr-4 py-3 text-sm font-semibold text-[#3f4254] placeholder-slate-400 shadow-md focus:outline-none focus:ring-2 focus:ring-purple-300"
                    placeholder="Search articles, guides, billing, FAQs..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                  <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                </div>

                {/* Quick search chips */}
                <div className="flex flex-wrap items-center gap-2 text-xs font-bold pt-1">
                  <span className="text-white/70 text-[11px]">Popular:</span>
                  <button onClick={() => setSearchQuery('post job')} className="rounded-lg bg-white/20 px-3 py-1 text-white hover:bg-white/30 transition">Posting Jobs</button>
                  <button onClick={() => setSearchQuery('unlock')} className="rounded-lg bg-white/20 px-3 py-1 text-white hover:bg-white/30 transition">Profile Unlocks</button>
                  <button onClick={() => setSearchQuery('invoice')} className="rounded-lg bg-white/20 px-3 py-1 text-white hover:bg-white/30 transition">GST Invoices</button>
                  <button onClick={() => setSearchQuery('2fa')} className="rounded-lg bg-white/20 px-3 py-1 text-white hover:bg-white/30 transition">2FA Security</button>
                  <ClearFilterButton active={hasActiveFaqFilters} onClick={resetFaqFilters} className="h-7 px-2.5 text-xs bg-white/20 text-white border-0 hover:bg-white/30" />
                </div>
              </div>

              <div className="hidden lg:col-span-4 lg:flex lg:flex-col lg:items-end text-right space-y-2">
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 max-w-xs text-left">
                  <div className="flex items-center gap-2 text-white font-extrabold text-xs mb-1">
                    <ShieldCheck className="h-4 w-4 text-emerald-300" />
                    <span>Dedicated Recruiter Desk</span>
                  </div>
                  <p className="text-[11px] text-white/80 font-medium">
                    Priority response within 2 hours for active employer subscription plans.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* HELP CATEGORY CARDS */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-extrabold text-[#3f4254]">Explore Knowledge Categories</h3>
              <span className="text-xs font-bold text-slate-400">Click any category for complete guides</span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Object.entries(CATEGORY_GUIDES).map(([key, cat], idx) => {
                const IconComponent = cat.icon;
                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedGuide(cat)}
                    className="group cursor-pointer rounded-xl border border-slate-100 bg-white p-5 text-center shadow-sm hover:border-[#6658dd]/30 hover:shadow-md transition duration-200"
                  >
                    <span className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-dashed transition group-hover:scale-110 duration-200 ${cat.color}`}>
                      <IconComponent className="h-6 w-6" />
                    </span>
                    <h5 className="font-extrabold text-sm text-[#3f4254] mb-1.5 group-hover:text-[#6658dd] transition">
                      {key}
                    </h5>
                    <p className="text-xs font-semibold text-slate-400 leading-relaxed mb-4 line-clamp-2">
                      {cat.desc}
                    </p>
                    <div className="inline-flex items-center gap-1 text-xs font-black text-[#6658dd] group-hover:translate-x-1 transition duration-200">
                      <span>View Full Guide</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* FAQ ACCORDION & POPULAR ARTICLES */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* FAQ Accordion */}
            <div className="lg:col-span-2 space-y-4">
              <div className="rounded-xl border border-slate-100 bg-white shadow-sm overflow-hidden">
                <div className="border-b border-slate-100 p-5 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h3 className="font-extrabold text-[#3f4254] text-base">Frequently Asked Questions</h3>
                    <p className="text-xs font-semibold text-slate-400 mt-0.5">Quick solutions to common questions.</p>
                  </div>

                  {/* Category filters */}
                  <div className="flex gap-1.5 shrink-0 bg-slate-100 p-1 rounded-lg text-xs font-bold text-slate-500">
                    {[
                      { id: 'all', label: 'All' },
                      { id: 'general', label: 'General' },
                      { id: 'billing', label: 'Billing' },
                      { id: 'technical', label: 'Technical' }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setFaqCategory(tab.id)}
                        className={`px-3 py-1 rounded-md transition ${
                          faqCategory === tab.id ? 'bg-white text-[#3f4254] font-extrabold shadow-sm' : 'hover:text-[#3f4254]'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  {filteredFaqs.length > 0 ? (
                    filteredFaqs.map(faq => (
                      <div key={faq.id} className="rounded-lg border border-slate-100 overflow-hidden">
                        <button
                          onClick={() => setActiveFaq(activeFaq === faq.id ? '' : faq.id)}
                          className="w-full flex items-center justify-between p-4 text-left text-xs font-extrabold text-[#3f4254] bg-slate-50/40 hover:bg-slate-50 transition"
                        >
                          <span className="flex items-center gap-2.5">
                            <HelpCircle className="h-4.5 w-4.5 text-[#6658dd] shrink-0" />
                            <span>{faq.question}</span>
                          </span>
                          {activeFaq === faq.id ? (
                            <ChevronUp className="h-4 w-4 text-slate-400" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-slate-400" />
                          )}
                        </button>
                        {activeFaq === faq.id && (
                          <div className="p-4 border-t border-slate-100 text-xs font-semibold text-slate-500 leading-relaxed bg-white">
                            {faq.answer}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-slate-400 font-semibold text-xs">
                      No FAQs found matching &quot;{searchQuery}&quot;. Try another term or submit a support ticket.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Popular Articles column */}
            <div className="lg:col-span-1">
              <div className="rounded-xl border border-slate-100 bg-white shadow-sm overflow-hidden h-full flex flex-col">
                <div className="border-b border-slate-100 p-5 bg-slate-50/60">
                  <h3 className="font-extrabold text-[#3f4254] text-base">Popular Help Articles</h3>
                  <p className="text-xs font-semibold text-slate-400 mt-0.5">Recommended recruiter guides.</p>

                  <div className="flex flex-wrap gap-1.5 mt-3 text-[10px] font-black text-slate-500">
                    {[
                      { id: 'all', label: 'All' },
                      { id: 'started', label: 'Getting Started' },
                      { id: 'jobs', label: 'Jobs' },
                      { id: 'account', label: 'Account' }
                    ].map(filter => (
                      <button
                        key={filter.id}
                        onClick={() => setArticleFilter(filter.id)}
                        className={`px-2.5 py-1 rounded border transition ${
                          articleFilter === filter.id ? 'bg-indigo-50 border-indigo-200 text-[#6658dd]' : 'bg-white border-slate-100 hover:bg-slate-50'
                        }`}
                      >
                        {filter.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-5 divide-y divide-slate-100 flex-grow">
                  {filteredArticles.map((art, idx) => (
                    <div
                      key={art.id}
                      onClick={() => setSelectedArticle(ARTICLE_DETAILS[art.id])}
                      className={`py-3.5 space-y-1 cursor-pointer group ${idx === 0 ? 'pt-0' : ''}`}
                    >
                      <div className="flex items-center justify-between text-[10px] font-black">
                        <span className="uppercase text-[#6658dd] bg-indigo-50 px-1.5 py-0.5 rounded">{art.cat}</span>
                        <span className="text-slate-400">{art.readTime}</span>
                      </div>
                      <h6 className="font-extrabold text-xs text-[#3f4254] group-hover:text-[#6658dd] transition">
                        {art.title}
                      </h6>
                      <p className="text-[11px] font-semibold text-slate-400 leading-normal line-clamp-2">
                        {art.desc}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="p-4 border-t border-slate-100 bg-slate-50/40 text-center">
                  <button
                    onClick={() => setActiveTab('new-ticket')}
                    className="text-xs font-black text-[#6658dd] hover:underline"
                  >
                    Didn&apos;t find an answer? Submit a Ticket &rarr;
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* CONTACT SUPPORT CHANNELS */}
          <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
            <h3 className="text-base font-extrabold text-[#3f4254] mb-4">Direct Contact Channels</h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Email Support */}
              <a
                href="mailto:support@jobswaale.com?subject=Employer%20Support%20Request"
                className="flex items-start gap-3 p-4 rounded-xl border border-slate-100 hover:border-indigo-100 hover:bg-slate-50/50 transition group"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-[#6658dd] shrink-0 group-hover:scale-105 transition">
                  <Mail className="h-5 w-5" />
                </span>
                <div>
                  <h6 className="font-extrabold text-xs text-[#3f4254]">Email Support</h6>
                  <span className="block text-xs font-black text-[#6658dd] mt-0.5">support@jobswaale.com</span>
                  <p className="text-[11px] font-semibold text-slate-400 mt-1">Reply within 24 hours</p>
                </div>
              </a>

              {/* Live Chat / WhatsApp */}
              <a
                href="https://wa.me/919800123456?text=Hello%20JobsWaale%20Support%2C%20I%20need%20assistance%20with%20my%20employer%20account."
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 p-4 rounded-xl border border-slate-100 hover:border-emerald-100 hover:bg-slate-50/50 transition group"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 shrink-0 group-hover:scale-105 transition">
                  <MessageSquare className="h-5 w-5" />
                </span>
                <div>
                  <h6 className="font-extrabold text-xs text-[#3f4254]">Live Support Chat</h6>
                  <span className="block text-xs font-black text-emerald-600 mt-0.5">Start WhatsApp Chat</span>
                  <p className="text-[11px] font-semibold text-slate-400 mt-1">Instant support advisor</p>
                </div>
              </a>

              {/* Working Hours */}
              <div className="flex items-start gap-3 p-4 rounded-xl border border-slate-100 bg-slate-50/30">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 shrink-0">
                  <Clock className="h-5 w-5" />
                </span>
                <div>
                  <h6 className="font-extrabold text-xs text-[#3f4254]">Support Hours</h6>
                  <span className="block text-xs font-black text-amber-600 mt-0.5">24/7 / 365 Days</span>
                  <p className="text-[11px] font-semibold text-slate-400 mt-1">Always available for employers</p>
                </div>
              </div>

              {/* Phone Channel */}
              <a
                href="tel:+919800123456"
                className="flex items-start gap-3 p-4 rounded-xl border border-slate-100 hover:border-rose-100 hover:bg-slate-50/50 transition group"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600 shrink-0 group-hover:scale-105 transition">
                  <Phone className="h-5 w-5" />
                </span>
                <div>
                  <h6 className="font-extrabold text-xs text-[#3f4254]">Phone Helpline</h6>
                  <span className="block text-xs font-black text-rose-600 mt-0.5">+91-9800-123-456</span>
                  <p className="text-[11px] font-semibold text-slate-400 mt-1">Mon-Sat, 9AM - 8PM IST</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ===================== TAB 2: MY TICKETS (HISTORY & STATUS) ===================== */}
      {activeTab === 'tickets' && (
        <div className="space-y-6">
          {/* Summary stats row */}
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
            <div
              onClick={() => setTicketStatusFilter('all')}
              className={`cursor-pointer rounded-xl border p-4 transition ${
                ticketStatusFilter === 'all' ? 'border-[#6658dd] bg-indigo-50/40 shadow-sm' : 'border-slate-100 bg-white hover:border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-400">Total Tickets</span>
                <Inbox className="h-4 w-4 text-[#6658dd]" />
              </div>
              <p className="text-2xl font-black text-[#3f4254] mt-2">{ticketStats.total}</p>
            </div>

            <div
              onClick={() => setTicketStatusFilter('open')}
              className={`cursor-pointer rounded-xl border p-4 transition ${
                ticketStatusFilter === 'open' ? 'border-sky-500 bg-sky-50/40 shadow-sm' : 'border-slate-100 bg-white hover:border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-400">Open Tickets</span>
                <LifeBuoy className="h-4 w-4 text-sky-500" />
              </div>
              <p className="text-2xl font-black text-sky-600 mt-2">{ticketStats.open}</p>
            </div>

            <div
              onClick={() => setTicketStatusFilter('in-progress')}
              className={`cursor-pointer rounded-xl border p-4 transition ${
                ticketStatusFilter === 'in-progress' ? 'border-amber-500 bg-amber-50/40 shadow-sm' : 'border-slate-100 bg-white hover:border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-400">In Progress</span>
                <Clock className="h-4 w-4 text-amber-500" />
              </div>
              <p className="text-2xl font-black text-amber-600 mt-2">{ticketStats.inProgress}</p>
            </div>

            <div
              onClick={() => setTicketStatusFilter('resolved')}
              className={`cursor-pointer rounded-xl border p-4 transition ${
                ticketStatusFilter === 'resolved' ? 'border-emerald-500 bg-emerald-50/40 shadow-sm' : 'border-slate-100 bg-white hover:border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-400">Resolved</span>
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              </div>
              <p className="text-2xl font-black text-emerald-600 mt-2">{ticketStats.resolved}</p>
            </div>

            <div
              onClick={() => setTicketStatusFilter('closed')}
              className={`cursor-pointer rounded-xl border p-4 transition ${
                ticketStatusFilter === 'closed' ? 'border-slate-400 bg-slate-50 shadow-sm' : 'border-slate-100 bg-white hover:border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-400">Closed</span>
                <X className="h-4 w-4 text-slate-500" />
              </div>
              <p className="text-2xl font-black text-slate-600 mt-2">{ticketStats.closed}</p>
            </div>
          </div>

          {/* Filter and search bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search tickets by ID or title..."
                  className="rounded-lg border border-slate-200 pl-9 pr-3 py-1.5 text-xs font-semibold text-[#3f4254] outline-none focus:border-[#6658dd] w-64"
                  value={ticketSearchQuery}
                  onChange={e => setTicketSearchQuery(e.target.value)}
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              </div>

              {/* Status dropdown filter */}
              <select
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-[#3f4254] bg-white outline-none focus:border-[#6658dd]"
                value={ticketStatusFilter}
                onChange={e => setTicketStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="open">Open</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>

              {/* Priority dropdown filter */}
              <select
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-[#3f4254] bg-white outline-none focus:border-[#6658dd]"
                value={ticketPriorityFilter}
                onChange={e => setTicketPriorityFilter(e.target.value)}
              >
                <option value="all">All Priorities</option>
                <option value="Urgent">Urgent</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={fetchTickets}
                disabled={loadingTickets}
                className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loadingTickets ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>

              <button
                onClick={() => setActiveTab('new-ticket')}
                className="flex items-center gap-1 rounded-lg bg-[#6658dd] px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-[#5848d8] transition"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                <span>New Ticket</span>
              </button>
            </div>
          </div>

          {/* Ticket list */}
          <div className="rounded-xl border border-slate-100 bg-white shadow-sm overflow-hidden">
            {loadingTickets ? (
              <div className="p-12 text-center text-slate-400">
                <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-[#6658dd]" />
                <p className="text-xs font-bold">Loading support tickets...</p>
              </div>
            ) : filteredTickets.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {filteredTickets.map(ticket => {
                  const responsesCount = ticket.responses?.length || 0;
                  const formattedDate = ticket.createDate
                    ? new Date(ticket.createDate).toLocaleDateString('en-US', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : 'Recent';

                  return (
                    <div
                      key={ticket._id}
                      className="p-5 hover:bg-slate-50/60 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
                          <span className="font-mono text-xs font-black text-[#6658dd] bg-indigo-50 px-2 py-0.5 rounded">
                            #{ticket.ticketId || ticket._id.slice(-6).toUpperCase()}
                          </span>
                          {getStatusBadge(ticket.status)}
                          {getPriorityBadge(ticket.priority)}
                          <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                            {ticket.category || 'General'}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-400 ml-auto md:ml-2">
                            {formattedDate}
                          </span>
                        </div>

                        <h4 className="font-extrabold text-sm text-[#3f4254] truncate">
                          {ticket.subject}
                        </h4>

                        <p className="text-xs font-semibold text-slate-400 line-clamp-1">
                          {ticket.message}
                        </p>

                        <div className="flex items-center gap-3 pt-1 text-[11px] font-bold text-slate-400">
                          {responsesCount > 0 && (
                            <span className="flex items-center gap-1 text-[#6658dd]">
                              <MessageCircle className="h-3.5 w-3.5" />
                              <span>{responsesCount} {responsesCount === 1 ? 'message' : 'messages'}</span>
                            </span>
                          )}
                          {ticket.attachment && (
                            <span className="flex items-center gap-1 text-slate-500">
                              <Paperclip className="h-3.5 w-3.5" />
                              <span>{ticket.attachmentOriginalName || 'Attachment attached'}</span>
                            </span>
                          )}
                          {ticket.adminReply && (
                            <span className="flex items-center gap-1 text-emerald-600">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span>Admin replied</span>
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                        <button
                          onClick={() => setSelectedTicketDetail(ticket)}
                          className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-[#3f4254] hover:bg-slate-50 transition"
                        >
                          <Eye className="h-3.5 w-3.5 text-slate-400" />
                          <span>View Thread</span>
                        </button>

                        {ticket.status !== 'closed' && (
                          <button
                            onClick={() => handleCloseTicket(ticket._id)}
                            className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-bold text-slate-500 hover:text-rose-600 hover:border-rose-200 transition"
                            title="Mark ticket as closed"
                          >
                            Close
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-12 text-center space-y-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-[#6658dd] mx-auto">
                  <Inbox className="h-6 w-6" />
                </div>
                <h4 className="font-extrabold text-sm text-[#3f4254]">No Support Tickets Found</h4>
                <p className="text-xs font-semibold text-slate-400 max-w-sm mx-auto">
                  {ticketSearchQuery || ticketStatusFilter !== 'all'
                    ? 'No tickets matched your current search or filter criteria.'
                    : 'You have not submitted any support tickets yet. Need help? Submit your first ticket.'}
                </p>
                <button
                  onClick={() => setActiveTab('new-ticket')}
                  className="rounded-lg bg-[#6658dd] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#5848d8] transition inline-flex items-center gap-1.5"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>Submit a New Ticket</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================== TAB 3: SUBMIT NEW TICKET ===================== */}
      {activeTab === 'new-ticket' && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Form container */}
          <div className="lg:col-span-2">
            <div className="rounded-xl border border-slate-100 bg-white shadow-sm overflow-hidden">
              <div className="border-b border-slate-100 p-5 bg-slate-50/60">
                <h3 className="font-extrabold text-[#3f4254] text-base">Submit Support Ticket</h3>
                <p className="text-xs font-semibold text-slate-400 mt-0.5">
                  Describe your question or technical issue. Our support engineering desk will respond shortly.
                </p>
              </div>

              {ticketSuccessMsg && (
                <div className="m-5 flex items-center gap-2.5 rounded-lg bg-emerald-50 p-4 text-xs font-bold text-emerald-800 border border-emerald-200">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                  <span>{ticketSuccessMsg}</span>
                </div>
              )}

              {ticketErrorMsg && (
                <div className="m-5 flex items-center gap-2.5 rounded-lg bg-rose-50 p-4 text-xs font-bold text-rose-800 border border-rose-200">
                  <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
                  <span>{ticketErrorMsg}</span>
                </div>
              )}

              <form onSubmit={handleTicketSubmit} className="p-5 space-y-4 text-xs font-bold text-slate-600">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block mb-1 text-slate-700">Topic Category *</label>
                    <select
                      required
                      className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs text-[#3f4254] bg-white outline-none focus:border-[#6658dd]"
                      value={ticketForm.category}
                      onChange={e => setTicketForm({ ...ticketForm, category: e.target.value })}
                    >
                      <option value="Billing & Pricing">Billing & Pricing Query</option>
                      <option value="Job Posting Issues">Job Posting & Management</option>
                      <option value="Candidate & Resume Access">Candidate & Resume Access</option>
                      <option value="Interview & Messaging">Interview & Messaging System</option>
                      <option value="Account & Security">Account & Security Credentials</option>
                      <option value="System Bug / Feedback">Bug Report / Feature Request</option>
                      <option value="Other Inquiry">Other Inquiry</option>
                    </select>
                  </div>

                  <div>
                    <label className="block mb-1 text-slate-700">Priority Level *</label>
                    <select
                      required
                      className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs text-[#3f4254] bg-white outline-none focus:border-[#6658dd]"
                      value={ticketForm.priority}
                      onChange={e => setTicketForm({ ...ticketForm, priority: e.target.value })}
                    >
                      <option value="Low">Low - General inquiry</option>
                      <option value="Medium">Medium - Standard query</option>
                      <option value="High">High - Important hiring roadblock</option>
                      <option value="Urgent">Urgent - Critical / Blocking account</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block mb-1 text-slate-700">Your Registered Email</label>
                    <input
                      type="email"
                      disabled
                      className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs text-slate-500 bg-slate-50 outline-none"
                      value={user?.email || 'Logged-in Employer'}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block mb-1 text-slate-700">Subject Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="E.g. Unable to download candidate resume after unlock / Invoice discrepancy"
                      className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs text-[#3f4254] outline-none focus:border-[#6658dd]"
                      value={ticketForm.subject}
                      onChange={e => setTicketForm({ ...ticketForm, subject: e.target.value })}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block mb-1 text-slate-700">Explain Details *</label>
                    <textarea
                      rows="5"
                      required
                      placeholder="Please provide full details about the issue, steps to reproduce, or any specific job/candidate IDs involved..."
                      className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs text-[#3f4254] outline-none focus:border-[#6658dd]"
                      value={ticketForm.message}
                      onChange={e => setTicketForm({ ...ticketForm, message: e.target.value })}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block mb-1 text-slate-700">Attach Screenshot or Document (Optional, Max 5MB)</label>
                    <div className="flex items-center justify-between border border-dashed border-slate-200 rounded-lg px-4 py-3 bg-slate-50/50">
                      <div className="flex items-center gap-2 truncate">
                        <Paperclip className="h-4 w-4 text-slate-400 shrink-0" />
                        <span className="text-xs font-semibold text-slate-600 truncate">
                          {ticketForm.fileName ? ticketForm.fileName : 'No file chosen (PNG, JPG, PDF)'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {ticketForm.fileName && (
                          <button
                            type="button"
                            onClick={() => setTicketForm({ ...ticketForm, fileName: '', attachment: '' })}
                            className="text-xs text-rose-500 hover:underline font-bold"
                          >
                            Remove
                          </button>
                        )}
                        <label className="inline-flex items-center gap-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg px-3 py-1.5 cursor-pointer hover:bg-slate-50 transition shadow-sm text-xs font-extrabold">
                          <FileUp className="h-3.5 w-3.5 text-slate-500" />
                          <span>Browse</span>
                          <input
                            type="file"
                            className="hidden"
                            onChange={handleFileChange}
                            accept=".png,.jpg,.jpeg,.webp,.pdf"
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 flex items-center justify-between">
                  <p className="text-[11px] font-semibold text-slate-400">
                    A ticket confirmation ID will be issued immediately upon submission.
                  </p>
                  <button
                    type="submit"
                    disabled={submittingTicket}
                    className="rounded-lg bg-[#6658dd] px-5 py-2.5 text-xs font-black text-white shadow-sm hover:bg-[#5848d8] transition flex items-center gap-2 disabled:opacity-50"
                  >
                    {submittingTicket ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-3.5 w-3.5" />
                        <span>Submit Support Ticket</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Quick FAQ / Helper Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm space-y-3">
              <h4 className="font-extrabold text-sm text-[#3f4254] flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#6658dd]" />
                <span>Ticket Resolution SLA</span>
              </h4>
              <p className="text-xs font-semibold text-slate-400 leading-relaxed">
                Tickets are reviewed by our dedicated employer support specialists:
              </p>
              <ul className="text-xs font-bold text-slate-600 space-y-2 pt-1">
                <li className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                  <span className="flex items-center gap-1.5 text-rose-600"><span className="h-2 w-2 rounded-full bg-rose-500"></span>Urgent Priority</span>
                  <span className="font-semibold text-slate-400">&lt; 2 Hours</span>
                </li>
                <li className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                  <span className="flex items-center gap-1.5 text-orange-600"><span className="h-2 w-2 rounded-full bg-orange-500"></span>High Priority</span>
                  <span className="font-semibold text-slate-400">&lt; 6 Hours</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-600"><span className="h-2 w-2 rounded-full bg-slate-400"></span>Standard / Low</span>
                  <span className="font-semibold text-slate-400">&lt; 24 Hours</span>
                </li>
              </ul>
            </div>

            <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-5 shadow-sm space-y-2">
              <h5 className="font-extrabold text-xs text-[#6658dd] uppercase tracking-wider">Fastest Resolution Tip</h5>
              <p className="text-xs font-semibold text-slate-600 leading-relaxed">
                Attaching screenshots of error messages or specifying candidate names / Job IDs helps resolve inquiries on the first response!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ===================== MODAL 1: TICKET CONVERSATION DETAIL ===================== */}
      {selectedTicketDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-6 py-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold">
                  <span className="font-mono text-xs font-black text-[#6658dd] bg-indigo-50 px-2 py-0.5 rounded">
                    #{selectedTicketDetail.ticketId || selectedTicketDetail._id.slice(-6).toUpperCase()}
                  </span>
                  {getStatusBadge(selectedTicketDetail.status)}
                  {getPriorityBadge(selectedTicketDetail.priority)}
                </div>
                <h3 className="text-base font-extrabold text-[#3f4254]">
                  {selectedTicketDetail.subject}
                </h3>
              </div>
              <button
                onClick={() => setSelectedTicketDetail(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body / Conversation thread */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Category and meta info */}
              <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3 text-xs font-bold text-slate-500">
                <span>Category: <strong className="text-[#3f4254]">{selectedTicketDetail.category || 'General'}</strong></span>
                <span>Created: {new Date(selectedTicketDetail.createDate).toLocaleString()}</span>
              </div>

              {/* Original Message */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
                <div className="flex items-center justify-between text-xs font-extrabold text-[#3f4254] border-b border-slate-100 pb-2">
                  <span>Initial Inquiry</span>
                  <span className="text-slate-400 text-[11px] font-semibold">
                    {new Date(selectedTicketDetail.createDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-600 whitespace-pre-wrap leading-relaxed">
                  {selectedTicketDetail.message}
                </p>
                {selectedTicketDetail.attachment && (
                  <div className="pt-2">
                    <a
                      href={selectedTicketDetail.attachment}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6658dd] bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition"
                    >
                      <Paperclip className="h-3.5 w-3.5" />
                      <span>View Attached File / Screenshot</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
              </div>

              {/* Conversation Responses thread */}
              {selectedTicketDetail.responses && selectedTicketDetail.responses.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h5 className="text-xs font-black uppercase text-slate-400 tracking-wider">Conversation History</h5>
                  {selectedTicketDetail.responses.map((resp, i) => {
                    const isAdmin = resp.sender === 'admin';
                    return (
                      <div
                        key={i}
                        className={`rounded-xl p-4 text-xs ${
                          isAdmin
                            ? 'bg-indigo-50/70 border border-indigo-100 ml-4'
                            : 'bg-slate-50 border border-slate-100 mr-4'
                        }`}
                      >
                        <div className="flex items-center justify-between font-extrabold text-[#3f4254] mb-1.5">
                          <span className="flex items-center gap-1.5">
                            {isAdmin ? (
                              <>
                                <ShieldCheck className="h-4 w-4 text-[#6658dd]" />
                                <span className="text-[#6658dd]">JobsWaale Support Engineering</span>
                              </>
                            ) : (
                              <span>{resp.senderName || 'You (Employer)'}</span>
                            )}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-400">
                            {new Date(resp.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-slate-600 font-semibold whitespace-pre-wrap leading-relaxed">
                          {resp.message}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Admin Direct Reply if available */}
              {selectedTicketDetail.adminReply && (!selectedTicketDetail.responses || selectedTicketDetail.responses.length === 0) && (
                <div className="rounded-xl bg-indigo-50/70 border border-indigo-100 p-4 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-extrabold text-[#6658dd]">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="h-4 w-4 text-[#6658dd]" />
                      <span>JobsWaale Support Response</span>
                    </span>
                    {selectedTicketDetail.adminReplyAt && (
                      <span className="text-[11px] font-semibold text-slate-400">
                        {new Date(selectedTicketDetail.adminReplyAt).toLocaleString()}
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-semibold text-slate-700 whitespace-pre-wrap leading-relaxed">
                    {selectedTicketDetail.adminReply}
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer: Reply input and Close ticket */}
            <div className="border-t border-slate-100 bg-slate-50/50 p-4 space-y-3">
              {selectedTicketDetail.status !== 'closed' ? (
                <form onSubmit={handleReplySubmit} className="space-y-2">
                  <textarea
                    rows="2"
                    required
                    placeholder="Type a follow-up reply to support..."
                    className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-[#3f4254] outline-none focus:border-[#6658dd] bg-white"
                    value={replyMessage}
                    onChange={e => setReplyMessage(e.target.value)}
                  />
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => handleCloseTicket(selectedTicketDetail._id)}
                      className="text-xs font-bold text-slate-500 hover:text-rose-600 transition"
                    >
                      Mark Issue as Resolved / Close Ticket
                    </button>
                    <button
                      type="submit"
                      disabled={replySubmitting || !replyMessage.trim()}
                      className="rounded-lg bg-[#6658dd] px-4 py-2 text-xs font-black text-white shadow-sm hover:bg-[#5848d8] transition flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {replySubmitting ? (
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Send className="h-3.5 w-3.5" />
                      )}
                      <span>Send Reply</span>
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">This ticket has been marked as closed.</span>
                  <button
                    onClick={() => {
                      setReplyMessage('Reopening ticket: ');
                      // Setting reply will allow submitting to reopen
                    }}
                    className="text-xs font-black text-[#6658dd] hover:underline"
                  >
                    Need to reopen? Send a reply
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===================== MODAL 2: CATEGORY GUIDE MODAL ===================== */}
      {selectedGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="relative flex max-h-[90vh] w-full max-w-xl flex-col rounded-2xl bg-white shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-6 py-4">
              <div className="flex items-center gap-3">
                <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${selectedGuide.color}`}>
                  <selectedGuide.icon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-base font-extrabold text-[#3f4254]">{selectedGuide.title}</h3>
                  <p className="text-xs font-semibold text-slate-400">{selectedGuide.desc}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedGuide(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {selectedGuide.steps.map((step, idx) => (
                <div key={idx} className="rounded-xl border border-slate-100 p-4 bg-slate-50/40 space-y-1">
                  <h5 className="font-extrabold text-xs text-[#3f4254]">{step.title}</h5>
                  <p className="text-xs font-semibold text-slate-500 leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 p-4">
              <button
                onClick={() => setSelectedGuide(null)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
              >
                Close Guide
              </button>
              {selectedGuide.actionLink && (
                <a
                  href={selectedGuide.actionLink}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#6658dd] px-4 py-2 text-xs font-black text-white hover:bg-[#5848d8] transition shadow-sm"
                >
                  <span>{selectedGuide.actionText}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===================== MODAL 3: ARTICLE READER MODAL ===================== */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="relative flex max-h-[90vh] w-full max-w-xl flex-col rounded-2xl bg-white shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-6 py-4">
              <div>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase text-[#6658dd]">
                  <span>{selectedArticle.category}</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-400">{selectedArticle.readTime}</span>
                </div>
                <h3 className="text-base font-extrabold text-[#3f4254] mt-1">{selectedArticle.title}</h3>
              </div>
              <button
                onClick={() => setSelectedArticle(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="text-xs font-semibold text-slate-600 leading-relaxed whitespace-pre-wrap">
                {selectedArticle.content}
              </div>
            </div>

            <div className="flex items-center justify-end border-t border-slate-100 bg-slate-50/50 p-4">
              <button
                onClick={() => setSelectedArticle(null)}
                className="rounded-lg bg-[#6658dd] px-4 py-2 text-xs font-black text-white hover:bg-[#5848d8] transition shadow-sm"
              >
                Done Reading
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployerSupport;

