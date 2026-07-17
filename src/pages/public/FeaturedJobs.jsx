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
    logoBg: 'bg-red-600 text-white'
  },
  {
    id: 2,
    title: 'UI/UX Designer',
    company: 'TCS',
    location: 'Bangalore, KA',
    salary: '₹3 - 5 LPA',
    type: 'Full Time',
    logoLetter: 'T',
    logoBg: 'bg-blue-600 text-white'
  },
  {
    id: 3,
    title: 'System Analyst',
    company: 'Infosys',
    location: 'Pune, MH',
    salary: '₹5 - 8 LPA',
    type: 'Full Time',
    logoLetter: 'I',
    logoBg: 'bg-emerald-600 text-white'
  },
  {
    id: 4,
    title: 'HR Executive',
    company: 'Wipro',
    location: 'Hyderabad, TS',
    salary: '₹2.5 - 3.5 LPA',
    type: 'Full Time',
    logoLetter: 'W',
    logoBg: 'bg-amber-500 text-slate-900'
  },
  {
    id: 5,
    title: 'Senior Frontend Developer',
    company: 'Microsoft',
    location: 'Noida, UP',
    salary: '₹8 - 12 LPA',
    type: 'Full Time',
    logoLetter: 'M',
    logoBg: 'bg-red-600 text-white'
  },
  {
    id: 6,
    title: 'Product Designer',
    company: 'TCS',
    location: 'Bangalore, KA',
    salary: '₹6 - 9 LPA',
    type: 'Full Time',
    logoLetter: 'T',
    logoBg: 'bg-blue-600 text-white'
  }
];

const FeaturedJobs = () => {
  return (
    <section className="py-10 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-12 gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
              Featured Jobs
            </h2>
            <p className="mt-2 text-slate-500">
              Discover top opportunities from leading companies. 
            </p>
          </div>

          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#0047C7] hover:text-[#FF6B00] transition-colors"
          >
            View All Jobs
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Jobs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURED_JOBS.map((job) => (
            <div
              key={job.id}
              className="group bg-white rounded-2xl border border-slate-200 p-6 flex flex-col h-full transition-all duration-300 hover:shadow-xl hover:border-[#0047C7]/20"
            >
              {/* Top Content */}
              <div className="flex items-start gap-4">
                <div
                  className={`w-14 h-14 rounded-xl flex items-center justify-center font-bold text-xl shrink-0 shadow-sm ${job.logoBg}`}
                >
                  {job.logoLetter}
                </div>

                <div className="flex-1 min-w-0">
                  <span className="inline-flex items-center rounded-full bg-orange-100 text-orange-600 text-xs font-semibold px-2.5 py-1 mb-3">
                    Featured
                  </span>

                  <h3 className="text-lg font-semibold text-slate-900 leading-snug">
                    <Link
                      to={`/jobs/${job.id}`}
                      className="hover:text-[#0047C7] transition-colors"
                    >
                      {job.title}
                    </Link>
                  </h3>

                  <p className="text-sm font-medium text-slate-600 mt-1">
                    {job.company}
                  </p>

                  <div className="flex items-center gap-1.5 text-sm text-slate-500 mt-3">
                    <MapPin className="w-4 h-4 shrink-0" />
                    <span>{job.location}</span>
                  </div>
                </div>
              </div>
 
              {/* Bottom Section */}
              <div className="mt-auto pt-5  border-slate-100 flex items-center justify-between mt-6">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Salary</p>
                  <p className="font-bold text-slate-900">{job.salary}</p>
                </div>

                <span className="px-3 py-1.5 rounded-full bg-blue-50 text-[#0047C7] text-xs font-semibold">
                  {job.type}
                </span>
              </div>

              {/* Apply Button */}
              {/* <Link
                to="/login"
                className="mt-5 w-full flex items-center justify-center rounded-xl bg-[#0047C7] text-white py-3 text-sm font-semibold hover:bg-[#0039a3] transition-colors"
              >
                Apply Now
              </Link> */}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedJobs;