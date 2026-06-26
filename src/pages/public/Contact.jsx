import React, { useState } from "react";
import { Phone, Mail, MapPin, CircleCheck } from "lucide-react";

export const Contact = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    telephone: "",
    subject: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !form.name ||
      !form.email ||
      !form.telephone ||
      !form.subject ||
      !form.message
    ) {
      setError("Please fill in all the fields.");
      return;
    }

    setLoading(true);
    setError("");

    // Mock API call
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setForm({
        name: "",
        email: "",
        telephone: "",
        subject: "",
        message: "",
      });
    }, 1200);
  };

  return (
    <main className="min-h-screen py-8">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 mt-24 md:mt-8 mb-20">
        <div className="flex flex-wrap">
          <div className="w-full xl:w-10/12 lg:w-full mx-auto">
            <section className="mb-12">
              <div className="flex flex-wrap">
                <div className="w-full xl:w-3/4 md:w-full mx-auto">
                  <div className="p-4 md:p-8">
                    <h5 className="text-blue-600 text-center text-[20px] font-medium">
                      Send Message
                    </h5>

                    <h2 className="text-3xl font-bold mt-4 mb-3 text-center">
                      Drop Us a Line
                    </h2>

                    <p className="text-gray-500 mb-8 text-base text-center">
                      Your email address will not be published. Required fields
                      are marked *
                    </p>

                    {/* Contact Info */}
                    <div className="flex flex-wrap -mx-4 mt-12">
                      <div className="w-full md:w-1/3 px-4 text-center">
                        <Phone
                          className="w-10 h-10 text-yellow-500 mx-auto mb-3"
                          strokeWidth={2}
                        />

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
                        <Mail
                          className="w-10 h-10 text-yellow-500 mx-auto mb-3"
                          strokeWidth={2}
                        />

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
                        <MapPin
                          className="w-10 h-10 text-yellow-500 mx-auto mb-3"
                          strokeWidth={2}
                        />

                        <p className="text-gray-500 text-xs mb-2">Address</p>

                        <p className="text-lg text-gray-900">
                          Hamirpur, H.P
                        </p>
                      </div>
                    </div>

                    {success ? (
                      <div className="text-center mt-20">
                        <CircleCheck
                          className="w-16 h-16 text-yellow-500 mx-auto"
                          strokeWidth={2}
                        />

                        <h5 className="mt-5 mb-3 text-xl font-semibold">
                          Message Sent Successfully!
                        </h5>

                        <p className="text-gray-500 text-sm">
                          Thank you for contacting us. One of our support
                          representatives will get in touch with you shortly.
                        </p>

                        <button
                          type="button"
                          onClick={() => setSuccess(false)}
                          className="mt-5 text-blue-600 hover:text-blue-800 font-medium transition-colors"
                        >
                          Send another message
                        </button>
                      </div>
                    ) : (
                      <form
                        className="mt-20"
                        id="contact-form"
                        onSubmit={handleSubmit}
                      >
                        {error && (
                          <div className="mb-5">
                            <p className="text-center text-red-500 text-sm font-semibold">
                              {error}
                            </p>
                          </div>
                        )}

                        <div className="flex flex-wrap -mx-3">
                          <div className="w-full md:w-1/2 px-3">
                            <div className="mb-5">
                              <input
                                name="name"
                                type="text"
                                placeholder="First Name *"
                                value={form.name}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                              />
                            </div>
                          </div>

                          <div className="w-full md:w-1/2 px-3">
                            <div className="mb-5">
                              <input
                                name="email"
                                type="email"
                                placeholder="Your Email *"
                                value={form.email}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                              />
                            </div>
                          </div>

                          <div className="w-full md:w-1/2 px-3">
                            <div className="mb-5">
                              <input
                                name="telephone"
                                type="tel"
                                placeholder="Your Phone *"
                                value={form.telephone}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                              />
                            </div>
                          </div>

                          <div className="w-full md:w-1/2 px-3">
                            <div className="mb-5">
                              <input
                                name="subject"
                                type="text"
                                placeholder="Subject *"
                                value={form.subject}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                              />
                            </div>
                          </div>

                          <div className="w-full px-3">
                            <div className="mb-8">
                              <textarea
                                name="message"
                                placeholder="Message *"
                                value={form.message}
                                onChange={handleChange}
                                className="w-full h-32 resize-y px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                              />
                            </div>

                            <div className="text-center">
                              <button
                                type="submit"
                                disabled={loading}
                                className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {loading ? "Sending..." : "Send message"}
                              </button>
                            </div>
                          </div>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Contact;