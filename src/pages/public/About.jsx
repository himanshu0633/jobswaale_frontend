import React from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart3, 
  Layers, 
  TrendingUp, 
  Globe, 
  Briefcase, 
  ArrowRight, 
  Star,
  Users
} from 'lucide-react';

const FEATURES = [
  {
    icon: BarChart3,
    title: 'Market Research',
    desc: 'It is a long established fact that a reader will be.',
    color: 'bg-blue-50 text-blue-600 border-blue-100'
  },
  {
    icon: Layers,
    title: 'Creative Layout',
    desc: 'It is a long established fact that a reader will be.',
    color: 'bg-orange-50 text-orange-600 border-orange-100'
  },
  {
    icon: TrendingUp,
    title: 'Digital Marketing',
    desc: 'It is a long established fact that a reader will be.',
    color: 'bg-emerald-50 text-emerald-600 border-emerald-105'
  },
  {
    icon: Globe,
    title: 'SEO & Backlinks',
    desc: 'It is a long established fact that a reader will be.',
    color: 'bg-purple-50 text-purple-650 border-purple-100'
  }
];

const TEAM = [
  { name: 'Elon Musk', role: 'Marketing Crew', letter: 'E', bg: 'bg-rose-100 text-rose-700' },
  { name: 'Bernard Arnault', role: 'Marketing Crew', letter: 'B', bg: 'bg-blue-100 text-blue-700' },
  { name: 'Jeff Bezos', role: 'Marketing Crew', letter: 'J', bg: 'bg-emerald-100 text-emerald-700' },
  { name: 'Bill Gates', role: 'Marketing Crew', letter: 'B', bg: 'bg-amber-100 text-amber-700' }
];

const TESTIMONIALS = [
  {
    name: 'Sarah Harding',
    role: 'Visual Designer',
    text: 'We are on the hunt for a designer who is exceptional in both making incredible product interfaces as well as product branding layouts.'
  },
  {
    name: 'Sarah Harding',
    role: 'Visual Designer',
    text: 'We are on the hunt for a designer who is exceptional in both making incredible product interfaces as well as product branding layouts.'
  },
  {
    name: 'Sarah Harding',
    role: 'Visual Designer',
    text: 'We are on the hunt for a designer who is exceptional in both making incredible product interfaces as well as product branding layouts.'
  }
];

export const About = () => {
  return (
    <div className="w-full bg-white">
      {/* Hero Banner Section */}
      <section className="bg-slate-50 py-16 lg:py-24 border-b border-slate-100 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-12 items-center">
            
            {/* Left Column Text details */}
            <div className="lg:col-span-7 space-y-6">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
                The <span className="text-[#ff5e14]">#1 Job Board</span> for <br />
                Finding Your Dream Job
              </h1>
              <p className="text-slate-500 text-base sm:text-lg max-w-xl leading-relaxed">
                Search and connect with the right candidates faster. This talent search gives you the opportunity to find candidates who may be a perfect fit for your role.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <Link 
                  to="/contact" 
                  className="bg-[#ff5e14] hover:bg-[#e05300] text-white font-bold text-sm px-6 py-3 rounded-xl transition duration-150 shadow-lg shadow-orange-600/20 cursor-pointer"
                >
                  Contact us
                </Link>
                <Link 
                  to="/contact" 
                  className="border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-sm px-6 py-3 rounded-xl transition cursor-pointer"
                >
                  Support center
                </Link>
              </div>
            </div>

            {/* Right Column Graphic illustration */}
            <div className="lg:col-span-5 hidden lg:block relative">
              <div className="relative w-full h-[320px] flex items-center justify-center">
                {/* Backdrop decorative blur */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-blue-100/50 blur-3xl" />
                <div className="absolute top-10 right-10 w-32 h-32 rounded-full bg-orange-100/40 blur-2xl" />

                {/* Mock Card Graphic */}
                <div className="relative bg-white border border-slate-200 rounded-3xl p-6 shadow-xl w-80 space-y-4 transform rotate-2 hover:rotate-0 transition duration-300">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-650 flex items-center justify-center font-bold">JW</div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm">JobsWaale India</h4>
                      <p className="text-[10px] text-slate-400 font-bold">10k+ Active Members</p>
                    </div>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full w-full" />
                  <div className="h-2 bg-slate-100 rounded-full w-5/6" />
                  <div className="h-2 bg-slate-100 rounded-full w-4/6" />
                  <div className="flex gap-2 pt-2">
                    <div className="h-5 bg-blue-50 text-blue-600 text-[9px] font-bold px-2 rounded flex items-center">Tech</div>
                    <div className="h-5 bg-orange-50 text-orange-600 text-[9px] font-bold px-2 rounded flex items-center">Design</div>
                  </div>
                </div>

                {/* Floating Badges */}
                <div className="absolute top-6 left-6 bg-white border border-slate-200 rounded-2xl p-3 shadow-lg flex items-center gap-2 transform -rotate-6">
                  <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-bold">✓</div>
                  <span className="text-[10px] font-bold text-slate-650">Direct Hiring</span>
                </div>
                <div className="absolute bottom-6 right-6 bg-white border border-slate-200 rounded-2xl p-3 shadow-lg flex items-center gap-2 transform rotate-6">
                  <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold">★</div>
                  <span className="text-[10px] font-bold text-slate-650">Verified Teams</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Core Features Grid Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <div 
                  key={index}
                  className="group border border-slate-200 rounded-2xl p-6 bg-white hover:border-indigo-200 hover:shadow-md transition-all duration-200"
                >
                  <div className={`p-4 rounded-xl w-14 h-14 flex items-center justify-center mb-5 shrink-0 transition-colors ${item.color}`}>
                    <IconComponent className="h-6 w-6" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-base group-hover:text-indigo-600 transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-slate-500 text-xs mt-3 leading-relaxed">
                    {item.desc}
                  </p>
                  <Link 
                    to="/contact"
                    className="inline-flex items-center gap-1.5 mt-5 text-xs font-bold text-indigo-600 hover:text-indigo-500"
                  >
                    Read more <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Find Jobs Block Container */}
      <section className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 sm:p-12 shadow-sm grid gap-10 lg:grid-cols-2 items-center">
            
            {/* Left Graphic mock */}
            <div className="relative h-[250px] flex items-center justify-center d-none d-md-flex">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-indigo-100/50 blur-2xl" />
              <div className="relative bg-white border border-slate-200 rounded-2xl p-5 shadow-lg w-72 space-y-4">
                <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                  <Briefcase className="h-5 w-5" />
                </div>
                <h4 className="font-extrabold text-slate-900 text-sm">Post a Job & Scale Today</h4>
                <p className="text-xs text-slate-500 leading-relaxed">Reach out to thousands of candidates who are actively looking for new opportunities.</p>
                <Link to="/employer-register" className="inline-flex items-center gap-1 text-xs font-bold text-indigo-650 hover:text-indigo-500">
                  Create Account Free <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* Right Information description */}
            <div className="space-y-4 flex flex-col justify-center">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Find jobs</span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                Create free account and start applying to your dream job today
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum is simply dummy.
              </p>
              <div className="pt-2">
                <Link 
                  to="/jobs" 
                  className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-6 py-3 rounded-xl transition shadow-md shadow-indigo-600/10 cursor-pointer"
                >
                  Explore more
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Online Marketingcommitted Section */}
      <section className="py-20 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            
            {/* Info details */}
            <div className="space-y-5">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Online Marketing</span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                Committed to top quality and results
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Proin ullamcorper pretium orci. Donec necscele risque leo. Nam massa dolor imperdiet neccon sequata congue idsem. Maecenas malesuada faucibus finibus.
              </p>
              <p className="text-slate-500 text-sm leading-relaxed">
                Proin ullamcorper pretium orci. Donec necscele risque leo. Nam massa dolor imperdiet neccon sequata congue idsem. Maecenas malesuada faucibus finibus.
              </p>
              <div className="pt-2">
                <Link 
                  to="/contact" 
                  className="inline-flex items-center gap-2 bg-[#ff5e14] hover:bg-[#e05300] text-white font-bold text-xs px-6 py-3 rounded-xl transition shadow-lg shadow-orange-600/20 cursor-pointer"
                >
                  Learn more
                </Link>
              </div>
            </div>

            {/* Illustration */}
            <div className="hidden lg:block relative">
              <div className="relative w-full h-[300px] flex items-center justify-center">
                {/* Colorful backdrop blobs */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-orange-100/50 blur-3xl" />
                {/* Floating Congratulations card */}
                <div className="relative bg-white border border-slate-200 rounded-3xl p-6 shadow-xl w-80 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">✓</div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm">Congratulations!</h4>
                      <p className="text-[10px] text-slate-400 font-bold">Your job posting is now live.</p>
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-xs text-slate-600 font-semibold leading-relaxed">
                    "We received over 120 applications within the first 24 hours of posting!"
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Meet Our Team Section */}
      <section className="py-20 bg-slate-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Meet our team</h2>
          <p className="mt-3 text-slate-500 text-sm max-w-xl mx-auto font-medium">
            Find the type of work you need, clearly defined and ready to start. Work begins as soon as you purchase and provide requirements.
          </p>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 mt-16">
            {TEAM.map((member, index) => (
              <div key={index} className="border border-slate-200 rounded-2xl p-6 bg-white hover:shadow-md transition duration-200 flex flex-col items-center">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center font-extrabold text-3xl shrink-0 shadow-inner mb-4 ${member.bg}`}>
                  {member.letter}
                </div>
                <h5 className="font-extrabold text-slate-900 text-base">{member.name}</h5>
                <p className="text-xs text-slate-400 font-semibold mt-1">{member.role}</p>

                {/* Social icons */}
                <div className="flex items-center gap-3 mt-6">
                  {['fb', 'tw', 'inst', 'in'].map((social) => (
                    <span 
                      key={social} 
                      className="w-7 h-7 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-[10px] uppercase font-bold text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer select-none"
                    >
                      {social}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Happy Customers Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Our Happy Customers</h2>
          <p className="mt-3 text-slate-500 text-sm max-w-xl mx-auto font-medium">
            When it comes to choosing the right web hosting provider, we know how easy it is to get overwhelmed with the number.
          </p>

          <div className="grid gap-8 md:grid-cols-3 mt-16">
            {TESTIMONIALS.map((item, index) => (
              <div 
                key={index} 
                className="border border-slate-250 rounded-2xl p-6 bg-white hover:border-indigo-150 hover:shadow-md transition duration-200 text-left flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-1 text-amber-400 mb-4 justify-center md:justify-start">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-slate-600 text-xs italic leading-relaxed text-center md:text-left">
                    "{item.text}"
                  </p>
                </div>
                <div className="flex items-center gap-3 mt-6 border-t border-slate-100 pt-4 justify-center md:justify-start">
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                    {item.name.charAt(0)}
                  </div>
                  <div>
                    <h5 className="font-extrabold text-slate-900 text-xs">{item.name}</h5>
                    <p className="text-[10px] text-slate-400 font-semibold">{item.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
