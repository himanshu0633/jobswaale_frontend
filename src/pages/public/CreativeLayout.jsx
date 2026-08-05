import React from 'react';
import { Link } from 'react-router-dom';

const CreativeLayout = () => {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-16 lg:pt-20 pb-16">
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <span className="text-[#0047C7] text-lg sm:text-xl font-semibold">Our Services</span>
          <h1 className="text-[28px] leading-[36px] sm:text-[36px] sm:leading-[44px] lg:text-[44px] lg:leading-[54px] font-bold text-[#1f2938] mt-4 mb-5">
            Creative Layout
          </h1>
          <p className="text-[#37404e] text-base sm:text-lg leading-relaxed">
            Transform your digital presence with stunning, user-centric designs that captivate audiences and strengthen your brand identity.
          </p>
        </div>

        <div className="grid gap-6 sm:gap-8 lg:grid-cols-2 items-center mb-12 sm:mb-16">
          <div>
            <h2 className="text-[22px] sm:text-[28px] font-bold text-[#1f2938] mb-4">Design That Delights</h2>
            <p className="text-[#37404e] text-base leading-relaxed mb-4">
              Our creative layout services combine aesthetics with functionality. We design intuitive interfaces and responsive layouts that ensure a seamless experience across all devices.
            </p>
            <p className="text-[#37404e] text-base leading-relaxed mb-6">
              Whether you need a complete redesign or a fresh landing page, our designers work closely with you to bring your vision to life while maintaining brand consistency.
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
                'Responsive web design',
                'UI/UX prototyping',
                'Brand identity design',
                'Landing page layouts',
                'Mobile-first design systems',
                'Interactive wireframing',
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
          <h3 className="text-[22px] sm:text-[28px] font-bold text-[#1f2938] mb-4">Ready to elevate your design?</h3>
          <p className="text-[#37404e] text-base sm:text-lg leading-relaxed max-w-2xl mx-auto mb-6">
            Let our creative team craft a layout that not only looks beautiful but also converts visitors into loyal customers.
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

export default CreativeLayout;
