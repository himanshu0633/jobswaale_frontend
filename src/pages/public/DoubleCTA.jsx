import React from 'react';
import { Link } from 'react-router-dom';
import { User, Briefcase, ArrowRight } from 'lucide-react';

export const DoubleCTA = () => {
  const handleNavigation = () => {
    window.scrollTo(0, 0);
  };

  return (
    <section className="py-[60px] bg-white">
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-10 rounded-[28px] p-9 sm:p-12 border border-black/[0.04] shadow-[0_10px_40px_rgba(15,23,42,0.05)] bg-gradient-to-r from-[#dce6ff] via-white to-[#ffe5dc]">

          {/* Job Seeker CTA */}
          <div className="flex-1 w-full flex flex-col sm:flex-row items-center text-center sm:text-left gap-7">
            <div className="w-[110px] h-[90px] sm:w-[110px] sm:h-[110px] min-w-[90px] sm:min-w-[110px] rounded-full flex items-center justify-center shrink-0 bg-[radial-gradient(circle,#1a66ff_0%,#0047C7_100%)] shadow-[0_15px_35px_rgba(0,71,199,0.25)]">
              <User className="h-9 w-9 sm:h-12 sm:w-12 text-white" />
            </div>

            <div>
              <h3 className="text-xl sm:text-[26px] font-bold text-slate-900 mb-1">
                For Job Seekers
              </h3>

              <p className="text-base text-slate-500 leading-relaxed max-w-[340px] mb-6">
                Explore the best opportunities and take the next step in your career.
              </p>

              <Link
                to="/jobseeker-plan"
                onClick={handleNavigation}
                className="inline-flex items-center justify-center gap-3 w-full sm:w-auto sm:min-w-[260px] h-14 rounded-[10px] bg-[#0047C7] hover:bg-[#0039A3] text-white text-base font-semibold transition-all hover:-translate-y-0.5"
              >
                Explore Job Seeker Plans <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Divider */}
          <div className="hidden md:block w-px h-[180px] bg-slate-900/[0.08] shrink-0" />
          <div className="block md:hidden w-full h-px bg-slate-900/[0.08]" />

          {/* Employer CTA */}
          <div className="flex-1 w-full flex flex-col sm:flex-row items-center text-center sm:text-left gap-7">
            <div className="w-[110px] h-[90px] sm:w-[110px] sm:h-[110px] min-w-[90px] sm:min-w-[110px] rounded-full flex items-center justify-center shrink-0 bg-[radial-gradient(circle,#ff954d_0%,#FF6B00_100%)] shadow-[0_15px_35px_rgba(255,107,0,0.25)]">
              <Briefcase className="h-9 w-9 sm:h-12 w-12 text-white" />
            </div>

            <div>
              <h3 className="text-xl sm:text-[26px] font-bold text-slate-900 mb-1">
                For Employers
              </h3>

              <p className="text-base text-slate-500 leading-relaxed max-w-[340px] mb-6">
                Hire the best talent faster with our smart solutions.
              </p>

              <Link
                to="/employer-plan"
                onClick={handleNavigation}
                className="inline-flex items-center justify-center gap-3 w-full sm:w-auto sm:min-w-[260px] h-14 rounded-[10px] bg-[#FF6B00] hover:bg-[#E85F00] text-white text-base font-semibold transition-all hover:-translate-y-0.5"
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