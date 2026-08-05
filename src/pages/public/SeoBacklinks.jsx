import React from 'react';
import { Link } from 'react-router-dom';

const SeoBacklinks = () => {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-16 lg:pt-20 pb-16">
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <span className="text-[#0047C7] text-lg sm:text-xl font-semibold">Our Services</span>
          <h1 className="text-[28px] leading-[36px] sm:text-[36px] sm:leading-[44px] lg:text-[44px] lg:leading-[54px] font-bold text-[#1f2938] mt-4 mb-5">
            SEO & Backlinks
          </h1>
          <p className="text-[#37404e] text-base sm:text-lg leading-relaxed">
            Improve your search rankings and domain authority with ethical SEO practices and high-quality backlink strategies.
          </p>
        </div>

        <div className="grid gap-6 sm:gap-8 lg:grid-cols-2 items-center mb-12 sm:mb-16">
          <div>
            <h2 className="text-[22px] sm:text-[28px] font-bold text-[#1f2938] mb-4">Rank Higher, Convert More</h2>
            <p className="text-[#37404e] text-base leading-relaxed mb-4">
              Our SEO and backlink services focus on sustainable, white-hat techniques that boost your organic visibility over time. We conduct thorough audits, keyword research, and competitor analysis to build a solid foundation.
            </p>
            <p className="text-[#37404e] text-base leading-relaxed mb-6">
              Through strategic link building and on-page optimization, we help you earn authoritative backlinks that signal trust to search engines and drive qualified traffic to your site.
            </p>
            <Link
              to="/contact"
              className="inline-block bg-[#0047C7] hover:bg-[#0052cc] text-white font-medium text-base px-6 py-3.5 rounded-lg transition-all hover:-translate-y-0.5"
            >
              Get Started
            </Link>
          </div>
          <div className="bg-[#f5f6f8] rounded-2xl p-8 sm:p-10 border border-[#ececec]">
            <h3 className="text-xl font-bold text-[#1f2938] mb-4">What We Offer</h3>
            <ul className="space-y-3">
              {[
                'Technical SEO audits',
                'On-page optimization',
                'Keyword research and mapping',
                'High-quality backlink building',
                'Local SEO optimization',
                'Monthly ranking and traffic reports',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-[#37404e] text-base">
                  <span className="mt-1.5 w-2 h-2 rounded-full bg-[#0047C7] flex-shrink-0"></span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="text-center">
          <h3 className="text-[22px] sm:text-[28px] font-bold text-[#1f2938] mb-4">Ready to climb the rankings?</h3>
          <p className="text-[#37404e] text-base sm:text-lg leading-relaxed max-w-2xl mx-auto mb-6">
            Let our SEO specialists develop a customized plan that improves your search performance and delivers long-term organic growth.
          </p>
          <Link
            to="/contact"
            className="inline-block bg-[#0047C7] hover:bg-[#0052cc] text-white font-medium text-base px-6 py-3.5 rounded-lg transition-all hover:-translate-y-0.5"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </main>
  );
};

export default SeoBacklinks;
