import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react';

export const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.subject || !form.message) {
      setError('Please fill in all the fields.');
      return;
    }
    
    setLoading(true);
    setError('');

    // Mock API call
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setForm({ name: '', email: '', subject: '', message: '' });
    }, 1200);
  };

  return (
    <div className="w-full">
      {/* Page Header */}
      <section className="bg-slate-50 border-b border-slate-200 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-sm font-bold text-indigo-600 uppercase tracking-wider">Contact Us</p>
          <h1 className="mt-3 text-3xl sm:text-5xl font-extrabold text-slate-950 tracking-tight">
            We'd Love to Hear From You
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-650 max-w-2xl mx-auto leading-relaxed">
            Have questions about plans, jobseeker mapping, or general support? Reach out, and our team will respond shortly.
          </p>
        </div>
      </section>

      {/* Main Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-12 items-start">
            
            {/* Contact Information Panel */}
            <div className="lg:col-span-5 space-y-8 bg-slate-50 border border-slate-200 rounded-3xl p-8 lg:p-10">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Reach Us Directly</h2>
                <p className="text-sm text-slate-550 mt-2">
                  Drop us an email, give us a call, or visit our office. We look forward to hearing from you.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Email Support</h4>
                    <p className="text-xs text-indigo-600 font-semibold mt-1">support@jobswaale.com</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Expect response within 24 hours</p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Call Center</h4>
                    <p className="text-xs text-slate-800 font-semibold mt-1">+91 98765 43210</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Monday to Saturday: 10 AM - 6 PM</p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Corporate Office</h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Lajpat Nagar, New Delhi, Delhi 110024, India
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Form Panel */}
            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-8 lg:p-10 shadow-sm">
              {success ? (
                <div className="text-center py-8">
                  <div className="inline-flex p-4 bg-emerald-50 border border-emerald-100 rounded-full text-emerald-600 mb-6 animate-bounce">
                    <CheckCircle className="h-10 w-10" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900">Message Sent Successfully!</h3>
                  <p className="text-sm text-slate-500 mt-3 max-w-sm mx-auto">
                    Thank you for contacting us. One of our support representatives will get in touch with you shortly.
                  </p>
                  <button
                    onClick={() => setSuccess(false)}
                    className="mt-6 text-sm font-semibold text-indigo-600 hover:text-indigo-500 cursor-pointer"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900">Send Message</h3>
                    <p className="text-xs text-slate-500 mt-1">Please fill the form below and we will get back to you.</p>
                  </div>

                  {error && (
                    <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 text-xs font-semibold rounded-lg">
                      {error}
                    </div>
                  )}

                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700">Full Name</label>
                      <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                        className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700">Email Address</label>
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="john@example.com"
                        className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700">Subject</label>
                    <input
                      type="text"
                      name="subject"
                      value={form.subject}
                      onChange={handleChange}
                      placeholder="Query about employer listings..."
                      className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700">Your Message</label>
                    <textarea
                      name="message"
                      rows={5}
                      value={form.message}
                      onChange={handleChange}
                      placeholder="Write your query details here..."
                      className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-indigo-600 hover:bg-indigo-550 text-white font-semibold text-sm py-3.5 rounded-lg transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Sending...' : 'Send Message'}
                    {!loading && <Send className="h-4 w-4" />}
                  </button>
                </form>
              )}
            </div>

          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
