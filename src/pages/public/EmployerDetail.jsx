import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import {
  Bookmark,
  Briefcase,
  Clock,
  Globe,
  MapPin,
  Phone,
  ShieldCheck,
  Star,
  User,
} from 'lucide-react';
import { BASE_API_URL } from '../../context/AuthContext';
import defaultEmployerLogo from './employerImages/employer-12.png';

const fallbackEmployer = {
  name: 'Behance Studio',
  location: 'Chicago, US',
  industry: 'Accounting / Finance',
  foundedYear: 2012,
  contactPerson: 'Michal Thomas',
  website: 'https://www.behance.com',
  description:
    'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Debitis illum fuga eveniet. Deleniti asperiores, commodi quae ipsum quas est itaque, ipsa, dolore beatae voluptates nemo blanditiis iste eius officia minus.',
  rating: 5,
  ratesCount: 0,
  openJobs: 4,
  memberSince: '2012-07-01',
  logoImg: defaultEmployerLogo,
  online: true,
  jobs: [
    { id: 'frontend-developer', title: 'Frontend Developer', company: 'Microsoft', location: 'Noida, UP', salary: '₹4 - 6 LPA', type: 'Full Time', logoLetter: 'M', logoColor: '#dc3545' },
    { id: 'ui-ux-designer', title: 'UI/UX Designer', company: 'TCS', location: 'Bangalore, KA', salary: '₹3 - 5 LPA', type: 'Full Time', logoLetter: 'T', logoColor: '#0047C7' },
    { id: 'system-analyst', title: 'System Analyst', company: 'Infosys', location: 'Pune, MH', salary: '₹5 - 8 LPA', type: 'Full Time', logoLetter: 'I', logoColor: '#198754' },
    { id: 'hr-executive', title: 'HR Executive', company: 'Wipro', location: 'Hyderabad, TS', salary: '₹2.5 - 3.5 LPA', type: 'Full Time', logoLetter: 'W', logoColor: '#f5a623' },
  ],
};

const formatMonthYear = (value) => {
  if (!value) return 'Not specified';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
};

const getDaysAgo = (value) => {
  if (!value) return 'Not posted yet';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not specified';
  const days = Math.max(0, Math.floor((Date.now() - date.getTime()) / 86400000));
  if (days === 0) return 'Today';
  if (days === 1) return '1 day';
  return `${days} days`;
};

const StarRating = ({ rating = 5 }) => (
  <div className="inline-flex items-center gap-1">
    {[1, 2, 3, 4, 5].map((item) => (
      <Star
        key={item}
        className={`h-4 w-4 ${item <= Math.round(rating) ? 'fill-[#f5a623] text-[#f5a623]' : 'fill-[#d8dbe2] text-[#d8dbe2]'}`}
      />
    ))}
  </div>
);

const OverviewItem = ({ icon: Icon, label, value, link }) => (
  <li className="flex gap-4 py-4 border-b border-[#eef1f6] last:border-b-0">
    <div className="h-10 w-10 rounded-lg bg-[#f2f6ff] text-[#0047C7] flex items-center justify-center flex-shrink-0">
      <Icon className="h-5 w-5" />
    </div>
    <div className="min-w-0">
      <span className="block text-[13px] text-[#88929b] mb-1">{label}</span>
      {link ? (
        <a href={link} target="_blank" rel="noreferrer" className="text-sm font-bold text-[#1f2938] break-words hover:text-[#0047C7]">
          {value}
        </a>
      ) : (
        <strong className="block text-sm font-bold text-[#1f2938] break-words">{value || 'Not specified'}</strong>
      )}
    </div>
  </li>
);

const JobCard = ({ job }) => {
  const logoColor = job.logoColor || '#dfe3f3';
  return (
    <div className="col-span-1">
      <div className="border border-[#e8ecf3] rounded-[10px] bg-white p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_18px_42px_rgba(31,31,51,0.08)]">
        <div className="flex">
          <div className="flex-shrink-0">
            <div
              className="h-[52px] w-[52px] rounded-[10px] text-white flex items-center justify-center text-xl font-bold"
              style={{ backgroundColor: logoColor, color: logoColor === '#f5a623' ? '#1f2938' : '#fff' }}
            >
              {job.logoLetter || job.company?.charAt(0)?.toUpperCase() || 'J'}
            </div>
          </div>
          <div className="flex-grow ml-4 min-w-0">
            <h3 className="text-[18px] leading-snug font-bold text-[#1f2938] mb-1">
              <Link to={`/jobs/${job.id}`} className="hover:text-[#0047C7]">
                {job.title}
              </Link>
            </h3>
            <p className="text-sm text-[#88929b] mb-2">{job.company}</p>
            <div className="text-sm text-[#667085] flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              <span className="truncate">{job.location}</span>
            </div>
          </div>
        </div>
        <div className="mt-6 pt-4 border-t border-[#eef1f6] flex items-center justify-between gap-3">
          <span className="text-sm font-bold text-[#0047C7]">{job.salary}</span>
          <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-[#eaf1ff] text-[#0047C7]">{job.type}</span>
        </div>
      </div>
    </div>
  );
};

const EmployerDetailSkeleton = () => (
  <div className="w-full bg-white animate-pulse" style={{ fontFamily: "'Inter', sans-serif" }}>
    {/* Header Skeleton Box */}
    <div className="bg-[#fff9f3] border-b border-[#f0e9df] py-10 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-center">
          <div className="flex flex-col sm:flex-row gap-5">
            {/* Logo Circle Skeleton */}
            <div className="h-[110px] w-[110px] rounded-full bg-slate-200 shrink-0" />
            <div className="flex-grow">
              {/* Title Skeleton */}
              <div className="h-8 w-64 bg-slate-200 rounded mb-4" />
              {/* Meta items Skeleton */}
              <div className="flex flex-wrap gap-4 mt-2">
                <div className="h-4 w-32 bg-slate-200 rounded" />
                <div className="h-4 w-28 bg-slate-200 rounded" />
                <div className="h-4 w-24 bg-slate-200 rounded" />
                <div className="h-4 w-20 bg-slate-200 rounded" />
              </div>
              {/* Badge Button Skeleton */}
              <div className="h-8 w-24 bg-slate-200 rounded-lg mt-5" />
            </div>
          </div>
          <div className="lg:text-right flex flex-col items-start lg:items-end gap-4">
            <div className="h-4 w-40 bg-slate-200 rounded" />
            <div className="flex gap-2 w-full lg:justify-end">
              <div className="h-11 w-24 bg-slate-200 rounded-lg" />
              <div className="h-11 w-36 bg-slate-200 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Content Skeleton Box */}
    <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-12 mb-20">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_390px] gap-10">
        <div>
          {/* About section Skeleton */}
          <div className="h-7 w-48 bg-slate-200 rounded mb-6" />
          <div className="space-y-3 mb-8">
            <div className="h-4 w-full bg-slate-200 rounded" />
            <div className="h-4 w-full bg-slate-200 rounded" />
            <div className="h-4 w-3/4 bg-slate-200 rounded" />
          </div>

          <div className="border-t border-[#eef1f6] my-8" />

          {/* Openings section Skeleton */}
          <div className="h-7 w-48 bg-slate-200 rounded mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="border border-[#e8ecf3] rounded-[10px] p-6 space-y-4">
                <div className="flex gap-4">
                  <div className="h-[52px] w-[52px] rounded-[10px] bg-slate-200 shrink-0" />
                  <div className="space-y-2 flex-grow">
                    <div className="h-5 w-32 bg-slate-200 rounded" />
                    <div className="h-4 w-20 bg-slate-200 rounded" />
                    <div className="h-4 w-24 bg-slate-200 rounded" />
                  </div>
                </div>
                <div className="border-t border-[#eef1f6] pt-4 flex justify-between">
                  <div className="h-4 w-20 bg-slate-200 rounded" />
                  <div className="h-6 w-16 bg-slate-200 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Skeleton */}
        <aside>
          <div className="rounded-[10px] border border-[#e8ecf3] p-7 space-y-6">
            <div className="h-7 w-28 bg-slate-200 rounded" />
            <div className="space-y-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex gap-4 py-2 border-b border-[#eef1f6] last:border-0">
                  <div className="h-10 w-10 rounded-lg bg-slate-200 shrink-0" />
                  <div className="space-y-2 flex-grow">
                    <div className="h-3 w-16 bg-slate-200 rounded" />
                    <div className="h-4 w-28 bg-slate-200 rounded" />
                  </div>
                </div>
              ))}
            </div>
            <div className="h-11 w-full bg-slate-200 rounded-lg mt-4" />
          </div>
        </aside>
      </div>
    </div>
  </div>
);

const EmployerDetail = () => {
  const [searchParams] = useSearchParams();
  const employerId = searchParams.get('id');
  const [employer, setEmployer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    const fetchEmployer = async () => {
      setLoading(true);
      setError('');
      try {
        let id = employerId;
        if (!id) {
          const listRes = await axios.get(`${BASE_API_URL}/employers/public`);
          id = listRes.data?.[0]?.id;
        }

        if (!id) {
          setEmployer(fallbackEmployer);
          return;
        }

        const token = localStorage.getItem('publicToken');
        const res = await axios.get(
          `${BASE_API_URL}/employers/public/${id}`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
          }
        );
        setEmployer({ ...fallbackEmployer, ...res.data, jobs: res.data?.jobs || [] });
        setSaved(Boolean(res.data?.hasSaved));
      } catch (err) {
        console.error('Fetch employer detail error:', err);
        setError('Failed to load employer details.');
        setEmployer(fallbackEmployer);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployer();
  }, [employerId]);

  const handleToggleSave = async () => {
    if (toggling) return;
    setToggling(true);
    try {
      const token = localStorage.getItem('publicToken');
      if (!token) {
        alert('Please log in to save employers.');
        setToggling(false);
        return;
      }
      const id = employerId || employer?.id || employer?._id;
      if (!id) {
        setToggling(false);
        return;
      }
      
      const res = await axios.post(
        `${BASE_API_URL}/jobseeker/saved-employers/${id}/toggle`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setSaved(Boolean(res.data?.saved));
    } catch (err) {
      console.error('Toggle save employer error:', err);
    } finally {
      setToggling(false);
    }
  };

  const aboutParagraphs = useMemo(() => {
    const text = employer?.description || fallbackEmployer.description;
    return text.split(/\n+/).filter(Boolean).slice(0, 3);
  }, [employer?.description]);

  if (loading) {
    return <EmployerDetailSkeleton />;
  }

  const logoSrc = employer.logoImg || defaultEmployerLogo;
  const sinceText = employer.foundedYear ? `Since ${employer.foundedYear}` : `Since ${formatMonthYear(employer.memberSince)}`;
  const openJobsUrl = `/jobs?company=${encodeURIComponent(employer.name)}`;

  return (
    <div className="w-full bg-white" style={{ fontFamily: "'Inter', sans-serif" }}>
      <section className="section-box">
        <div className="bg-[#fff9f3] border-b border-[#f0e9df] py-10 sm:py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            {loading && (
              <div className="mb-4 text-sm font-semibold text-[#667085]">Loading employer details...</div>
            )}
            {error && (
              <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">{error}</div>
            )}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-center">
              <div className="flex flex-col sm:flex-row gap-5">
                <div className="relative h-[110px] w-[110px] flex-shrink-0">
                  <figure className="h-[110px] w-[110px] rounded-full overflow-hidden bg-white border border-[#e8ecf3] shadow-sm">
                    <img alt={employer.name} src={logoSrc} className="h-full w-full object-cover" />
                  </figure>
                  {employer.online && <span className="absolute bottom-2 right-1 h-5 w-5 rounded-full bg-[#00c070] border-[3px] border-white" />}
                </div>

                <div className="min-w-0">
                  <h4 className="text-[26px] sm:text-[30px] leading-tight font-bold text-[#1f2938] mb-3">{employer.name}</h4>
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-[#667085]">
                    <span className="inline-flex items-center"><MapPin className="h-4 w-4 mr-1.5 text-[#88929b]" />{employer.location}</span>
                    <span className="inline-flex items-center"><Briefcase className="h-4 w-4 mr-1.5 text-[#88929b]" />{employer.industry}</span>
                    <span className="inline-flex items-center"><Clock className="h-4 w-4 mr-1.5 text-[#88929b]" />{sinceText}</span>
                    <span className="inline-flex items-center gap-2">
                      <StarRating rating={employer.rating} />
                      <span className="text-[#88929b]">({Number(employer.rating || 0).toFixed(1)})</span>
                    </span>
                  </div>

                  <div className="mt-5">
                    <Link to={openJobsUrl} className="inline-flex items-center rounded-lg bg-[#eef4ff] px-4 py-2 text-sm font-bold text-[#0047C7] hover:bg-[#0047C7] hover:text-white transition">
                      {employer.openJobs || employer.jobs?.length || 0} open jobs
                    </Link>
                  </div>
                </div>
              </div>

              <div className="lg:text-right">
                <ul className="flex items-center lg:justify-end gap-2 text-sm text-[#88929b] mb-4">
                  <li><Link to="/" className="text-[#1f2938] hover:text-[#0047C7]">Home</Link></li>
                  <li>/</li>
                  <li><Link to="/employers" className="text-[#1f2938] hover:text-[#0047C7]">Employer</Link></li>
                  <li>/</li>
                  <li>Employer Detail</li>
                </ul>
                <div className="flex justify-start lg:justify-end gap-2">
                  <button
                    type="button"
                    onClick={handleToggleSave}
                    disabled={toggling}
                    className={`inline-flex items-center gap-2 rounded-lg px-5 py-3 text-sm font-bold transition disabled:opacity-60 disabled:cursor-not-allowed ${
                      saved
                        ? 'bg-amber-500 text-white hover:bg-amber-600'
                        : 'bg-[#ffb020] text-[#1f2938] hover:bg-[#f5a400]'
                    }`}
                  >
                    <Bookmark className={`h-4 w-4 ${saved ? 'fill-current' : ''}`} />
                    {toggling ? 'Saving...' : (saved ? 'Saved' : 'Save')}
                  </button>
                  <Link to={openJobsUrl} className="inline-flex items-center gap-2 rounded-lg bg-[#0047C7] px-5 py-3 text-sm font-bold text-white hover:bg-[#003aa3] transition">
                    Apply for Job
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-12 mb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_390px] gap-10">
            <div className="lg:pr-5">
              <div className="content-single">
                <h4 className="text-[24px] font-bold text-[#1f2938] mb-5">About Company</h4>
                {aboutParagraphs.map((paragraph) => (
                  <p key={paragraph} className="text-[15px] leading-7 text-[#667085] mb-4">
                    {paragraph}
                  </p>
                ))}

                <div className="border-t border-[#eef1f6] my-8" />

                <h5 className="text-[22px] font-bold text-[#1f2938] mb-5">Current Openings</h5>
                {employer.jobs?.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {employer.jobs.map((job) => (
                      <JobCard key={job.id} job={job} />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-[10px] border border-[#e8ecf3] bg-white p-6 text-sm font-semibold text-[#667085]">
                    No open jobs are currently available for this employer.
                  </div>
                )}
              </div>
            </div>

            <aside className="lg:pl-2">
              <div className="rounded-[10px] border border-[#e8ecf3] bg-white p-7 shadow-[0_18px_40px_rgba(31,31,51,0.05)]">
                <h5 className="text-[22px] font-bold text-[#1f2938]">Overview</h5>
                <ul className="mt-3">
                  <OverviewItem icon={Briefcase} label="Company field" value={employer.industry} />
                  <OverviewItem icon={MapPin} label="Location" value={employer.address || employer.location} />
                  <OverviewItem icon={User} label="Contact Person" value={employer.contactPerson} />
                  <OverviewItem icon={Clock} label="Member since" value={formatMonthYear(employer.memberSince)} />
                  <OverviewItem icon={ShieldCheck} label="Last Jobs Posted" value={getDaysAgo(employer.lastJobPostedAt)} />
                  <OverviewItem icon={Globe} label="Website" value={employer.website || 'Not specified'} link={employer.website || ''} />
                </ul>
                <div className="mt-5">
                  <a href={employer.phone ? `tel:${employer.phone}` : '#'} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#0047C7] px-5 py-3 text-sm font-bold text-white hover:bg-[#003aa3] transition">
                    <Phone className="h-4 w-4" /> Contact
                  </a>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
};

export default EmployerDetail;
