import { useState } from 'react';
import { Bookmark, Clock, MapPin, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const initialSavedJobs = [
  {
    id: 1,
    title: 'Frontend Developer',
    company: 'Google',
    initial: 'G',
    tone: 'bg-[#0d6efd] text-white',
    location: 'Bangalore, KA',
    type: 'Full Time',
    salary: '₹20 - 35 LPA'
  },
  {
    id: 2,
    title: 'React Developer',
    company: 'Amazon',
    initial: 'A',
    tone: 'bg-[#198754] text-white',
    location: 'Hyderabad, TS',
    type: 'Full Time',
    salary: '₹12 - 18 LPA'
  },
  {
    id: 3,
    title: 'Software Engineer',
    company: 'Flipkart',
    initial: 'F',
    tone: 'bg-[#ffc107] text-[#212529]',
    location: 'Bangalore, KA',
    type: 'Full Time',
    salary: '₹8 - 14 LPA'
  },
  {
    id: 4,
    title: 'Full Stack Developer',
    company: 'Microsoft',
    initial: 'M',
    tone: 'bg-[#dc3545] text-white',
    location: 'Noida, UP',
    type: 'Full Time',
    salary: '₹15 - 25 LPA'
  }
];


export const JobseekerSavedJobs = () => {
  const [savedJobs, setSavedJobs] = useState(initialSavedJobs);
  const [removingId, setRemovingId] = useState(null);


  const removeSaved = (id) => {
    setRemovingId(id);
    setTimeout(() => {
      setSavedJobs(prev => prev.filter(job => job.id !== id));
      setRemovingId(null);
    }, 300);
  };


  return (
    <div>

      {/* Section Header */}
      <div className="mb-5 flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">

        <h4 className="text-[1.1rem] font-bold text-[#0f172a]">
          Saved Jobs ({savedJobs.length})
        </h4>

        <Link
          to="/jobs"
          className="inline-flex items-center gap-[0.35rem] text-[0.85rem] font-semibold text-[#0047C7] transition-colors hover:text-[#FF6B00]"
        >
          <PlusCircle className="h-4 w-4" /> Browse More Jobs
        </Link>

      </div>

      {/* Saved Jobs Grid */}
      {savedJobs.length === 0 ? (

        <div className="rounded-xl border border-[#e2e8f0] bg-white p-12 text-center">
          <Bookmark className="mx-auto mb-4 h-14 w-14 text-[#e2e8f0]" />
          <h5 className="text-lg font-bold text-[#0f172a]">No saved jobs yet</h5>
          <p className="mt-1 text-sm text-[#94a3b8]">Start saving jobs you're interested in.</p>
        </div>

      ) : (

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">

          {savedJobs.map(job => (

            <div
              key={job.id}
              className={`flex flex-col rounded-xl border border-[#e2e8f0] bg-white p-[1.8rem] transition-all duration-300 hover:-translate-y-1 hover:border-[rgba(0,102,255,0.2)] hover:shadow-[0_10px_25px_rgba(0,0,0,0.06)] ${
                removingId === job.id
                  ? 'scale-95 opacity-0'
                  : 'scale-100 opacity-100'
              }`}
            >

              <div className="mb-2 flex items-start justify-between gap-3">

                <div className="flex items-center gap-4">

                  <div
                    className={`flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-lg text-[1.4rem] font-bold ${job.tone}`}
                  >
                    {job.initial}
                  </div>

                  <div>

                    <h3 className="mb-[0.2rem] text-base font-semibold leading-tight text-[#212529]">
                      <Link to="/jobs-detail" className="hover:underline">
                        {job.title}
                      </Link>
                    </h3>

                    <p className="mb-0 text-[0.82rem] text-[#475569]">
                      {job.company}
                    </p>

                  </div>

                </div>

                <button
                  type="button"
                  onClick={() => removeSaved(job.id)}
                  title="Remove from saved"
                  className="shrink-0 rounded-[10px] border-0 px-5 py-3 text-[#dc3545] transition-colors hover:text-[#bb2d3b]"
                >
                  <Bookmark className="h-4 w-4 fill-current" />
                </button>

              </div>

              <div className="mb-4 flex flex-col gap-[0.4rem] text-[0.8rem] text-[#475569]">

                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" /> {job.location}
                </span>

                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" /> {job.type}
                </span>

              </div>

              <div className="mt-0 flex items-center justify-between border-t border-[#e2e8f0] pt-[0.8rem]">

                <span className="text-[0.85rem] font-bold text-[#0f172a]">
                  {job.salary}
                </span>

                <Link
                  to="/jobs-detail"
                  className="rounded-[6px] bg-[#0047C7] px-5 py-3 text-sm font-normal leading-none text-white transition-colors hover:bg-[#0052cc]"
                >
                  Apply Now
                </Link>

              </div>

            </div>

          ))}

        </div>

      )}

    </div>
  );
};


export default JobseekerSavedJobs;