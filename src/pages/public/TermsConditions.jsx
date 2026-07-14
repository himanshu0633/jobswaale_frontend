import React from 'react';
import { PublicHeader, PublicFooter } from './PublicPage';
import { Link } from 'react-router-dom';

export const TermsConditions = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
     

      <main className="flex-grow">

        {/* Breadcrumb */}
        {/* <div className="bg-[#fff9f3] py-5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ul className="flex items-center list-none p-0">
              <li>
                <Link to="/" className="text-base text-[#1f2938] hover:text-[#0047C7] no-underline">
                  Home
                </Link>
              </li>
              <li className="relative pl-[14px] text-base text-[#88929b] before:content-['/'] before:absolute before:top-px before:left-[3px] before:text-[#88929b]">
                Terms &amp; Conditions
              </li>
            </ul>
          </div>
        </div> */}

        {/* Page Intro */}
        <section className="pt-[50px]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="w-full">
              <h3 className="text-[44px] font-bold text-[#1f2938] leading-[54px] mb-5">
                Terms &amp; Conditions
              </h3>
              <p className="mb-[10px] text-[#88929b] text-base">
                <em>Last Updated: June 2026</em>
              </p>
              <p className="mb-[40px] text-[#88929b] text-base leading-relaxed">
                Welcome to JobsWaale. By accessing or using our website and services, you agree to be bound by these Terms &amp; Conditions. Please read them carefully before using our platform.
              </p>
            </div>
          </div>
        </section>

        {/* Policy Content */}
        <section className="mb-[80px]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            {/* 1. Acceptance of Terms */}
            <div className="mb-[40px]">
              <h4 className="text-[28px] font-bold text-[#1f2938] leading-[34px] mb-3">
                1. Acceptance of Terms
              </h4>
              <p className="text-[#475569] text-base leading-relaxed">
                By creating an account, accessing, or using the JobsWaale platform, you acknowledge that you have read, understood, and agree to be bound by these Terms &amp; Conditions, our Privacy Policy, and any additional terms that may apply to specific services. If you do not agree with any part of these terms, you must discontinue use of our platform immediately.
              </p>
            </div>

            {/* 2. Description of Services */}
            <div className="mb-[40px]">
              <h4 className="text-[28px] font-bold text-[#1f2938] leading-[34px] mb-3">
                2. Description of Services
              </h4>
              <p className="text-[#475569] text-base leading-relaxed mb-3">
                JobsWaale is an online job portal that connects job seekers with employers. Our platform provides the following services:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-[#475569] text-base leading-relaxed">
                <li><strong>For Job Seekers:</strong> Create professional profiles, upload resumes, search and apply for job openings, and communicate with potential employers.</li>
                <li><strong>For Employers:</strong> Register companies, post job vacancies, search candidate databases, receive applications, and communicate with applicants.</li>
              </ul>
            </div>

            {/* 3. User Accounts */}
            <div className="mb-[40px]">
              <h4 className="text-[28px] font-bold text-[#1f2938] leading-[34px] mb-3">
                3. User Accounts and Registration
              </h4>
              <p className="text-[#475569] text-base leading-relaxed mb-3">
                To access certain features of our platform, you must register for an account. You agree to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-[#475569] text-base leading-relaxed">
                <li>Provide accurate, current, and complete information during the registration process.</li>
                <li>Maintain the confidentiality of your account credentials and password.</li>
                <li>Notify us immediately of any unauthorized use of your account.</li>
                <li>Accept responsibility for all activities that occur under your account.</li>
              </ul>
              <p className="text-[#475569] text-base leading-relaxed mt-3">
                You must be at least 18 years of age to create an account. JobsWaale reserves the right to suspend or terminate accounts that violate these terms.
              </p>
            </div>

            {/* 4. User Conduct */}
            <div className="mb-[40px]">
              <h4 className="text-[28px] font-bold text-[#1f2938] leading-[34px] mb-3">
                4. User Conduct and Responsibilities
              </h4>
              <p className="text-[#475569] text-base leading-relaxed mb-3">
                As a user of JobsWaale, you agree not to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-[#475569] text-base leading-relaxed">
                <li>Provide false, misleading, or fraudulent information on your profile or job postings.</li>
                <li>Use the platform for any unlawful purpose or in violation of any applicable laws.</li>
                <li>Upload or transmit viruses, malware, or any malicious code.</li>
                <li>Attempt to access another user's account without authorization.</li>
                <li>Harass, abuse, or harm other users of the platform.</li>
                <li>Post discriminatory, offensive, or inappropriate content.</li>
                <li>Use automated bots, scrapers, or other tools to extract data from our platform without prior written consent.</li>
                <li>Impersonate any person or entity or misrepresent your affiliation with any person or entity.</li>
              </ul>
            </div>

            {/* 5. Job Postings */}
            <div className="mb-[40px]">
              <h4 className="text-[28px] font-bold text-[#1f2938] leading-[34px] mb-3">
                5. Job Postings and Applications
              </h4>
              <p className="text-[#475569] text-base leading-relaxed mb-3">
                <strong>Employers</strong> are solely responsible for the accuracy, legality, and content of their job postings. JobsWaale does not endorse any job posting or guarantee the validity of any position listed on our platform.
              </p>
              <p className="text-[#475569] text-base leading-relaxed mb-3">
                <strong>Job Seekers</strong> are responsible for the accuracy of their profiles and applications. Submitting false or misleading information may result in account suspension.
              </p>
              <p className="text-[#475569] text-base leading-relaxed">
                JobsWaale acts as an intermediary platform and is not a party to any employment agreement between job seekers and employers. We do not guarantee job placement or hiring outcomes.
              </p>
            </div>

            {/* 6. Subscription */}
            <div className="mb-[40px]">
              <h4 className="text-[28px] font-bold text-[#1f2938] leading-[34px] mb-3">
                6. Subscription and Payments
              </h4>
              <p className="text-[#475569] text-base leading-relaxed mb-3">
                Certain features of JobsWaale may require payment of subscription fees. By subscribing to a paid plan, you agree to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-[#475569] text-base leading-relaxed">
                <li>Pay all applicable fees as described on our pricing page.</li>
                <li>Provide accurate and complete billing information.</li>
                <li>Authorize us to charge your selected payment method.</li>
              </ul>
              <p className="text-[#475569] text-base leading-relaxed mt-3">
                Subscription fees are non-refundable unless otherwise stated. We reserve the right to modify our pricing with prior notice. Failure to pay fees may result in suspension or termination of your account.
              </p>
            </div>

            {/* 7. Intellectual Property */}
            <div className="mb-[40px]">
              <h4 className="text-[28px] font-bold text-[#1f2938] leading-[34px] mb-3">
                7. Intellectual Property Rights
              </h4>
              <p className="text-[#475569] text-base leading-relaxed mb-3">
                All content, design, logos, trademarks, and software on the JobsWaale platform are the exclusive property of JobsWaale or its licensors and are protected by applicable intellectual property laws. You may not reproduce, distribute, modify, or create derivative works from our content without our express written permission.
              </p>
              <p className="text-[#475569] text-base leading-relaxed">
                By submitting content (such as resumes, job postings, or profile information), you grant JobsWaale a non-exclusive, royalty-free license to use, display, and distribute that content for the purpose of operating and promoting our services.
              </p>
            </div>

            {/* 8. Limitation of Liability */}
            <div className="mb-[40px]">
              <h4 className="text-[28px] font-bold text-[#1f2938] leading-[34px] mb-3">
                8. Limitation of Liability
              </h4>
              <p className="text-[#475569] text-base leading-relaxed mb-3">
                To the fullest extent permitted by law, JobsWaale and its affiliates, officers, directors, employees, and agents shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or related to your use of our platform. This includes, but is not limited to, loss of profits, data, or business opportunities.
              </p>
              <p className="text-[#475569] text-base leading-relaxed">
                Our total liability for any claim arising from your use of the platform shall not exceed the amount you have paid to us in the twelve (12) months preceding the claim.
              </p>
            </div>

            {/* 9. Disclaimer of Warranties */}
            <div className="mb-[40px]">
              <h4 className="text-[28px] font-bold text-[#1f2938] leading-[34px] mb-3">
                9. Disclaimer of Warranties
              </h4>
              <p className="text-[#475569] text-base leading-relaxed mb-3">
                The JobsWaale platform is provided on an "as is" and "as available" basis without any warranties of any kind, either express or implied. We do not guarantee that:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-[#475569] text-base leading-relaxed">
                <li>The platform will be uninterrupted, timely, secure, or error-free.</li>
                <li>The results obtained from using the platform will be accurate or reliable.</li>
                <li>The quality of any services or information obtained through the platform will meet your expectations.</li>
              </ul>
            </div>

            {/* 10. Termination */}
            <div className="mb-[40px]">
              <h4 className="text-[28px] font-bold text-[#1f2938] leading-[34px] mb-3">
                10. Termination
              </h4>
              <p className="text-[#475569] text-base leading-relaxed">
                JobsWaale reserves the right to suspend or terminate your account at any time, without prior notice, for conduct that we believe violates these Terms &amp; Conditions or is harmful to other users, third parties, or our platform. Upon termination, your right to use the platform will immediately cease. You may also delete your account at any time through your account settings.
              </p>
            </div>

            {/* 11. Changes to Terms */}
            <div className="mb-[40px]">
              <h4 className="text-[28px] font-bold text-[#1f2938] leading-[34px] mb-3">
                11. Changes to Terms
              </h4>
              <p className="text-[#475569] text-base leading-relaxed">
                We reserve the right to modify these Terms &amp; Conditions at any time. Changes will be effective immediately upon posting the updated terms on this page. We will notify users of material changes via email or a prominent notice on our website. Your continued use of the platform after any modifications indicates your acceptance of the new terms.
              </p>
            </div>

            {/* 12. Governing Law */}
            <div className="mb-[40px]">
              <h4 className="text-[28px] font-bold text-[#1f2938] leading-[34px] mb-3">
                12. Governing Law
              </h4>
              <p className="text-[#475569] text-base leading-relaxed">
                These Terms &amp; Conditions shall be governed by and construed in accordance with the laws of India. Any disputes arising out of or relating to these terms shall be subject to the exclusive jurisdiction of the courts in Hamirpur, Himachal Pradesh, India.
              </p>
            </div>

            {/* 13. Contact Information */}
            <div className="mb-[40px]">
              <h4 className="text-[28px] font-bold text-[#1f2938] leading-[34px] mb-3">
                13. Contact Information
              </h4>
              <p className="text-[#475569] text-base leading-relaxed mb-3">
                If you have any questions, concerns, or requests regarding these Terms &amp; Conditions, please contact us:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-[#475569] text-base leading-relaxed">
                <li><strong>Email:</strong> jobswaale.india@gmail.com</li>
                <li><strong>Phone:</strong> +91 99998 84424</li>
                <li><strong>Address:</strong> Hamirpur, Himachal Pradesh, India</li>
              </ul>
            </div>

          </div>
        </section>

      </main>

      
    </div>
  );
};

export default TermsConditions;