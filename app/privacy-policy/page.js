"use client";

import Link from "next/link";
import Head from "next/head";
import { useEffect, useState } from "react";
import {
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

// Base URL setup
const baseUrl =
  process.env.NEXT_PUBLIC_BASE_URL ||
  (process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : "https://chat.realfam.co.in");

export default function PrivacyPolicy() {
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll("h2");
      let currentSection = "";
      sections.forEach((section) => {
        const sectionTop = section.getBoundingClientRect().top;
        if (sectionTop <= 150) {
          currentSection = section.id;
        }
      });
      setActiveSection(currentSection);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <Head>
        <title>Privacy Policy - chatrealfam</title>
        <meta property="og:title" content="Privacy Policy - chatrealfam" />
        <meta
          property="og:description"
          content="Learn how Realfam collects, uses, and protects your data, including Instagram and WhatsApp profile data, messages, comments, published content, performance insights, and automated responses, in compliance with Meta’s policies."
        />
        <meta
          property="og:image"
          content="https://chat.realfam.co.in/_next/static/media/chatrealfam.8b32fd1e.png"
        />
        <meta property="og:image:alt" content="chatrealfam Logo" />
        <meta
          property="og:url"
          content="https://chat.realfam.co.in/privacy-policy"
        />
        <meta
          name="description"
          content="Learn how Realfam collects, uses, and protects your data, including Instagram and WhatsApp profile data, messages, comments, published content, performance insights, and automated responses, in compliance with Meta’s policies."
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
        <div className="flex-1 max-w-7xl mx-auto w-full py-2 px-4 sm:px-6 lg:flex lg:space-x-8">
          {/* Table of Contents (Sticky Sidebar) */}
          <aside className="hidden lg:block lg:w-64 xl:w-72 sticky top-24 self-start">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Table of Contents
              </h3>
              <ul className="space-y-2">
                {[
                  {
                    id: "information-we-collect",
                    title: "1. Information We Collect",
                  },
                  { id: "how-we-use", title: "2. How We Use Your Information" },
                  {
                    id: "how-we-share",
                    title: "3. How We Share Your Information",
                  },
                  { id: "data-storage", title: "4. Data Storage and Security" },
                  { id: "your-rights", title: "5. Your Rights and Choices" },
                  { id: "third-party", title: "6. Third-Party Services" },
                  {
                    id: "international-transfers",
                    title: "7. International Data Transfers",
                  },
                  { id: "childrens-privacy", title: "8. Children’s Privacy" },
                  {
                    id: "changes-policy",
                    title: "9. Changes to This Privacy Policy",
                  },
                  { id: "contact-us", title: "10. Contact Us" },
                ].map((item) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      className={`text-sm ${
                        activeSection === item.id
                          ? "text-blue-600 font-medium"
                          : "text-gray-600 hover:text-blue-600"
                      } transition-colors`}
                    >
                      {item.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Policy Content */}
          <main className="lg:flex-1 bg-white rounded-lg shadow-md p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
              Privacy Policy
            </h1>
            <p className="text-sm text-gray-500 mb-6">
              Last Updated: October 8, 2025
            </p>

            <p className="text-gray-700 mb-6 leading-relaxed">
              chatrealfam, operated by Marcadeo, is a platform that integrates with the Instagram Graph API and WhatsApp Business API to provide services for Instagram Business/Creator accounts and WhatsApp Business accounts. These services include Instagram profile management, direct messaging, comment moderation, content publishing, performance analytics, and WhatsApp automated messaging, template management, and business profile management. This Privacy Policy explains how we collect, use, disclose, and safeguard your information, including data accessed via the Instagram Graph API permissions (<code className="bg-gray-100 px-1 rounded">instagram_business_basic</code>, <code className="bg-gray-100 px-1 rounded">instagram_business_manage_messages</code>, <code className="bg-gray-100 px-1 rounded">instagram_business_manage_comments</code>, <code className="bg-gray-100 px-1 rounded">instagram_business_content_publish</code>, <code className="bg-gray-100 px-1 rounded">instagram_business_manage_insights</code>) and WhatsApp Business API permissions (<code className="bg-gray-100 px-1 rounded">whatsapp_business_management</code>, <code className="bg-gray-100 px-1 rounded">whatsapp_business_messaging</code>, messaging, template management), in compliance with Meta’s Platform Terms and WhatsApp Business Platform policies. By using the App, you agree to this Privacy Policy. If you do not agree, please do not use the App.
            </p>

            <h2
              id="information-we-collect"
              className="text-2xl font-semibold text-gray-800 mt-8 mb-4"
            >
              1. Information We Collect
            </h2>
            <p className="text-gray-700 mb-4 leading-relaxed">
              We collect information to provide and improve our services, including data accessed through the Instagram Graph API and WhatsApp Business API with your explicit consent. The types of information we collect include:
            </p>

            <h3 className="text-xl font-medium text-gray-800 mt-6 mb-3">
              a. Instagram Account Data
            </h3>
            <p className="text-gray-700 mb-4 leading-relaxed">
              With your authorization, we access the following data from your Instagram Business or Creator account via the Instagram Graph API:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
              <li>
                <strong>Profile Data</strong>: Username, biography, followers count, media count, and profile picture URL (via <code className="bg-gray-100 px-1 rounded">instagram_business_basic</code> and <code className="bg-gray-100 px-1 rounded">instagram_business_manage_insights</code> scopes).
              </li>
              <li>
                <strong>Media Data</strong>: Details of posts, Reels, or carousels you own or publish, including captions, media URLs, timestamps, and media types (via <code className="bg-gray-100 px-1 rounded">instagram_business_basic</code> and <code className="bg-gray-100 px-1 rounded">instagram_business_content_publish</code> scopes).
              </li>
              <li>
                <strong>Insights Data</strong>: Performance metrics for your profile (e.g., followers count, profile visits) and media (e.g., reach, likes, comments, shares, saved, views, total interactions, video view time for Reels) (via <code className="bg-gray-100 px-1 rounded">instagram_business_manage_insights</code> scope).
              </li>
              <li>
                <strong>Comments Data</strong>: Comments on your posts and replies you create (via <code className="bg-gray-100 px-1 rounded">instagram_business_manage_comments</code> scope).
              </li>
              <li>
                <strong>Direct Messages</strong>: Messages in your Instagram Direct inbox and messages you send (via <code className="bg-gray-100 px-1 rounded">instagram_business_manage_messages</code> scope).
              </li>
            </ul>

            <h3 className="text-xl font-medium text-gray-800 mt-6 mb-3">
              b. WhatsApp Account Data
            </h3>
            <p className="text-gray-700 mb-4 leading-relaxed">
              With your authorization, we access the following data from your WhatsApp Business account via the WhatsApp Business API:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
              <li>
                <strong>Profile Data</strong>: WhatsApp Business profile details, such as business name, phone number ID, profile picture, about text, address, description, email, website, and WhatsApp Business Account ID (WABA ID) (via <code className="bg-gray-100 px-1 rounded">whatsapp_business_management</code> scope).
              </li>
              <li>
                <strong>Messages</strong>: Incoming and outgoing messages, including text messages, media (e.g., images, documents), and metadata (e.g., sender phone number, timestamps) (via <code className="bg-gray-100 px-1 rounded">whatsapp_business_messaging</code> scope).
              </li>
              <li>
                <strong>Templates</strong>: Message templates used for automated responses, including template names, languages, categories, components, and parameters (e.g., placeholders for dynamic content) (via <code className="bg-gray-100 px-1 rounded">whatsapp_business_management</code> scope).
              </li>
              <li>
                <strong>Automation Data</strong>: Keyword automation settings, such as keywords, match types (exact, contains, startsWith, endsWith), and associated templates for automated replies.
              </li>
            </ul>

            <h3 className="text-xl font-medium text-gray-800 mt-6 mb-3">
              c. Consent via OAuth
            </h3>
            <p className="text-gray-700 mb-4 leading-relaxed">
              When you connect your Instagram Business/Creator or WhatsApp Business account to chatrealfam, you will be prompted to grant permissions through the Instagram OAuth Dialog (for Instagram) or WhatsApp Business API OAuth flow (for WhatsApp). These processes allow you to explicitly consent to us accessing your Instagram data (e.g., profile, media, insights, messages, comments) and WhatsApp data (e.g., profile, messages, templates, automation settings) as described above. You can review and approve these permissions during the login flow, and a link to this Privacy Policy will be provided to inform your decision.
            </p>

            <h3 className="text-xl font-medium text-gray-800 mt-6 mb-3">
              d. User-Provided Information
            </h3>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
              <li>
                <strong>Authentication Data</strong>: Email address, Instagram access tokens, and WhatsApp access tokens provided during OAuth authorization to connect your accounts to the App.
              </li>
              <li>
                <strong>Contact Information</strong>: If you contact us for support, we may collect your name, email address, or other information you provide.
              </li>
              <li>
                <strong>Content Data</strong>: Media files (e.g., JPEG images, MP4 videos), captions, alt text, or message templates you upload or provide for publishing Instagram posts, Reels, carousels, or sending WhatsApp messages.
              </li>
              <li>
                <strong>Automation Configuration</strong>: Keywords, match types, and template parameters you configure for WhatsApp automation.
              </li>
              <li>
                <strong>Business Profile Configuration</strong>: Information you provide to manage your WhatsApp Business profile, such as profile picture, about text, address, description, email, or website.
              </li>
            </ul>

            <h3 className="text-xl font-medium text-gray-800 mt-6 mb-3">
              e. Technical Data
            </h3>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
              <li>
                <strong>Usage Data</strong>: Information about how you interact with the App, such as features used (e.g., publishing posts, viewing insights, configuring WhatsApp automations or business profiles), timestamps, and session duration.
              </li>
              <li>
                <strong>Device Data</strong>: IP address, browser type, operating system, and device identifiers.
              </li>
              <li>
                <strong>Cookies and Tracking</strong>: We may use cookies or similar technologies to enhance your experience and analyze usage. You can manage cookie preferences through your browser settings.
              </li>
            </ul>

            <h2
              id="how-we-use"
              className="text-2xl font-semibold text-gray-800 mt-8 mb-4"
            >
              2. How We Use Your Information
            </h2>
            <p className="text-gray-700 mb-4 leading-relaxed">
              We use the collected information to:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
              <li>
                <strong>Provide Services</strong>: Enable features such as viewing and managing your Instagram profile, managing comments, sending/receiving Instagram direct messages, publishing Instagram posts, Reels, or carousels, accessing Instagram performance analytics, managing your WhatsApp Business profile, sending/receiving WhatsApp messages, and managing WhatsApp automated responses using keyword-based templates.
              </li>
              <li>
                <strong>Improve the App</strong>: Analyze usage patterns and aggregated, de-identified insights (e.g., Instagram post performance trends, WhatsApp automation effectiveness, business profile engagement) to enhance functionality, suggest optimal posting or messaging strategies, and improve user experience.
              </li>
              <li>
                <strong>Communicate with You</strong>: Respond to your inquiries, provide customer support, and send service-related notifications (e.g., WhatsApp template approval status, business profile updates).
              </li>
              <li>
                <strong>Comply with Legal Obligations</strong>: Meet requirements under applicable laws, regulations, or Meta’s policies for both Instagram and WhatsApp.
              </li>
              <li>
                <strong>Ensure Security</strong>: Detect and prevent fraud, unauthorized access, or other misuse of the App.
              </li>
            </ul>

            <h2
              id="how-we-share"
              className="text-2xl font-semibold text-gray-800 mt-8 mb-4"
            >
              3. How We Share Your Information
            </h2>
            <p className="text-gray-700 mb-4 leading-relaxed">
              We do not sell your personal information. We may share your information in the following cases:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
              <li>
                <strong>With Meta</strong>: Data accessed via the Instagram Graph API or WhatsApp Business API (e.g., for publishing, insights, messaging, or profile management) is processed in accordance with Meta’s Developer Policies, WhatsApp Business Platform policies, and Terms of Service.
              </li>
              <li>
                <strong>Service Providers</strong>: We may share data with trusted third-party providers who assist in operating the App (e.g., analytics or hosting on our Ubuntu server), subject to strict confidentiality agreements.
              </li>
              <li>
                <strong>Legal Requirements</strong>: If required by law, regulation, or legal process, we may disclose information to authorities or third parties.
              </li>
              <li>
                <strong>Business Transfers</strong>: In the event of a merger, acquisition, or sale of assets, your information may be transferred to a successor entity.
              </li>
            </ul>

            <h2
              id="data-storage"
              className="text-2xl font-semibold text-gray-800 mt-8 mb-4"
            >
              4. Data Storage and Security
            </h2>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
              <li>
                <strong>Storage</strong>: Your data is stored securely on our Ubuntu server with AES-256 encryption and access controls. Instagram and WhatsApp data accessed via their respective APIs (e.g., media, insights, messages, templates, business profiles) is stored temporarily and only as needed to provide services.
              </li>
              <li>
                <strong>Retention</strong>: We retain your data only for as long as necessary to fulfill the purposes outlined in this policy or as required by law. Instagram and WhatsApp access tokens are refreshed or deleted upon revocation of access.
              </li>
              <li>
                <strong>Security Measures</strong>: We implement industry-standard measures, such as AES-256 encryption, firewalls, and secure authentication, to protect your data. However, no system is completely secure, and we cannot guarantee absolute security.
              </li>
            </ul>

            <h2
              id="your-rights"
              className="text-2xl font-semibold text-gray-800 mt-8 mb-4"
            >
              5. Your Rights and Choices
            </h2>
            <p className="text-gray-700 mb-4 leading-relaxed">
              Depending on your location (e.g., under GDPR or CCPA), you may have the following rights:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
              <li>
                <strong>Access</strong>: Request a copy of the personal data we hold about you, including Instagram profile, media, insights, WhatsApp messages, templates, automation settings, or business profile data.
              </li>
              <li>
                <strong>Correction</strong>: Request corrections to inaccurate or incomplete data.
              </li>
              <li>
                <strong>Deletion</strong>: Request deletion of your data, subject to legal or contractual limitations.
              </li>
              <li>
                <strong>Restriction</strong>: Request restrictions on how we process your data.
              </li>
              <li>
                <strong>Data Portability</strong>: Request a copy of your data in a structured, machine-readable format.
              </li>
              <li>
                <strong>Opt-Out</strong>: You can revoke chatrealfam’s access to your Instagram or WhatsApp account at any time via the Instagram, Facebook, or WhatsApp app settings (under “Business Integrations” or “Apps and Websites”). This will stop further data collection (e.g., insights, publishing, messaging, profile management) and delete associated access tokens from our systems, in accordance with Meta’s policies.
              </li>
            </ul>
            <p className="text-gray-700 mb-4 leading-relaxed">
              To exercise these rights, contact us at{" "}
              <a
                href="mailto:admin@realfam.co.in"
                className="text-blue-600 hover:underline"
              >
                admin@realfam.co.in
              </a>
              . We will respond within the timeframes required by applicable law.
            </p>

            <h2
              id="third-party"
              className="text-2xl font-semibold text-gray-800 mt-8 mb-4"
            >
              6. Third-Party Services
            </h2>
            <p className="text-gray-700 mb-4 leading-relaxed">
              The App integrates with the Instagram Graph API and WhatsApp Business API, subject to Meta’s Platform Terms (
              <a
                href="https://developers.facebook.com/terms"
                className="text-blue-600 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://developers.facebook.com/terms
              </a>
              ) and WhatsApp Business Platform policies (
              <a
                href="https://developers.facebook.com/docs/whatsapp/business-management-api"
                className="text-blue-600 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://developers.facebook.com/docs/whatsapp/business-management-api
              </a>
              ). Data shared with Meta is governed by their privacy policies. We are not responsible for the privacy practices of Meta or other third-party services linked from the App.
            </p>

            <h2
              id="international-transfers"
              className="text-2xl font-semibold text-gray-800 mt-8 mb-4"
            >
              7. International Data Transfers
            </h2>
            <p className="text-gray-700 mb-4 leading-relaxed">
              Your data may be transferred to and processed in countries other than your own, including servers hosted in India or other regions, where our Ubuntu server or service providers are located. We ensure appropriate safeguards, such as Standard Contractual Clauses, for international data transfers as required by law.
            </p>

            <h2
              id="childrens-privacy"
              className="text-2xl font-semibold text-gray-800 mt-8 mb-4"
            >
              8. Children’s Privacy
            </h2>
            <p className="text-gray-700 mb-4 leading-relaxed">
              The App is not intended for individuals under 13 (or 16 in certain jurisdictions). We do not knowingly collect personal information from children. If you believe we have collected such data, please contact us to have it removed.
            </p>

            <h2
              id="changes-policy"
              className="text-2xl font-semibold text-gray-800 mt-8 mb-4"
            >
              9. Changes to This Privacy Policy
            </h2>
            <p className="text-gray-700 mb-4 leading-relaxed">
              We may update this Privacy Policy to reflect changes in our practices or legal requirements. We will notify you of significant changes via email or a notice in the App. The updated policy will take effect upon posting, with the “Last Updated” date revised.
            </p>

            <h2
              id="contact-us"
              className="text-2xl font-semibold text-gray-800 mt-8 mb-4"
            >
              10. Contact Us
            </h2>
            <p className="text-gray-700 mb-4 leading-relaxed">
              If you have questions, concerns, or requests regarding this Privacy Policy, please contact us at:
            </p>
            <p className="text-gray-700 mb-4 leading-relaxed">
              Marcadeo
              <br />
              127/1, W-1, Juhi Kalan, Saket Nagar,
              <br />
              Kanpur, Uttar Pradesh 208014, India
              <br />
              <a
                href="mailto:admin@realfam.co.in"
                className="text-blue-600 hover:underline"
              >
                admin@realfam.co.in
              </a>
              <br />
              <a
                href="tel:+916388807379"
                className="text-blue-600 hover:underline"
              >
                +91 6388807379
              </a>
              <br />
              <a
                href="https://chat.realfam.co.in"
                className="text-blue-600 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                chat.realfam.co.in
              </a>
            </p>
            <p className="text-gray-700 mb-4 leading-relaxed">
              For complaints, you may also contact your local data protection authority.
            </p>

            <p className="text-gray-700 mt-6 leading-relaxed border-t pt-6">
              This Privacy Policy complies with Meta’s requirements for the Instagram Graph API, WhatsApp Business API, and applicable data protection laws. Please review it carefully and ensure it is accessible via a publicly available URL for Meta’s App Review process.
            </p>

            <div className="mt-8">
              <Link href="/login">
                <button className="flex items-center px-4 py-2 cursor-pointer rounded-lg font-medium transition-all bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 text-white hover:bg-blue-700 active:scale-95">
                  <ChevronLeft className="w-5 h-5 mr-2" />
                  Go Back
                </button>
              </Link>
            </div>
          </main>
        </div>

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
                      Empowering businesses with innovative marketing solutions and strategic digital transformation. Your success is our commitment.
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
                        href="tel:+916388807379"
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