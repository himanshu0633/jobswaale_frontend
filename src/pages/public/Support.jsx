import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronDown,
  Phone,
  Mail,
  MapPin,
  UserSearch,
  Building2,
  CreditCard,
  LifeBuoy,
  MessageCircle,
  ArrowRight,
} from 'lucide-react';

const supportCategories = [
  {
    icon: UserSearch,
    title: 'For Jobseekers',
    description: 'Help with your profile, resume, job applications and saved jobs.',
    to: '/faq',
  },
  {
    icon: Building2,
    title: 'For Employers',
    description: 'Guidance on posting jobs, managing candidates and your company profile.',
    to: '/employer-plan',
  },
  {
    icon: CreditCard,
    title: 'Account & Billing',
    description: 'Questions about subscriptions, payments, invoices and plan upgrades.',
    to: '/contact',
  },
  {
    icon: LifeBuoy,
    title: 'Technical Support',
    description: 'Facing an error or a bug on the platform? Let our team take a look.',
    to: '/contact',
  },
];

const supportFaqs = [
  {
    question: 'How do I reset my account password?',
    answer:
      'Go to the login page and click on "Forgot Password". Enter the email address linked to your account and we will send you a secure link to reset your password.',
  },
  {
    question: 'How can I check the status of my job application?',
    answer:
      'Log in to your Jobseeker dashboard and open the "Applications" section. Every job you have applied to will show its current status, from Applied to Shortlisted, Interview or Selected.',
  },
  {
    question: 'How do I post a job as an employer?',
    answer:
      'Sign in to your Employer dashboard and click "Post a Job" from the Jobs section. Fill in the job details, description and requirements across the guided steps, then publish it live.',
  },
  {
    question: 'How do I upgrade or manage my subscription plan?',
    answer:
      'Visit the Subscription section inside your dashboard to view your current plan, compare available plans and upgrade at any time. Billing changes take effect immediately.',
  },
  {
    question: 'I found a bug or something is not working. What do I do?',
    answer:
      'Please reach out to us through the contact form below with as much detail as possible, including screenshots if you can. Our support team typically responds within 24 hours.',
  },
  {
    question: 'How do I delete or deactivate my account?',
    answer:
      'Account deactivation requests can be sent to our support email. Once verified, we will process your request and confirm once it is complete.',
  },
];

const SupportAccordionItem = ({ faq, index, isOpen, toggle }) => (
  <div className="border-b border-gray-200 last:border-b-0">
    <h2 className="accordion-header">
      <button
        className={`w-full py-4 px-5 flex items-center gap-3 font-medium text-gray-900 hover:text-blue-600 transition-colors focus:outline-none ${
          isOpen ? 'text-blue-600' : ''
        }`}
        type="button"
        onClick={() => toggle(index)}
      >
        <ChevronDown
          className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
        <span className="flex-1 text-left">{faq.question}</span>
      </button>
    </h2>

    <div
      className={`overflow-hidden transition-all duration-300 ease-in-out ${
        isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
      }`}
    >
      <div className="pl-12 pr-5 pb-4 text-gray-600">
        <p>{faq.answer}</p>
      </div>
    </div>
  </div>
);

export const Support = () => {
  const [openIndex, setOpenIndex] = useState(0);

  const toggle = (index) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  return (
    <main className="min-h-screen bg-white">
      {/* Page Header */}
      <section className="py-12">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="w-full md:w-1/2 mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-8">
              Support Center
            </h1>
            <p className="mb-0 text-gray-500 text-base leading-relaxed">
              We're here to help. Browse a support category below, check our most
              common questions, or reach out to our team directly.
            </p>
          </div>
        </div>
      </section>

      {/* Support Categories */}
      <section className="py-4">
        <div className="max-w-[1350px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {supportCategories.map(({ icon: Icon, title, description, to }) => (
              <Link
                key={title}
                to={to}
                className="group bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md hover:border-blue-200 transition-all p-6 flex flex-col"
              >
                <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center mb-5 group-hover:bg-blue-600 transition-colors">
                  <Icon className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" strokeWidth={2} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed flex-grow">{description}</p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600">
                  Learn more
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Contact Info */}
      <section className="py-16 md:py-20">
        <div className="max-w-[1350px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="w-full xl:w-3/4 mx-auto text-center">
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">
              Get in touch
            </span>
            <h2 className="text-3xl md:text-5xl font-bold mt-4 mb-12 text-gray-900">
              Talk to Our Support Team
            </h2>

            <div className="flex flex-wrap -mx-4">
              <div className="w-full md:w-1/3 px-4 text-center">
                <Phone className="w-10 h-10 text-yellow-500 mx-auto mb-3" strokeWidth={2} />
                <p className="text-gray-500 text-xs mb-2">Phone</p>
                <p className="text-lg">
                  <a
                    href="tel:+919999884424"
                    className="text-gray-900 hover:text-blue-600 transition-colors"
                  >
                    +91 9999884424
                  </a>
                </p>
              </div>

              <div className="w-full md:w-1/3 px-4 mt-8 md:mt-0 text-center">
                <Mail className="w-10 h-10 text-yellow-500 mx-auto mb-3" strokeWidth={2} />
                <p className="text-gray-500 text-xs mb-2">Email</p>
                <p className="text-lg">
                  <a
                    href="mailto:jobswaale.india@gmail.com"
                    className="text-gray-900 hover:text-blue-600 transition-colors"
                  >
                    jobswaale.india@gmail.com
                  </a>
                </p>
              </div>

              <div className="w-full md:w-1/3 px-4 mt-8 md:mt-0 text-center">
                <MapPin className="w-10 h-10 text-yellow-500 mx-auto mb-3" strokeWidth={2} />
                <p className="text-gray-500 text-xs mb-2">Address</p>
                <p className="text-lg text-gray-900">Hamirpur, H.P</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ / Quick Help Section */}
      <section className="py-16 md:py-20 bg-gray-50">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end mb-12">
            <div className="w-full lg:w-5/12">
              <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">
                Quick Help
              </span>
              <h3 className="text-3xl md:text-5xl font-bold mt-5 text-gray-900">
                Common Support Questions
              </h3>
            </div>
            <div className="hidden lg:block w-full lg:w-2/12"></div>
            <div className="w-full lg:w-5/12 mt-6 lg:mt-0">
              <p className="text-lg text-gray-500 leading-relaxed">
                Can't find what you're looking for? Send us a message and our
                team will get back to you shortly.
              </p>
            </div>
          </div>

          <div className="w-full lg:w-9/12 mx-auto rounded-lg overflow-hidden bg-white shadow-sm">
            {supportFaqs.map((faq, index) => (
              <SupportAccordionItem
                key={index}
                faq={faq}
                index={index}
                isOpen={openIndex === index}
                toggle={toggle}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Still Need Help CTA */}
      <section className="py-16 md:py-20">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-[#0047C7] px-6 py-14 sm:px-16 sm:py-16 text-center relative overflow-hidden">
            <MessageCircle className="w-10 h-10 text-white/80 mx-auto mb-5" strokeWidth={2} />
            <h3 className="text-2xl sm:text-4xl font-bold text-white mb-4">
              Still need help?
            </h3>
            <p className="text-white/80 max-w-xl mx-auto mb-8 leading-relaxed">
              Our support team is ready to answer any questions and help you
              get the most out of JobsWaale.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 bg-white text-[#0047C7] font-semibold px-7 py-3.5 rounded-lg hover:-translate-y-0.5 transition-all"
            >
              Contact Us
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Support;