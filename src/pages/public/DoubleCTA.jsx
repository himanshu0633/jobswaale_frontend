import React from 'react';
import { Link } from 'react-router-dom';
import { User, Briefcase, ArrowRight, Sparkles } from 'lucide-react';

const getPublicUser = () => {
  try {
    return JSON.parse(localStorage.getItem('publicUser') || 'null');
  } catch {
    return null;
  }
};

export const DoubleCTA = () => {
  const handleNavigation = () => {
    window.scrollTo(0, 0);
  };

  const user = getPublicUser();
  const token = localStorage.getItem('publicToken');
  const isLoggedInAsJobseeker = Boolean(
    token &&
    user &&
    (user.accountType === 'jobseeker' || user.role === 'Jobseeker' || user.role === 'jobseeker')
  );
  const isLoggedInAsEmployer = Boolean(
    token &&
    user &&
    (user.accountType === 'employer' || user.role === 'Employer' || user.role === 'employer')
  );
  const showJobSeeker = !isLoggedInAsEmployer;
  const showEmployer = !isLoggedInAsJobseeker;
  const isSingle = showJobSeeker !== showEmployer;

  // -------- Single CTA (logged-in) layout --------
  if (isSingle) {
    const isJobseeker = showJobSeeker;
    const accent = isJobseeker
      ? {
          ring: 'ring-[#0047C7]/10',
          border: 'border-[#0047C7]/15',
          iconBg: 'bg-[radial-gradient(circle,#1a66ff_0%,#0047C7_100%)]',
          iconShadow: 'shadow-[0_15px_35px_rgba(0,71,199,0.25)]',
          badgeBg: 'bg-[#0047C7]/8',
          badgeText: 'text-[#0047C7]',
          buttonBg: 'bg-[#0047C7] hover:bg-[#0039A3]',
          glow: 'from-[#dce6ff] via-white to-white',
          Icon: User,
          eyebrow: 'Welcome back',
          title: 'Keep your job search moving',
          copy: 'New roles are added every day — pick up where you left off and find the plan that fits your next move.',
          cta: 'Explore Job Seeker Plans',
          to: '/jobseeker-plan',
        }
      : {
          ring: 'ring-[#FF6B00]/10',
          border: 'border-[#FF6B00]/15',
          iconBg: 'bg-[radial-gradient(circle,#ff954d_0%,#FF6B00_100%)]',
          iconShadow: 'shadow-[0_15px_35px_rgba(255,107,0,0.25)]',
          badgeBg: 'bg-[#FF6B00]/8',
          badgeText: 'text-[#FF6B00]',
          buttonBg: 'bg-[#FF6B00] hover:bg-[#E85F00]',
          glow: 'from-[#ffe5dc] via-white to-white',
          Icon: Briefcase,
          eyebrow: 'Welcome back',
          title: 'Keep building your team',
          copy: 'Post new roles or upgrade your plan to reach more qualified candidates, faster.',
          cta: 'Explore Employer Plans',
          to: '/employer-plan',
        };

    const { Icon } = accent;

    return (
      <section className="py-12 sm:py-[60px] bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div
            className={`relative overflow-hidden rounded-[28px] border ${accent.border} shadow-[0_10px_40px_rgba(15,23,42,0.06)] bg-gradient-to-br ${accent.glow} px-6 py-9 sm:px-12 sm:py-12`}
          >
            <div className="relative flex flex-col items-center gap-6 text-center sm:flex-row sm:items-center sm:gap-8 sm:text-left">
              <div
                className={`flex h-20 w-20 sm:h-24 sm:w-24 shrink-0 items-center justify-center rounded-full ${accent.iconBg} ${accent.iconShadow}`}
              >
                <Icon className="h-9 w-9 sm:h-11 sm:w-11 text-white" />
              </div>

              <div className="flex-1">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full ${accent.badgeBg} ${accent.badgeText} px-3 py-1 text-xs font-semibold uppercase tracking-wide`}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  {accent.eyebrow}
                </span>

                <h3 className="mt-3 text-2xl sm:text-[28px] font-bold text-slate-900">
                  {accent.title}
                </h3>

                <p className="mt-2 text-base text-slate-500 leading-relaxed max-w-md mx-auto sm:mx-0">
                  {accent.copy}
                </p>

                <Link
                  to={accent.to}
                  onClick={handleNavigation}
                  className={`mt-6 inline-flex w-full sm:w-auto items-center justify-center gap-3 min-w-[260px] h-14 rounded-[10px] ${accent.buttonBg} text-white text-base font-semibold transition-all hover:-translate-y-0.5`}
                >
                  {accent.cta} <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // -------- Default two-up CTA (logged out) layout --------
  return (
    <section className="py-[60px] bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-10 rounded-[28px] p-9 sm:p-12 border border-black/[0.04] shadow-[0_10px_40px_rgba(15,23,42,0.05)] bg-gradient-to-r from-[#dce6ff] via-white to-[#ffe5dc]">

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

          <div className="hidden md:block w-px h-[180px] bg-slate-900/[0.08] shrink-0" />
          <div className="block md:hidden w-full h-px bg-slate-900/[0.08]" />

          <div className="flex-1 w-full flex flex-col sm:flex-row items-center text-center sm:text-left gap-7">
            <div className="w-[110px] h-[90px] sm:w-[110px] sm:h-[110px] min-w-[90px] sm:min-w-[110px] rounded-full flex items-center justify-center shrink-0 bg-[radial-gradient(circle,#ff954d_0%,#FF6B00_100%)] shadow-[0_15px_35px_rgba(255,107,0,0.25)]">
              <Briefcase className="h-9 w-9 sm:h-12 sm:w-12 text-white" />
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