import React from 'react';

export const PrivacyPolicy = () => {
  return (
    <div className="w-full bg-white">
      {/* Page Header */}
      <section className="bg-slate-50 border-b border-slate-200 py-12 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-sm font-bold text-indigo-600 uppercase tracking-wider">Legal</p>
          <h1 className="mt-3 text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
            Privacy Policy
          </h1>
          <p className="mt-2 text-xs text-slate-400">
            Last Updated: June 24, 2026
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-10">
        <div className="max-w-3xl mx-auto px-4 prose prose-slate">
          <p className="text-sm leading-relaxed text-slate-600">
            Welcome to JobsWaale. We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about this privacy notice or our practices with regard to your personal info, please contact us at support@jobswaale.com.
          </p>

          <h2 className="text-lg font-bold text-slate-900 mt-8 mb-4">1. Information We Collect</h2>
          <p className="text-sm leading-relaxed text-slate-600">
            We collect personal information that you voluntarily provide to us when you register on our platform, express an interest in obtaining information about us or our products, or when you contact us.
          </p>
          <ul className="list-disc list-inside text-sm leading-relaxed text-slate-600 space-y-2 mt-3 pl-4">
            <li><strong>Personal Details:</strong> Names, phone numbers, email addresses, mailing addresses, job titles, and passwords.</li>
            <li><strong>Professional Details:</strong> Resume contents, qualifications, industry type, job preference, salary details, and work experience.</li>
            <li><strong>Payment Details:</strong> We collect billing address and transaction histories for paid plans (payments are processed via secured third-party gateways).</li>
          </ul>

          <h2 className="text-lg font-bold text-slate-900 mt-8 mb-4">2. How We Use Your Information</h2>
          <p className="text-sm leading-relaxed text-slate-600">
            We process your information for purposes based on legitimate business interests, the fulfillment of our services with you, compliance with our legal obligations, and/or your consent.
          </p>
          <ul className="list-disc list-inside text-sm leading-relaxed text-slate-600 space-y-2 mt-3 pl-4">
            <li>To facilitate account creation and logon processes.</li>
            <li>To post and apply to jobs as selected by candidates and employers.</li>
            <li>To administer and manage premium packages and direct contact access.</li>
            <li>To send administrative information or marketing communications.</li>
          </ul>

          <h2 className="text-lg font-bold text-slate-900 mt-8 mb-4">3. Sharing Your Information</h2>
          <p className="text-sm leading-relaxed text-slate-600">
            We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations. For example:
          </p>
          <ul className="list-disc list-inside text-sm leading-relaxed text-slate-600 space-y-2 mt-3 pl-4">
            <li><strong>Job Applications:</strong> When a candidate applies to a job, their profile and resume are visible to the employer.</li>
            <li><strong>Direct Contacts:</strong> Based on premium plan mapping, verified employers can view contact information of candidates.</li>
          </ul>

          <h2 className="text-lg font-bold text-slate-900 mt-8 mb-4">4. Security of Your Information</h2>
          <p className="text-sm leading-relaxed text-slate-600">
            We aim to protect your personal information through a system of organizational and technical security measures. However, please also remember that we cannot guarantee that the internet itself is 100% secure.
          </p>

          <h2 className="text-lg font-bold text-slate-900 mt-8 mb-4">5. Your Privacy Rights</h2>
          <p className="text-sm leading-relaxed text-slate-600">
            You may review, change, or terminate your account at any time. Under certain regions, you have the right to request access to and obtain a copy of your personal information, request rectification, or erasure.
          </p>
        </div>
      </section>
    </div>
  );
};

export default PrivacyPolicy;
