import Link from "next/link";

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
import Head from "next/head";




export default function Terms() {
  return (

    <>
         <Head>
             <title>Terms - chatrealfam</title>
             <meta property="og:title" content="Terms - chatrealfam" />
             <meta
               property="og:description"
               content="Terms of Service for chatrealfam Application"
             />
             {/* <meta property="og:image" content={`${baseUrl}/chatrealfam.png`} /> */}
             <meta property="og:image:alt" content="chatrealfam Logo" />
             <meta
               property="og:image"
               content="https://chat.realfam.co.in/_next/static/media/chatrealfam.8b32fd1e.png"
             />
     
             <meta
               property="og:url"
               content="https://chat.realfam.co.in/terms"
             />
             <meta
               name="description"
               content="Learn how Realfam collects, uses, and protects your data, including Instagram profile, messages, insights, and comments, in compliance with Meta’s terms."
             />
           </Head>
    <div className="min-h-screen bg-white flex flex-col ">
      {/* Header */}
     <div className="flex justify-center gap-2 md:justify-start px-8">
          <Link href="/" className="flex items-center gap-2 font-medium">
            <div className="flex items-center justify-center h-30 w-30">
              <Image src={logo} alt="Logo" width={200} height={160} />
            </div>
          </Link>
        </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <section className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            1. Introduction
          </h2>
          <p className="text-gray-700 text-sm sm:text-base">
            chatrealfam, developed by Marcadeo, provides a platform that
            integrates with Instagram to offer features such as viewing your
            Instagram Business or Creator account profile, managing comments,
            messaging, and accessing insights about your Instagram content.
            These features are powered by the Instagram Graph API, and we are
            committed to protecting your privacy and ensuring compliance with
            Instagram’s policies and applicable laws.
          </p>
        </section>

        <section className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            2. Eligibility
          </h2>
          <p className="text-gray-700 text-sm sm:text-base">
            To use our Service, you must:
          </p>
          <ul className="list-disc pl-6 text-gray-700 text-sm sm:text-base">
            <li>
              Be at least 13 years old or the minimum age required in your
              jurisdiction to use Instagram.
            </li>
            <li>
              Have an Instagram Business or Creator account linked to a Facebook
              Page, as required for our Service’s functionality.
            </li>
            <li>
              Agree to comply with these ToS and all applicable laws and
              regulations.
            </li>
          </ul>
        </section>

        <section className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            3. Use of Instagram Graph API
          </h2>
          <p className="text-gray-700 text-sm sm:text-base">
            Our Service integrates with the Instagram Graph API to provide the
            following functionalities:
          </p>
          <ul className="list-disc pl-6 text-gray-700 text-sm sm:text-base">
            <li>
              <strong>Profile Information:</strong> Accessing basic profile
              data, such as your Instagram Business or Creator account’s
              username, biography, and profile details
              (instagram_business_basic).
            </li>
            <li>
              <strong>Comment Management:</strong> Viewing, posting, replying
              to, hiding, or deleting comments on your Instagram media
              (instagram_business_manage_comments).
            </li>
            <li>
              <strong>Messaging:</strong> Managing direct messages sent to or
              from your Instagram Business or Creator account
              (instagram_business_manage_messages).
            </li>
            <li>
              <strong>Insights:</strong> Retrieving analytics and metrics about
              your Instagram posts, stories, and account performance, such as
              engagement, impressions, and reach
              (instagram_business_manage_insights).
            </li>
          </ul>
          <p className="text-gray-700 text-sm sm:text-base mt-2">
            We use these permissions solely to provide the features of our
            Service and do not access, store, or share data beyond what is
            necessary for these purposes.
          </p>
        </section>

        <section className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            4. User Data and Privacy
          </h2>
          <h3 className="text-lg sm:text-xl font-medium mb-2">
            4.1 Data Collection
          </h3>
          <p className="text-gray-700 text-sm sm:text-base">
            When you connect your Instagram account to chatrealfam, we collect and
            process data as authorized by the Instagram Graph API permissions
            you grant during the OAuth 2.0 authentication process. This may
            include:
          </p>
          <ul className="list-disc pl-6 text-gray-700 text-sm sm:text-base">
            <li>
              Your Instagram profile information (e.g., username, profile
              picture, biography).
            </li>
            <li>
              Comments and messages associated with your Instagram Business or
              Creator account.
            </li>
            <li>
              Analytics data, such as post engagement, impressions, and reach.
            </li>
          </ul>

          <h3 className="text-lg sm:text-xl font-medium mt-4 mb-2">
            4.2 Data Usage
          </h3>
          <p className="text-gray-700 text-sm sm:text-base">
            We use your data to:
          </p>
          <ul className="list-disc pl-6 text-gray-700 text-sm sm:text-base">
            <li>
              Provide and improve the features of chatrealfam, such as displaying
              your Instagram profile, managing comments, responding to messages,
              and generating insights.
            </li>
            <li>Personalize your experience within the Service.</li>
            <li>
              Ensure compliance with Instagram’s Platform Policy and applicable
              laws.
            </li>
          </ul>

          <h3 className="text-lg sm:text-xl font-medium mt-4 mb-2">
            4.3 Data Sharing
          </h3>
          <p className="text-gray-700 text-sm sm:text-base">
            We do not sell, rent, or share your personal data with third
            parties, except:
          </p>
          <ul className="list-disc pl-6 text-gray-700 text-sm sm:text-base">
            <li>With your explicit consent.</li>
            <li>
              To comply with legal obligations, such as responding to lawful
              requests from authorities.
            </li>
            <li>
              With service providers acting on our behalf (e.g., cloud storage
              providers) who are bound by strict confidentiality agreements.
            </li>
          </ul>

          <h3 className="text-lg sm:text-xl font-medium mt-4 mb-2">
            4.4 Data Storage and Security
          </h3>
          <p className="text-gray-700 text-sm sm:text-base">
            We store your data securely and retain it only for as long as
            necessary to provide the Service or as required by law. You may
            disconnect your Instagram account at any time through chatrealfam’s
            settings, which will revoke our access to your data via the
            Instagram Graph API. For more details, please review our{" "}
            <a href="/privacy-policy" className="text-blue-600 hover:underline">
              Privacy Policy
            </a>
            .
          </p>
        </section>

        <section className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            5. User Responsibilities
          </h2>
          <p className="text-gray-700 text-sm sm:text-base">You agree to:</p>
          <ul className="list-disc pl-6 text-gray-700 text-sm sm:text-base">
            <li>
              Provide accurate information when connecting your Instagram
              account.
            </li>
            <li>
              Use the Service in compliance with Instagram’s Platform Policy and
              Community Guidelines.
            </li>
            <li>
              Not misuse chatrealfam to engage in spamming, harassment, or other
              prohibited activities.
            </li>
            <li>
              Not attempt to access data or features beyond the permissions you
              have granted us.
            </li>
          </ul>
        </section>

        <section className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            6. Instagram Platform Policy Compliance
          </h2>
          <p className="text-gray-700 text-sm sm:text-base">
            Marcadeo adheres to Meta’s Instagram Platform Policy, which governs
            the use of the Instagram Graph API. Key commitments include:
          </p>
          <ul className="list-disc pl-6 text-gray-700 text-sm sm:text-base">
            <li>Using your data only for the purposes you have authorized.</li>
            <li>
              Not storing data longer than necessary or beyond the scope of the
              granted permissions.
            </li>
            <li>
              Providing you with clear options to disconnect your Instagram
              account and revoke permissions.
            </li>
            <li>
              Ensuring transparency about how your data is used and protected.
            </li>
          </ul>
          <p className="text-gray-700 text-sm sm:text-base mt-2">
            By using chatrealfam, you acknowledge that your use of Instagram is
            also subject to Instagram’s{" "}
            <a href="/terms" className="text-blue-600 hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="/privacy-policy" className="text-blue-600 hover:underline">
              Privacy Policy
            </a>
            .
          </p>
        </section>

        <section className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            7. App Review Process
          </h2>
          <p className="text-gray-700 text-sm sm:text-base">
            To ensure compliance with Instagram’s requirements, chatrealfam
            undergoes Meta’s App Review process to obtain the necessary
            permissions (instagram_business_basic,
            instagram_business_manage_comments,
            instagram_business_manage_messages,
            instagram_business_manage_insights). During this process, we
            demonstrate:
          </p>
          <ul className="list-disc pl-6 text-gray-700 text-sm sm:text-base">
            <li>
              How chatrealfam uses the requested permissions to provide value to
              users.
            </li>
            <li>
              Clear instructions for users to authenticate and grant permissions
              via Instagram’s OAuth 2.0 flow.
            </li>
            <li>Robust data security measures to protect your information.</li>
          </ul>
          <p className="text-gray-700 text-sm sm:text-base mt-2">
            You can help us maintain compliance by ensuring your Instagram
            account is a valid Business or Creator account and by granting the
            requested permissions during authentication.
          </p>
        </section>

        <section className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            8. Intellectual Property
          </h2>
          <p className="text-gray-700 text-sm sm:text-base">
            All content, trademarks, and intellectual property related to
            chatrealfam are owned by Marcadeo or our licensors. You may not
            reproduce, distribute, or create derivative works from our Service
            without our prior written consent. Content you access or manage
            through chatrealfam (e.g., your Instagram posts, comments, or
            messages) remains your property or the property of the respective
            rights holders, subject to Instagram’s Terms of Use.
          </p>
        </section>

        <section className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            9. Termination
          </h2>
          <p className="text-gray-700 text-sm sm:text-base">
            We may suspend or terminate your access to chatrealfam if you:
          </p>
          <ul className="list-disc pl-6 text-gray-700 text-sm sm:text-base">
            <li>Violate these ToS or Instagram’s Platform Policy.</li>
            <li>Engage in activities that harm the Service or other users.</li>
            <li>
              Fail to maintain a valid Instagram Business or Creator account.
            </li>
          </ul>
          <p className="text-gray-700 text-sm sm:text-base mt-2">
            You may stop using chatrealfam at any time by disconnecting your
            Instagram account through our settings.
          </p>
        </section>

        <section className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            10. Limitation of Liability
          </h2>
          <p className="text-gray-700 text-sm sm:text-base">
            To the fullest extent permitted by law, Marcadeo shall not be liable
            for any indirect, incidental, special, or consequential damages
            arising from your use of chatrealfam. We do not guarantee
            uninterrupted or error-free operation of the Service, as it relies
            on third-party services like the Instagram Graph API.
          </p>
        </section>

        <section className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            11. Changes to These Terms
          </h2>
          <p className="text-gray-700 text-sm sm:text-base">
            We may update these ToS to reflect changes in chatrealfam, Instagram’s
            policies, or applicable laws. We will notify you of significant
            changes by posting the updated ToS on our website (
            <a
              href="http://chat.realfam.co.in"
              className="text-blue-600 hover:underline"
            >
              chat.realfam.co.in
            </a>
            ) or through the Service. Your continued use of chatrealfam after such
            changes constitutes acceptance of the updated ToS.
          </p>
        </section>

        <section className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            12. Governing Law
          </h2>
          <p className="text-gray-700 text-sm sm:text-base">
            These ToS are governed by the laws of India, without regard to its
            conflict of law principles. Any disputes arising from these ToS
            shall be resolved in the courts of Bangalore, India.
          </p>
        </section>

        <section className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            13. Contact Us
          </h2>
          <p className="text-gray-700 text-sm sm:text-base">
            If you have questions about these Terms of Service, please contact
            us at:
          </p>
          <ul className="list-disc pl-6 text-gray-700 text-sm sm:text-base">
            <li>
              <strong>Email:</strong>{" "}
              <a
                href="mailto:admin@realfam.co.in"
                className="text-blue-600 hover:underline"
              >
                admin@realfam.co.in
              </a>
            </li>
            <li>
              <strong>Address:</strong>  127/1, W-1, Juhi Kalan, Saket Nagar,
               Kanpur, Uttar Pradesh 208014
            </li>
          </ul>
        </section>
        <div className="mt-8">
          <Link href="/login">
            <button className="flex items-center px-4 py-2 cursor-pointer rounded-lg font-medium transition-all bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 text-white hover:bg-blue-700 active:scale-95">
              <ChevronLeft className="w-5 h-5 mr-2" />
              Go Back
            </button>
          </Link>
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
