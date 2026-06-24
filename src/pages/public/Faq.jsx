import React, { useState } from 'react';
import { 
  ChevronDown, 
  HelpCircle, 
  Info, 
  LifeBuoy, 
  MessageSquare, 
  Sparkles 
} from 'lucide-react';

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

  return (
    <div className="w-full bg-slate-50/50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Header Section */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            FAQs
          </h1>
          <p className="text-sm font-semibold text-slate-500 leading-relaxed">
            This is part of our help center where frequently asked questions are collected. Do a search here before sending a message or contacting us, here are the most common problems you will encounter when using our system.
          </p>
        </div>

        {/* Visual Support Grid */}
        <div className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto mb-20">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center gap-4 hover:shadow-md transition">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center shrink-0">
              <HelpCircle className="h-6 w-6" />
            </div>
            <div>
              <h5 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">Help Center</h5>
              <p className="text-[10px] text-slate-450 font-bold mt-1">Browse support logs</p>
            </div>
          </div>
          
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center gap-4 hover:shadow-md transition">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center shrink-0">
              <LifeBuoy className="h-6 w-6" />
            </div>
            <div>
              <h5 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">Quick Guides</h5>
              <p className="text-[10px] text-slate-450 font-bold mt-1">Troubleshoot key actions</p>
            </div>
          </div>
          
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center gap-4 hover:shadow-md transition">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
              <Info className="h-6 w-6" />
            </div>
            <div>
              <h5 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">Platform Status</h5>
              <p className="text-[10px] text-slate-450 font-bold mt-1">Operational checks</p>
            </div>
          </div>
        </div>

        {/* Accordions Container */}
        <div className="space-y-16">
          
          {/* Section Subheading */}
          <div className="grid gap-6 md:grid-cols-2 items-end pb-8 border-b border-slate-250/60">
            <div>
              <span className="text-xs font-black uppercase text-indigo-600 tracking-widest">Questions</span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">Frequently Asked Questions</h3>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 leading-relaxed max-w-sm">
                Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum is simply dummy.
              </p>
            </div>
          </div>

          {/* Grid columns */}
          <div className="grid gap-8 lg:grid-cols-2">
            
            {/* Left Accordion Column */}
            <div className="space-y-4">
              {leftFaqs.map((faq, index) => {
                const isOpen = leftOpenIndex === index;
                return (
                  <div 
                    key={index} 
                    className="border border-slate-200 bg-white rounded-2xl overflow-hidden shadow-sm transition-all duration-200"
                  >
                    <button 
                      onClick={() => toggleLeft(index)}
                      className="w-full flex items-center justify-between p-5 text-left font-bold text-slate-800 hover:text-indigo-600 transition text-sm cursor-pointer"
                    >
                      <span>{faq.question}</span>
                      <ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-indigo-650' : ''}`} />
                    </button>
                    
                    <div 
                      className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-[500px] border-t border-slate-100' : 'max-h-0'}`}
                    >
                      <div className="p-5 text-xs sm:text-sm font-semibold text-slate-500 leading-relaxed whitespace-pre-line bg-slate-50/50">
                        {faq.answer}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Accordion Column */}
            <div className="space-y-4">
              {rightFaqs.map((faq, index) => {
                const isOpen = rightOpenIndex === index;
                return (
                  <div 
                    key={index} 
                    className="border border-slate-200 bg-white rounded-2xl overflow-hidden shadow-sm transition-all duration-200"
                  >
                    <button 
                      onClick={() => toggleRight(index)}
                      className="w-full flex items-center justify-between p-5 text-left font-bold text-slate-800 hover:text-indigo-600 transition text-sm cursor-pointer"
                    >
                      <span>{faq.question}</span>
                      <ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-indigo-650' : ''}`} />
                    </button>
                    
                    <div 
                      className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-[500px] border-t border-slate-100' : 'max-h-0'}`}
                    >
                      <div className="p-5 text-xs sm:text-sm font-semibold text-slate-500 leading-relaxed whitespace-pre-line bg-slate-50/50">
                        {faq.answer}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default Faq;
