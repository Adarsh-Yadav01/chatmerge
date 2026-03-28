"use client";

import Link from "next/link";
import Head from "next/head";
import { useState } from "react";
import {
  BotMessageSquare,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Instagram,
  Send,
  ChevronLeft,
} from "lucide-react";
import Image from "next/image";
import logo from "../../public/chatrealfam.png"; // Updated logo import

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setStatus("Please fill out all fields.");
      return;
    }

    setIsSubmitting(true);
    setStatus("Sending...");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setStatus("Message sent successfully!");
        setFormData({ name: "", email: "", message: "" });
      } else {
        setStatus("Failed to send message. Please try again.");
      }
    } catch (error) {
      setStatus("An error occurred. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Contact Us - chatrealfam</title>
        <meta
          name="description"
          content="Contact Marcadeo for support or inquiries about chatrealfam, your Instagram management solution."
        />
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        {/* Header */}
        <div className="flex justify-center gap-2 md:justify-start px-8">
          <Link href="/" className="flex items-center gap-2 font-medium">
            <div className="flex items-center justify-center h-30 w-30">
              <Image src={logo} alt="Logo" width={200} height={160} />
            </div>
          </Link>
        </div>

        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-5xl font-bold mb-4">Get in Touch</h1>
            <p className="text-white/70 leading-relaxed">
              Fill out the form below and we&apos;ll get back to you as soon as
              possible.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  Send us a message
                </h2>
                <p className="text-sm text-blue-800">
                  <strong>Response Time:</strong> We typically respond within 24
                  hours during business days.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-semibold text-gray-900 mb-2"
                    >
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 placeholder-gray-400"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-semibold text-gray-900 mb-2"
                    >
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 placeholder-gray-400"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-semibold text-gray-900 mb-2"
                  >
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows="6"
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 placeholder-gray-400 resize-none"
                    placeholder="Tell us how we can help you..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-4 px-6 rounded-lg font-semibold text-white transition-all duration-200 ${
                    isSubmitting
                      ? "bg-gray-400 cursor-not-allowed"
                      : "cursor-pointer bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  }`}
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Sending...
                    </div>
                  ) : (
                    "Send Message"
                  )}
                </button>
              </form>

              {status && (
                <div
                  className={`mt-4 p-4 rounded-lg ${
                    status.includes("successfully")
                      ? "bg-green-50 border border-green-200"
                      : "bg-red-50 border border-red-200"
                  }`}
                >
                  <p
                    className={`text-sm font-medium ${
                      status.includes("successfully")
                        ? "text-green-800"
                        : "text-red-800"
                    }`}
                  >
                    {status}
                  </p>
                </div>
              )}
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              {/* Contact Details Card */}
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Contact Information
                </h2>

                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <svg
                          className="w-6 h-6 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          ></path>
                        </svg>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">
                        Email
                      </h3>
                      <a
                        href="mailto:admin@realfam.co.in"
                        className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                      >
                        admin@realfam.co.in
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <svg
                          className="w-6 h-6 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9m0 9c-5 0-9-4-9-9s4-9 9-9"
                          ></path>
                        </svg>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">
                        Website
                      </h3>
                      <a
                        href="https://chat.realfam.co.in"
                        className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        chat.realfam.co.in
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Support Hours Card */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Support Hours
                </h3>
                <div className="space-y-2 text-gray-700">
                  <p className="flex justify-between">
                    <span>Monday - Friday:</span>
                    <span className="font-medium">9:00 AM - 6:00 PM</span>
                  </p>
                  <p className="flex justify-between">
                    <span>Saturday:</span>
                    <span className="font-medium">10:00 AM - 4:00 PM</span>
                  </p>
                  <p className="flex justify-between">
                    <span>Sunday:</span>
                    <span className="font-medium">Closed</span>
                  </p>
                </div>
                <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Response Time:</strong> We typically respond within
                    24 hours during business days.
                  </p>
                </div>
              </div>

              {/* Back to Home Button */}
              <div className="text-center">
                <Link href="/login">
                  <button className="flex items-center px-4 py-2 cursor-pointer rounded-lg font-medium transition-all bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 text-white hover:bg-blue-700 active:scale-95">
                    <ChevronLeft className="w-5 h-5 mr-2" />
                    Go Back
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-black/80 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Main Footer Content */}
            <div className="py-12">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* Brand & Description */}
                <div className="md:col-span-2">
                  <div className="mb-4">
                    <h3 className="text-2xl font-bold text-white mb-2">
                      Marcadeo
                    </h3>
                    <p className="text-gray-300 text-sm leading-relaxed max-w-md">
                      Empowering businesses with innovative marketing solutions
                      and strategic digital transformation. Your success is our
                      commitment.
                    </p>
                  </div>

                  {/* Social Media Icons */}
                  <div className="flex space-x-4 mt-6">
                    <a
                      href="mailto:support@marcadeo.com"
                      className="bg-white/30 hover:bg-blue-600 p-2 rounded-full transition-colors duration-300"
                      aria-label="Email"
                    >
                      <Mail size={20} />
                    </a>
                    <a
                      href="https://facebook.com/marcadeo"
                      className="bg-white/30 hover:bg-blue-600 p-2 rounded-full transition-colors duration-300"
                      aria-label="Facebook"
                    >
                      <Facebook size={20} />
                    </a>
                    <a
                      href="https://instagram.com/marcadeo"
                      className="bg-white/30 hover:bg-pink-600 p-2 rounded-full transition-colors duration-300"
                      aria-label="Instagram"
                    >
                      <Instagram size={20} />
                    </a>

                    <a
                      href="https://t.me/marcadeo"
                      className="bg-white/30 hover:bg-blue-500 p-2 rounded-full transition-colors duration-300"
                      aria-label="Telegram"
                    >
                      <Send size={20} />
                    </a>
                  </div>
                </div>

                {/* Quick Links */}
                <div>
                  <h4 className="text-lg font-semibold text-white mb-4">
                    Company
                  </h4>
                  <ul className="space-y-3">
                    <li>
                      <a
                        href="/about"
                        className="text-gray-300 hover:text-white transition-colors duration-300 text-sm"
                      >
                        About Us
                      </a>
                    </li>
                    <li>
                      <a
                        href="/login"
                        className="text-gray-300 hover:text-white transition-colors duration-300 text-sm"
                      >
                        Our Services
                      </a>
                    </li>
                    <li>
                      <a
                        href="/contact"
                        className="text-gray-300 hover:text-white transition-colors duration-300 text-sm"
                      >
                        Contact Us
                      </a>
                    </li>
                    <li>
                      <a
                        href="/login"
                        className="text-gray-300 hover:text-white transition-colors duration-300 text-sm"
                      >
                        Blog
                      </a>
                    </li>
                  </ul>
                </div>

                {/* Contact Info */}
                <div>
                  <h4 className="text-lg font-semibold text-white mb-4">
                    Contact
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <Mail
                        className="text-gray-300 mt-0.5 flex-shrink-0"
                        size={16}
                      />
                      <a
                        href="mailto:support@marcadeo.com"
                        className="text-gray-300 hover:text-white transition-colors duration-300 text-sm"
                      >
                        admin@realfam.co.in
                      </a>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Phone
                        className="text-gray-300 mt-0.5 flex-shrink-0"
                        size={16}
                      />
                      <a
                        href="tel:+1234567890"
                        className="text-gray-300 hover:text-white transition-colors duration-300 text-sm"
                      >
                        +91 6388807379
                      </a>
                    </div>
                    <div className="flex items-start space-x-3">
                      <MapPin
                        className="text-gray-300 mt-0.5 flex-shrink-0"
                        size={16}
                      />
                      <span className="text-gray-300 text-sm">
                        127/1, W-1, Juhi Kalan, Saket Nagar,
                        <br />
                         Kanpur, Uttar Pradesh 208014
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-white/50 py-6">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <p className="text-gray-400 text-sm">
                  © 2025 Marcadeo. All rights reserved.
                </p>
                <div className="flex space-x-6 mt-4 md:mt-0">
                  <a
                    href="/privacy-policy"
                    className="text-gray-400 hover:text-white transition-colors duration-300 text-sm"
                  >
                    Privacy Policy
                  </a>
                  <a
                    href="/terms"
                    className="text-gray-400 hover:text-white transition-colors duration-300 text-sm"
                  >
                    Terms of Service
                  </a>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
