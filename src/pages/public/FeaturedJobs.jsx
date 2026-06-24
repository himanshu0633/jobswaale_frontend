import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin } from 'lucide-react';

const FEATURED_JOBS = [
  {
    id: 1,
    title: 'Frontend Developer',
    company: 'Microsoft',
    location: 'Noida, UP',
    salary: '₹4 - 6 LPA',
    type: 'Full Time',
    logoLetter: 'M',
    logoBg: 'bg-rose-100 text-rose-700'
  },
  {
    id: 2,
    title: 'UI/UX Designer',
    company: 'TCS',
    location: 'Bangalore, KA',
    salary: '₹3 - 5 LPA',
    type: 'Full Time',
    logoLetter: 'T',
    logoBg: 'bg-blue-100 text-blue-700'
  },
  {
    id: 3,
    title: 'System Analyst',
    company: 'Infosys',
    location: 'Pune, MH',
    salary: '₹5 - 8 LPA',
    type: 'Full Time',
    logoLetter: 'I',
    logoBg: 'bg-emerald-100 text-emerald-700'
  },
  {
    id: 4,
    title: 'HR Executive',
    company: 'Wipro',
    location: 'Hyderabad, TS',
    salary: '₹2.5 - 3.5 LPA',
    type: 'Full Time',
    logoLetter: 'W',
    logoBg: 'bg-amber-100 text-amber-700'
  },
  {
    id: 5,
    title: 'Senior Frontend Developer',
    company: 'Microsoft',
    location: 'Noida, UP',
    salary: '₹8 - 12 LPA',
    type: 'Full Time',
    logoLetter: 'M',
    logoBg: 'bg-rose-100 text-rose-700'
  },
  {
    id: 6,
    title: 'Product Designer',
    company: 'TCS',
    location: 'Bangalore, KA',
    salary: '₹6 - 9 LPA',
    type: 'Full Time',
    logoLetter: 'T',
    logoBg: 'bg-blue-100 text-blue-700'
  }
];

export const FeaturedJobs = () => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-12">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900">Featured Jobs</h2>
            <p className="mt-2 text-slate-550 text-sm">Hand-picked featured listings currently accepting applications.</p>
          </div>
          <Link 
            to="/login"
            className="mt-4 sm:mt-0 inline-flex items-center gap-1 text-sm font-bold text-indigo-650 hover:text-indigo-500"
          >
            View All Jobs <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {FEATURED_JOBS.map((job, idx) => (
            <div key={idx} className="border border-slate-200 rounded-2xl p-6 bg-white hover:border-indigo-200 hover:shadow-md transition-all duration-200 flex flex-col justify-between h-[210px]">
              <div className="flex gap-4 items-start">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-extrabold text-lg shrink-0 ${job.logoBg}`}>
                  {job.logoLetter}
                </div>
                <div className="space-y-0.5">
                  <h3 className="font-bold text-slate-900 hover:text-indigo-600 transition-colors text-base truncate max-w-[200px]">
                    <Link to="/login">{job.title}</Link>
                  </h3>
                  <p className="text-xs font-semibold text-slate-500">{job.company}</p>
                  <div className="flex items-center gap-1 mt-3 text-xs font-bold text-slate-400">
                    <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    {job.location}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-4">
                <span className="text-sm font-extrabold text-indigo-600">{job.salary}</span>
                <span className="px-2.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] uppercase font-bold tracking-wider">
                  {job.type}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedJobs;
