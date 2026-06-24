import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Check, 
  Sparkles, 
  TrendingUp, 
  UserCheck, 
  Award, 
  ArrowRight,
  ChevronRight,
  ShieldCheck,
  Compass,
  MessageSquare
} from 'lucide-react';
import TrustedCompanies from './TrustedCompanies';

export const JobseekerPlan = () => {
  return (
    <div className="w-full bg-slate-50/50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Page Title & Subtitle */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Choose the plan that's right for you
          </h2>
          <p className="text-sm sm:text-base font-semibold text-slate-500 leading-relaxed">
            Start saving time today and choose your best plan
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 items-stretch mb-20">
          
          {/* Card 1: FREE */}
          <div className="border border-slate-200 rounded-3xl bg-white p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition duration-200">
            <div>
              {/* Price Details */}
              <div className="pb-6 border-b border-slate-100 mb-6">
                <span className="text-3xl font-black text-slate-950">₹0</span>
                <span className="text-xs font-bold text-slate-400 block mt-1.5">Always Free</span>
              </div>

              {/* Title & Desc */}
              <div className="mb-6">
                <h4 className="text-sm font-black text-slate-800 tracking-wider uppercase">FREE</h4>
                <p className="text-xs text-slate-400 font-semibold mt-1">
                  Start your journey with us
                </p>
              </div>

              {/* Features List */}
              <ul className="space-y-3.5 mb-8 text-[11px] font-bold text-slate-550">
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                  <span>Candidate Profile Registration</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                  <span>Profile Support</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                  <span>Limited Job Offers</span>
                </li>
              </ul>
            </div>

            {/* CTA Button */}
            <Link 
              to="/jobseeker-register" 
              className="w-full text-center inline-flex items-center justify-center gap-1.5 border border-slate-300 hover:border-slate-400 text-slate-700 hover:text-slate-800 text-xs font-bold py-3 rounded-2xl transition duration-150 cursor-pointer"
            >
              Choose plan <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Card 2: Basic */}
          <div className="border border-slate-200 rounded-3xl bg-white p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition duration-200">
            <div>
              {/* Price Details */}
              <div className="pb-6 border-b border-slate-100 mb-6">
                <span className="text-3xl font-black text-slate-950">₹500</span>
                <span className="text-xs font-bold text-slate-400 block mt-1.5">One Time Registration</span>
              </div>

              {/* Title & Desc */}
              <div className="mb-6">
                <h4 className="text-sm font-black text-slate-800 tracking-wider uppercase">Basic</h4>
                <p className="text-xs text-slate-400 font-semibold mt-1">
                  Register & Get Started
                </p>
              </div>

              {/* Features List */}
              <ul className="space-y-3.5 mb-8 text-[11px] font-bold text-slate-550">
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                  <span>Candidate Profile Registration</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                  <span>Profile Support</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                  <span>Limited Job Offers</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                  <span>Job Alerts & Vacancy Updates</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                  <span>Profile Forward to Suitable Companies</span>
                </li>
              </ul>
            </div>

            {/* CTA Button */}
            <Link 
              to="/jobseeker-register" 
              className="w-full text-center inline-flex items-center justify-center gap-1.5 border border-slate-300 hover:border-slate-400 text-slate-700 hover:text-slate-800 text-xs font-bold py-3 rounded-2xl transition duration-150 cursor-pointer"
            >
              Choose plan <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Card 3: Pro (Most Popular) */}
          <div className="border-2 border-amber-500 rounded-3xl bg-[#fffcf8] p-6 flex flex-col justify-between shadow-md relative pt-10">
            <span className="absolute top-0 start-1/2 -translate-x-1/2 -translate-y-1/2 text-white bg-amber-500 text-[8px] font-black tracking-wider px-3.5 py-1 rounded-full uppercase shadow-sm">
              Most Popular
            </span>
            
            <div>
              {/* Price Details */}
              <div className="pb-6 border-b border-orange-100 mb-6">
                <span className="text-3xl font-black text-slate-950">₹1,000</span>
                <span className="text-xs font-bold text-slate-450 block mt-1.5">One Time Payment</span>
                <span className="inline-block mt-2 px-2.5 py-1 bg-amber-500 text-white text-[9px] font-black uppercase rounded-lg">
                  3 Months Assistance
                </span>
              </div>

              {/* Title & Desc */}
              <div className="mb-6">
                <h4 className="text-sm font-black text-slate-800 tracking-wider uppercase">Pro</h4>
                <p className="text-xs text-slate-400 font-semibold mt-1">
                  Placement Support
                </p>
              </div>

              {/* Features List */}
              <ul className="space-y-3.5 mb-8 text-[11px] font-bold text-slate-550">
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-amber-550 shrink-0 mt-0.5" />
                  <span>Multiple Interview Opportunities</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-amber-550 shrink-0 mt-0.5" />
                  <span>Telephonic & Face-to-Face Support</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-amber-550 shrink-0 mt-0.5" />
                  <span>Priority Profile Forwarding</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-amber-550 shrink-0 mt-0.5" />
                  <span>Accounts, Billing & Backend Job Prep</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-amber-550 shrink-0 mt-0.5" />
                  <span>Regular Job Updates & Career Support</span>
                </li>
              </ul>
            </div>

            {/* CTA Button */}
            <Link 
              to="/jobseeker-register" 
              className="w-full text-center inline-flex items-center justify-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold py-3 rounded-2xl transition duration-150 cursor-pointer shadow-md shadow-amber-500/10"
            >
              Choose plan <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Card 4: Premium */}
          <div className="border border-slate-200 rounded-3xl bg-white p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition duration-200">
            <div>
              {/* Price Details */}
              <div className="pb-6 border-b border-slate-100 mb-6">
                <span className="text-3xl font-black text-slate-950">₹5,000</span>
                <span className="text-xs font-bold text-slate-400 block mt-1.5">One Time Payment</span>
                <span className="inline-block mt-2 px-2.5 py-1 bg-amber-500 text-white text-[9px] font-black uppercase rounded-lg">
                  3 Months Assistance
                </span>
              </div>

              {/* Title & Desc */}
              <div className="mb-6">
                <h4 className="text-sm font-black text-slate-800 tracking-wider uppercase">Premium</h4>
                <p className="text-xs text-slate-400 font-semibold mt-1">
                  Advanced Career Support
                </p>
              </div>

              {/* Features List */}
              <ul className="space-y-3.5 mb-8 text-[11px] font-bold text-slate-550">
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                  <span>Priority Access to WFH & Office Jobs</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                  <span>Multiple Interview Opportunities</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                  <span>Maximum Interview & Placement Support</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                  <span>Computer Basics & Accounting Training</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                  <span>Government Certified Training</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                  <span>Job Assurance Support</span>
                </li>
              </ul>
            </div>

            {/* CTA Button */}
            <Link 
              to="/jobseeker-register" 
              className="w-full text-center inline-flex items-center justify-center gap-1.5 border border-slate-300 hover:border-slate-400 text-slate-700 hover:text-slate-800 text-xs font-bold py-3 rounded-2xl transition duration-150 cursor-pointer"
            >
              Choose plan <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

        </div>

        {/* Invest In Yourself Section */}
        <div className="grid gap-12 lg:grid-cols-2 items-center mb-20 bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 shadow-sm">
          
          {/* Left Graphic Layout Mockup */}
          <div className="relative bg-slate-50 border border-slate-150 rounded-2xl p-6 sm:p-8 flex flex-col gap-6 overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full translate-x-12 -translate-y-12" />
            <h5 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-indigo-600" /> Career Boost Metrics
            </h5>
            
            <div className="grid gap-4 grid-cols-2">
              <div className="bg-white border border-slate-150 p-4 rounded-xl shadow-sm flex flex-col justify-center">
                <span className="text-xl sm:text-2xl font-black text-indigo-600">+40%</span>
                <span className="text-[10px] font-bold text-slate-400 mt-1">Profile Visibility Boost</span>
              </div>
              <div className="bg-white border border-slate-150 p-4 rounded-xl shadow-sm flex flex-col justify-center">
                <span className="text-xl sm:text-2xl font-black text-emerald-600">3x</span>
                <span className="text-[10px] font-bold text-slate-400 mt-1">Faster Recruiter Matches</span>
              </div>
            </div>

            <div className="space-y-3.5 bg-white border border-slate-150 p-4 rounded-xl shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <h6 className="text-[11px] font-extrabold text-slate-800">Priority Placement Forwarding</h6>
                  <p className="text-[9.5px] font-semibold text-slate-400 mt-0.5">Top-tier recruiters review your CV first</p>
                </div>
              </div>
              <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <h6 className="text-[11px] font-extrabold text-slate-800">Certified Training Support</h6>
                  <p className="text-[9.5px] font-semibold text-slate-400 mt-0.5">Basic computers & accounts verification</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Info Section */}
          <div className="space-y-6">
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 leading-snug">
              Invest in Yourself and Open the Door to Better Opportunities
            </h3>
            <div className="space-y-4 text-xs font-medium text-slate-500 leading-relaxed">
              <p>
                Investing in your career is one of the most valuable decisions you can make. Our premium plans are designed to help you stand out in a competitive job market by increasing your visibility to recruiters and giving you access to tools that support your professional growth.
              </p>
              <p>
                Whether you're searching for your first role, aiming for a career change, or pursuing new opportunities, our features are built to help you connect with the right employers faster. Take advantage of enhanced exposure, exclusive opportunities, and resources that bring you one step closer to achieving your career goals.
              </p>
            </div>
          </div>

        </div>

        {/* CTA section: Your Career Deserves More... */}
        <div className="bg-indigo-600 rounded-3xl p-8 sm:p-12 text-white shadow-lg shadow-indigo-600/10 mb-20">
          <div className="grid gap-6 md:grid-cols-12 items-center">
            <div className="md:col-span-8 space-y-3">
              <h3 className="text-2xl sm:text-3xl font-black leading-tight">
                Your Career Deserves More<br className="hidden sm:inline" /> Than Just Applications
              </h3>
              <p className="text-xs sm:text-sm font-semibold text-indigo-100">
                Take control of your career journey and move closer to the role you've been working toward.
              </p>
            </div>
            <div className="md:col-span-4 flex flex-wrap gap-4 justify-start md:justify-end">
              <Link 
                to="/contact" 
                className="bg-white hover:bg-slate-50 text-indigo-600 text-xs font-black py-3.5 px-6 rounded-2xl shadow-sm transition duration-150 cursor-pointer"
              >
                Contact us
              </Link>
              <Link 
                to="/about" 
                className="border border-indigo-400 hover:border-indigo-300 hover:bg-indigo-700/30 text-white text-xs font-black py-3.5 px-6 rounded-2xl transition duration-150 cursor-pointer"
              >
                Learn more
              </Link>
            </div>
          </div>
        </div>

        {/* Trusted Companies section */}
        <TrustedCompanies />

      </div>
    </div>
  );
};

export default JobseekerPlan;
