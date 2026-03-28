'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import illustrationImg from "../../../public/instaconnect.jpg";
import Image from 'next/image';
import Link from 'next/link';
import logo from "../../../public/chatrealfam.png";

const PlatformSelection = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const [isInstagramAgreed, setIsInstagramAgreed] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status === "loading" || !session || session.user.role !== "USER") {
      return;
    }

    const checkInstagramConnection = async () => {
      if (session.user.id) {
        try {
          const response = await fetch("/api/user/instagram-status", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: session.user.id }),
          });
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          const data = await response.json();
          setIsConnected(!!data.instagramToken);
        } catch (err) {
          console.error("Error checking Instagram connection:", err);
          setError("Failed to verify Instagram connection. Please try again.");
          toast.error("Failed to verify Instagram connection. Please try again.", {
            duration: 3000,
          });
        }
      }
    };

    checkInstagramConnection();

    if (session.user.instagramToken) {
      router.push("/dashboard");
    }
  }, [session, status, router]);

  const handleInstagramConnect = async () => {
    setIsConnecting(true);
    setError(null);

    const clientId = process.env.NEXT_PUBLIC_INSTAGRAM_CLIENT_ID;
    const redirectUri = process.env.NEXT_PUBLIC_INSTAGRAM_REDIRECT_URI;

    if (!clientId || !redirectUri) {
      console.error("Missing clientId or redirectUri:", { clientId, redirectUri });
      setError("Configuration error: Instagram connection setup is incomplete.");
      toast.error("Instagram connection setup is incomplete. Please contact support.", {
        duration: 3000,
      });
      setIsConnecting(false);
      return;
    }

    const newScopes = [
      "instagram_business_basic",
      "instagram_business_manage_comments",
      "instagram_business_manage_messages",
      "instagram_business_content_publish",
      "instagram_business_manage_insights",
    ].join(",");
    const state = Buffer.from(session?.user?.id || Math.random().toString(36).substring(2)).toString("base64");
    const authUrl = `https://www.instagram.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${newScopes}&response_type=code&state=${state}&force_reauth=true`;

    try {
      window.location.href = authUrl;
    } catch (err) {
      console.error("Error initiating Instagram OAuth:", err);
      setError("Failed to start Instagram connection. Please try again.");
      toast.error("Failed to start Instagram connection. Please try again.", {
        duration: 3000,
      });
      setIsConnecting(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-r from-purple-50 via-red-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session || session.user.role !== "USER") {
    return null;
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left Side - Logo and Content */}
      <div className="flex flex-col gap-4 p-6 md:p-10">
        {/* Logo Section */}
        <div className="flex justify-center gap-2 md:justify-start">
          <Link href="/" className="flex items-center gap-2 font-medium">
            <div className="flex justify-center gap-2 md:justify-start px-8">
              <div className="flex items-center justify-center h-30 w-30">
                <div className="flex items-center justify-center h-30 w-30">
                  <Image src={logo} alt="Logo" width={200} height={160} />
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Content Section */}
        <div className="flex flex-1 items-center justify-center lg:ml-30">
          <div className="w-full max-w-lg">
            {/* Illustration */}
            <div className="flex justify-center lg:justify-start">
              <Image
                src={illustrationImg}
                alt="Illustration"
                width={300}
                height={300}
                className="rounded-xl"
              />
            </div>

            {/* Text Content */}
            <div className="text-center lg:text-left">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 leading-tight">
                Connect Instagram
                <br />
                like to start?
              </h2>
              <p className="text-gray-600 text-sm mb-4">
                Use your Instagram account to connect to ChatRealfam.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Connection Steps */}
      <div className="flex flex-col gap-4 p-6 md:p-10 bg-gray-50 lg:border-l rounded-3xl border-gray-300">
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                A few steps left
              </h3>
              <p className="text-gray-600 text-sm mb-8 leading-relaxed">
                Log in with Instagram and set your permissions. Once that's done, you're all set to connect to ChatRealfam!
              </p>

              {/* Privacy Agreement Checkbox */}
              <div className="mb-6">
                <label
                  htmlFor="privacy-agreement"
                  className="text-sm flex items-start cursor-pointer"
                >
                  <input
                    type="checkbox"
                    id="privacy-agreement"
                    required
                    onChange={(e) => setIsInstagramAgreed(e.target.checked)}
                    className="mr-2 mt-1 accent-blue-500 cursor-pointer w-4 h-4"
                  />
                  <span className="text-gray-700">
                    I agree to the{" "}
                    <Link
                      href="https://chat.realfam.co.in/privacy-policy"
                      className="text-blue-500 hover:text-blue-600 underline underline-offset-4"
                      target="_blank"
                    >
                      Privacy Policy
                    </Link>
                    {" "}and{" "}
                    <Link
                      href="https://chat.realfam.co.in/terms"
                      className="text-blue-500 hover:text-blue-600 underline underline-offset-4"
                      target="_blank"
                    >
                      Terms & Conditions
                    </Link>
                  </span>
                </label>
              </div>

              {/* Connect Button */}
              {!isConnected ? (
                <button
                  onClick={handleInstagramConnect}
                  disabled={isConnecting || !isInstagramAgreed}
                  className="w-full cursor-pointer bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 mb-4 text-base"
                >
                  {isConnecting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                          strokeDasharray="32"
                          strokeDashoffset="32"
                        >
                          <animate
                            attributeName="stroke-dashoffset"
                            values="32;0"
                            dur="1s"
                            repeatCount="indefinite"
                          />
                        </circle>
                      </svg>
                      Connecting...
                    </span>
                  ) : (
                    "Go To Instagram"
                  )}
                </button>
              ) : (
                <button className="w-full bg-green-500 text-white font-semibold py-2 px-4 rounded-lg mb-4 text-base cursor-default">
                  ✅ Account Connected
                </button>
              )}

          
            </div>
          </div>
        </div>
        <div className="text-center text-xs text-gray-500">
          By continuing, you agree to our{" "}
          <Link href="/privacy-policy" className="text-blue-500 hover:text-blue-800 underline underline-offset-4">
            Privacy Policy
          </Link>{" "}
          and{" "}
          <Link href="/terms" className="text-blue-500 hover:text-blue-800 underline underline-offset-4">
            Terms
          </Link>
          .
        </div>
      </div>
      <Toaster />
    </div>
  );
};

export default PlatformSelection;