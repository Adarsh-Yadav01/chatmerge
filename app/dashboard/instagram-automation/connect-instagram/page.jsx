"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import instalogo from "../../../../public/instalogo.webp";
import Loader from "@/app/components/Loader";
import toast, { Toaster } from "react-hot-toast";

export default function ConnectInstagram() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [instagramDetails, setInstagramDetails] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isInstagramAgreed, setIsInstagramAgreed] = useState(false);

  useEffect(() => {
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
          if (data.instagramToken) {
            await fetchInstagramDetails(session.user.id);
          }
        } catch (err) {
          console.error("Error checking Instagram connection:", err);
          setError("Failed to verify Instagram connection. Please try again.");
          toast.error("Failed to verify Instagram connection. Please try again.", {
            duration: 3000,
          });
        } finally {
          setInitialLoading(false);
        }
      }
    };

    const fetchInstagramDetails = async (userId) => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/instagram/user-details?userId=${encodeURIComponent(userId)}`
        );
        const data = await response.json();
        console.log("Instagram details response:", data);

        if (response.ok) {
          setInstagramDetails(data);
        } else {
          const errorDetail = data.error || { message: "Unknown error" };
          setError(`Failed to fetch details: ${errorDetail.message}`);
        }
      } catch (err) {
        console.error("Error fetching Instagram details:", err);
        setError(`Failed to fetch details: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    checkInstagramConnection();
  }, [session, status, router]);

  const handleConnect = async () => {
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
    const authUrl = `https://www.instagram.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&scope=${newScopes}&response_type=code&state=${state}&force_reauth=true`;

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

  const handleDisconnect = async () => {
    try {
      const response = await fetch("/api/user/disconnect-instagram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: session.user.email }),
      });

      if (response.ok) {
        setIsConnected(false);
        setInstagramDetails(null);
      }
    } catch (err) {
      setError("Failed to disconnect Instagram account");
      toast.error("Failed to disconnect Instagram account", {
        duration: 3000,
      });
    }
  };

  if (status === "loading") {
    return <Loader />;
  }

  if (!session || session.user.role !== "USER") {
    return null;
  }

  return (
    <div className="p-2">
      <div className="max-w-4xl mx-auto px-2 sm:px-4 lg:px-8">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 px-2">
            Instagram Integration
          </h1>
          <p className="text-sm sm:text-base text-gray-600 px-2">
            Connect your Instagram Business account to unlock powerful automation features
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Connection Status Header */}
          <div
            className={`px-3 sm:px-6 py-4 border-b border-gray-200 ${
              isConnected ? "bg-green-50" : "bg-gray-50"
            }`}
          >
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center space-x-3 min-w-0 flex-1">
                <div className="flex-shrink-0">
                  <div className="rounded-lg flex items-center justify-center">
                    <Image
                      src={instalogo}
                      alt="Instagram Logo"
                      className="h-8 w-8 sm:h-10 sm:w-10 object-cover rounded-lg"
                    />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                    Instagram Business
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-600">
                    {isConnected ? "Connected and ready" : "Not connected"}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2 flex-shrink-0">
                {isConnected && (
                  <span className="inline-flex items-center px-2 sm:px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <svg
                      className="w-3 h-3 sm:w-4 sm:h-4 mr-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="hidden sm:inline">Connected</span>
                    <span className="sm:hidden">✓</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mx-3 sm:mx-6 mt-4 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="flex">
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 mr-2 flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <p className="text-xs sm:text-sm text-red-700 mt-1 break-words">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="px-3 sm:px-6 py-4 border-b border-gray-200 flex justify-center">
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-blue-600 mr-3"></div>
              </div>
            </div>
          )}

          {/* Privacy Agreement Checkbox */}
          {!isConnected && (
            <div className="px-3 sm:px-6 py-4 border-b border-gray-200">
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
                  <a
                    href="https://chat.realfam.co.in/privacy-policy"
                    className="text-blue-500 hover:text-blue-600 underline underline-offset-4"
                    target="_blank"
                  >
                    Privacy Policy
                  </a>{" "}
                  and{" "}
                  <a
                    href="https://chat.realfam.co.in/terms"
                    className="text-blue-500 hover:text-blue-600 underline underline-offset-4"
                    target="_blank"
                  >
                    Terms & Conditions
                  </a>
                </span>
              </label>
            </div>
          )}

          {/* Account Details */}
          {isConnected && instagramDetails && !loading && (
            <div className="px-3 sm:px-6 py-4 sm:py-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-6">
                {/* Profile Picture */}
                <div className="flex-shrink-0 self-center sm:self-start">
                  {instagramDetails.profile_picture_url ? (
                    <img
                      src={instagramDetails.profile_picture_url}
                      alt="Profile"
                      className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-gray-200"
                    />
                  ) : (
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 rounded-full flex items-center justify-center">
                      <svg
                        className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Account Info */}
                <div className="flex-1 min-w-0 w-full">
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2 mb-2">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
                      {instagramDetails.name || "Instagram Business Account"}
                    </h3>
                    <span className="text-sm text-gray-500 truncate">
                      @{instagramDetails.username}
                    </span>
                  </div>

                  {instagramDetails.biography && (
                    <p className="text-gray-600 text-sm mb-4 leading-relaxed break-words">
                      {instagramDetails.biography}
                    </p>
                  )}

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-4">
                    <div className="text-center p-2 sm:p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg sm:text-2xl font-bold text-gray-900">
                        {instagramDetails.followers_count?.toLocaleString() || "0"}
                      </div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide">
                        Followers
                      </div>
                    </div>
                    <div className="text-center p-2 sm:p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg sm:text-2xl font-bold text-gray-900">
                        {instagramDetails.follows_count?.toLocaleString() || "0"}
                      </div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide">
                        Following
                      </div>
                    </div>
                    <div className="text-center p-2 sm:p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg sm:text-2xl font-bold text-gray-900">
                        {instagramDetails.media_count?.toLocaleString() || "0"}
                      </div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide">
                        Posts
                      </div>
                    </div>
                    <div className="text-center p-2 sm:p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm font-medium text-gray-900">
                        {instagramDetails.account_type || "Business"}
                      </div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide">
                        Account Type
                      </div>
                    </div>
                  </div>

                  {/* Website Link */}
                  {instagramDetails.website && (
                    <div className="flex items-center space-x-2">
                      <svg
                        className="w-4 h-4 text-gray-400 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                        />
                      </svg>
                      <a
                        href={instagramDetails.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm break-all"
                      >
                        {instagramDetails.website}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="px-3 sm:px-6 py-4 sm:py-6 bg-gray-50">
            <div className="flex flex-col sm:flex-row gap-3">
              {initialLoading ? (
                <div className="w-full flex-1 bg-gray-200 text-gray-400 font-medium py-3 px-4 rounded-lg flex items-center justify-center text-sm sm:text-base">
                  <svg
                    className="animate-spin -ml-1 mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 text-gray-400"
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
                  <span>Checking connection...</span>
                </div>
              ) : !isConnected ? (
                <button
                  onClick={handleConnect}
                  disabled={isConnecting || !isInstagramAgreed}
                  className="w-full flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center text-sm sm:text-base"
                >
                  {isConnecting ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 text-white"
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
                      <span className="hidden sm:inline">Connecting...</span>
                      <span className="sm:hidden">Connecting...</span>
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-4 h-4 sm:w-5 sm:h-5 mr-2"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                      </svg>
                      <span className="hidden sm:inline">Connect Instagram Account</span>
                      <span className="sm:hidden">Connect Instagram</span>
                    </>
                  )}
                </button>
              ) : (
                <>
                  <button
                    onClick={() =>
                      router.push("/dashboard/instagram-automation/connect-instagram/analytics")
                    }
                    className="w-full sm:flex-1 bg-gradient-to-br from-green-400 via-green-600 to-green-700 cursor-pointer hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center text-sm sm:text-base"
                  >
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                    <span className="hidden sm:inline">View Media</span>
                    <span className="sm:hidden">Media</span>
                  </button>
                  <button
                    onClick={handleDisconnect}
                    className="w-full sm:w-auto px-4 sm:px-6 py-3 border bg-gradient-to-br from-red-400 via-red-600 to-red-700 cursor-pointer border-red-300 text-white hover:bg-red-50 font-medium rounded-lg transition-colors duration-200 text-sm sm:text-base"
                  >
                    Disconnect
                  </button>
                </>
              )}
            </div>

            {/* Security Notice */}
            <div className="mt-4 flex items-center justify-center text-xs sm:text-sm text-gray-500">
              <svg
                className="w-3 h-3 sm:w-4 sm:h-4 mr-2 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              <span className="text-center">
                Your data is encrypted and stored securely
              </span>
            </div>
          </div>
        </div>
      </div>
      <Toaster />
    </div>
  );
}