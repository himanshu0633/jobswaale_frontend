import { useState } from 'react';
import axios from 'axios';
import { BASE_API_URL } from '../../../context/AuthContext';

const getTokenHeaders = () => {
  const token = localStorage.getItem('publicToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};
import {
  LifeBuoy,
  Search,
  Rocket,
  Briefcase,
  FileText,
  CalendarCheck,
  CreditCard,
  Settings,
  Info,
  ChevronDown,
  ChevronUp,
  Mail,
  MessageSquare,
  Clock,
  Phone,
  ArrowRight,
  Send,
  HelpCircle,
  FileUp
} from 'lucide-react';

export const EmployerSupport = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFaq, setActiveFaq] = useState('faq1');
  const [faqCategory, setFaqCategory] = useState('all'); // all, billing, technical, general
  const [articleFilter, setArticleFilter] = useState('all'); // all, started, jobs, account
  
  // Ticket Form state
  const [ticketForm, setTicketForm] = useState({
    subject: '',
    priority: 'Medium',
    email: 'nitika@techcorpindia.com',
    message: '',
    fileName: ''
  });

  const categories = [
    { title: 'Getting Started', desc: 'Learn the basics of setting up your account and posting your first job.', icon: Rocket, color: 'bg-indigo-50 text-indigo-600 border-indigo-100', linkText: 'View Guides' },
    { title: 'Managing Jobs', desc: 'Create, edit, pause, and manage your job listings effectively.', icon: Briefcase, color: 'bg-emerald-50 text-emerald-600 border-emerald-100', linkText: 'View Guides' },
    { title: 'Applications & Screening', desc: 'Review, shortlist, and manage candidate applications efficiently.', icon: FileText, color: 'bg-sky-50 text-sky-600 border-sky-100', linkText: 'View Guides' },
    { title: 'Interviews & Selection', desc: 'Schedule interviews, track feedback, and make hiring decisions.', icon: CalendarCheck, color: 'bg-amber-50 text-amber-600 border-amber-100', linkText: 'View Guides' },
    { title: 'Billing & Subscription', desc: 'Manage your plan, payment methods, invoices, and billing history.', icon: CreditCard, color: 'bg-rose-50 text-rose-600 border-rose-100', linkText: 'Go to Billing', route: '#billing' },
    { title: 'Account & Settings', desc: 'Update your profile, security settings, and team management.', icon: Settings, color: 'bg-slate-50 text-slate-600 border-slate-100', linkText: 'Go to Settings', route: '#settings' }
  ];

  const faqs = [
    { id: 'faq1', cat: 'general', question: 'How do I post a new job?', answer: 'Go to the "Post a Job" section from the sidebar. Fill in the job title, description, department, requirements, and job location details. Once completed, click "Publish" to display it on the public jobs board.' },
    { id: 'faq2', cat: 'general', question: 'How do I review candidate applications?', answer: 'Navigate to "Applications" inside the menu. You can filter applicant pools by job title, active dates, or selection status. Click on a candidate to open their full resume preview, contact options, and screening details.' },
    { id: 'faq3', cat: 'general', question: 'How do I shortlist a candidate?', answer: 'While viewing an application, click the "Shortlist" button. This updates the candidate state and moves their details to the Shortlisted portal for simple access.' },
    { id: 'faq4', cat: 'general', question: 'How do I search for candidates?', answer: 'Use the "Search Candidates" sidebar tool to look up jobseeker accounts based on skills keywords, locations, or experience levels. You can then save resumes directly to your Talent Pool.' },
    
    { id: 'faq5', cat: 'billing', question: 'How do I upgrade my plan?', answer: 'Visit the "Subscription" tab in the sidebar, view packages inside the pricing grid, and click "Upgrade Now" on the package of your choice. Billing upgrades are processed instantly.' },
    { id: 'faq6', cat: 'billing', question: 'What payment methods are accepted?', answer: 'We support Visa, Mastercard, American Express, PayPal, and UPI options. Payment cards can be saved and deleted directly from the billing portal.' },
    { id: 'faq7', cat: 'billing', question: 'How do I cancel my subscription?', answer: 'Go to the billing portal and click "Cancel Subscription". Your features will remain active until the end of your paid billing cycle.' },
    { id: 'faq8', cat: 'billing', question: 'How do I download invoices?', answer: 'Billing statements are logged at the bottom of the "Subscription" dashboard in the "Billing History" table. Click "Download Invoice" to save invoices as PDFs.' },
    
    { id: 'faq9', cat: 'technical', question: 'How do I reset my password?', answer: 'Navigate to Settings -> Security tab. Enter your active password, enter your new passcode twice, and click "Update Password" to save changes securely.' },
    { id: 'faq10', cat: 'technical', question: 'How do I enable two-factor authentication (2FA)?', answer: 'Go to Settings -> Security tab. Toggle "Enable 2FA via Authenticator App" and scan the generated QR code with authenticator applications like Google Authenticator or Microsoft Authenticator.' },
    { id: 'faq11', cat: 'technical', question: 'Which browsers are supported?', answer: 'JobsWaale is compatible with Google Chrome, Firefox, Safari, and Microsoft Edge. We recommend keeping browsers updated for the best performance.' },
    { id: 'faq12', cat: 'technical', question: 'How do I add team members to my organization?', answer: 'Access Company Profile -> Team Members tab. Click "Add Team Member", write their name, role designation, and set access rights (Owner, Admin, Member) to issue invites.' }
  ];

  const popularArticles = [
    { id: 'art1', cat: 'started', title: 'Setting Up Your Company Profile', desc: 'Learn how to upload logos, add banner taglines, founder metrics, and verify your corporate details.', readTime: '4 min read' },
    { id: 'art2', cat: 'jobs', title: 'How to Write an Effective Job Description', desc: 'Tips and templates to write descriptions that attract high-quality candidates.', readTime: '5 min read' },
    { id: 'art3', cat: 'account', title: 'Understanding Your Invoice & Billing Cycles', desc: 'A complete breakdown of monthly plan limits, renewals, GST billing invoices, and payment logs.', readTime: '3 min read' },
    { id: 'art4', cat: 'account', title: 'Managing Team Members & Access Roles', desc: 'Invite recruiters to your team and set up appropriate Admin vs Member restrictions.', readTime: '4 min read' },
    { id: 'art5', cat: 'jobs', title: 'Posting Your First Job: Step-by-Step', desc: 'Walkthrough of creating job titles, matching candidate profiles, and publishing listings.', readTime: '6 min read' },
    { id: 'art6', cat: 'started', title: 'Comparing Pricing Plans: Which One is Right?', desc: 'Discover differences between Starter, Professional, and Premium enterprise packages.', readTime: '5 min read' }
  ];

  const handleTicketSubmit = async (e) => {
    e.preventDefault();
    if (!ticketForm.subject || !ticketForm.message) {
      alert('Please fill out the subject and message fields.');
      return;
    }
    try {
      await axios.post(`${BASE_API_URL}/employer/support/ticket`, {
        subject: ticketForm.subject,
        priority: ticketForm.priority,
        message: ticketForm.message,
        attachment: ticketForm.fileName
      }, { headers: getTokenHeaders() });
      
      alert('Support ticket submitted successfully!');
      
      setTicketForm({
        subject: '',
        priority: 'Medium',
        email: 'nitika@techcorpindia.com',
        message: '',
        fileName: ''
      });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit support ticket.');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setTicketForm({ ...ticketForm, fileName: file.name });
    }
  };

  // Filter FAQs based on query or category
  const filteredFaqs = faqs.filter(faq => {
    const matchesCat = faqCategory === 'all' || faq.cat === faqCategory;
    const matchesSearch = searchQuery === '' || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const filteredArticles = popularArticles.filter(art => {
    return articleFilter === 'all' || art.cat === articleFilter;
  });

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-[#3f4254]">Support Center</h1>
          <p className="mt-1 text-sm font-semibold text-slate-400">Search our knowledge base, browse common guides, or reach out to our team.</p>
        </div>
        <div className="flex items-center gap-2 text-sm font-bold text-slate-400">
          <span className="text-[#3f4254]">JobsWaale</span>
          <span className="text-slate-300">/</span>
          <span className="text-[#6658dd]">Support Center</span>
        </div>
      </div>

      {/* SECTION 1: HERO SEARCH BANNER */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 p-6 md:p-10 shadow-sm">
        {/* Abstract shapes */}
        <div className="absolute right-0 top-0 h-40 w-40 -translate-y-12 translate-x-12 rounded-full bg-white/10 blur-xl"></div>
        <div className="absolute left-1/3 bottom-0 h-24 w-24 translate-y-8 rounded-full bg-purple-400/20 blur-lg"></div>

        <div className="relative z-10 grid gap-6 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-white shrink-0 shadow-inner">
                <LifeBuoy className="h-6 w-6" />
              </span>
              <h2 className="text-xl md:text-2xl font-extrabold text-white">How can we help you?</h2>
            </div>
            <p className="text-sm font-semibold text-white/80 max-w-lg">
              Search for immediate solutions below or view specific category manuals.
            </p>
            <div className="relative max-w-md">
              <input
                type="text"
                className="w-full rounded-full border-0 bg-white pl-11 pr-4 py-3 text-sm font-semibold text-[#3f4254] placeholder-slate-400 shadow focus:outline-none focus:ring-2 focus:ring-purple-400"
                placeholder="Search articles, guides, FAQs..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            </div>
            
            {/* Quick search chips */}
            <div className="flex flex-wrap gap-2 text-xs font-bold">
              <button onClick={() => setSearchQuery('post job')} className="rounded bg-white/20 px-3 py-1.5 text-white hover:bg-white/30 transition">Posting Jobs</button>
              <button onClick={() => setSearchQuery('invoice')} className="rounded bg-white/20 px-3 py-1.5 text-white hover:bg-white/30 transition">Invoices</button>
              <button onClick={() => setSearchQuery('2fa')} className="rounded bg-white/20 px-3 py-1.5 text-white hover:bg-white/30 transition">2FA</button>
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="rounded bg-rose-500 px-3 py-1.5 text-white font-extrabold shadow-sm transition">Reset Search</button>
              )}
            </div>
          </div>
          
          <div className="hidden lg:col-span-4 lg:flex lg:justify-end">
            <img src="/assets/images/email-send.png" alt="Support" className="h-32 object-contain opacity-85 shrink-0" onError={(e) => { e.target.style.display = 'none'; }} />
          </div>
        </div>
      </div>

      {/* SECTION 2: HELP CATEGORY CARDS */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat, idx) => (
          <div key={idx} className="group rounded-lg border border-slate-100 bg-white p-5 text-center shadow-sm hover:border-indigo-100 hover:shadow-md transition duration-200">
            <span className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-dashed transition group-hover:scale-110 duration-200 ${cat.color}`}>
              <cat.icon className="h-6 w-6" />
            </span>
            <h5 className="font-extrabold text-sm text-[#3f4254] mb-1.5">{cat.title}</h5>
            <p className="text-xs font-semibold text-slate-400 leading-relaxed mb-4">{cat.desc}</p>
            <a
              href={cat.route || '#'}
              onClick={(e) => {
                if(!cat.route) {
                  e.preventDefault();
                  alert(`Navigating to ${cat.title} documentation...`);
                }
              }}
              className="inline-flex items-center gap-1 text-xs font-black text-indigo-600 hover:text-indigo-700 transition"
            >
              {cat.linkText}
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
        ))}
      </div>

      {/* SECTION 3: FAQ ACCORDION & POPULAR ARTICLES */}
      <div className="grid gap-6 lg:grid-cols-3">
        
        {/* FAQs accordion block */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-lg border border-slate-100 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-slate-100 p-5 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="font-extrabold text-[#3f4254] text-base">Frequently Asked Questions</h3>
                <p className="text-xs font-semibold text-slate-400 mt-1">Quick answers to common questions about using JobsWaale.</p>
              </div>
              
              {/* Category tabs */}
              <div className="flex gap-1.5 shrink-0 bg-slate-100 p-1 rounded-lg text-[10px] font-bold text-slate-500">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'general', label: 'General' },
                  { id: 'billing', label: 'Billing' },
                  { id: 'technical', label: 'Technical' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setFaqCategory(tab.id)}
                    className={`px-2.5 py-1 rounded ${faqCategory === tab.id ? 'bg-white text-[#3f4254] font-extrabold shadow-sm' : 'hover:text-[#3f4254]'}`}
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
                      className="w-full flex items-center justify-between p-4 text-left text-xs font-extrabold text-[#3f4254] bg-slate-50/30 hover:bg-slate-50 transition"
                    >
                      <span className="flex items-center gap-2">
                        <HelpCircle className="h-4.5 w-4.5 text-indigo-500 shrink-0" />
                        {faq.question}
                      </span>
                      {activeFaq === faq.id ? (
                        <ChevronUp className="h-4 w-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-slate-400" />
                      )}
                    </button>
                    {activeFaq === faq.id && (
                      <div className="p-4 border-t border-slate-100 text-xs font-semibold text-slate-400 leading-relaxed bg-white">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-slate-400 font-semibold text-xs">
                  No FAQs found matching your search.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Popular Articles column */}
        <div className="lg:col-span-1">
          <div className="rounded-lg border border-slate-100 bg-white shadow-sm overflow-hidden h-full flex flex-col">
            <div className="border-b border-slate-100 p-5 bg-slate-50/50">
              <h3 className="font-extrabold text-[#3f4254] text-base">Popular Articles</h3>
              <p className="text-xs font-semibold text-slate-400 mt-1">Useful guides and tips.</p>
              
              {/* Popular article filters */}
              <div className="flex flex-wrap gap-1.5 mt-3 text-[10px] font-extrabold text-slate-500">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'started', label: 'Started' },
                  { id: 'jobs', label: 'Jobs' },
                  { id: 'account', label: 'Account' }
                ].map(filter => (
                  <button
                    key={filter.id}
                    onClick={() => setArticleFilter(filter.id)}
                    className={`px-2.5 py-1 rounded border ${articleFilter === filter.id ? 'bg-indigo-50 border-indigo-100 text-indigo-600' : 'bg-white border-slate-100 hover:bg-slate-50'}`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-5 divide-y divide-slate-100 flex-grow">
              {filteredArticles.map((art, idx) => (
                <div key={art.id} className={`py-3.5 space-y-1 ${idx === 0 ? 'pt-0' : ''}`}>
                  <div className="flex items-center justify-between text-[10px] font-black">
                    <span className="uppercase text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">{art.cat}</span>
                    <span className="text-slate-400">{art.readTime}</span>
                  </div>
                  <h6 className="font-extrabold text-xs text-[#3f4254] hover:text-indigo-600 cursor-pointer transition">{art.title}</h6>
                  <p className="text-[11px] font-semibold text-slate-400 leading-normal line-clamp-2">{art.desc}</p>
                </div>
              ))}
            </div>
            
            <div className="p-4 border-t border-slate-100 bg-slate-50/40 text-center">
              <button onClick={() => alert('Opening full documentation index...')} className="text-xs font-black text-indigo-600 hover:underline">
                View All Documentation
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 4: CONTACT SUPPORT TICKET FORM */}
      <div className="grid gap-6 lg:grid-cols-3" id="contact">
        
        {/* Support Ticket form */}
        <div className="lg:col-span-2">
          <div className="rounded-lg border border-slate-100 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-slate-100 p-5 bg-slate-50/50">
              <h3 className="font-extrabold text-[#3f4254] text-base">Send Us a Message</h3>
              <p className="text-xs font-semibold text-slate-400 mt-1">Fill out the form below and our support team will get back to you.</p>
            </div>
            <form onSubmit={handleTicketSubmit} className="p-5 space-y-4 text-xs font-bold text-slate-500">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block mb-1 text-slate-600">Subject Topic *</label>
                  <select
                    required
                    className="w-full rounded border border-slate-200 px-3 py-2 text-xs text-[#3f4254] bg-white outline-none focus:border-indigo-500"
                    value={ticketForm.subject}
                    onChange={e => setTicketForm({ ...ticketForm, subject: e.target.value })}
                  >
                    <option value="">Select a topic...</option>
                    <option value="Billing & Pricing">Billing & Pricing Query</option>
                    <option value="Job Posting Issue">Job Posting Issues</option>
                    <option value="Resume Access Problems">Resume Access Problems</option>
                    <option value="Security & Team Credentials">Security & Login Credentials</option>
                    <option value="System Bug / Suggestion">System Bug / Feedback</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1 text-slate-600">Priority Level</label>
                  <select
                    className="w-full rounded border border-slate-200 px-3 py-2 text-xs text-[#3f4254] bg-white outline-none focus:border-indigo-500"
                    value={ticketForm.priority}
                    onChange={e => setTicketForm({ ...ticketForm, priority: e.target.value })}
                  >
                    <option value="Low">Low - General inquiry</option>
                    <option value="Medium">Medium - Standard issue</option>
                    <option value="High">High - Blocking action</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1 text-slate-600">Your Email Address</label>
                  <input
                    type="email"
                    disabled
                    className="w-full rounded border border-slate-200 px-3 py-2 text-xs text-slate-400 bg-slate-50 outline-none"
                    value={ticketForm.email}
                  />
                </div>
                <div>
                  <label className="block mb-1 text-slate-600">Attach Screenshot / File (Optional)</label>
                  <div className="relative flex items-center justify-between border border-dashed border-slate-200 rounded px-3 py-1.5 bg-slate-50/40">
                    <span className="text-[11px] font-semibold text-slate-400 truncate max-w-[150px]">
                      {ticketForm.fileName || 'No file selected'}
                    </span>
                    <label className="inline-flex items-center gap-1 bg-white border border-slate-200 text-slate-600 rounded px-2.5 py-1 cursor-pointer hover:bg-slate-50 transition shadow-sm text-[10px] font-extrabold shrink-0">
                      <FileUp className="h-3.5 w-3.5 text-slate-400" />
                      Browse
                      <input type="file" className="hidden" onChange={handleFileChange} accept=".png,.jpg,.jpeg,.pdf" />
                    </label>
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className="block mb-1 text-slate-600">Explain details *</label>
                  <textarea
                    rows="4"
                    required
                    placeholder="Describe your issue or question in details..."
                    className="w-full rounded border border-slate-200 px-3 py-2 text-xs text-[#3f4254] outline-none focus:border-indigo-500"
                    value={ticketForm.message}
                    onChange={e => setTicketForm({ ...ticketForm, message: e.target.value })}
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="rounded bg-[#6658dd] px-4.5 py-2.5 text-xs font-extrabold text-white shadow-sm hover:bg-[#5848d8] transition flex items-center gap-1.5"
                >
                  <Send className="h-3.5 w-3.5" />
                  Submit Support Ticket
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Support Channels side panel */}
        <div className="lg:col-span-1 space-y-4">
          
          {/* Email channel */}
          <div className="rounded-lg border border-slate-100 bg-white p-5 shadow-sm flex gap-3.5 items-start">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 shrink-0 mt-0.5">
              <Mail className="h-5.5 w-5.5" />
            </span>
            <div className="text-xs font-bold text-[#3f4254]">
              <h6 className="font-extrabold text-sm text-[#3f4254]">Email Support</h6>
              <span className="block text-indigo-600 font-extrabold mt-1">support@jobswaale.com</span>
              <p className="text-[11px] font-semibold text-slate-400 mt-1">Response within 24 hours.</p>
            </div>
          </div>

          {/* Chat channel */}
          <div className="rounded-lg border border-slate-100 bg-white p-5 shadow-sm flex gap-3.5 items-start">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 shrink-0 mt-0.5">
              <MessageSquare className="h-5.5 w-5.5" />
            </span>
            <div className="text-xs font-bold text-[#3f4254] space-y-1">
              <h6 className="font-extrabold text-sm text-[#3f4254]">Live Chat</h6>
              <p className="text-[11px] font-semibold text-slate-400 mt-0.5">Chat with our help desk advisors.</p>
              <button onClick={() => alert('Connecting to support chat...')} className="inline-flex h-7 items-center justify-center rounded bg-emerald-500 px-3 text-[10px] font-black text-white hover:bg-emerald-600 transition">
                Start Chat
              </button>
            </div>
          </div>

          {/* Response timing */}
          <div className="rounded-lg border border-slate-100 bg-white p-5 shadow-sm flex gap-3.5 items-start">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-amber-600 shrink-0 mt-0.5">
              <Clock className="h-5.5 w-5.5" />
            </span>
            <div className="text-xs font-bold text-[#3f4254]">
              <h6 className="font-extrabold text-sm text-[#3f4254]">Working Hours</h6>
              <span className="block text-slate-500 mt-1">24/7/365</span>
              <p className="text-[11px] font-semibold text-slate-400 mt-1">Technical team active daily.</p>
            </div>
          </div>

          {/* Phone channel */}
          <div className="rounded-lg border border-slate-100 bg-white p-5 shadow-sm flex gap-3.5 items-start">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-50 text-rose-600 shrink-0 mt-0.5">
              <Phone className="h-5.5 w-5.5" />
            </span>
            <div className="text-xs font-bold text-[#3f4254]">
              <h6 className="font-extrabold text-sm text-[#3f4254]">Phone Support</h6>
              <span className="block text-rose-600 font-extrabold mt-1">+91-9800-123-456</span>
              <p className="text-[11px] font-semibold text-slate-400 mt-1">Available for Premium plans.</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default EmployerSupport;
