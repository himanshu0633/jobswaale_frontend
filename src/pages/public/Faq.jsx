import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import faqImg1 from './faqImages/img-1.png';
import faqImg2 from './faqImages/img-2.png';
import faqImg3 from './faqImages/img-3.png';

export const Faq = () => {
  // Left Column Accordion State (Index 0 is open by default)
  const [leftOpenIndex, setLeftOpenIndex] = useState(0);

  // Right Column Accordion State (Index 3 is open by default)
  const [rightOpenIndex, setRightOpenIndex] = useState(3);

  const leftFaqs = [
    {
      question: "How To Contact Your Finance Office?",
      answer: "Far far away, behind the word mountains, far from the countries Vokalia and Consonantia. Far far away, behind the word mountains, far from the countries Vokalia and Consonantia.\n\nFar far away, behind the word mountains, far from the countries Vokalia and Consonantia. Far far away, behind the word mountains, far from the countries Vokalia and Consonantia."
    },
    {
      question: "Change Tax Account on Envato?",
      answer: "Far far away, behind the word mountains, far from the countries Vokalia and Consonantia. Far far away, behind the word mountains, far from the countries Vokalia and Consonantia. Far far away, behind the word mountains, far from the countries Vokalia and Consonantia. Far far away, behind the word mountains, far from the countries Vokalia and Consonantia."
    },
    {
      question: "Reset Password With Phone Number?",
      answer: "Far far away, behind the word mountains, far from the countries Vokalia and Consonantia. Far far away, behind the word mountains, far from the countries Vokalia and Consonantia. Far far away, behind the word mountains, far from the countries Vokalia and Consonantia. Far far away, behind the word mountains, far from the countries Vokalia and Consonantia."
    },
    {
      question: "Create Account On Finansi App?",
      answer: "Far far away, behind the word mountains, far from the countries Vokalia and Consonantia. Far far away, behind the word mountains, far from the countries Vokalia and Consonantia. Far far away, behind the word mountains, far from the countries Vokalia and Consonantia. Far far away, behind the word mountains, far from the countries Vokalia and Consonantia."
    }
  ];

  const rightFaqs = [
    {
      question: "What Makes Your Business Plans So Special?",
      answer: "Far far away, behind the word mountains, far from the countries Vokalia and Consonantia. Far far away, behind the word mountains, far from the countries Vokalia and Consonantia.\n\nFar far away, behind the word mountains, far from the countries Vokalia and Consonantia. Far far away, behind the word mountains, far from the countries Vokalia and Consonantia."
    },
    {
      question: "Where Can I Find Market Research Reports?",
      answer: "Far far away, behind the word mountains, far from the countries Vokalia and Consonantia. Far far away, behind the word mountains, far from the countries Vokalia and Consonantia. Far far away, behind the word mountains, far from the countries Vokalia and Consonantia. Far far away, behind the word mountains, far from the countries Vokalia and Consonantia."
    },
    {
      question: "What Type of Company?",
      answer: "Far far away, behind the word mountains, far from the countries Vokalia and Consonantia. Far far away, behind the word mountains, far from the countries Vokalia and Consonantia. Far far away, behind the word mountains, far from the countries Vokalia and Consonantia. Far far away, behind the word mountains, far from the countries Vokalia and Consonantia."
    },
    {
      question: "Change Tax Account?",
      answer: "Far far away, behind the word mountains, far from the countries Vokalia and Consonantia. Far far away, behind the word mountains, far from the countries Vokalia and Consonantia. Far far away, behind the word mountains, far from the countries Vokalia and Consonantia."
    }
  ];

  const toggleLeft = (index) => {
    setLeftOpenIndex(leftOpenIndex === index ? -1 : index);
  };

  const toggleRight = (index) => {
    setRightOpenIndex(rightOpenIndex === index ? -1 : index);
  };

  // Reusable Accordion Item Component
const AccordionItem = ({ faq, index, isOpen, toggle, isLeft }) => {
  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <h2 className="accordion-header">
        <button
          className={`w-full py-4 px-5 flex items-center gap-3 font-medium text-gray-900 hover:text-blue-600 transition-colors focus:outline-none ${
            isOpen ? 'text-blue-600' : ''
          }`}
          type="button"
          onClick={() => toggle(index)}
        >
          {/* Arrow on the left */}
          <ChevronDown
            className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />

          {/* Question */}
          <span className="flex-1 text-left">
            {faq.question}
          </span>
        </button>
      </h2>

      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="pl-12 pr-5 pb-4 text-gray-600">
          {faq.answer.split('\n\n').map((para, pIdx, arr) => (
            <p key={pIdx} className={pIdx < arr.length - 1 ? 'mb-4' : ''}>
              {para}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
};

  return (
    <main className="min-h-screen bg-white">
      {/* Page Header */}
      <section className="py-12">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="w-full md:w-1/2 mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-8">
              FAQs
            </h1>
            <p className="mb-0 text-gray-500 text-base leading-relaxed">
              This is part of our help center where frequently asked questions are collected. Do a search here before sending a message or contacting us, here are the most common problems you will encounter when using our system.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Images */}
      <section className="py-4 ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="w-full lg:w-10/12 mx-auto">
            <div className="flex flex-wrap -mx-4">
              <div className="w-full lg:w-7/12 px-4">
                <img
                  className="w-full h-auto rounded-lg shadow-md"
                  src={faqImg1}
                  alt="FAQ illustration 1"
                />
              </div>
              <div className="w-full lg:w-5/12 px-4 mt-4 lg:mt-0">
                <img
                  className="w-full h-auto rounded-lg shadow-md mb-4"
                  src={faqImg2}
                  alt="FAQ illustration 2"
                />
                <img
                  className="w-full h-auto rounded-lg shadow-md"
                  src={faqImg3}
                  alt="FAQ illustration 3"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Questions Section */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-wrap items-end mb-12">
            <div className="w-full lg:w-5/12">
              <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">
                Questions
              </span>
              <h3 className="text-3xl md:text-5xl font-bold mt-5 text-gray-900">
                Frequently Ask Questions
              </h3>
            </div>
            <div className="hidden lg:block w-full lg:w-2/12"></div>
            <div className="w-full lg:w-5/12 mt-6 lg:mt-0">
              <p className="text-lg text-gray-500 leading-relaxed">
                Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum is
                simply dummy.
              </p>
            </div>
          </div>

          {/* Accordion Columns */}
          <div className="flex flex-wrap -mx-4">
            {/* Left Accordion Column */}
            <div className="w-full lg:w-1/2 px-4">
              <div className=" rounded-lg overflow-hidden bg-white shadow-sm">
                {leftFaqs.map((faq, index) => (
                  <AccordionItem
                    key={`left-${index}`}
                    faq={faq}
                    index={index}
                    isOpen={leftOpenIndex === index}
                    toggle={toggleLeft}
                    isLeft={true}
                  />
                ))}
              </div>
            </div>

            {/* Right Accordion Column */}
            <div className="w-full lg:w-1/2 px-4 mt-6 lg:mt-0">
              <div className=" rounded-lg overflow-hidden bg-white shadow-sm">
                {rightFaqs.map((faq, index) => (
                  <AccordionItem
                    key={`right-${index}`}
                    faq={faq}
                    index={index}
                    isOpen={rightOpenIndex === index}
                    toggle={toggleRight}
                    isLeft={false}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Faq;