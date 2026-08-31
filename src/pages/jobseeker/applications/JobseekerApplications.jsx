import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Briefcase,
  CalendarCheck,
  CheckCircle,
  Eye,
  MapPin,
  MessageCircle,
  Send,
  XCircle,
  Award,
  Clock,
  UserCheck,
  ExternalLink,
  Loader,
  X
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { BASE_API_URL } from '../../../context/AuthContext';
import PageSkeleton from '../../../components/SkeletonLoader';

const statConfig = [
  { key: 'total', label: 'Total Applied', icon: Briefcase, tone: 'bg-blue-50 text-blue-600' },
  { key: 'applied', label: 'Applied', icon: Send, tone: 'bg-sky-50 text-sky-600' },
  { key: 'reviewed', label: 'Reviewed', icon: Eye, tone: 'bg-cyan-50 text-cyan-600' },
  { key: 'shortlisted', label: 'Shortlisted', icon: CheckCircle, tone: 'bg-emerald-50 text-emerald-600' },
  { key: 'interview', label: 'Interview', icon: CalendarCheck, tone: 'bg-amber-50 text-amber-600' },
  { key: 'onhold', label: 'Hold for Interview', icon: Clock, tone: 'bg-orange-50 text-orange-500' },
  { key: 'selected', label: 'Selected', icon: Award, tone: 'bg-emerald-100 text-emerald-800' },
  { key: 'offered', label: 'Offered', icon: Award, tone: 'bg-blue-50 text-blue-600' },
  { key: 'hired', label: 'Hired', icon: UserCheck, tone: 'bg-teal-50 text-teal-600' },
  { key: 'rejected', label: 'Rejected', icon: XCircle, tone: 'bg-rose-50 text-rose-600' }
];

const filterTabs = [
  { key: 'all', label: 'All' },
  { key: 'applied', label: 'Applied' },
  { key: 'reviewed', label: 'Reviewed' },
  { key: 'shortlisted', label: 'Shortlisted' },
  { key: 'interview', label: 'Interview' },
  { key: 'onhold', label: 'Hold for Interview' },
  { key: 'selected', label: 'Selected' },
  { key: 'offered', label: 'Offered' },
  { key: 'hired', label: 'Hired' },
  { key: 'rejected', label: 'Rejected' }
];

const statusStyles = {
  applied: 'bg-blue-50 text-blue-600',
  pending: 'bg-amber-50 text-amber-600',
  reviewed: 'bg-cyan-50 text-cyan-600',
  shortlisted: 'bg-emerald-50 text-emerald-600',
  interview: 'bg-indigo-50 text-indigo-600',
  onhold: 'bg-orange-50 text-orange-500',
  'on hold': 'bg-orange-50 text-orange-500',
  offered: 'bg-emerald-100 text-emerald-800',
  selected: 'bg-emerald-50 text-emerald-600',
  'offer sent': 'bg-blue-50 text-blue-600',
  'offer accepted': 'bg-cyan-50 text-cyan-600',
  hired: 'bg-emerald-50 text-emerald-600',
  'offer declined': 'bg-rose-50 text-rose-600',
  rejected: 'bg-rose-50 text-rose-600'
};

const statusLabels = {
  applied: 'Applied',
  pending: 'Pending',
  reviewed: 'Reviewed',
  shortlisted: 'Shortlisted',
  interview: 'Interview',
  onhold: 'On Hold for Interview',
  'on hold': 'On Hold for Interview',
  offered: 'Offered',
  selected: 'Selected',
  'offer sent': 'Offer Received',
  'offer accepted': 'Offer Accepted',
  hired: 'Hired',
  'offer declined': 'Offer Declined',
  rejected: 'Rejected'
};

const canJobseekerMessage = (status) => ['shortlisted', 'interview', 'offered', 'onhold', 'on hold'].includes(String(status || '').toLowerCase());

const getApplicationFilterStatus = (job) => {
  const status = String(job.status || '').toLowerCase();
  if (status !== 'offered') return status;

  const offerStatus = String(job.selectionDetails?.offerStatus || 'Selected').toLowerCase();
  if (offerStatus === 'selected') return 'selected';
  if (offerStatus === 'hired') return 'hired';
  if (offerStatus === 'offer declined') return 'offer-declined';
  return 'offered';
};

const getApplicationDisplayStatus = (job) => (
  job.status === 'offered'
    ? (job.selectionDetails?.offerStatus || 'Selected')
    : job.status
);

const isActionableOffer = (job) => (
  job.status === 'offered' && job.selectionDetails?.offerStatus === 'Offer Sent'
);

const getOfferMessageText = (message = '') => {
  if (typeof document === 'undefined') {
    return String(message).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  }
  const element = document.createElement('div');
  element.innerHTML = message;
  return element.textContent || element.innerText || message;
};

export const JobseekerApplications = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const filterParam = searchParams.get('filter') || 'all';
  
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState(filterParam);
  const [activeOfferJob, setActiveOfferJob] = useState(null);
  const [offerAction, setOfferAction] = useState('');

  useEffect(() => {
    setActiveFilter(filterParam);
  }, [filterParam]);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const token = localStorage.getItem('publicToken');
        const res = await axios.get(`${BASE_API_URL}/jobseeker/applications`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        setAppliedJobs(res.data || []);
      } catch (err) {
        console.error('Fetch applications error:', err);
        setError('Failed to load applications. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, []);

  const countByStatus = (status) => {
    if (status === 'all') return appliedJobs.length;
    return appliedJobs.filter(job => getApplicationFilterStatus(job) === status).length;
  };

  const stats = {
    total: { value: appliedJobs.length },
    applied: { value: countByStatus('applied') },
    reviewed: { value: countByStatus('reviewed') },
    shortlisted: { value: countByStatus('shortlisted') },
    interview: { value: countByStatus('interview') },
    onhold: { value: countByStatus('onhold') },
    selected: { value: countByStatus('selected') },
    offered: { value: countByStatus('offered') },
    hired: { value: countByStatus('hired') },
    rejected: { value: countByStatus('rejected') }
  };

  const visibleJobs = activeFilter === 'all'
    ? appliedJobs
    : appliedJobs.filter(job => getApplicationFilterStatus(job) === activeFilter);

  const handleOfferResponse = async (job, response) => {
    setOfferAction(response);
    setError('');
    try {
      const token = localStorage.getItem('publicToken');
      const res = await axios.patch(
        `${BASE_API_URL}/jobseeker/applications/${job.id}/offer`,
        { response },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      const nextOfferStatus = response === 'accept' ? 'Offer Accepted' : 'Offer Declined';
      const nextSelectionDetails = {
        ...(job.selectionDetails || {}),
        ...(res.data?.application?.selectionDetails || {}),
        offerStatus: res.data?.application?.selectionDetails?.offerStatus || nextOfferStatus
      };
      setAppliedJobs((current) => current.map((item) => (
        item.id === job.id
          ? { ...item, selectionDetails: nextSelectionDetails }
          : item
      )));
      setActiveOfferJob((current) => (
        current?.id === job.id
          ? { ...current, selectionDetails: nextSelectionDetails }
          : current
      ));
    } catch (err) {
      setError(err.response?.data?.message || 'Offer response could not be saved. Please try again.');
    } finally {
      setOfferAction('');
    }
  };

  if (loading) {
    return <PageSkeleton variant="table" />;
  }

  return (
    <div className="space-y-5">
      {error && (
        <div className="rounded-md border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {statConfig.map(item => {
          const Icon = item.icon;
          const statFilterMap = {
            total: 'all',
            applied: 'applied',
            reviewed: 'reviewed',
            shortlisted: 'shortlisted',
            interview: 'interview',
            onhold: 'onhold',
            selected: 'selected',
            offered: 'offered',
            hired: 'hired',
            rejected: 'rejected'
          };
          return (
            <div
              key={item.key}
              onClick={() => {
                const targetFilter = statFilterMap[item.key] || 'all';
                setActiveFilter(targetFilter);
                setSearchParams({ filter: targetFilter });
              }}
              className="rounded-md border border-slate-100 bg-white p-5 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-13 w-13 items-center justify-center rounded-xl ${item.tone}`}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-400">
                    {item.label}
                  </p>
                  <p className="text-2xl font-bold text-[#0f172a]">
                    {stats[item.key]?.value || 0}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 rounded-md border border-slate-100 bg-white p-3 shadow-sm">
        {filterTabs.map(tab => (
          <button
            key={tab.key}
            type="button"
            onClick={() => {
              setActiveFilter(tab.key);
              setSearchParams({ filter: tab.key });
            }}
            className={`rounded-full px-4 py-1.5 text-sm font-bold transition ${
              activeFilter === tab.key
                ? 'bg-[#0047C7] text-white'
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            {tab.label} ({countByStatus(tab.key)})
          </button>
        ))}
      </div>

      {/* Applied Jobs List */}
      <div className="space-y-3">
        {visibleJobs.length === 0 && (
          <div className="rounded-md border border-slate-100 bg-white p-10 text-center shadow-sm">
            <p className="text-sm font-bold text-slate-400">
              No applications in this category yet.
            </p>
          </div>
        )}

        {visibleJobs.map(job => (
          <div
            key={job.id}
            className="flex flex-col gap-4 rounded-md border border-slate-100 bg-white p-5 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 sm:flex-row sm:items-center"
          >
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md text-lg font-bold text-white"
              style={{ background: job.color || '#0047C7' }}
            >
              {job.initial}
            </div>

            <div className="flex-1">
              <div className="font-bold text-slate-800">
                <Link to={`/jobs/${job.jobId}`} className="hover:text-[#0047C7] transition-colors">
                  {job.title}
                </Link>
              </div>
              <div className="text-sm font-semibold text-slate-500">
                {job.company}
              </div>
              <div className="mt-1 flex items-center gap-1 text-xs font-medium text-slate-400">
                <MapPin className="h-3.5 w-3.5" />
                {job.location} · Applied on {job.appliedOn}
              </div>
            </div>

            <span
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${
                statusStyles[String(getApplicationDisplayStatus(job)).toLowerCase()] || 'bg-slate-50 text-slate-500'
              }`}
            >
              {statusLabels[String(getApplicationDisplayStatus(job)).toLowerCase()] || getApplicationDisplayStatus(job)}
            </span>

            <div className="flex shrink-0 flex-wrap gap-2">
              {job.offerLetter && (
                <button
                  type="button"
                  onClick={() => setActiveOfferJob(job)}
                  className="rounded-md border border-emerald-200 px-4 py-2 text-center text-sm font-bold text-emerald-600 transition hover:bg-emerald-50"
                >
                  View Offer
                </button>
              )}
              <Link
                to={`/jobseeker/applications/${job.id}`}
                className="rounded-md border border-[#0047C7] text-[#0047C7] hover:bg-blue-50 px-4 py-2 text-center text-sm font-bold transition"
              >
                Track Application
              </Link>
              {canJobseekerMessage(job.status) && (
                <Link
                  to={`/jobseeker/messages?application=${job.id}`}
                  className="inline-flex items-center justify-center gap-2 rounded-md border border-sky-200 px-4 py-2 text-sm font-bold text-sky-600 transition hover:bg-sky-50"
                >
                  <MessageCircle className="h-4 w-4" />
                  Message
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>

      {activeOfferJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 py-6">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-xl">
            <div className="flex items-start justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Offer Letter</p>
                <h3 className="mt-1 text-lg font-extrabold text-slate-800">{activeOfferJob.title}</h3>
                <p className="text-sm font-semibold text-slate-500">{activeOfferJob.company}</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveOfferJob(null)}
                className="rounded-md p-2 text-slate-400 transition hover:bg-slate-50 hover:text-slate-600"
                aria-label="Close offer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 px-5 py-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Subject</p>
                <p className="mt-1 text-sm font-bold text-slate-800">
                  {activeOfferJob.offerLetter?.subject || 'Job Offer'}
                </p>
              </div>

              <div className="rounded-md border border-slate-100 bg-slate-50 p-4">
                <p className="whitespace-pre-wrap text-sm font-medium leading-6 text-slate-600">
                  {getOfferMessageText(activeOfferJob.offerLetter?.message || 'Offer details are not available.')}
                </p>
              </div>

              {activeOfferJob.offerLetter?.attachmentUrl && (
                <a
                  href={activeOfferJob.offerLetter.attachmentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-md border border-blue-200 px-4 py-2 text-sm font-bold text-blue-600 transition hover:bg-blue-50"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open Mail Attachment
                </a>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusStyles[String(getApplicationDisplayStatus(activeOfferJob)).toLowerCase()] || 'bg-slate-50 text-slate-500'}`}>
                  {statusLabels[String(getApplicationDisplayStatus(activeOfferJob)).toLowerCase()] || getApplicationDisplayStatus(activeOfferJob)}
                </span>
                {isActionableOffer(activeOfferJob) && (
                  <div className="flex flex-wrap gap-2">
                    <Link
                      to={`/jobseeker/messages?application=${activeOfferJob.id}`}
                      className="inline-flex items-center justify-center gap-2 rounded-md border border-sky-200 px-4 py-2 text-sm font-bold text-sky-600 transition hover:bg-sky-50"
                    >
                      <MessageCircle className="h-4 w-4" />
                      Discuss with Recruiter
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleOfferResponse(activeOfferJob, 'decline')}
                      disabled={Boolean(offerAction)}
                      className="inline-flex items-center justify-center gap-2 rounded-md border border-rose-200 px-4 py-2 text-sm font-bold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {offerAction === 'decline' && <Loader className="h-4 w-4 animate-spin" />}
                      Reject Offer
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOfferResponse(activeOfferJob, 'accept')}
                      disabled={Boolean(offerAction)}
                      className="inline-flex items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {offerAction === 'accept' && <Loader className="h-4 w-4 animate-spin" />}
                      Accept Offer
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobseekerApplications;
