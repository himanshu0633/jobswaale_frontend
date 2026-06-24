import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';
import logoAsset from '../../assets/logo.png';

// Custom social SVG components
const TwitterIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

const LinkedinIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const GithubIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

export const PublicFooter = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid gap-8 grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
          {/* Logo & Info */}
          <div className="col-span-2 space-y-4">
            <Link to="/" className="inline-block">
              <img src={logoAsset} alt="JobsWaale" className="h-9 w-auto object-contain brightness-0 invert" />
            </Link>
            <p className="text-xs leading-relaxed max-w-sm">
              We connect job seekers with the right opportunities and help organizations find exceptional talent.
            </p>
            <div className="flex gap-4 pt-2">
              <a href="#" className="hover:text-white transition duration-150"><TwitterIcon className="h-4 w-4" /></a>
              <a href="#" className="hover:text-white transition duration-150"><LinkedinIcon className="h-4 w-4" /></a>
              <a href="#" className="hover:text-white transition duration-150"><GithubIcon className="h-4 w-4" /></a>
            </div>
          </div>

          {/* Candidates Column */}
          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-4">For Job Seekers</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/login" className="hover:text-white transition">Browse Jobs</Link></li>
              <li><Link to="/jobseeker-plan" className="hover:text-white transition">Candidate Plans</Link></li>
              <li><Link to="/login" className="hover:text-white transition">Upload Resume</Link></li>
              <li><Link to="/login?role=employer" className="hover:text-white transition">Browse Employer</Link></li>
            </ul>
          </div>

          {/* Employers Column */}
          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-4">For Employers</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/employer-plan" className="hover:text-white transition">Employer Plans</Link></li>
              <li><Link to="/employer-register" className="hover:text-white transition">Post a Job</Link></li>
              <li><Link to="/login?role=employer" className="hover:text-white transition">Browse Candidates</Link></li>
              <li><Link to="/contact" className="hover:text-white transition">Hiring Solutions</Link></li>
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-4">Company</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/about" className="hover:text-white transition">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-white transition">Contact Us</Link></li>
              <li><Link to="/faq" className="hover:text-white transition">FAQ Page</Link></li>
              <li><Link to="/blogs" className="hover:text-white transition">Blog</Link></li>
            </ul>
          </div>

          {/* Contact Column */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-4">Contact Us</h4>
            <div className="flex gap-2.5 items-start text-xs">
              <Mail className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
              <span className="break-all">Jobswaale.india@gmail.com</span>
            </div>
            <div className="flex gap-2.5 items-center text-xs">
              <Phone className="h-4 w-4 text-slate-400 shrink-0" />
              <span>+91 99998 84424</span>
            </div>
            <div className="flex gap-2.5 items-start text-xs">
              <MapPin className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
              <span>Hamirpur, Himachal Pradesh, India</span>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>© {new Date().getFullYear()} JobsWaale. All rights reserved.</p>
          <div className="flex items-center gap-5 text-slate-500">
            <Link to="/privacy-policy" className="hover:text-white transition">Privacy Policy</Link>
            <Link to="/terms-conditions" className="hover:text-white transition">Terms & Conditions</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default PublicFooter;
