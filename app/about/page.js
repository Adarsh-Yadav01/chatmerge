"use client";

import Link from "next/link";
import Head from "next/head";
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
import logo from "../../public/chatrealfam.png";

export default function About() {
  return (
    <>
      <Head>
        <title>About Us - chatrealfam</title>
        <meta
          name="description"
          content="Learn about Marcadeo and chatrealfam, your solution for managing Instagram Business accounts."
        />
      </Head>
      <div className="min-h-screen bg-gray-100 flex flex-col">
        {/* Header */}
        <div className="flex justify-center gap-2 md:justify-start px-8">
          <Link href="/" className="flex items-center gap-2 font-medium">
            <div className="flex items-center justify-center h-30 w-30">
              <Image src={logo} alt="Logo" width={200} height={160} />
            </div>
          </Link>
        </div>

        {/* Main Content */}
        <main className="flex-1 max-w-7xl mx-auto w-full pb-10 px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
              About chatrealfam
            </h1>
            <p className="text-gray-700 mb-6 leading-relaxed">
              chatrealfam, developed by Marcadeo, is a powerful tool designed to
              help businesses and creators manage their Instagram Business
              accounts with ease. By integrating with the Instagram Graph API,
              we provide seamless features to streamline your social media
              presence, from managing comments and messages to analyzing
              performance insights.
            </p>

            <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">
              Our Mission
            </h2>
            <p className="text-gray-700 mb-6 leading-relaxed">
              At Marcadeo, our mission is to empower businesses and creators to
              connect with their audience effectively. chatrealfam simplifies
              Instagram management by offering tools to automate engagement,
              monitor analytics, and enhance communication, all while
              prioritizing user privacy and security.
            </p>

            <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">
              What We Offer
            </h2>
            <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
              <li>
                <strong>Profile Management</strong>: Access and display your
                Instagram profile details, including bio, follower count, and
                posts.
              </li>
              <li>
                <strong>Comment Moderation</strong>: Easily manage and respond
                to comments on your posts to foster engagement.
              </li>
              <li>
                <strong>Direct Messaging</strong>: Automate and streamline your
                Instagram Direct messages to connect with your audience.
              </li>
              <li>
                <strong>Analytics Insights</strong>: Gain valuable insights into
                your account’s performance, including reach, impressions, and
                audience demographics.
              </li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">
              Why Choose chatrealfam?
            </h2>
            <p className="text-gray-700 mb-6 leading-relaxed">
              We understand the challenges of managing a busy Instagram account.
              chatrealfam is built to save you time, enhance your engagement,
              and provide data-driven insights to grow your presence. Our
              commitment to transparency and data security ensures your
              information is handled responsibly, as outlined in our{" "}
              <Link
                href="/privacy-policy"
                className="text-blue-600 hover:underline"
              >
                Privacy Policy
              </Link>
              .
            </p>

            <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">
              About Marcadeo
            </h2>
            <p className="text-gray-700 mb-6 leading-relaxed">
              Marcadeo is a technology company dedicated to creating innovative
              solutions for digital marketing and social media management. Based
              in India, we strive to deliver tools that make online engagement
              effortless and effective for businesses worldwide.
            </p>

            <div className="mt-8">
              <Link href="/login">
                <button className="flex items-center px-4 py-2 cursor-pointer rounded-lg font-medium transition-all bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 text-white hover:bg-blue-700 active:scale-95">
                  <ChevronLeft className="w-5 h-5 mr-2" />
                  Go Back{" "}
                </button>
              </Link>
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
