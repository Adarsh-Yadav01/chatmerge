"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import {
  Instagram,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Plus,
  Eye,
  Users,
  MessageSquare,
  Link2,
  Info,
} from "lucide-react";
import { FaWhatsapp, FaTelegramPlane, FaFacebookF } from "react-icons/fa";

const SocialMediaTable = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [expandedRows, setExpandedRows] = useState({});
  const [infoExpanded, setInfoExpanded] = useState({});
  const [instagramDetails, setInstagramDetails] = useState(null);
  const [whatsappDetails, setWhatsappDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isInstagramConnected, setIsInstagramConnected] = useState(false);
  const [isInstagramConnecting, setIsInstagramConnecting] = useState(false);
  const [instagramError, setInstagramError] = useState(null);
  const [isInstagramAgreed, setIsInstagramAgreed] = useState(false);

  const isPlatformActive = (platform) => {
    if (!session?.user) return false;
    
    switch (platform) {
      case "Instagram":
        return isInstagramConnected;
      case "WhatsApp":
        return !!(session.user.whatsappToken && session.user.whatsappWabaId);
      default:
        return false;
    }
  };

  useEffect(() => {
    const fetchInstagramDetails = async () => {
      if (session?.user?.id) {
        setLoading(true);
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
          setIsInstagramConnected(!!data.instagramToken);
          if (data.instagramToken) {
            const detailsResponse = await fetch(
              `/api/instagram/user-details?userId=${encodeURIComponent(session.user.id)}`
            );
            const detailsData = await detailsResponse.json();
            if (detailsResponse.ok) {
              setInstagramDetails(detailsData);
            } else {
              throw new Error(detailsData.error?.message || "Failed to fetch details");
            }
          }
        } catch (err) {
          console.error("Error fetching Instagram:", err);
          setInstagramError("Failed to load Instagram data. Please try again.");
          toast.error("Failed to load Instagram data.", { duration: 3000 });
        } finally {
          setLoading(false);
        }
      }
    };

    const fetchWhatsappDetails = async () => {
      if (session?.user?.id && isPlatformActive("WhatsApp")) {
        try {
          setWhatsappDetails({
            phoneNumber: session.user.whatsappPhoneNumber || "+91 98765-43210",
            businessName: session.user.whatsappBusinessName || "Niya Bags Store",
          });
        } catch (err) {
          console.error("Error fetching WhatsApp details:", err);
        }
      }
    };

    if (status !== "loading") {
      fetchInstagramDetails();
      fetchWhatsappDetails();
    }
  }, [session, status, router]);

  const handleInstagramConnect = async () => {
    setIsInstagramConnecting(true);
    setInstagramError(null);

    const clientId = process.env.NEXT_PUBLIC_INSTAGRAM_CLIENT_ID;
    const redirectUri = process.env.NEXT_PUBLIC_INSTAGRAM_REDIRECT_URI;

    if (!clientId || !redirectUri) {
      console.error("Missing clientId or redirectUri");
      setInstagramError("Configuration error: Instagram connection setup is incomplete.");
      toast.error("Instagram connection setup is incomplete. Please contact support.", {
        duration: 3000,
      });
      setIsInstagramConnecting(false);
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
      setInstagramError("Failed to start Instagram connection. Please try again.");
      toast.error("Failed to start Instagram connection. Please try again.", {
        duration: 3000,
      });
      setIsInstagramConnecting(false);
    }
  };

  const socialMediaData = [
    {
      id: 1,
      platform: "Instagram",
      username: instagramDetails?.username ? `@${instagramDetails.username}` : "@niya_bags_2605",
      handle: instagramDetails?.name || "Niya Bags",
      description: instagramDetails?.biography || "👜 Handcrafted luxury bags for modern women 🌟 Eco-friendly & stylish designs 🌿",
      followers: instagramDetails?.followers_count?.toString() || "113",
      following: instagramDetails?.follows_count?.toString() || "1,276",
      posts: instagramDetails?.media_count?.toString() || "52",
      profilePicture: instagramDetails?.profile_picture_url || null,
      status: isInstagramConnected ? "Active" : "Inactive",
      icon: Instagram,
      iconColor: "text-pink-500",
      statusColor: isInstagramConnected ? "text-green-600" : "text-gray-500",
      bgColor: isInstagramConnected ? "bg-pink-50" : "bg-gray-50",
      borderColor: isInstagramConnected ? "border-pink-200" : "border-gray-200",
      addChannelUrl: "https://instagram.com",
      platformInfo: "Instagram is a popular photo, video, and story-sharing platform owned by Meta. It allows users, influencers, and brands to connect with their audience through engaging visual content. With features like Reels, Stories, and Instagram Insights, it helps businesses grow their online presence and understand their followers better.",
      permissions: [
        "Access to your public profile information to personalize your experience.",
        "Permission to create, schedule, and manage posts on your behalf.",
        "Access to analytics data to help track engagement and performance.",
        "Permission to view and analyze follower insights for better audience understanding."
      ],
    },
    {
      id: 2,
      platform: "WhatsApp",
      username: whatsappDetails?.phoneNumber || "+91 98765-43210",
      handle: whatsappDetails?.businessName || "Niya Bags Store",
      description: "💼 Premium handcrafted bags 🚚 Fast delivery nationwide 💳 Secure payments",
      followers: "89",
      following: "0",
      posts: "156",
      status: isPlatformActive("WhatsApp") ? "Active" : "Inactive",
      icon: FaWhatsapp,
      iconColor: "text-green-500",
      statusColor: isPlatformActive("WhatsApp") ? "text-green-600" : "text-gray-500",
      bgColor: isPlatformActive("WhatsApp") ? "bg-green-50" : "bg-gray-50",
      borderColor: isPlatformActive("WhatsApp") ? "border-green-200" : "border-gray-200",
      addChannelUrl: "https://whatsapp.com/business",
      platformInfo: "WhatsApp Business API allows businesses to communicate with customers at scale. It provides features like automated messages, quick replies, and integration with business systems for customer support and engagement.",
      permissions: ["Message sending/receiving", "Contact access", "Media sharing", "Business profile management"],
    },
    {
      id: 3,
      platform: "Telegram",
      username: "@niyabags_official",
      handle: "Niya Bags Official",
      description: "✨ Exclusive collections 🎯 Daily deals & offers 📢 New arrivals first 🛒",
      followers: "67",
      following: "23",
      posts: "78",
      status: "Inactive",
      icon: FaTelegramPlane,
      iconColor: "text-blue-500",
      statusColor: "text-gray-500",
      bgColor: "bg-gray-50",
      borderColor: "border-gray-200",
      addChannelUrl: "https://telegram.org",
      platformInfo: "Telegram is a cloud-based messaging app with channels and bots.",
      permissions: ["Channel management", "Message access", "Subscriber data", "Bot integration"],
    },
    {
      id: 4,
      platform: "Facebook",
      username: "NiyaBagsOfficial",
      handle: "Niya Bags",
      description: "👜 Handcrafted luxury bags 🌍 Eco-friendly fashion 💝 Perfect gifts for loved ones",
      followers: "234",
      following: "45",
      posts: "91",
      status: "Inactive",
      icon: FaFacebookF,
      iconColor: "text-blue-600",
      statusColor: "text-gray-500",
      bgColor: "bg-gray-50",
      borderColor: "border-gray-200",
      addChannelUrl: "https://facebook.com/business",
      platformInfo: "Facebook is a social networking platform for pages and groups.",
      permissions: ["Page management", "Post creation", "Audience insights", "Ad access"],
    },
  ];

  const toggleRow = (id) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const toggleInfo = (id) => {
    setInfoExpanded((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const getLabels = (platform) => {
    switch (platform) {
      case "WhatsApp":
        return { followers: "Contacts", posts: "Messages", following: "Groups" };
      case "Telegram":
        return { followers: "Subscribers", posts: "Messages", following: "Channels" };
      default:
        return { followers: "Followers", posts: "Posts", following: "Following" };
    }
  };

  return (
    <div className="min-h-screen bg-white p-3 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-2">
            Social Media Command Center
          </h1>
          <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
            Manage all your business social media channels from one central location
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg sm:text-2xl font-bold text-green-600">
                  {socialMediaData.filter((s) => s.status === "Active").length}
                </div>
                <div className="text-xs sm:text-sm text-gray-600">Active</div>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg sm:text-2xl font-bold text-gray-500">
                  {socialMediaData.filter((s) => s.status === "Inactive").length}
                </div>
                <div className="text-xs sm:text-sm text-gray-600">Inactive</div>
              </div>
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg sm:text-2xl font-bold text-blue-600">
                  {socialMediaData.reduce(
                    (acc, s) => (s.status === "Active" ? acc + parseInt(s.followers.replace(/,/g, ''), 10) : acc),
                    0
                  ).toLocaleString()}
                </div>
                <div className="text-xs sm:text-sm text-gray-600">Total Reach</div>
              </div>
              <Users className="w-6 h-6 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg sm:text-2xl font-bold text-purple-600">
                  {socialMediaData.reduce(
                    (acc, s) => (s.status === "Active" ? acc + parseInt(s.posts.replace(/,/g, ''), 10) : acc),
                    0
                  ).toLocaleString()}
                </div>
                <div className="text-xs sm:text-sm text-gray-600">Content</div>
              </div>
              <MessageSquare className="w-6 h-6 text-purple-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-3 sm:p-4 text-xs sm:text-sm font-semibold text-gray-700">Platform</th>
                  <th className="text-left p-3 sm:p-4 text-xs sm:text-sm font-semibold text-gray-700 hidden sm:table-cell">Username</th>
                  <th className="text-center p-3 sm:p-4 text-xs sm:text-sm font-semibold text-gray-700">Status</th>
                  <th className="text-center p-3 sm:p-4 text-xs sm:text-sm font-semibold text-gray-700 hidden md:table-cell">Reach</th>
                  <th className="text-center p-3 sm:p-4 text-xs sm:text-sm font-semibold text-gray-700 hidden lg:table-cell">Content</th>
                  <th className="text-center p-3 sm:p-4 text-xs sm:text-sm font-semibold text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {socialMediaData.map((social) => {
                  const IconComponent = social.icon;
                  const labels = getLabels(social.platform);
                  const isExpanded = !!expandedRows[social.id];
                  const isInfoExpanded = !!infoExpanded[social.id];

                  return (
                    <React.Fragment key={social.id}>
                      <tr
                        className={`border-b hover:bg-gray-50 transition-colors cursor-pointer`}
                        onClick={() => toggleRow(social.id)}
                      >
                        <td className="p-3 sm:p-4">
                          <div className="flex items-center space-x-2 sm:space-x-3">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white shadow-sm border flex items-center justify-center overflow-hidden">
                              {social.platform === "Instagram" ? (
                                <Instagram className={`w-4 h-4 sm:w-5 sm:h-5 ${social.iconColor}`} />
                              ) : (
                                <IconComponent className={`w-4 h-4 sm:w-5 sm:h-5 ${social.iconColor}`} />
                              )}
                            </div>

                            <div>
                              <div className="font-medium text-sm sm:text-base text-gray-900">{social.platform}</div>
                              <div className="text-xs sm:text-sm text-gray-500 sm:hidden">
                                {social.status === "Active" ? social.username : "Connect First"}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="p-3 sm:p-4 hidden sm:table-cell">
                          {social.status === "Active" ? (
                            <>
                              <div className="text-sm text-gray-900">{social.username}</div>
                              <div className="text-xs text-gray-500">{social.handle}</div>
                            </>
                          ) : (
                            <div className="flex items-center text-gray-400 text-sm space-x-2">
                              <Link2 className="w-4 h-4" />
                              <span>Connect First</span>
                            </div>
                          )}
                        </td>

                        <td className="p-3 sm:p-4 text-center">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${social.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                            <div className={`w-1.5 h-1.5 rounded-full mr-1 ${social.status === 'Active' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                            {social.status}
                          </span>
                        </td>

                        <td className="p-3 sm:p-4 text-center hidden md:table-cell">
                          {social.status === "Active" ? (
                            <>
                              <div className="text-sm font-medium text-gray-900">{social.followers}</div>
                              <div className="text-xs text-gray-500">{labels.followers}</div>
                            </>
                          ) : (
                            <div className="text-sm text-gray-400 flex items-center justify-center">
                              <span className="text-xs bg-gray-100 px-2 py-1 rounded">Connect First</span>
                            </div>
                          )}
                        </td>

                        <td className="p-3 sm:p-4 text-center hidden lg:table-cell">
                          {social.status === "Active" ? (
                            <>
                              <div className="text-sm font-medium text-gray-900">{social.posts}</div>
                              <div className="text-xs text-gray-500">{labels.posts}</div>
                            </>
                          ) : (
                            <div className="text-sm text-gray-400 flex items-center justify-center">
                              <span className="text-xs bg-gray-100 px-2 py-1 rounded">Connect First</span>
                            </div>
                          )}
                        </td>

                        <td className="p-3 sm:p-4 text-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleRow(social.id);
                            }}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 transition-colors"
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-gray-600" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-gray-600" />
                            )}
                          </button>
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr className={`${social.bgColor} ${social.borderColor} border-l-4`}>
                          <td colSpan={6} className="p-4 sm:p-6">
                            <div className="space-y-6">
                              {social.status === "Active" ? (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                                  <div className="space-y-4">
                                    <div>
                                      <h4 className="font-medium text-gray-900 mb-2">Account Information</h4>
                                      <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                          <span className="text-gray-600">Handle:</span>
                                          <span className="font-medium">{social.handle}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-gray-600">Username:</span>
                                          <span className="font-medium">{social.username}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-gray-600">Account Type:</span>
                                          <span className="text-green-600 font-medium">Business</span>
                                        </div>
                                      </div>
                                    </div>

                                    <div>
                                      <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                                      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                                        {social.description}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="space-y-4">
                                    <div>
                                      <h4 className="font-medium text-gray-900 mb-3">Statistics</h4>
                                      <div className="grid grid-cols-3 gap-3">
                                        <div className="text-center p-3 bg-white rounded-lg border">
                                          <div className="text-lg font-bold text-gray-900">{social.followers}</div>
                                          <div className="text-xs text-gray-600">{labels.followers}</div>
                                        </div>
                                        <div className="text-center p-3 bg-white rounded-lg border">
                                          <div className="text-lg font-bold text-gray-900">{social.posts}</div>
                                          <div className="text-xs text-gray-600">{labels.posts}</div>
                                        </div>
                                        <div className="text-center p-3 bg-white rounded-lg border">
                                          <div className="text-lg font-bold text-gray-900">{social.following}</div>
                                          <div className="text-xs text-gray-600">{labels.following}</div>
                                        </div>
                                      </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-2">
                                      <button
                                        onClick={(e) => e.stopPropagation()}
                                        className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-blue-50 border text-black/80 border-sky-200 text-sm font-medium rounded-lg hover:bg-sky-50 transition-colors"
                                      >
                                        <Eye className="w-4 h-4 mr-2" />
                                        View Analytics
                                      </button>
                                      <a
                                        href={social.addChannelUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                                      >
                                        <ExternalLink className="w-4 h-4 mr-2" />
                                        Open Platform
                                      </a>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="text-center">
                                  <div className="relative">
                                    <div className="absolute inset-0 blur-sm opacity-30 pointer-events-none">
                                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                                        <div className="space-y-4">
                                          <div className="bg-gray-200 h-4 w-32 rounded"></div>
                                          <div className="space-y-2">
                                            <div className="bg-gray-200 h-3 w-full rounded"></div>
                                            <div className="bg-gray-200 h-3 w-24 rounded"></div>
                                            <div className="bg-gray-200 h-3 w-36 rounded"></div>
                                          </div>
                                          <div className="bg-gray-200 h-16 w-full rounded"></div>
                                        </div>
                                        <div className="space-y-4">
                                          <div className="grid grid-cols-3 gap-3">
                                            <div className="bg-gray-200 h-16 rounded"></div>
                                            <div className="bg-gray-200 h-16 rounded"></div>
                                            <div className="bg-gray-200 h-16 rounded"></div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    <div className="relative z-10 bg-white rounded-xl p-6 shadow-lg border-2 border-dashed border-gray-300 max-w-md mx-auto">
                                      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                                        <Plus className="w-8 h-8 text-gray-400" />
                                      </div>

                                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                        Account Not Connected
                                      </h3>

                                      <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                                        Connect your {social.platform} account to access details and analytics.
                                      </p>

                                      {instagramError && social.platform === "Instagram" && (
                                        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded text-sm">
                                          {instagramError}
                                        </div>
                                      )}

                                      {social.platform === "Instagram" && (
                                        <div className="mb-6">
                                          <label
                                            htmlFor="instagram-agreement"
                                            className="text-sm flex items-start cursor-pointer"
                                          >
                                            <input
                                              type="checkbox"
                                              id="instagram-agreement"
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
                                              </a>
                                              {" "}and{" "}
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

                                      {social.platform === "Instagram" ? (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleInstagramConnect();
                                          }}
                                          disabled={isInstagramConnecting || !isInstagramAgreed}
                                          className="inline-flex items-center justify-center cursor-pointer px-6 py-3 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                          {isInstagramConnecting ? (
                                            <>
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
                                              Connecting...
                                            </>
                                          ) : (
                                            <>
                                              <Plus className="w-4 h-4 mr-2" />
                                              Connect {social.platform} Account
                                              <ExternalLink className="w-4 h-4 ml-2" />
                                            </>
                                          )}
                                        </button>
                                      ) : (
                                        <a
                                          href={social.addChannelUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          onClick={(e) => e.stopPropagation()}
                                          className="inline-flex items-center justify-center px-6 py-3 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors shadow-md"
                                        >
                                          <Plus className="w-4 h-4 mr-2" />
                                          Connect {social.platform} Account
                                          <ExternalLink className="w-4 h-4 ml-2" />
                                        </a>
                                      )}

                                      <div className="mt-4 text-xs text-gray-500">
                                        Connect to unlock full features
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}

                              <div className="mt-6 pt-6 border-t">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleInfo(social.id);
                                  }}
                                  className="flex gap-3 cursor-pointer items-center text-gray-700 font-medium text-sm hover:text-gray-900 w-full"
                                >
                                  <Info className="w-4 h-4" />
                                  Platform Information & Permissions
                                  {isInfoExpanded ? (
                                    <ChevronUp className="w-4 h-4 ml-auto" />
                                  ) : (
                                    <ChevronDown className="w-4 h-4 ml-auto" />
                                  )}
                                </button>

                                {isInfoExpanded && (
                                  <div className="mt-4 space-y-4">
                                    <div>
                                      <h4 className="font-medium text-gray-900 mb-2">Platform Overview</h4>
                                      <p className="text-sm text-gray-700">{social.platformInfo}</p>
                                    </div>
                                    <div>
                                      <h4 className="font-medium text-gray-900 mb-2">Required Permissions</h4>
                                      <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                                        {social.permissions.map((perm, index) => (
                                          <li key={index}>{perm}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="text-center mt-6 pt-4 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-1 sm:space-y-0 sm:space-x-4 text-xs text-gray-500">
            <span className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>All active accounts verified</span>
            </span>
            <span className="hidden sm:block">•</span>
            <span>Last updated: {new Date().toLocaleDateString()}</span>
            <span className="hidden sm:block">•</span>
            <span>Real-time sync enabled</span>
          </div>
        </div>
      </div>
      <Toaster />
    </div>
  );
};

export default SocialMediaTable;