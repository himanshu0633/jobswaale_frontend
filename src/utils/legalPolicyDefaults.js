/**
 * Default data structures for Legal and Policy document pages
 * (Privacy Policy, Terms & Conditions)
 * Matches the clean points, headings, descriptions and bullet lists layout.
 */

export const DEFAULT_PRIVACY_POLICY_DOC = {
  title: 'Privacy Policy',
  slug: 'privacy-policy',
  publicUrl: '/privacy-policy',
  lastUpdated: 'June 24, 2026',
  introText: 'Welcome to JobsWaale. We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about this privacy notice or our practices with regard to your personal info, please contact us at support@jobswaale.com.',
  clauses: [
    {
      id: 'privacy-1',
      title: '1. Information We Collect',
      description: 'We collect personal information that you voluntarily provide to us when you register on our platform, express an interest in obtaining information about us or our products, or when you contact us.',
      items: [
        { label: 'Personal Details:', text: 'Names, phone numbers, email addresses, mailing addresses, job titles, and passwords.' },
        { label: 'Professional Details:', text: 'Resume contents, qualifications, industry type, job preference, salary details, and work experience.' },
        { label: 'Payment Details:', text: 'We collect billing address and transaction histories for paid plans (payments are processed via secured third-party gateways).' }
      ]
    },
    {
      id: 'privacy-2',
      title: '2. How We Use Your Information',
      description: 'We process your information for purposes based on legitimate business interests, the fulfillment of our services with you, compliance with our legal obligations, and/or your consent:',
      items: [
        { label: '', text: 'To facilitate account creation and logon processes.' },
        { label: '', text: 'To post and apply to jobs as selected by candidates and employers.' },
        { label: '', text: 'To administer and manage premium packages and direct contact access.' },
        { label: '', text: 'To send administrative information or marketing communications.' }
      ]
    },
    {
      id: 'privacy-3',
      title: '3. Sharing Your Information',
      description: 'We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations. For example:',
      items: [
        { label: 'Job Applications:', text: 'When a candidate applies to a job, their profile and resume are visible to the employer.' },
        { label: 'Direct Contacts:', text: 'Based on premium plan mapping, verified employers can view contact information of candidates.' }
      ]
    },
    {
      id: 'privacy-4',
      title: '4. Security of Your Information',
      description: 'We aim to protect your personal information through a system of organizational and technical security measures. However, please also remember that we cannot guarantee that the internet itself is 100% secure.',
      items: []
    },
    {
      id: 'privacy-5',
      title: '5. Your Privacy Rights',
      description: 'You may review, change, or terminate your account at any time. Under certain regions, you have the right to request access to and obtain a copy of your personal information, request rectification, or erasure.',
      items: []
    },
    {
      id: 'privacy-6',
      title: '6. Data Retention',
      description: 'We will retain your personal information only for as long as is necessary for the purposes set out in this Privacy Policy, unless a longer retention period is required or permitted by law. When we have no ongoing legitimate business need to process your personal information, we will either delete or anonymize it.',
      items: []
    },
    {
      id: 'privacy-7',
      title: '7. Cookies and Tracking Technologies',
      description: 'We may use cookies and similar tracking technologies to track the activity on our platform and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our platform.',
      items: []
    },
    {
      id: 'privacy-8',
      title: '8. Third-Party Services',
      description: 'Our platform may contain links to third-party websites or services that are not owned or controlled by JobsWaale. We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party websites or services. We strongly advise you to review the privacy policy of every site you visit.',
      items: []
    },
    {
      id: 'privacy-9',
      title: '9. Children\'s Privacy',
      description: 'Our platform is not intended for use by children under the age of 18. We do not knowingly collect personally identifiable information from children under 18. If you are a parent or guardian and you are aware that your child has provided us with personal information, please contact us immediately.',
      items: []
    },
    {
      id: 'privacy-10',
      title: '10. Changes to Privacy Policy',
      description: 'We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. You are advised to review this Privacy Policy periodically for any changes.',
      items: []
    },
    {
      id: 'privacy-11',
      title: '11. Contact Information',
      description: 'If you have any questions, concerns, or requests regarding this Privacy Policy, please contact us:',
      items: [
        { label: 'Email:', text: 'jobswaale.india@gmail.com' },
        { label: 'Phone:', text: '+91 99998 84424' },
        { label: 'Address:', text: 'Hamirpur, Himachal Pradesh, India' }
      ]
    }
  ]
};

export const DEFAULT_TERMS_DOC = {
  title: 'Terms & Conditions',
  slug: 'terms-conditions',
  publicUrl: '/terms-conditions',
  lastUpdated: 'June 2026',
  introText: 'Welcome to JobsWaale. By accessing or using our website and services, you agree to be bound by these Terms & Conditions. Please read them carefully before using our platform.',
  clauses: [
    {
      id: 'terms-1',
      title: '1. Acceptance of Terms',
      description: 'By creating an account, accessing, or using the JobsWaale platform, you acknowledge that you have read, understood, and agree to be bound by these Terms & Conditions, our Privacy Policy, and any additional terms that may apply to specific services. If you do not agree with any part of these terms, you must discontinue use of our platform immediately.',
      items: []
    },
    {
      id: 'terms-2',
      title: '2. Description of Services',
      description: 'JobsWaale is an online job portal that connects job seekers with employers. Our platform provides the following services:',
      items: [
        { label: 'For Job Seekers:', text: 'Create professional profiles, upload resumes, search and apply for job openings, and communicate with potential employers.' },
        { label: 'For Employers:', text: 'Register companies, post job vacancies, search candidate databases, receive applications, and communicate with applicants.' }
      ]
    },
    {
      id: 'terms-3',
      title: '3. User Accounts and Registration',
      description: 'To access certain features of our platform, you must register for an account. You agree to:',
      items: [
        { label: '', text: 'Provide accurate, current, and complete information during the registration process.' },
        { label: '', text: 'Maintain the confidentiality of your account credentials and password.' },
        { label: '', text: 'Notify us immediately of any unauthorized use of your account.' },
        { label: '', text: 'Accept responsibility for all activities that occur under your account.' }
      ]
    },
    {
      id: 'terms-4',
      title: '4. User Conduct and Responsibilities',
      description: 'As a user of JobsWaale, you agree not to:',
      items: [
        { label: '', text: 'Provide false, misleading, or fraudulent information on your profile or job postings.' },
        { label: '', text: 'Use the platform for any unlawful purpose or in violation of any applicable laws.' },
        { label: '', text: 'Upload or transmit viruses, malware, or any malicious code.' },
        { label: '', text: 'Attempt to access another user\'s account without authorization.' },
        { label: '', text: 'Harass, abuse, or harm other users of the platform.' },
        { label: '', text: 'Post discriminatory, offensive, or inappropriate content.' },
        { label: '', text: 'Use automated bots, scrapers, or other tools to extract data from our platform without prior written consent.' },
        { label: '', text: 'Impersonate any person or entity or misrepresent your affiliation with any person or entity.' }
      ]
    },
    {
      id: 'terms-5',
      title: '5. Job Postings and Applications',
      description: 'Employers are solely responsible for the accuracy, legality, and content of their job postings. JobsWaale does not endorse any job posting or guarantee the validity of any position listed on our platform.\n\nJob Seekers are responsible for the accuracy of their profiles and applications. Submitting false or misleading information may result in account suspension.\n\nJobsWaale acts as an intermediary platform and is not a party to any employment agreement between job seekers and employers. We do not guarantee job placement or hiring outcomes.',
      items: []
    },
    {
      id: 'terms-6',
      title: '6. Subscription and Payments',
      description: 'Certain features of JobsWaale may require payment of subscription fees. By subscribing to a paid plan, you agree to:',
      items: [
        { label: '', text: 'Pay all applicable fees as described on our pricing page.' },
        { label: '', text: 'Provide accurate and complete billing information.' },
        { label: '', text: 'Authorize us to charge your selected payment method.' }
      ]
    },
    {
      id: 'terms-7',
      title: '7. Intellectual Property Rights',
      description: 'All content, design, logos, trademarks, and software on the JobsWaale platform are the exclusive property of JobsWaale or its licensors and are protected by applicable intellectual property laws. You may not reproduce, distribute, modify, or create derivative works from our content without our express written permission.\n\nBy submitting content (such as resumes, job postings, or profile information), you grant JobsWaale a non-exclusive, royalty-free license to use, display, and distribute that content for the purpose of operating and promoting our services.',
      items: []
    },
    {
      id: 'terms-8',
      title: '8. Limitation of Liability',
      description: 'To the fullest extent permitted by law, JobsWaale and its affiliates, officers, directors, employees, and agents shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or related to your use of our platform. This includes, but is not limited to, loss of profits, data, or business opportunities.\n\nOur total liability for any claim arising from your use of the platform shall not exceed the amount you have paid to us in the twelve (12) months preceding the claim.',
      items: []
    },
    {
      id: 'terms-9',
      title: '9. Disclaimer of Warranties',
      description: 'The JobsWaale platform is provided on an "as is" and "as available" basis without any warranties of any kind, either express or implied. We do not guarantee that the platform will be uninterrupted, timely, secure, or error-free, that the results obtained will be accurate or reliable, or that the quality of services meets your expectations.',
      items: []
    },
    {
      id: 'terms-10',
      title: '10. Termination',
      description: 'JobsWaale reserves the right to suspend or terminate your account at any time, without prior notice, for conduct that we believe violates these Terms & Conditions or is harmful to other users, third parties, or our platform. Upon termination, your right to use the platform will immediately cease. You may also delete your account at any time through your account settings.',
      items: []
    },
    {
      id: 'terms-11',
      title: '11. Changes to Terms',
      description: 'We reserve the right to modify these Terms & Conditions at any time. Changes will be effective immediately upon posting the updated terms on this page. We will notify users of material changes via email or a prominent notice on our website. Your continued use of the platform after any modifications indicates your acceptance of the new terms.',
      items: []
    },
    {
      id: 'terms-12',
      title: '12. Governing Law',
      description: 'These Terms & Conditions shall be governed by and construed in accordance with the laws of India. Any disputes arising out of or relating to these terms shall be subject to the exclusive jurisdiction of the courts in Hamirpur, Himachal Pradesh, India.',
      items: []
    },
    {
      id: 'terms-13',
      title: '13. Contact Information',
      description: 'If you have any questions, concerns, or requests regarding these Terms & Conditions, please contact us:',
      items: [
        { label: 'Email:', text: 'jobswaale.india@gmail.com' },
        { label: 'Phone:', text: '+91 99998 84424' },
        { label: 'Address:', text: 'Hamirpur, Himachal Pradesh, India' }
      ]
    }
  ]
};

export const LEGAL_DOCS_CONFIG = {
  privacy: {
    key: 'privacy',
    slug: 'privacy-policy',
    publicUrl: '/privacy-policy',
    pageName: 'Privacy Policy',
    defaultDoc: DEFAULT_PRIVACY_POLICY_DOC
  },
  terms: {
    key: 'terms',
    slug: 'terms-conditions',
    publicUrl: '/terms-conditions',
    pageName: 'Terms & Conditions',
    defaultDoc: DEFAULT_TERMS_DOC
  }
};

/**
 * Generate formatted HTML representation for storage and backward-compatibility
 */
export const generateLegalDocumentHtml = (doc) => {
  if (!doc) return '';
  const parts = [];
  parts.push(`<h2>${doc.title || 'Legal Document'}</h2>`);
  if (doc.lastUpdated) {
    parts.push(`<p><em>Last Updated: ${doc.lastUpdated}</em></p>`);
  }
  if (doc.introText) {
    parts.push(`<p>${doc.introText}</p>`);
  }
  parts.push('<hr />');
  (doc.clauses || []).forEach((c) => {
    if (c.title) parts.push(`<h3>${c.title}</h3>`);
    if (c.description) parts.push(`<p>${c.description}</p>`);
    if (Array.isArray(c.items) && c.items.length > 0) {
      parts.push('<ul>');
      c.items.forEach((item) => {
        const label = typeof item === 'object' ? item.label : '';
        const text = typeof item === 'object' ? item.text : item;
        const prefix = label ? `<strong>${label}</strong> ` : '';
        parts.push(`  <li>${prefix}${text}</li>`);
      });
      parts.push('</ul>');
    }
  });
  return parts.join('\n');
};

/**
 * Format today's date in 'Month DD, YYYY' format (e.g., 'October 8, 2026')
 */
export const getFormattedCurrentDate = () => {
  return new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
};
