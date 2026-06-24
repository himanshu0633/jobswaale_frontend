import React from 'react';

export const TermsConditions = () => {
  return (
    <div className="w-full bg-white">
      {/* Page Header */}
      <section className="bg-slate-50 border-b border-slate-200 py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-sm font-bold text-indigo-600 uppercase tracking-wider">Legal</p>
          <h1 className="mt-3 text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
            Terms & Conditions
          </h1>
          <p className="mt-2 text-xs text-slate-400">
            Last Updated: June 24, 2026
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 prose prose-slate">
          <p className="text-sm leading-relaxed text-slate-600">
            These terms and conditions govern your use of the JobsWaale website. By accessing or registering on JobsWaale, we assume you accept these terms and conditions in full. Do not continue to use JobsWaale if you do not agree to all of the terms and conditions stated on this page.
          </p>

          <h2 className="text-lg font-bold text-slate-900 mt-8 mb-4">1. License & Acceptable Use</h2>
          <p className="text-sm leading-relaxed text-slate-600">
            Unless otherwise stated, JobsWaale owns the intellectual property rights for all material on the platform. All intellectual property rights are reserved. You must not:
          </p>
          <ul className="list-disc list-inside text-sm leading-relaxed text-slate-600 space-y-2 mt-3 pl-4">
            <li>Republish or redistribute material from JobsWaale.</li>
            <li>Sell, rent or sub-license material from JobsWaale.</li>
            <li>Post spam, fraudulent job listings, or false resumes.</li>
            <li>Harass other platform users, employers, or candidates.</li>
          </ul>

          <h2 className="text-lg font-bold text-slate-900 mt-8 mb-4">2. User Account Registration</h2>
          <p className="text-sm leading-relaxed text-slate-600">
            When you create an account, you must provide accurate, complete, and current information. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account. You are responsible for safeguarding your password.
          </p>

          <h2 className="text-lg font-bold text-slate-900 mt-8 mb-4">3. Premium Packages & Payments</h2>
          <p className="text-sm leading-relaxed text-slate-600">
            Payments for jobseeker plans or employer plans are billed on a subscription or one-time basis.
          </p>
          <ul className="list-disc list-inside text-sm leading-relaxed text-slate-600 space-y-2 mt-3 pl-4">
            <li>All fees are non-refundable unless explicitly stated otherwise.</li>
            <li>Plan mappings, contact limits, and features are subject to change with prior notice.</li>
          </ul>

          <h2 className="text-lg font-bold text-slate-900 mt-8 mb-4">4. Disclaimer of Liability</h2>
          <p className="text-sm leading-relaxed text-slate-600">
            To the maximum extent permitted by applicable law, we exclude all representations, warranties, and conditions relating to our website and the use of this website. We do not guarantee that the listings posted by employers are genuine, though we strive to filter them. Candidates and employers are advised to conduct their own background checks before final commitments.
          </p>

          <h2 className="text-lg font-bold text-slate-900 mt-8 mb-4">5. Governing Law</h2>
          <p className="text-sm leading-relaxed text-slate-600">
            These terms and conditions are governed by and construed in accordance with the laws of India, and any disputes will be subject to the exclusive jurisdiction of the courts of New Delhi, India.
          </p>
        </div>
      </section>
    </div>
  );
};

export default TermsConditions;
