import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowLeft,
  Bookmark,
  Briefcase,
  CalendarPlus,
  CheckCircle2,
  Download,
  Mail,
  MapPin,
  Phone,
  Star,
  UserCheck,
  UserPlus,
  UserX
} from 'lucide-react';
import { BASE_API_URL } from '../../../context/AuthContext';

const getTokenHeaders = () => {
  const token = localStorage.getItem('publicToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const Card = ({ title, children }) => (
  <section className="rounded-md border border-slate-100 bg-white shadow-sm">
    <div className="border-b border-dashed border-slate-200 px-5 py-4">
      <h2 className="text-base font-extrabold text-[#3f4254]">{title}</h2>
    </div>
    <div className="p-5">{children}</div>
  </section>
);

const ActionButton = ({ tone, icon: Icon, children }) => (
  <button type="button" className={`inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-xs font-extrabold transition ${tone}`}>
    <Icon className="h-4 w-4" />
    {children}
  </button>
);

const SkillBadge = ({ children, tone = 'bg-blue-50 text-blue-600' }) => (
  <span className={`mb-1 mr-1 inline-flex rounded px-2 py-1 text-xs font-black ${tone}`}>{children}</span>
);

const EmployerCandidateProfile = () => {
  const { id } = useParams();
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError('');
    axios.get(`${BASE_API_URL}/employer/candidateProfile/${id}`, { headers: getTokenHeaders() })
      .then((response) => {
        if (alive) setCandidate(response.data);
      })
      .catch((err) => {
        if (alive) setError(err.response?.data?.message || 'Candidate profile could not be loaded.');
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => { alive = false; };
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <div className="h-9 w-9 animate-spin rounded-full border-4 border-[#6658dd] border-t-transparent" />
      </div>
    );
  }

  if (!candidate) {
    return <div className="rounded-md border border-rose-100 bg-rose-50 p-6 text-sm font-bold text-rose-700">{error || 'Candidate not found.'}</div>;
  }

  const resumeHref = candidate.resume ? `${BASE_API_URL.replace(/\/api$/, '')}/${candidate.resume}` : '#';
  const matchScore = candidate.application?.matchScore || 0;

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div>
          <Link to={candidate.application?.id ? `/employer/applications/${candidate.application.id}` : '/employer/applications'} className="mb-2 inline-flex items-center gap-2 text-xs font-extrabold text-slate-400 hover:text-[#6658dd]">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <h1 className="text-xl font-extrabold text-[#3f4254]">Candidate Profile</h1>
        </div>
        <div className="flex items-center gap-2 text-sm font-bold text-slate-400"><span className="text-[#3f4254]">JobsWaale</span><span>/</span><span>Applications</span><span>/</span><span>{candidate.name}</span></div>
      </div>

      {error && <div className="rounded-md border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">{error}</div>}

      <div className="flex flex-wrap items-center gap-2">
        <ActionButton tone="bg-amber-400 text-white hover:bg-amber-500" icon={UserCheck}>Shortlist</ActionButton>
        <ActionButton tone="bg-[#6658dd] text-white hover:bg-[#5848d8]" icon={CalendarPlus}>Schedule Interview</ActionButton>
        <ActionButton tone="bg-emerald-500 text-white hover:bg-emerald-600" icon={UserPlus}>Select</ActionButton>
        <ActionButton tone="bg-slate-500 text-white hover:bg-slate-600" icon={Bookmark}>Save to Talent Pool</ActionButton>
        <ActionButton tone="border border-rose-200 bg-white text-rose-600 hover:bg-rose-50" icon={UserX}>Reject</ActionButton>
        <a href={resumeHref} target="_blank" rel="noreferrer" className={`inline-flex items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-extrabold text-slate-600 transition hover:bg-slate-50 ${!candidate.resume ? 'pointer-events-none opacity-60' : ''}`}>
          <Download className="h-4 w-4" /> Download Resume
        </a>
      </div>

      <section className="rounded-md border border-slate-100 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-5 md:flex-row md:items-center">
          <span className={`flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${candidate.avatarTone || 'from-violet-200 to-pink-200'} text-2xl font-black text-[#3f4254] ring-4 ring-white`}>
            {candidate.initials}
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-black text-[#3f4254]">{candidate.name}</h2>
            <p className="mt-1 text-base font-semibold text-slate-400">{candidate.designation || candidate.role}</p>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm font-semibold text-slate-500">
              <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4" />{candidate.location}</span>
              <span className="inline-flex items-center gap-1"><Mail className="h-4 w-4" />{candidate.email || 'N/A'}</span>
              <span className="inline-flex items-center gap-1"><Phone className="h-4 w-4" />{candidate.phone || 'N/A'}</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded bg-emerald-50 px-2 py-1 text-xs font-black text-emerald-600"><Star className="mr-1 inline h-3.5 w-3.5" />{matchScore}% Match</span>
              <span className="rounded bg-emerald-50 px-2 py-1 text-xs font-black text-emerald-600">{candidate.noticePeriod}</span>
              {candidate.linkedin && <a href={candidate.linkedin} target="_blank" rel="noreferrer" className="rounded bg-sky-50 px-2 py-1 text-xs font-black text-sky-600">LinkedIn</a>}
              {candidate.github && <a href={candidate.github} target="_blank" rel="noreferrer" className="rounded bg-slate-100 px-2 py-1 text-xs font-black text-slate-700">GitHub</a>}
            </div>
          </div>
        </div>
        <div className="my-5 border-t border-slate-100" />
        <div className="grid gap-4 text-center sm:grid-cols-2 xl:grid-cols-4">
          <div><h3 className="text-lg font-black text-[#3f4254]">{candidate.experience}</h3><span className="text-sm font-semibold text-slate-400">Total Experience</span></div>
          <div><h3 className="text-lg font-black text-[#3f4254]">{candidate.currentSalary}</h3><span className="text-sm font-semibold text-slate-400">Current CTC</span></div>
          <div><h3 className="text-lg font-black text-[#3f4254]">{candidate.expectedSalary}</h3><span className="text-sm font-semibold text-slate-400">Expected CTC</span></div>
          <div><h3 className="text-lg font-black text-[#3f4254]">{candidate.noticePeriod}</h3><span className="text-sm font-semibold text-slate-400">Notice Period</span></div>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          <Card title="Professional Summary">
            <p className="text-sm leading-6 text-slate-600">{candidate.bio}</p>
          </Card>

          <Card title="Work Experience">
            {(candidate.workExperience || []).map((item, index) => (
              <div key={`${item.title}-${index}`} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                <div className="flex justify-between gap-4">
                  <div><h3 className="text-sm font-extrabold text-[#3f4254]">{item.title}</h3><p className="text-xs font-semibold text-slate-400">{item.company}</p><p className="text-xs font-semibold text-slate-400">{item.location}</p></div>
                  <span className="text-xs font-semibold text-slate-400">{item.period}</span>
                </div>
                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-600">
                  {(item.points || []).map((point) => <li key={point}>{point}</li>)}
                </ul>
              </div>
            ))}
          </Card>

          <Card title="Education">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] text-left text-sm">
                <thead className="bg-slate-100 text-[11px] uppercase text-slate-500"><tr><th className="px-4 py-3">Degree</th><th className="px-4 py-3">Institution</th><th className="px-4 py-3">Year</th><th className="px-4 py-3">Grade</th></tr></thead>
                <tbody>
                  {(candidate.education || []).map((item, index) => (
                    <tr key={`${item.degree}-${index}`} className="border-b border-slate-100 last:border-0"><td className="px-4 py-3">{item.degree}</td><td className="px-4 py-3">{item.institution}</td><td className="px-4 py-3">{item.year}</td><td className="px-4 py-3">{item.grade}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card title="Certifications">
            {(candidate.certifications || []).map((item) => (
              <div key={item.title} className="flex items-start gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600"><CheckCircle2 className="h-5 w-5" /></span>
                <div><h3 className="text-sm font-extrabold text-[#3f4254]">{item.title}</h3><p className="text-xs font-semibold text-slate-400">{item.issuer} · {item.year}</p></div>
              </div>
            ))}
          </Card>
        </div>

        <aside className="space-y-5">
          <Card title="Skills">
            <div className="mb-4">
              <label className="mb-2 block text-[11px] font-black uppercase text-slate-400">Frontend</label>
              <div>{(candidate.frontendSkills || candidate.skills || []).map((skill) => <SkillBadge key={skill}>{skill}</SkillBadge>)}</div>
            </div>
            <div className="mb-4">
              <label className="mb-2 block text-[11px] font-black uppercase text-slate-400">Backend</label>
              <div>{(candidate.backendSkills || []).map((skill) => <SkillBadge key={skill} tone="bg-emerald-50 text-emerald-600">{skill}</SkillBadge>)}</div>
            </div>
            <div>
              <label className="mb-2 block text-[11px] font-black uppercase text-slate-400">Tools & Platforms</label>
              <div>{(candidate.toolSkills || []).map((skill) => <SkillBadge key={skill} tone="bg-sky-50 text-sky-600">{skill}</SkillBadge>)}</div>
            </div>
          </Card>

          <Card title="Languages">
            <div className="space-y-3">
              {(candidate.languages || []).map((language, index) => (
                <div key={language} className="flex items-center justify-between text-sm font-semibold text-[#3f4254]">
                  <span>{language}</span>
                  <span className={`rounded px-2 py-1 text-xs font-black ${index === 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-sky-50 text-sky-600'}`}>{index === 0 ? 'Fluent' : 'Native'}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Application Details">
            <div className="space-y-3 text-sm font-semibold text-slate-600">
              <p className="flex items-center gap-2"><Briefcase className="h-4 w-4 text-slate-400" />Applied For: {candidate.application?.jobTitle || 'N/A'}</p>
              <p className="flex items-center gap-2"><Star className="h-4 w-4 text-slate-400" />Match Score: {matchScore}%</p>
              <p>Status: <span className="rounded bg-blue-50 px-2 py-1 text-xs font-black text-blue-600">{candidate.application?.status || 'Available'}</span></p>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
};

export default EmployerCandidateProfile;
