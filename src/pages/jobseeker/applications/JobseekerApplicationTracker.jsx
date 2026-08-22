import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowLeft,
  Calendar,
  Check,
  Clock,
  Eye,
  FileText,
  Loader,
  MailCheck,
  MapPin,
  MessageCircle,
  Video,
  X
} from 'lucide-react';
import { BASE_API_URL } from '../../../context/AuthContext';
import PageSkeleton from '../../../components/SkeletonLoader';

const statusOrder = ['applied', 'reviewed', 'shortlisted', 'interview', 'offered', 'accepted'];

const formatDate = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

const normalizeStatus = (status) => String(status || 'Applied').trim().toLowerCase();

const getTokenHeaders = () => {
  const token = localStorage.getItem('publicToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const JobseekerApplicationTracker = () => {
  const { id } = useParams();
  const [tracker, setTracker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTracker = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await axios.get(`${BASE_API_URL}/jobseeker/applications/${id}`, {
          headers: getTokenHeaders()
        });
        setTracker(response.data);
      } catch (err) {
        console.error('Error loading application tracker:', err);
        setError(err.response?.data?.message || 'Failed to load application status details.');
      } finally {
        setLoading(false);
      }
    };
    fetchTracker();
  }, [id]);

  const timeline = useMemo(() => {
    if (!tracker) return [];
    const status = normalizeStatus(tracker.status);
    const accepted =
      String(tracker.selectionDetails?.offerStatus || '').toLowerCase().includes('accepted') ||
      String(tracker.selectionDetails?.offerStatus || '').toLowerCase().includes('hired');
    
    const currentKey = accepted ? 'accepted' : status === 'rejected' ? 'rejected' : status;
    const currentIndex = currentKey === 'rejected'
      ? statusOrder.indexOf('interview')
      : Math.max(0, statusOrder.indexOf(currentKey));

    const base = [
      {
        key: 'applied',
        title: 'Application Submitted',
        date: formatDate(tracker.appliedDate),
        icon: FileText,
        color: 'bg-blue-500',
        text: 'Your application has been successfully submitted and received by the employer.'
      },
      {
        key: 'reviewed',
        title: 'Application Reviewed',
        date: ['reviewed', 'shortlisted', 'interview', 'offered'].includes(status) ? formatDate(tracker.reviewedDate) : '',
        icon: Eye,
        color: 'bg-sky-500',
        text: 'An HR manager or hiring authority reviewed your profile and details.'
      },
      {
        key: 'shortlisted',
        title: 'Shortlisted',
        date: ['shortlisted', 'interview', 'offered'].includes(status) ? formatDate(tracker.shortlistedDate || tracker.reviewedDate) : '',
        icon: Check,
        color: 'bg-amber-500',
        text: 'Congratulations! Your profile has matched the criteria and you have been shortlisted for the position.'
      },
      {
        key: 'interview',
        title: tracker.interviewDetails?.onHold ? 'Interview (On Hold)' : 'Interview Round',
        date: tracker.interviewDetails?.date ? formatDate(tracker.interviewDetails.date) : '',
        icon: tracker.interviewDetails?.onHold ? Clock : Calendar,
        color: tracker.interviewDetails?.onHold ? 'bg-amber-500' : 'bg-violet-500',
        text: tracker.interviewDetails?.onHold
          ? 'Your interview is kept on hold by the recruiter. We will notify you once they resume it.'
          : tracker.interviewDetails?.date
            ? `Scheduled a ${tracker.interviewDetails.type || 'Interview'} on ${formatDate(tracker.interviewDetails.date)} at ${tracker.interviewDetails.time || 'scheduled time'}.`
            : 'Interview details will appear here once the employer schedules a meeting.',
        meetingDetails: tracker.interviewDetails
      },
      {
        key: 'offered',
        title: tracker.selectionDetails?.offerStatus === 'Selected' ? 'Selected' : 'Job Offer',
        date: formatDate(tracker.selectionDetails?.selectedDate || tracker.selectionDetails?.offerSentAt),
        icon: MailCheck,
        color: 'bg-emerald-500',
        text: tracker.selectionDetails?.offerStatus === 'Selected'
          ? 'Congratulations! You have been selected for this position. The employer will send your job offer details soon.'
          : tracker.selectionDetails?.salaryOffered
            ? `Congratulations! You have received a job offer with an package of ${tracker.selectionDetails.salaryOffered} LPA.`
            : 'Official job offer from the recruiter.',
        offerDetails: tracker.selectionDetails
      }
    ];

    if (status === 'rejected') {
      base.splice(3, 0, {
        key: 'rejected',
        title: 'Application Rejected',
        date: formatDate(tracker.rejectedDate || tracker.reviewedDate),
        icon: X,
        color: 'bg-rose-500',
        text: 'The employer reviewed your application and decided not to proceed with your candidacy at this time.'
      });
    }

    return base.map((step, idx) => ({
      ...step,
      done: step.key === 'rejected' || idx <= currentIndex,
      current: step.key === currentKey
    }));
  }, [tracker]);

  if (loading) {
    return <PageSkeleton variant="detail" />;
  }

  if (error || !tracker) {
    return (
      <div className="space-y-4">
        <Link to="/jobseeker/applications" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600">
          <ArrowLeft className="h-4 w-4" /> Back to Applications
        </Link>
        <div className="rounded-md border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
          {error || 'Application tracker details not found.'}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      <div>
        <Link to="/jobseeker/applications" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-[#6658dd] mb-3 transition">
          <ArrowLeft className="h-4 w-4" /> Back to Applications
        </Link>
        <h1 className="text-xl font-extrabold text-[#3f4254]">Track Application</h1>
      </div>

      {/* Header Summary Card */}
      <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-[#6658dd] text-xl font-black text-white shadow-sm shadow-indigo-100">
              {tracker.company?.charAt(0).toUpperCase()}
            </span>
            <div>
              <h2 className="text-base font-extrabold text-[#3f4254] sm:text-lg">
                <Link to={`/jobs/${tracker.jobId}`} className="hover:text-[#0047C7] transition-colors">
                  {tracker.title}
                </Link>
              </h2>
              <p className="text-sm font-semibold text-slate-400">{tracker.company}</p>
              <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
                <MapPin className="h-3.5 w-3.5" />
                <span>{tracker.location}</span>
                <span>•</span>
                <span>{tracker.jobType}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-row items-center gap-3 sm:flex-col sm:items-end">
            <span className={`rounded-full px-3.5 py-1.5 text-xs font-bold border ${
              tracker.status === 'Rejected' 
                ? 'bg-rose-50 text-rose-600 border-rose-100'
                : tracker.status === 'Offered'
                ? 'bg-emerald-50 text-emerald-600 border-emerald-100 animate-pulse'
                : 'bg-indigo-50 text-indigo-600 border-indigo-100'
            }`}>
              {tracker.status}
            </span>
            <span className="text-xs font-semibold text-slate-400">Applied on {tracker.appliedOn}</span>
          </div>
        </div>
      </div>

      {/* Stepper Timeline Tracker */}
      <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
        <h3 className="text-base font-extrabold text-[#3f4254] border-b border-slate-100 pb-4 mb-6">Hiring Timeline</h3>
        
        <div className="relative pl-8 space-y-8 before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100">
          {timeline.map((step, idx) => {
            const StepIcon = step.icon;
            return (
              <div key={step.key} className="relative group">
                {/* Node Line (Indigo highlight if completed) */}
                {idx < timeline.length - 1 && (
                  <div className={`absolute -left-[17px] top-6 w-[2px] h-[calc(100%+32px)] ${step.done ? 'bg-indigo-500 z-[1]' : 'bg-slate-100 z-0'}`} />
                )}
                
                {/* Status Indicator Bubble */}
                <span className={`absolute -left-[29px] top-0.5 flex h-7 w-7 items-center justify-center rounded-full border-2 transition z-[2] ${
                  step.done 
                    ? `${step.color} text-white border-transparent` 
                    : 'bg-white border-slate-200 text-slate-300'
                }`}>
                  <StepIcon className="h-3.5 w-3.5 font-bold" />
                </span>

                {/* Step Body */}
                <div className={`rounded-xl border p-4 transition-all ${
                  step.current 
                    ? 'bg-slate-50/50 border-indigo-100 shadow-sm'
                    : step.done
                    ? 'border-slate-100 bg-white'
                    : 'border-slate-100/50 bg-white opacity-60'
                }`}>
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h4 className={`text-sm font-extrabold ${step.done ? 'text-[#3f4254]' : 'text-slate-400'}`}>
                        {step.title}
                      </h4>
                      {step.current && (
                        <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Active</span>
                      )}
                    </div>
                    {step.date && (
                      <span className="text-xs font-semibold text-slate-400">{step.date}</span>
                    )}
                  </div>
                  
                  <p className="text-xs font-semibold text-slate-500 leading-relaxed">
                    {step.text}
                  </p>

                  {/* Render Interview Info */}
                  {step.key === 'interview' && step.meetingDetails && step.meetingDetails.date && (
                    <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-2 text-xs text-slate-600 font-semibold">
                      <p><span className="text-slate-400">Interviewer:</span> {step.meetingDetails.interviewer || 'Hiring Manager'}</p>
                      <p><span className="text-slate-400">Type / Mode:</span> {step.meetingDetails.type}</p>
                      {step.meetingDetails.notes && (
                        <p><span className="text-slate-400">Recruiter Notes:</span> {step.meetingDetails.notes}</p>
                      )}
                      {step.meetingDetails.locationOrLink && (
                        <div className="pt-2">
                          {String(step.meetingDetails.locationOrLink).startsWith('http') ? (
                            <a
                              href={step.meetingDetails.locationOrLink}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 rounded-md bg-[#6658dd] px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#5848d8] transition"
                            >
                              <Video className="h-3.5 w-3.5" /> Join Virtual Meeting
                            </a>
                          ) : (
                            <p className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-slate-400" />{step.meetingDetails.locationOrLink}</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Render Selection / Offer Details */}
                  {step.key === 'offered' && step.offerDetails && step.offerDetails.salaryOffered && (
                    <div className="mt-4 p-3 bg-emerald-50/50 rounded-lg border border-emerald-100 space-y-2 text-xs text-slate-600 font-semibold">
                      <p><span className="text-emerald-700 font-bold">Offer Package:</span> ₹ {step.offerDetails.salaryOffered} LPA</p>
                      <p><span className="text-slate-400">Status:</span> {step.offerDetails.offerStatus}</p>
                      {step.offerDetails.notes && (
                        <p><span className="text-slate-400">Recruiter Notes:</span> {step.offerDetails.notes}</p>
                      )}
                      <div className="pt-2">
                        <Link 
                          to={`/jobseeker/messages?application=${tracker.id}`}
                          className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition"
                        >
                          <MessageCircle className="h-3.5 w-3.5" /> Discuss with Recruiter
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default JobseekerApplicationTracker;
