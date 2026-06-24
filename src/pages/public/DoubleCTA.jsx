import React from 'react';
import { Link } from 'react-router-dom';
import { User, Briefcase, ArrowRight } from 'lucide-react';

export const DoubleCTA = () => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="border border-slate-200 rounded-3xl overflow-hidden shadow-sm grid md:grid-cols-2">
          
          {/* Job Seeker CTA */}
          <div className="bg-blue-50/40 p-8 sm:p-10 flex flex-col sm:flex-row gap-6 items-center sm:items-start text-center sm:text-left">
            <div className="relative flex items-center justify-center shrink-0">
              <div className="w-24 h-24 rounded-full bg-blue-100/80 flex items-center justify-center ring-8 ring-blue-50/30">
                <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <User className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-2xl font-extrabold text-slate-900">For Job Seekers</h3>
              <p className="text-slate-600 text-sm leading-relaxed max-w-sm">
                Explore the best opportunities and take the next step in your career.
              </p>
              <Link 
                to="/jobseeker-register" 
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#0d6efd] hover:bg-blue-700 text-white text-xs font-bold transition shadow-md shadow-blue-600/10 cursor-pointer"
              >
                Explore Job Seeker Plans <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Employer CTA */}
          <div className="bg-orange-50/40 p-8 sm:p-10 flex flex-col sm:flex-row gap-6 items-center sm:items-start text-center sm:text-left border-t md:border-t-0 md:border-l border-slate-200">
            <div className="relative flex items-center justify-center shrink-0">
              <div className="w-24 h-24 rounded-full bg-orange-100/80 flex items-center justify-center ring-8 ring-orange-50/30">
                <div className="w-16 h-16 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/20">
                  <Briefcase className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-2xl font-extrabold text-slate-900">For Employers</h3>
              <p className="text-slate-600 text-sm leading-relaxed max-w-sm">
                Hire the best talent faster with our smart solutions.
              </p>
              <Link 
                to="/employer-register" 
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#fd7e14] hover:bg-orange-600 text-white text-xs font-bold transition shadow-md shadow-orange-600/10 cursor-pointer"
              >
                Explore Employer Plans <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default DoubleCTA;
