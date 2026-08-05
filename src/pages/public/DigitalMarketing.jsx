import React from 'react';
import { Link } from 'react-router-dom';

const DigitalMarketing = () => {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-16 lg:pt-20 pb-16">
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <span className="text-[#0047C7] text-lg sm:text-xl font-semibold">Our Services</span>
          <h1 className="text-[28px] leading-[36px] sm:text-[36px] sm:leading-[44px] lg:text-[44px] lg:leading-[54px] font-bold text-[#1f2938] mt-4 mb-5">
            Digital Marketing
          </h1>
          <p className="text-[#37404e] text-base sm:text-lg leading-relaxed">
            Amplify your brand reach and drive measurable growth with data-driven digital marketing strategies tailored to your business goals.
          </p>
        </div>

        <div className="grid gap-6 sm:gap-8 lg:grid-cols-2 items-center mb-12 sm:mb-16">
          <div>
            <h2 className="text-[22px] sm:text-[28px] font-bold text-[#1f2938] mb-4">Grow Your Online Presence</h2>
            <p className="text-[#37404e] text-base leading-relaxed mb-4">
              Our digital marketing services cover the full funnel from awareness to conversion. We create targeted campaigns across search, social, email, and display channels to maximize your ROI.
            </p>
            <p className="text-[#37404e] text-base leading-relaxed mb-6">
              With continuous optimization and transparent reporting, we ensure every marketing dollar works harder for your business.
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
                'Search engine marketing (SEM)',
                'Social media marketing',
                'Email marketing campaigns',
                'Content marketing strategy',
                'Pay-per-click (PPC) advertising',
                'Analytics and performance tracking',
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
          <h3 className="text-[22px] sm:text-[28px] font-bold text-[#1f2938] mb-4">Ready to accelerate growth?</h3>
          <p className="text-[#37404e] text-base sm:text-lg leading-relaxed max-w-2xl mx-auto mb-6">
            Let our digital marketing experts build a custom strategy that increases visibility, engagement, and revenue for your brand.
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

export default DigitalMarketing;
