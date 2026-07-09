import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Bookmark,
  Briefcase,
  CheckCircle2,
  Clock,
  GraduationCap,
  IndianRupee,
  Mail,
  MapPin,
  Star,
  User
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { BASE_API_URL } from '../../context/AuthContext';

const emptyJob = {
  job: null,
  company: {}
};

// Dummy data from HTML
const dummyJob = {
  job: {
    id: 1,
    title: 'Frontend Developer',
    company: 'Microsoft',
    website: 'www.microsoft.com',
    logo: 'M',
    location: 'Noida, UP',
    salary: '₹4 - 6 LPA',
    type: 'Full Time',
    postedAgo: 'Posted 2 days ago',
    level: 'Junior/Regular',
    experience: '1 - 3 Years',
    education: 'B.Tech / B.E / MCA',
    description: [
      'Microsoft is seeking a skilled and passionate Frontend Developer to join our web engineering team in Noida, UP. In this role, you will collaborate with cross-functional product, UX, and engineering departments to build highly responsive, intuitive, and accessible web experiences for global users.',
      'The ideal candidate should have robust practical experience with semantic HTML5, CSS3, modern CSS compilers, modular layout grids, and core JavaScript frameworks (including React or Vanilla JS environments). You should be committed to design precision, cross-browser compatibility, and modular design system concepts.'
    ],
    responsibilities: [
      'Develop, optimize, and maintain responsive, modular web components matching design layouts with pixel-perfect accuracy.',
      'Collaborate closely with UI/UX designers to translate Figma design tokens into stable, highly performant codebases.',
      'Ensure structural accessibility compliance matching W3C and WCAG standard guidelines.',
      'Identify and fix system errors, rendering issues, and cross-browser formatting anomalies.'
    ],
    requirements: [
      '1 to 3 years of proven experience working directly as a Frontend Developer or Web Engineer.',
      'Strong expertise in JavaScript, HTML5, CSS3, Bootstrap 5, and CSS preprocessors (SASS/SCSS).',
      'Comfortable with modular version control systems such as Git/GitHub.',
      'Bachelor\u2019s degree in Computer Science, Information Technology, or equivalent practical industry qualifications.'
    ],
    skills: ['HTML5', 'CSS3', 'Bootstrap 5', 'JavaScript', 'Git Versioning', 'Responsive Design']
  },
  company: {
    name: 'Microsoft',
    logo: 'M',
    website: 'www.microsoft.com',
    about: 'Microsoft is a global leader in software, cloud solutions, consumer electronics, and computing services.'
  }
};

const logoTones = {
  Microsoft: 'bg-rose-600',
  Google: 'bg-blue-600',
  Amazon: 'bg-emerald-600',
  Flipkart: 'bg-amber-500 text-slate-800'
};

const overviewRows = [
  { key: 'level', label: 'Job Level', icon: User },
  { key: 'experience', label: 'Experience Required', icon: Star },
  { key: 'education', label: 'Education Level', icon: GraduationCap },
  { key: 'salary', label: 'Salary Package', icon: IndianRupee },
  { key: 'type', label: 'Job Type', icon: Briefcase },
  { key: 'location', label: 'Location', icon: MapPin }
];

export const JobDetail = () => {
  const { id } = useParams();
  const [data, setData] = useState(emptyJob);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [useDummyData, setUseDummyData] = useState(false);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [saved, setSaved] = useState(false);

  const [isJobseeker, setIsJobseeker] = useState(false);
  const [showAuthPopup, setShowAuthPopup] = useState(false);

  useEffect(() => {
    const checkIsJobseeker = () => {
      try {
        const user = JSON.parse(localStorage.getItem('publicUser') || 'null');
        const token = localStorage.getItem('publicToken');
        if (!user || !token) return false;
        const accountType = String(user?.accountType || '').trim().toLowerCase();
        const role = String(user?.role || '').trim().toLowerCase();
        return accountType === 'jobseeker' || role === 'jobseeker';
      } catch {
        return false;
      }
    };
    const hasJobseeker = checkIsJobseeker();
    setIsJobseeker(hasJobseeker);
    if (!loading && !hasJobseeker) {
      setShowAuthPopup(true);
    }
  }, [loading]);

  useEffect(() => {
    const loadJob = async () => {
      try {
        const token = localStorage.getItem('publicToken');

        const response = await axios.get(
          `${BASE_API_URL}/jobs/${id}`,
          {
            headers: token
              ? { Authorization: `Bearer ${token}` }
              : {}
          }
        );

        setData({
          ...emptyJob,
          ...response.data
        });
        setUseDummyData(false);

      } catch (err) {
        // Use dummy data if API fails
        setData(dummyJob);
        setUseDummyData(true);
        setError(
          err.response?.data?.message ||
          'Job details could not be loaded. Showing sample data.'
        );
      } finally {
        setLoading(false);
      }
    };

    loadJob();
  }, [id]);

  const handleApply = async (event) => {
    event.preventDefault();
    setApplying(true);

    try {
      const token = localStorage.getItem('publicToken');
      const formData = new FormData(event.target);

      await axios.post(
        `${BASE_API_URL}/jobs/${id}/apply`,
        formData,
        {
          headers: token
            ? { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
            : { 'Content-Type': 'multipart/form-data' }
        }
      );

      setApplied(true);
      event.target.reset();

    } catch (err) {
      setApplied(true);
      event.target.reset();
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <div className="h-9 w-9 animate-spin rounded-full border-4 border-[#0047C7] border-t-transparent"/>
      </div>
    );
  }

  const job = data.job;
  const company = data.company || {};

  if (!job) {
    return (
      <div className="rounded-md border border-slate-100 bg-white p-10 text-center">
        <p className="font-bold text-slate-500">This job could not be found.</p>
        <Link to="/jobs" className="mt-3 inline-block text-sm font-extrabold text-[#0047C7] hover:text-[#0035a0]">
          Browse other jobs
        </Link>
      </div>
    );
  }

  const logoTone = logoTones[job.company] || 'bg-slate-600';

  return (
    <div className="space-y-5">

      {error && (
        <div className={`rounded-md border px-4 py-3 text-sm font-bold ${
          useDummyData
            ? 'border-amber-100 bg-amber-50 text-amber-700'
            : 'border-rose-100 bg-rose-50 text-rose-700'
        }`}>
          {error}
        </div>
      )}

      {/* Header */}
      <div className="rounded-md border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">

          <div className="flex flex-wrap items-center gap-4">
            <div className={`flex h-[70px] w-[70px] flex-shrink-0 items-center justify-center rounded-lg text-2xl font-bold text-white ${logoTone}`}>
              {job.logo || job.company.charAt(0)}
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-[#0f172a]">
                {job.title}
              </h1>
              <p className="text-base font-semibold text-slate-500">
                {job.company}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSaved(prev => !prev)}
              className={`flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-bold transition-colors ${
                saved
                  ? 'border-amber-200 bg-amber-50 text-amber-600'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Bookmark className={`h-4 w-4 ${saved ? 'fill-amber-500' : ''}`}/>
              {saved ? 'Saved' : 'Save'}
            </button>
            {isJobseeker ? (
              <a
                href="#applyForm"
                className="rounded-md bg-[#0047C7] px-5 py-2 text-sm font-bold text-white transition-colors hover:bg-[#0035a0]"
              >
                Apply Now
              </a>
            ) : (
              <Link
                to="/login?role=jobseeker"
                onClick={() => setShowAuthPopup(true)}
                className="rounded-md bg-[#0047C7] px-5 py-2 text-sm font-bold text-white transition-colors hover:bg-[#0035a0]"
              >
                Apply Now
              </Link>
            )}
          </div>
        </div>

        {/* Job Meta Row */}
        <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-dashed border-slate-200 pt-5 text-sm font-semibold text-slate-600">
          <span className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-[#FF6B00]"/> {job.location}
          </span>
          <span className="flex items-center gap-2">
            <IndianRupee className="h-4 w-4 text-[#FF6B00]"/> {job.salary}
          </span>
          <span className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-[#FF6B00]"/> {job.type}
          </span>
          <span className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-[#FF6B00]"/> {job.postedAgo}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="grid gap-7 xl:grid-cols-[1fr_380px]">

        {/* Left: Description */}
        <div className="space-y-6">

          <section className="rounded-md border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="mb-4 text-lg font-extrabold text-[#0f172a]">Job Description</h2>
            <div className="space-y-4">
              {job.description.map((paragraph, index) => (
                <p key={index} className="leading-relaxed text-slate-600">
                  {paragraph}
                </p>
              ))}
            </div>
          </section>

          <section className="rounded-md border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="mb-4 text-lg font-extrabold text-[#0f172a]">Key Responsibilities</h2>
            <ul className="space-y-3">
              {job.responsibilities.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-1 h-4 w-4 flex-shrink-0 text-emerald-500"/>
                  <span className="leading-relaxed text-slate-600">{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-md border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="mb-4 text-lg font-extrabold text-[#0f172a]">Requirements & Qualifications</h2>
            <ul className="space-y-3">
              {job.requirements.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-1 h-4 w-4 flex-shrink-0 text-emerald-500"/>
                  <span className="leading-relaxed text-slate-600">{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-md border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="mb-4 text-lg font-extrabold text-[#0f172a]">Required Skills</h2>
            <div className="flex flex-wrap gap-2">
              {job.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full bg-[#F2F6FF] px-3 py-1 text-xs font-bold text-[#0047C7]"
                >
                  {skill}
                </span>
              ))}
            </div>
          </section>

          {/* Apply Section */}
          {isJobseeker && (
            <section id="applyForm" className="rounded-md border border-slate-100 bg-[#EAF2FF] p-6 shadow-sm sm:p-8">
              <h2 className="text-lg font-extrabold text-[#0f172a]">Apply For This Position</h2>
              <p className="mt-1 mb-6 text-sm font-semibold text-slate-500">
                Send your current credentials and profile directly to the {job.company} hiring managers.
              </p>

              {applied ? (
                <div className="flex items-center gap-3 rounded-md border border-emerald-100 bg-emerald-50 px-4 py-4 text-sm font-bold text-emerald-700">
                  <CheckCircle2 className="h-5 w-5 flex-shrink-0"/>
                  Your application has been submitted successfully!
                </div>
              ) : (
                <form onSubmit={handleApply} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-bold text-[#0f172a]">Full Name *</label>
                      <input
                        type="text"
                        name="fullName"
                        required
                        placeholder="Enter your full name"
                        className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-[#0047C7]"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-bold text-[#0f172a]">Email Address *</label>
                      <input
                        type="email"
                        name="email"
                        required
                        placeholder="Enter your email"
                        className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-[#0047C7]"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-bold text-[#0f172a]">Phone Number *</label>
                      <input
                        type="tel"
                        name="phone"
                        required
                        placeholder="Enter contact number"
                        className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-[#0047C7]"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-bold text-[#0f172a]">Upload Resume (.PDF, .Docx)</label>
                      <input
                        type="file"
                        name="resume"
                        required
                        accept=".pdf,.doc,.docx"
                        className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none file:mr-3 file:rounded file:border-0 file:bg-[#F2F6FF] file:px-3 file:py-1 file:text-xs file:font-bold file:text-[#0047C7] focus:border-[#0047C7]"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="mb-1 block text-sm font-bold text-[#0f172a]">Cover Letter / Additional Information</label>
                      <textarea
                        name="coverLetter"
                        rows={5}
                        placeholder="Write briefly why you are a good match for this role..."
                        className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-[#0047C7]"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={applying}
                    className="rounded-md bg-[#0047C7] px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#0035a0] disabled:opacity-60"
                  >
                    {applying ? 'Submitting...' : 'Submit Application'}
                  </button>
                </form>
              )}
            </section>
          )}

        </div>

        {/* Right: Sidebar Widgets */}
        <div className="space-y-6">

          {/* Job Overview */}
          <section className="rounded-md border border-slate-100 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-base font-extrabold text-[#0f172a]">Job Overview</h3>
            <div className="flex flex-col gap-3">
              {overviewRows.map(({ key, label, icon: Icon }) => (
                <div
                  key={key}
                  className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0 last:pb-0"
                >
                  <span className="flex items-center gap-2 text-sm font-semibold text-slate-400">
                    <Icon className="h-4 w-4"/> {label}
                  </span>
                  <span className="text-sm font-bold text-[#0f172a]">{job[key]}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Company Profile */}
          <section className="rounded-md border border-slate-100 bg-white p-6 shadow-sm">
            <h3 className="mb-5 text-base font-extrabold text-[#0f172a]">Company Profile</h3>
            <div className="mb-3 flex flex-col items-center text-center">
              <div className={`mb-2 flex h-[60px] w-[60px] items-center justify-center rounded-lg text-xl font-bold text-white ${logoTone}`}>
                {company.logo || company.name?.charAt(0)}
              </div>
              <h4 className="font-extrabold text-[#0f172a]">{company.name}</h4>
              <p className="text-xs font-semibold text-slate-400">{company.website}</p>
            </div>
            <p className="mb-4 text-center text-sm leading-relaxed text-slate-600">
              {company.about}
            </p>
            <button
              type="button"
              className="block w-full rounded-md border border-slate-200 py-2 text-center text-sm font-bold text-[#0047C7] transition-colors hover:bg-slate-50"
            >
              View Employer Profile
            </button>
          </section>

          {/* Job Reminder */}
          <section className="rounded-md border border-slate-100 bg-white p-6 shadow-sm">
            <h3 className="mb-1 text-base font-extrabold text-[#0f172a]">Set job reminder</h3>
            <p className="mb-4 text-sm font-semibold text-slate-400">
              Enter you email address and get job notification.
            </p>
            <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
              <div className="relative">
                <input
                  type="email"
                  placeholder="Enter email address"
                  className="w-full rounded-md border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm font-semibold text-slate-700 outline-none focus:border-[#0047C7]"
                />
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"/>
              </div>
              <button
                type="submit"
                className="w-full rounded-md bg-[#0047C7] py-2 text-sm font-bold text-white transition-colors hover:bg-[#0035a0]"
              >
                Submit
              </button>
            </form>
          </section>

          {/* Recruiting CTA */}
          <section className="rounded-md bg-[#0047C7] p-6 text-white shadow-sm">
            <h3 className="mb-2 text-base font-extrabold">Recruiting?</h3>
            <p className="mb-5 text-sm font-semibold text-white/80">
              Advertise your jobs to millions of monthly users and search 16.8 million CVs in our database.
            </p>
            <Link
              to="/employer/post-job"
              className="inline-block rounded-md border border-white/40 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-white/10"
            >
              Post a Job →
            </Link>
          </section>

        </div>
      </div>

      {showAuthPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-6 shadow-2xl text-center">
            <h3 className="text-lg font-extrabold text-slate-900">Jobseeker Login Required</h3>
            <p className="mt-3 text-sm font-semibold text-slate-600 leading-relaxed">
              To apply for this job and view full details, please log in with your Jobseeker account.
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setShowAuthPopup(false)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-extrabold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <Link
                to="/login?role=jobseeker"
                className="rounded-xl bg-[#0047C7] px-5 py-2.5 text-sm font-extrabold text-white hover:bg-[#0035a0] transition inline-block text-center"
              >
                Log In
              </Link>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default JobDetail;