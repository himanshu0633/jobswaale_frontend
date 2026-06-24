import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Phone, 
  Mail, 
  Zap, 
  Headset, 
  Gauge, 
  Gift, 
  Calendar, 
  CheckCircle2, 
  Rocket, 
  TrendingUp, 
  Building2, 
  Lock,
  ArrowRight,
  Check,
  MapPin
} from 'lucide-react';

export const EmployerPlan = () => {
  return (
    <div className="w-full bg-slate-50/50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Header Promo Banner */}
        <div className="grid gap-8 lg:grid-cols-12 items-center mb-12">
          <div className="lg:col-span-9 space-y-6">
            {/* Hero Section */}
            <div className="text-center md:text-left">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
                Hire <span className="text-blue-600">Faster.</span> Hire Smarter, Hire <span className="text-[#ff5e14]">Better.</span>
              </h2>
              <p className="text-slate-500 text-base sm:text-lg mt-2 font-semibold">
                Post Jobs, Unlock Candidate Contacts & Hire Across India
              </p>
            </div>

            {/* Benefits Horizontal Icon Row */}
            <div className="grid gap-3 grid-cols-2 md:grid-cols-5">
              <div className="p-4 bg-white border border-slate-200 rounded-xl flex items-center gap-3 shadow-sm">
                <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0" />
                <span className="text-xs font-bold text-slate-800 leading-snug">Verified Candidates</span>
              </div>
              <div className="p-4 bg-white border border-slate-200 rounded-xl flex items-center gap-3 shadow-sm">
                <Phone className="h-5 w-5 text-blue-600 shrink-0" />
                <span className="text-xs font-bold text-slate-800 leading-snug">Direct Contact Access</span>
              </div>
              <div className="p-4 bg-white border border-slate-200 rounded-xl flex items-center gap-3 shadow-sm">
                <Zap className="h-5 w-5 text-amber-500 shrink-0" />
                <span className="text-xs font-bold text-slate-800 leading-snug">Faster Hiring Process</span>
              </div>
              <div className="p-4 bg-white border border-slate-200 rounded-xl flex items-center gap-3 shadow-sm">
                <Headset className="h-5 w-5 text-emerald-600 shrink-0" />
                <span className="text-xs font-bold text-slate-800 leading-snug">Dedicated Support</span>
              </div>
              <div className="p-4 bg-white border border-slate-200 rounded-xl flex items-center gap-3 shadow-sm col-span-2 md:col-span-1">
                <Gauge className="h-5 w-5 text-blue-600 shrink-0" />
                <span className="text-xs font-bold text-slate-800 leading-snug">Employer Dashboard</span>
              </div>
            </div>
          </div>

          {/* Right Side Gift Badge */}
          <div className="lg:col-span-3">
            <div className="border border-amber-200 rounded-2xl p-5 text-center space-y-4 shadow-sm bg-[#fffaf5] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/5 rounded-full translate-x-6 -translate-y-6" />
              <div className="flex items-center justify-center text-4xl text-amber-500 gap-2">
                <Gift className="h-10 w-10 text-amber-500" />
                <span className="text-xs font-extrabold text-slate-800 text-left leading-tight">New to<br />JobsWaale?</span>
              </div>
              <div className="font-extrabold text-slate-900 text-lg leading-snug">
                First Job Post <span className="text-[#ff5e14] block text-2xl mt-1">FREE</span>
              </div>
              <p className="text-[11px] font-semibold text-slate-500 leading-relaxed">
                Post a Job Today & Start Receiving Applications Immediately
              </p>
              <Link 
                to="/employer-register" 
                className="block text-center text-white bg-blue-600 hover:bg-blue-700 text-xs font-bold py-2.5 rounded-lg transition shadow-md shadow-blue-600/10 cursor-pointer"
              >
                Post Your First Job Free
              </Link>
            </div>
          </div>
        </div>

        {/* Promo Gift Banner */}
        <div className="border-2 border-amber-300 rounded-3xl p-6 shadow-sm mb-12 flex flex-col md:flex-row items-center justify-between gap-6 bg-[#fffaf5]">
          <div className="flex flex-col md:flex-row items-center gap-5">
            <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center shrink-0">
              <Gift className="h-10 w-10 text-amber-500" />
            </div>
            <div className="space-y-1 text-center md:text-left">
              <h5 className="font-extrabold text-slate-900 text-sm">Welcome to JobsWaale!</h5>
              <h4 className="font-black text-slate-900 text-lg">Your First Job Post is <span className="text-[#ff5e14]">FREE</span></h4>
              <p className="text-xs font-semibold text-slate-500">Post your first job for free and start hiring the best talent.</p>
            </div>
          </div>
          <div className="border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-6 text-center md:text-left">
            <p className="text-xs font-semibold text-slate-500 max-w-xs leading-relaxed">
              After your first free post, unlock more with our affordable plans shown below.
            </p>
          </div>
        </div>

        {/* PLAN ROW 1: WEEKLY PLAN */}
        <div className="border border-slate-200 rounded-3xl bg-white p-5 shadow-sm mb-8">
          <div className="grid gap-6 lg:grid-cols-12 items-stretch">
            
            {/* Left Vertical Badge */}
            <div className="lg:col-span-3 bg-blue-600 rounded-2xl text-white p-6 flex flex-col justify-between h-full">
              <div className="text-3xl font-black opacity-30 select-none">1</div>
              <div className="space-y-1">
                <h4 className="text-base font-bold flex items-center gap-1.5"><Calendar className="h-4 w-4" /> WEEKLY PLAN</h4>
                <p className="text-xs text-blue-100 leading-relaxed font-medium">Best for Quick Hiring</p>
              </div>
            </div>

            {/* Middle Plans list */}
            <div className="lg:col-span-7 flex flex-col justify-center">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl text-center flex flex-col justify-center">
                  <div className="text-2xl font-black text-slate-900">₹149</div>
                  <div className="text-xs font-bold text-slate-400 mt-1">10 Unlocks</div>
                </div>
                
                <div className="p-5 bg-[#fffaf5] border border-orange-200 rounded-2xl text-center flex flex-col justify-between">
                  <div className="my-auto">
                    <div className="text-2xl font-black text-slate-900">₹249</div>
                    <div className="text-xs font-bold text-slate-400 mt-1">20 Unlocks</div>
                  </div>
                  <span className="inline-block mt-3 text-[10px] font-extrabold uppercase bg-emerald-50 text-emerald-600 py-1 rounded">
                    2 Job Posts <strong className="text-emerald-700">Free</strong>
                  </span>
                </div>

                <div className="p-4 bg-white border border-slate-200 rounded-2xl flex flex-col justify-center">
                  <ul className="space-y-2 text-[10px] font-bold text-slate-500">
                    <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-blue-600" /> Direct Contact Access</li>
                    <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-blue-600" /> 7 Days Validity</li>
                    <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-blue-600" /> Employer Dashboard</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Right Special Card */}
            <div className="lg:col-span-2 bg-[#041e5b] rounded-2xl p-5 text-center flex flex-col justify-center text-white">
              <h5 className="text-[10px] font-extrabold uppercase text-amber-400 tracking-wider">First Time Offer</h5>
              <p className="text-[10px] font-semibold text-slate-200 mt-1">Weekly Plan</p>
              <div className="text-2xl font-black text-amber-400 my-1">FREE</div>
              <p className="text-[9px] text-slate-300 leading-snug">with your First Job Post</p>
            </div>

          </div>
        </div>

        {/* PLAN ROW 2: MONTHLY PLAN */}
        <div className="border border-slate-200 rounded-3xl bg-white p-5 shadow-sm mb-8">
          <div className="grid gap-6 lg:grid-cols-12 items-stretch">
            
            {/* Left Vertical Badge */}
            <div className="lg:col-span-3 bg-[#ff5e14] rounded-2xl text-white p-6 flex flex-col justify-between h-full">
              <div className="text-3xl font-black opacity-30 select-none">2</div>
              <div className="space-y-1">
                <h4 className="text-base font-bold flex items-center gap-1.5"><Calendar className="h-4 w-4" /> MONTHLY PLAN</h4>
                <p className="text-xs text-orange-100 leading-relaxed font-medium">Best for Active Hiring</p>
              </div>
            </div>

            {/* Middle Plans list */}
            <div className="lg:col-span-6 flex flex-col justify-center">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl text-center flex flex-col justify-between">
                  <div className="my-auto">
                    <div className="text-2xl font-black text-slate-900">₹499</div>
                    <div className="text-xs font-bold text-slate-400 mt-1">40 Unlocks</div>
                  </div>
                  <span className="inline-block mt-3 text-[10px] font-extrabold uppercase bg-emerald-50 text-emerald-600 py-1 rounded">
                    3 Job Posts <strong className="text-emerald-700">Free</strong>
                  </span>
                </div>
                
                <div className="p-5 border-2 border-[#ff5e14] rounded-2xl text-center flex flex-col justify-between bg-[#fffaf5] relative pt-6">
                  <span className="absolute top-0 start-50 translate-middle text-white bg-[#ff5e14] text-[8px] font-black tracking-wider px-2 py-0.5 rounded-full uppercase">
                    Most Popular
                  </span>
                  <div className="my-auto">
                    <div className="text-2xl font-black text-slate-900">₹999</div>
                    <div className="text-xs font-bold text-slate-400 mt-1">90 Unlocks</div>
                  </div>
                  <span className="inline-block mt-3 text-[10px] font-extrabold uppercase bg-emerald-50 text-emerald-600 py-1 rounded">
                    5 Job Posts <strong className="text-emerald-700">Free</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Right Features */}
            <div className="lg:col-span-3 bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-center">
              <ul className="space-y-2.5 text-[10px] font-bold text-slate-500">
                <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-[#ff5e14]" /> Direct Contact Access</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-[#ff5e14]" /> Employer Dashboard</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-[#ff5e14]" /> Priority Support</li>
              </ul>
            </div>

          </div>
        </div>

        {/* PLAN ROW 3: QUARTERLY PLAN */}
        <div className="border border-slate-200 rounded-3xl bg-white p-5 shadow-sm mb-8">
          <div className="grid gap-6 lg:grid-cols-12 items-stretch">
            
            {/* Left Vertical Badge */}
            <div className="lg:col-span-3 bg-orange-600 rounded-2xl text-white p-6 flex flex-col justify-between h-full">
              <div className="text-3xl font-black opacity-30 select-none">3</div>
              <div className="space-y-1">
                <h4 className="text-base font-bold flex items-center gap-1.5"><Calendar className="h-4 w-4" /> QUARTERLY PLAN</h4>
                <p className="text-xs text-orange-100 leading-relaxed font-medium">Best for Growing Companies</p>
              </div>
            </div>

            {/* Middle Plans list */}
            <div className="lg:col-span-6 flex flex-col justify-center">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl text-center flex flex-col justify-between">
                  <div className="my-auto">
                    <div className="text-2xl font-black text-slate-900">₹1,299</div>
                    <div className="text-xs font-bold text-slate-400 mt-1">75 Unlocks</div>
                  </div>
                  <span className="inline-block mt-3 text-[10px] font-extrabold uppercase bg-emerald-50 text-emerald-600 py-1 rounded">
                    3 Job Posts <strong className="text-emerald-700">Free</strong>
                  </span>
                </div>
                
                <div className="p-5 border-2 border-[#ff5e14] bg-white rounded-2xl text-center flex flex-col justify-between relative pt-6">
                  <span className="absolute top-0 start-50 translate-middle text-white bg-[#ff5e14] text-[8px] font-black tracking-wider px-2 py-0.5 rounded-full uppercase">
                    Best Value
                  </span>
                  <div className="my-auto">
                    <div className="text-2xl font-black text-slate-900">₹2,499</div>
                    <div className="text-xs font-bold text-slate-400 mt-1">175 Unlocks</div>
                  </div>
                  <span className="inline-block mt-3 text-[10px] font-extrabold uppercase bg-emerald-50 text-emerald-600 py-1 rounded">
                    5 Job Posts <strong className="text-emerald-700">Free</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Right Features */}
            <div className="lg:col-span-3 bg-white border border-slate-200 rounded-2xl p-4 flex flex-col justify-center">
              <ul className="space-y-2.5 text-[10px] font-bold text-slate-500">
                <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-[#ff5e14]" /> Lower Cost Per Unlock</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-[#ff5e14]" /> Priority Support</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-[#ff5e14]" /> Candidate Tracking</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-[#ff5e14]" /> Detailed Insights</li>
              </ul>
            </div>

          </div>
        </div>

        {/* PLAN ROW 4: YEARLY PLAN */}
        <div className="border border-slate-200 rounded-3xl bg-white p-5 shadow-sm mb-8">
          <div className="grid gap-6 lg:grid-cols-12 items-stretch">
            
            {/* Left Vertical Badge */}
            <div className="lg:col-span-3 bg-orange-700 rounded-2xl text-white p-6 flex flex-col justify-between h-full">
              <div className="text-3xl font-black opacity-30 select-none">4</div>
              <div className="space-y-1">
                <h4 className="text-base font-bold flex items-center gap-1.5"><Calendar className="h-4 w-4" /> YEARLY PLAN</h4>
                <p className="text-xs text-orange-100 leading-relaxed font-medium">Best for Long-Term Hiring</p>
              </div>
            </div>

            {/* Middle Plans list */}
            <div className="lg:col-span-6 flex flex-col justify-center">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl text-center flex flex-col justify-between">
                  <div className="my-auto">
                    <div className="text-2xl font-black text-slate-900">₹4,999</div>
                    <div className="text-xs font-bold text-slate-400 mt-1">250 Unlocks</div>
                  </div>
                  <span className="inline-block mt-3 text-[10px] font-extrabold uppercase bg-emerald-50 text-emerald-600 py-1 rounded">
                    5 Job Posts <strong className="text-emerald-700">Free</strong>
                  </span>
                </div>
                
                <div className="p-5 border-2 border-[#ff5e14] bg-white rounded-2xl text-center flex flex-col justify-between relative pt-6">
                  <span className="absolute top-0 start-50 translate-middle text-white bg-[#ff5e14] text-[8px] font-black tracking-wider px-2 py-0.5 rounded-full uppercase">
                    Enterprise Choice
                  </span>
                  <div className="my-auto">
                    <div className="text-2xl font-black text-slate-900">₹9,999</div>
                    <div className="text-xs font-bold text-slate-400 mt-1">500 Unlocks</div>
                  </div>
                  <span className="inline-block mt-3 text-[10px] font-extrabold uppercase bg-emerald-50 text-emerald-600 py-1 rounded">
                    10 Job Posts <strong className="text-emerald-700">Free</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Right Features */}
            <div className="lg:col-span-3 bg-white border border-slate-200 rounded-2xl p-4 flex flex-col justify-center">
              <ul className="space-y-2.5 text-[10px] font-bold text-slate-500">
                <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-[#ff5e14]" /> Lowest Cost Per Unlock</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-[#ff5e14]" /> Dedicated Account Manager</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-[#ff5e14]" /> Recruitment Reports</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-[#ff5e14]" /> Advanced Insights</li>
              </ul>
            </div>

          </div>
        </div>

        {/* SECTION 5: MANAGED RECRUITMENT SERVICES */}
        <div className="text-center mb-10 mt-16 space-y-2">
          <span className="inline-block bg-blue-50 text-blue-600 text-xs font-extrabold px-3.5 py-1.5 rounded-full uppercase tracking-wider">
            Value Added Services
          </span>
          <h3 className="text-2xl font-extrabold text-slate-950">MANAGED RECRUITMENT SERVICES</h3>
          <p className="text-slate-500 text-sm max-w-2xl mx-auto">
            We Find, Screen & Shortlist Candidates For You — Share your Job Description and let our expert team handle the rest.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 items-stretch mb-16 mt-8">
          
          {/* Card 1: Fast Hiring */}
          <div className="border border-slate-250 rounded-2xl p-5 bg-white flex flex-col justify-between text-center shadow-sm">
            <div>
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Rocket className="h-6 w-6" />
              </div>
              <h4 className="font-extrabold text-blue-800 text-base">FAST HIRING</h4>
              <p className="text-[10px] text-slate-400 font-semibold mt-1">Best for Immediate Hiring</p>
              
              <div className="py-4 border-b border-slate-100 my-4 space-y-1">
                <div className="text-2xl font-black text-slate-950">1</div>
                <div className="text-[10.5px] font-bold text-slate-400 uppercase">Shortlisted Candidate</div>
                <div className="text-xl font-extrabold text-blue-700 pt-1">₹5,000</div>
              </div>

              <ul className="text-left space-y-2 text-[10px] font-semibold text-slate-500 mb-6">
                <li className="flex items-center gap-1"><Check className="h-4.5 w-4.5 text-blue-600" /> Candidate Sourcing</li>
                <li className="flex items-center gap-1"><Check className="h-4.5 w-4.5 text-blue-600" /> Initial Screening</li>
                <li className="flex items-center gap-1"><Check className="h-4.5 w-4.5 text-blue-600" /> Resume Verification</li>
                <li className="flex items-center gap-1"><Check className="h-4.5 w-4.5 text-blue-600" /> Contact Details Shared</li>
              </ul>
            </div>
            <div className="bg-blue-50 text-blue-700 text-[10px] font-bold py-2 rounded-xl">
              Delivery: 3-5 Working Days
            </div>
          </div>

          {/* Card 2: Growth Hiring */}
          <div className="border-2 border-[#ff5e14] rounded-2xl p-5 bg-[#fffaf5] flex flex-col justify-between text-center shadow-sm relative pt-7">
            <span className="absolute top-0 start-50 translate-middle text-white bg-[#ff5e14] text-[8px] font-black tracking-wider px-3 py-1 rounded-full uppercase">
              Most Popular
            </span>
            <div>
              <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-6 w-6 text-orange-500" />
              </div>
              <h4 className="font-extrabold text-orange-700 text-base">GROWTH HIRING</h4>
              <p className="text-[10px] text-slate-400 font-semibold mt-1">Perfect for Multiple Options</p>
              
              <div className="py-4 border-b border-slate-100 my-4 space-y-1">
                <div className="text-2xl font-black text-slate-950">5</div>
                <div className="text-[10.5px] font-bold text-slate-400 uppercase">Shortlisted Candidates</div>
                <div className="text-xl font-extrabold text-[#ff5e14] pt-1">₹20,000</div>
                <span className="text-[9px] font-extrabold text-orange-655 block mt-1">(Save ₹5,000)</span>
              </div>

              <ul className="text-left space-y-2 text-[10px] font-semibold text-slate-500 mb-6">
                <li className="flex items-center gap-1"><Check className="h-4.5 w-4.5 text-orange-500" /> Everything in Fast Hiring</li>
                <li className="flex items-center gap-1"><Check className="h-4.5 w-4.5 text-orange-500" /> Advanced Screening</li>
                <li className="flex items-center gap-1"><Check className="h-4.5 w-4.5 text-orange-500" /> Skill & Exp Matching</li>
                <li className="flex items-center gap-1"><Check className="h-4.5 w-4.5 text-orange-500" /> Interview scheduling support</li>
              </ul>
            </div>
            <div className="bg-[#ff5e14] text-white text-[10px] font-bold py-2 rounded-xl">
              Delivery: 5-7 Working Days
            </div>
          </div>

          {/* Card 3: Business Hiring */}
          <div className="border border-slate-250 rounded-2xl p-5 bg-white flex flex-col justify-between text-center shadow-sm">
            <div>
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="h-6 w-6" />
              </div>
              <h4 className="font-extrabold text-blue-800 text-base">BUSINESS HIRING</h4>
              <p className="text-[10px] text-slate-400 font-semibold mt-1">For Growing Companies</p>
              
              <div className="py-4 border-b border-slate-100 my-4 space-y-1">
                <div className="text-2xl font-black text-slate-950">10</div>
                <div className="text-[10.5px] font-bold text-slate-400 uppercase">Shortlisted Candidates</div>
                <div className="text-xl font-extrabold text-blue-700 pt-1">₹40,000</div>
                <span className="text-[9px] font-extrabold text-blue-655 block mt-1">(Save ₹10,000)</span>
              </div>

              <ul className="text-left space-y-2 text-[10px] font-semibold text-slate-500 mb-6">
                <li className="flex items-center gap-1"><Check className="h-4.5 w-4.5 text-blue-600" /> Sourcing across channels</li>
                <li className="flex items-center gap-1"><Check className="h-4.5 w-4.5 text-blue-600" /> Dedicated Recruiter</li>
                <li className="flex items-center gap-1"><Check className="h-4.5 w-4.5 text-blue-600" /> Multiple Position Support</li>
                <li className="flex items-center gap-1"><Check className="h-4.5 w-4.5 text-blue-600" /> Interview Coordination</li>
              </ul>
            </div>
            <div className="bg-blue-50 text-blue-700 text-[10px] font-bold py-2 rounded-xl">
              Delivery: 7-10 Working Days
            </div>
          </div>

          {/* Card 4: Talent Partner */}
          <div className="border border-slate-800 rounded-2xl p-5 bg-gradient-to-br from-[#0d1e3d] to-[#001026] text-white flex flex-col justify-between text-center shadow-sm">
            <div>
              <div className="w-12 h-12 bg-amber-500/10 text-amber-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="h-6 w-6" />
              </div>
              <h4 className="font-extrabold text-amber-400 text-base">TALENT PARTNER</h4>
              <p className="text-[10px] text-slate-300 font-semibold mt-1">Your Extended Recruiting Team</p>
              
              <div className="py-4 border-b border-slate-700/60 my-4 space-y-1">
                <div className="text-2xl font-black text-white">20+</div>
                <div className="text-[10.5px] font-bold text-slate-350 uppercase">Shortlisted Candidates</div>
                <div className="text-lg font-extrabold text-amber-400 pt-1">Custom Pricing</div>
              </div>

              <ul className="text-left space-y-2 text-[10px] font-semibold text-slate-200 mb-6">
                <li className="flex items-center gap-1"><Check className="h-4.5 w-4.5 text-amber-400" /> Dedicated Account Manager</li>
                <li className="flex items-center gap-1"><Check className="h-4.5 w-4.5 text-amber-400" /> Pan-India Sourcing</li>
                <li className="flex items-center gap-1"><Check className="h-4.5 w-4.5 text-amber-400" /> Employer Branding Support</li>
                <li className="flex items-center gap-1"><Check className="h-4.5 w-4.5 text-amber-400" /> Leadership Hiring Support</li>
              </ul>
            </div>
            <div className="bg-amber-400 text-slate-900 text-[10px] font-bold py-2 rounded-xl">
              Best for Large Scale Hiring
            </div>
          </div>

        </div>

        {/* WHY EMPLOYERS CHOOSE JOBS WAALE */}
        <div className="text-center mb-10 mt-16 space-y-2">
          <h3 className="text-2xl font-extrabold text-slate-950">WHY EMPLOYERS CHOOSE JOBS WAALE</h3>
          <p className="text-slate-500 text-sm max-w-2xl mx-auto">
            We help businesses hire more efficiently with verified profiles and smart tracking integrations.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-16">
          {['Quality Candidates', 'Easy & Fast Process', 'Cost Effective', 'Dedicated Support'].map((item, index) => (
            <div key={index} className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center shrink-0 shadow-md shadow-blue-500/10">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h5 className="font-extrabold text-slate-900 text-sm">{item}</h5>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Verified & Reliable</p>
              </div>
            </div>
          ))}
        </div>

        {/* NETWORK METRICS & CONTACT HELPLINE */}
        <div className="grid gap-6 md:grid-cols-2">
          
          {/* Left panel metrics */}
          <div className="p-6 bg-white border border-slate-200 rounded-2xl text-left flex flex-col justify-between shadow-sm">
            <div>
              <h5 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider mb-5">JOBS WAALE NETWORK</h5>
              <div className="grid gap-4 grid-cols-3">
                <div>
                  <div className="text-2xl font-black text-blue-600">10,000+</div>
                  <div className="text-[10px] font-bold text-slate-400 mt-1">Active Job Seekers</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-blue-600">500+</div>
                  <div className="text-[10px] font-bold text-slate-400 mt-1">Employers</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-blue-600">100+</div>
                  <div className="text-[10px] font-bold text-slate-400 mt-1">Weekly Registrations</div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 mt-6 pt-4 border-t border-slate-100 text-slate-400 text-xs font-semibold">
              <MapPin className="h-4.5 w-4.5 text-rose-500 shrink-0" />
              <span>Growing Across India</span>
            </div>
          </div>

          {/* Right panel helpline */}
          <div className="p-6 bg-white border border-slate-200 rounded-2xl text-left flex flex-col justify-between shadow-sm">
            <div>
              <h5 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider mb-1">NEED HIRING ASSISTANCE?</h5>
              <p className="text-[10px] text-slate-400 font-semibold mb-4">Our recruitment coordinators are ready to assist you.</p>
              
              <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold">
                <Calendar className="h-4.5 w-4.5 text-slate-400" />
                <span>Monday - Saturday (10:00 AM - 5:00 PM)</span>
              </div>
            </div>
            <div className="row g-2 border-t border-slate-100 pt-4 mt-6 flex flex-col sm:flex-row gap-4 sm:gap-12">
              <a href="tel:+919999884424" className="flex items-center gap-2 text-slate-800 hover:text-blue-600 transition text-xs font-bold">
                <Phone className="h-4.5 w-4.5 text-blue-600 shrink-0" />
                <span>+91 99998 84424</span>
              </a>
              <a href="mailto:support@jobswaale.com" className="flex items-center gap-2 text-slate-800 hover:text-blue-600 transition text-xs font-bold">
                <Mail className="h-4.5 w-4.5 text-blue-600 shrink-0" />
                <span>support@jobswaale.com</span>
              </a>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default EmployerPlan;
