import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin } from 'lucide-react';
import axios from 'axios';
import { BASE_API_URL } from '../../context/AuthContext';

export const FeaturedJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedJobs = async () => {
      try {
        const res = await axios.get(`${BASE_API_URL}/jobs`);
        // Map DB jobs to format required by the UI card
        const mapped = (res.data || []).map(j => ({
          id: j.slug || j._id,
          title: j.jobTitle,
          company: j.companyName,
          location: `${j.city}, ${j.state}`,
          salary: j.salary || (j.minSalary && j.maxSalary ? `₹${j.minSalary} - ${j.maxSalary}` : 'Not Specified'),
          type: j.jobType?.jobType || j.workMode || 'Full Time',
          logoLetter: j.companyName ? j.companyName.charAt(0).toUpperCase() : 'J',
          logoBg: ['bg-red-600 text-white', 'bg-blue-600 text-white', 'bg-emerald-600 text-white', 'bg-purple-600 text-white', 'bg-amber-500 text-slate-900'][Math.floor(Math.random() * 5)],
          isFeatured: j.status === 'featured'
        }));

        // Sort: show featured first, then slice up to 6 jobs
        const sorted = mapped.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
        setJobs(sorted.slice(0, 6));
      } catch (err) {
        console.error('Error fetching featured jobs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeaturedJobs();
  }, []);

  return (
    <section className="py-24 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
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
            to="/jobs"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#0047C7] hover:text-[#FF6B00] transition-colors"
          >
            View All Jobs
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Jobs Grid */}
        {loading ? (
          <div className="flex min-h-[260px] items-center justify-center">
            <div className="h-9 w-9 animate-spin rounded-full border-4 border-[#0047C7] border-t-transparent"/>
          </div>
        ) : jobs.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-slate-500">
            No active jobs found in the database.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
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
                <div className="mt-auto pt-5 border-slate-100 flex items-center justify-between mt-6">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Salary</p>
                    <p className="font-bold text-slate-900">{job.salary}</p>
                  </div>

                  <span className="px-3 py-1.5 rounded-full bg-blue-50 text-[#0047C7] text-xs font-semibold">
                    {job.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedJobs;