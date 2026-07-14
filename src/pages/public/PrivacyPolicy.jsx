import React from 'react';
import { Link } from 'react-router-dom';

export const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <main className="flex-grow">
        {/* Page Intro */}
        <section className="pt-[50px]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="w-full">
              <h3 className="text-[44px] font-bold text-[#1f2938] leading-[54px] mb-5">
                Privacy Policy
              </h3>
              <p className="mb-[10px] text-[#88929b] text-base">
                <em>Last Updated: June 24, 2026</em>
              </p>
              <p className="mb-[40px] text-[#88929b] text-base leading-relaxed">
                Welcome to JobsWaale. We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about this privacy notice or our practices with regard to your personal info, please contact us at support@jobswaale.com.
              </p>
            </div>
          </div>
        </section>

        {/* Policy Content */}
        <section className="mb-[80px]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            {/* 1. Information We Collect */}
            <div className="mb-[40px]">
              <h4 className="text-[28px] font-bold text-[#1f2938] leading-[34px] mb-3">
                1. Information We Collect
              </h4>
              <p className="text-[#475569] text-base leading-relaxed mb-3">
                We collect personal information that you voluntarily provide to us when you register on our platform, express an interest in obtaining information about us or our products, or when you contact us.
              </p>
              <ul className="list-disc pl-6 space-y-2 text-[#475569] text-base leading-relaxed">
                <li><strong>Personal Details:</strong> Names, phone numbers, email addresses, mailing addresses, job titles, and passwords.</li>
                <li><strong>Professional Details:</strong> Resume contents, qualifications, industry type, job preference, salary details, and work experience.</li>
                <li><strong>Payment Details:</strong> We collect billing address and transaction histories for paid plans (payments are processed via secured third-party gateways).</li>
              </ul>
            </div>

            {/* 2. How We Use Your Information */}
            <div className="mb-[40px]">
              <h4 className="text-[28px] font-bold text-[#1f2938] leading-[34px] mb-3">
                2. How We Use Your Information
              </h4>
              <p className="text-[#475569] text-base leading-relaxed mb-3">
                We process your information for purposes based on legitimate business interests, the fulfillment of our services with you, compliance with our legal obligations, and/or your consent.
              </p>
              <ul className="list-disc pl-6 space-y-2 text-[#475569] text-base leading-relaxed">
                <li>To facilitate account creation and logon processes.</li>
                <li>To post and apply to jobs as selected by candidates and employers.</li>
                <li>To administer and manage premium packages and direct contact access.</li>
                <li>To send administrative information or marketing communications.</li>
              </ul>
            </div>

            {/* 3. Sharing Your Information */}
            <div className="mb-[40px]">
              <h4 className="text-[28px] font-bold text-[#1f2938] leading-[34px] mb-3">
                3. Sharing Your Information
              </h4>
              <p className="text-[#475569] text-base leading-relaxed mb-3">
                We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations. For example:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-[#475569] text-base leading-relaxed">
                <li><strong>Job Applications:</strong> When a candidate applies to a job, their profile and resume are visible to the employer.</li>
                <li><strong>Direct Contacts:</strong> Based on premium plan mapping, verified employers can view contact information of candidates.</li>
              </ul>
            </div>

            {/* 4. Security of Your Information */}
            <div className="mb-[40px]">
              <h4 className="text-[28px] font-bold text-[#1f2938] leading-[34px] mb-3">
                4. Security of Your Information
              </h4>
              <p className="text-[#475569] text-base leading-relaxed">
                We aim to protect your personal information through a system of organizational and technical security measures. However, please also remember that we cannot guarantee that the internet itself is 100% secure.
              </p>
            </div>

            {/* 5. Your Privacy Rights */}
            <div className="mb-[40px]">
              <h4 className="text-[28px] font-bold text-[#1f2938] leading-[34px] mb-3">
                5. Your Privacy Rights
              </h4>
              <p className="text-[#475569] text-base leading-relaxed">
                You may review, change, or terminate your account at any time. Under certain regions, you have the right to request access to and obtain a copy of your personal information, request rectification, or erasure.
              </p>
            </div>

            {/* 6. Data Retention */}
            <div className="mb-[40px]">
              <h4 className="text-[28px] font-bold text-[#1f2938] leading-[34px] mb-3">
                6. Data Retention
              </h4>
              <p className="text-[#475569] text-base leading-relaxed">
                We will retain your personal information only for as long as is necessary for the purposes set out in this Privacy Policy, unless a longer retention period is required or permitted by law. When we have no ongoing legitimate business need to process your personal information, we will either delete or anonymize it.
              </p>
            </div>

            {/* 7. Cookies and Tracking Technologies */}
            <div className="mb-[40px]">
              <h4 className="text-[28px] font-bold text-[#1f2938] leading-[34px] mb-3">
                7. Cookies and Tracking Technologies
              </h4>
              <p className="text-[#475569] text-base leading-relaxed">
                We may use cookies and similar tracking technologies to track the activity on our platform and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our platform.
              </p>
            </div>

            {/* 8. Third-Party Services */}
            <div className="mb-[40px]">
              <h4 className="text-[28px] font-bold text-[#1f2938] leading-[34px] mb-3">
                8. Third-Party Services
              </h4>
              <p className="text-[#475569] text-base leading-relaxed">
                Our platform may contain links to third-party websites or services that are not owned or controlled by JobsWaale. We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party websites or services. We strongly advise you to review the privacy policy of every site you visit.
              </p>
            </div>

            {/* 9. Children's Privacy */}
            <div className="mb-[40px]">
              <h4 className="text-[28px] font-bold text-[#1f2938] leading-[34px] mb-3">
                9. Children's Privacy
              </h4>
              <p className="text-[#475569] text-base leading-relaxed">
                Our platform is not intended for use by children under the age of 18. We do not knowingly collect personally identifiable information from children under 18. If you are a parent or guardian and you are aware that your child has provided us with personal information, please contact us immediately.
              </p>
            </div>

            {/* 10. Changes to Privacy Policy */}
            <div className="mb-[40px]">
              <h4 className="text-[28px] font-bold text-[#1f2938] leading-[34px] mb-3">
                10. Changes to Privacy Policy
              </h4>
              <p className="text-[#475569] text-base leading-relaxed">
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. You are advised to review this Privacy Policy periodically for any changes.
              </p>
            </div>

            {/* 11. Contact Information */}
            <div className="mb-[40px]">
              <h4 className="text-[28px] font-bold text-[#1f2938] leading-[34px] mb-3">
                11. Contact Information
              </h4>
              <p className="text-[#475569] text-base leading-relaxed mb-3">
                If you have any questions, concerns, or requests regarding this Privacy Policy, please contact us:
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

export default PrivacyPolicy;