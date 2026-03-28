"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

import {
  Heart,
  MessageCircle,
  Send,
  X,
  Bookmark,
  Camera,
  MoreHorizontal,
  ArrowLeft,
  Home,
  Search,
  PlusSquare,
  Video,
  User,
  Phone,
  Mic,
  Image,
  Smile,
  Plus,
} from "lucide-react";

export default function PreviewBox({
  selectedPost,
  currentStep,
  keywords,
  enabledAnyWord,
  enabledPublicReply,
  messages,
  selectedMessages,
  openingMessage,
  openingButtonLabel,
  linkDescription,
  linkButtonLabel,
  dmLink,
}) {
  console.log("PreviewBox received selectedPostId:", selectedPost
  ); // Debug log

  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState("Post");
  const { data: session, status } = useSession();

  // Add these new state variables
  const [instagramDetails, setInstagramDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // const [media, setMedia] = useState([]);
  // const [selectedPost, setSelectedPost] = useState(null);  

  // Fetch Instagram user details
  useEffect(() => {
    if (status === "loading" || !session || session.user.role !== "USER")
      return;

    const fetchInstagramDetails = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/instagram/user-details?userId=${encodeURIComponent(
            session.user.id
          )}`
        );
        const data = await response.json();
        // console.log("Instagram Details:", data);

        if (!response.ok) {
          throw new Error(
            data.error?.message || "Failed to fetch Instagram details"
          );
        }

        setInstagramDetails({
          username: data.username || "Unknown User",
          profilePicture: data.profile_picture_url || null,
        });
      } catch (err) {
        console.error("Error fetching Instagram details:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInstagramDetails();
  }, [session, status]);

  // Fetch Instagram posts (unchanged)
  useEffect(() => {
    if (status === "loading" || !session || session.user.role !== "USER")
      return;

    const fetchPosts = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/instagram/analytics?email=${encodeURIComponent(
            session.user.email
          )}`
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch posts");
        }

        // setMedia(data.media || []);
      } catch (err) {
        console.error("Error fetching posts:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [session, status]);



  useEffect(() => {
    // Map Automation steps to PreviewBox tabs
    const stepToTabMap = {
      1: "Post",
      2: "Comments",
      3: "DM",
    };
    setActiveTab(stepToTabMap[currentStep] || "Post"); // Use currentStep
  }, [currentStep]);

  console.log("Selected Post:", selectedPost);

  const renderTabContent = () => {
    switch (activeTab) {
      case "Post":
        return (
          <div className="bg-black flex-grow">
            {/* User Info */}
            <div className="flex items-center justify-between px-3 py-2">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-yellow-500 p-0.5">
                  <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                    <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                      {instagramDetails?.profilePicture ? (
                        <img
                          src={instagramDetails.profilePicture}
                          alt="Profile"
                          className="w-7 h-7 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-7 h-7 bg-gray-600 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-gray-300" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="ml-2">
                  <div className="flex items-center">
                    <span className="font-semibold text-xs">
                      {instagramDetails?.username || "Unknown "}
                    </span>
                  </div>
                </div>
              </div>
              <MoreHorizontal className="w-4 h-4 text-gray-400" />
            </div>

            {/* Post Image */}
            <div className="relative bg-black w-full h-[350px]">
              {selectedPost?.id === "all" ? (
                <div className="w-full h-full bg-gray-700 flex items-center justify-center p-4">
                  <span className="text-center text-white/80 text-md sm:text-lg leading-snug break-words max-w-xs sm:max-w-md">
                    Selected all of your posts or reels
                  </span>
                </div>
              ) : selectedPost?.media_url ? (
                selectedPost.media_type === "VIDEO" ? (
                  <video
                    src={selectedPost.media_url}
                    className="w-full h-full object-cover"
                    controls
                    muted
                    playsInline
                    preload="metadata"
                    onError={(e) => {
                      console.error(
                        `Video load error for post ID: ${selectedPost.id}, URL: ${selectedPost.media_url}`
                      );
                      // Fallback to showing error message
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = '<div class="w-full h-full bg-red-500/20 flex items-center justify-center"><span class="text-white">Video could not be loaded</span></div>';
                    }}
                  >
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <img
                    src={selectedPost.media_url}
                    alt="Selected Instagram post"
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      console.error(
                        `Image load error for post ID: ${selectedPost.id}, URL: ${selectedPost.media_url}`
                      );
                      e.target.src = "/fallback-image.jpg";
                    }}
                  />
                )
              ) : (
                <div className="w-full h-full bg-white/30 flex items-center justify-center animate-pulse">
                  <span className="text-gray-400 text-lg">
                    Select a post to get started
                  </span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between px-3 py-2">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setLiked(!liked)}
                  className="transition-colors"
                >
                  <div className="flex gap-1 cursor-pointer">
                    <Heart
                      className={`w-5 h-5 ${liked ? "fill-red-500 text-red-500" : "text-white"
                        }`}
                    />
                    <span className="font-semibold text-sm">0</span>
                  </div>
                </button>
                <button>
                  <div className="flex gap-1">
                    <MessageCircle className="w-5 h-5" />
                    <span className="font-semibold text-sm">0</span>
                  </div>
                </button>
                <button>
                  <div className="flex gap-1">
                    <Send className="w-5 h-5" />
                    <span className="font-semibold text-sm">0</span>
                  </div>
                </button>
              </div>
              <button
                onClick={() => setSaved(!saved)}
                className="transition-colors"
              >
                <Bookmark className={`w-5 h-5 ${saved ? "fill-white" : ""}`} />
              </button>
            </div>

            {/* Post Details */}
            <div className="px-3 pb-2">
              <div className="flex items-start">
                <div className="text-xs text-gray-300 ml-1 space-y-0.5">
                  <div className=" text-gray-500">
                    {selectedPost
                      ? new Date(selectedPost.timestamp).toLocaleDateString(
                        "en-US",
                        {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        }
                      )
                      : "08 June, 2025"}
                  </div>
                  <div className="font-semibold text-xs text-gray-500">
                    view all comments
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "Comments":
        return (
          <div className="bg-black flex-grow relative">
            {/* Background Post Content (Dimmed) */}
            <div className="opacity-70">
              {/* User Info */}
              <div className="flex items-center justify-between px-3 py-2">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-yellow-500 p-0.5">
                    <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                      {instagramDetails?.profilePicture ? (
                        <img
                          src={instagramDetails.profilePicture}
                          alt="Profile"
                          className="w-7 h-7 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-7 h-7 bg-gray-600 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-gray-300" />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="ml-3">
                    <div className="flex items-center">
                      <span className="font-semibold text-xs">
                        {loading
                          ? "Loading..."
                          : instagramDetails?.username || "Unknown User"}
                      </span>
                    </div>
                  </div>
                </div>
                <MoreHorizontal className="w-4 h-4 text-gray-400" />
              </div>

              {/* Post Image */}
              <div className="relative bg-black w-full h-[340px]">
                {selectedPost?.media_url ? (
                  selectedPost.media_type === "VIDEO" ? (
                    <video
                      src={selectedPost.media_url}
                      className="w-full h-full object-cover"
                      controls
                      muted
                      playsInline
                      preload="metadata"
                      onError={(e) => {
                        console.error(
                          `Video load error for post ID: ${selectedPost.id}, URL: ${selectedPost.media_url}`
                        );
                        // Fallback to showing error message
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = '<div class="w-full h-full bg-red-500/20 flex items-center justify-center"><span class="text-white">Video could not be loaded</span></div>';
                      }}
                    >
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <img
                      src={selectedPost.media_url}
                      alt="Selected Instagram post"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error(
                          `Image load error for post ID: ${selectedPost.id}, URL: ${selectedPost.media_url}`
                        );
                        e.target.src = "/fallback-image.jpg";
                      }}
                    />
                  )
                ) : (
                  <div className="w-full h-full bg-white/30 flex items-center justify-center">
                    <span className="text-gray-400 text-base">
                      Select a post to get started
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Comments Overlay */}
            <div
              className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-95 rounded-t-3xl"
              style={{ height: "60%" }}
            >
              <div className="flex items-center justify-between px-4 py-4 border-b border-gray-800">
                <h2 className="text-lg font-semibold">Comments</h2>
                <Send className="w-5 h-5 text-gray-400 rotate-45" />
              </div>

              <div className="px-1 py-2 flex-1 overflow-y-auto h-[250px]">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-7 h-7 bg-white/50 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-gray-100" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-semibold">Username</span>
                        <span className="text-xs text-gray-500">Now</span>
                      </div>
                      <p className="text-xs font-semibold text-gray-50">
                        {enabledAnyWord
                          ? "Leaves any comment"
                          : keywords.length > 0
                            ? keywords[0]
                            : "Leaves a comment"}
                      </p>
                      <button className="text-xs font-semibold text-gray-500">
                        Reply
                      </button>

                      {/* Nested Reply */}
                      {enabledPublicReply && selectedMessages.length > 0 && (
                        <div className="flex items-start space-x-3 mt-4">
                          <div className="w-8 h-7 bg-white/50 rounded-full flex items-center justify-center">
                            {instagramDetails?.profilePicture ? (
                              <img
                                src={instagramDetails.profilePicture}
                                alt="Profile"
                                className="w-7 h-7 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-7 h-7 bg-gray-600 rounded-full flex items-center justify-center">
                                <User className="w-4 h-4 text-gray-300" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-semibold">
                                {instagramDetails?.username}
                              </span>
                              <span className="text-xs text-gray-500">Now</span>
                            </div>
                            <p className="text-xs font-semibold mt-1.5 text-gray-50">
                              {selectedMessages.map((id) => (
                                <span key={id}>{messages[id]}</span>
                              ))}
                            </p>
                            <button className="text-xs font-semibold text-gray-500">
                              Reply
                            </button>
                          </div>
                          <Heart className="w-4 h-4 -ml-4 text-gray-500" />
                        </div>
                      )}
                    </div>
                    <Heart className="w-4 h-4 -ml-4 text-gray-500" />
                  </div>
                </div>
              </div>

              <div className="px-4 py-2 border-t border-gray-800">
                <div className="flex space-x-3">
                  {["❤️", "🙌", "🔥", "👏", "😢", "😍", "😮", "😂"].map(
                    (emoji, index) => (
                      <button
                        key={index}
                        className="text-lg hover:scale-110 transition-transform"
                      >
                        {emoji}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-3 px-3 py-2 border-t border-gray-800">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-gray-900" />
                </div>
                <div className="flex-1 bg-gray-800 rounded-full px-4 py-1.5 border border-gray-500">
                  <input
                    type="text"
                    placeholder="Add a comment for this post..."
                    className="bg-transparent text-sm text-white placeholder-gray-400 w-full outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case "DM":
        return (
          <div className="bg-black h-full flex flex-col">
            <div className="flex items-center justify-between px-3 py-2">
              <div className="flex items-center gap-2">
                <ArrowLeft className="w-5 h-5 text-white" />
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-yellow-500 p-0.5">
                  <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                    <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                      {instagramDetails?.profilePicture ? (
                        <img
                          src={instagramDetails.profilePicture}
                          alt="Profile"
                          className="w-7 h-7 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-7 h-7 bg-gray-600 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-gray-300" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="ml-2">
                  <div className="flex items-center">
                    <span className="font-semibold text-xs">
                      {loading
                        ? "Loading..."
                        : instagramDetails?.username || "Unknown User"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <button className="p-1">
                  <Phone className="w-5 h-5 text-white" />
                </button>
                <button className="p-1">
                  <Video className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            <div
              className="flex-1 overflow-y-auto px-4 py-4 bg-black"
              style={{ height: "380px" }}
            >
              <div className="space-y-2">
                <div className="flex justify-start items-end space-x-1">
                  <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-3 h-3 text-gray-300" />
                  </div>
                  <div className="max-w-[70%] space-y-1">
                    <div className="bg-white/20 rounded-2xl rounded-bl-xs px-4 py-2">
                      <p className="text-white text-xs">
                        {openingMessage ||
                          "Hey there! I’m so happy you’re here, thanks so much for your interest 😊\n\nClick below and I’ll send you the link in just a sec ✨"}
                      </p>
                      <button className="bg-white/20 w-full mt-2 p-1.5 text-xs rounded-md">
                        {openingButtonLabel || "Send me the link"}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <div className="max-w-[70%]">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl rounded-br-xs px-4 py-2">
                      <p className="text-white text-xs">
                        {openingButtonLabel || "Send me the link"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-start items-end space-x-1">
                  <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-3 h-3 text-gray-300" />
                  </div>
                  <div className="max-w-[70%]">
                    <div className="bg-white/20 rounded-2xl rounded-bl-xs px-4 py-2 mb-1">
                      <p className="text-white text-xs">
                        {linkDescription || "Write a message"}
                      </p>
                      {linkButtonLabel && (
                        <button className="bg-white/20 w-full mt-2 p-1.5 text-xs rounded-md">
                          {linkButtonLabel}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="py-2 bg-black border-t border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="flex-1 bg-gray-700 rounded-full px-3 gap-0.5 py-2 flex items-center border border-gray-500">
                  <button className="p-1.5 bg-gradient-to-tr from-blue-400 to-blue-700 rounded-3xl">
                    <Camera className="w-4 h-4 text-white" />
                  </button>
                  <input
                    type="text"
                    placeholder="Message..."
                    className="bg-transparent text-sm text-white placeholder-gray-500 flex-1 outline-none"
                  />
                  <div className="flex items-center space-x-2">
                    <button className="p-1">
                      <Mic className="w-4 h-4 text-white" />
                    </button>
                    <button className="p-1">
                      <Image className="w-4 h-4 text-white" />
                    </button>
                    <button className="p-1">
                      <Plus className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      {/* iPhone Frame */}
      <div className="relative">
        {/* Phone Body */}
        <div className="w-[320px] h-[640px] bg-black rounded-[2.5rem] p-2 shadow-2xl">
          {/* Screen */}
          <div className="w-full h-full bg-black rounded-[2rem] overflow-hidden relative">
            {/* Notch */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-28 h-5 bg-white/20 rounded-b-2xl z-10"></div>
            {/* Your Instagram Content */}
            <div className="max-w-sm mx-auto bg-black text-white h-full flex flex-col">
              {/* Tab Navigation */}
              <div className="flex bg-black border-b border-gray-800 pt-5">
                {["Post", "Comments", "DM"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-2 px-3 text-xs font-medium transition-colors ${activeTab === tab
                        ? "text-white border-b-2 border-white"
                        : "text-gray-400 hover:text-gray-200"
                      }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              {/* Tab Content */}
              <div className="flex-1 overflow-hidden ">
                {renderTabContent()}
              </div>
              {/* Instagram Bottom Navigation - Fixed */}
              <div className="bg-black border-t border-gray-800 px-3 py-2 mt-auto">
                <div className="flex justify-between items-center">
                  <button className="p-1">
                    <Home className="w-5 h-5 text-white" />
                  </button>
                  <button className="p-1">
                    <Search className="w-5 h-5 text-gray-100" />
                  </button>
                  <button className="p-1">
                    <PlusSquare className="w-5 h-5 text-gray-100" />
                  </button>
                  <button className="p-1">
                    <Video className="w-5 h-5 text-gray-100" />
                  </button>
                  <button className="p-1">
                    <div className="w-5 h-5 bg-gray-600 rounded-full flex items-center justify-center">
                      <User className="w-3 h-3 text-gray-100" />
                    </div>
                  </button>
                </div>
              </div>
              {/* iPhone Bottom Indicator */}
              <div className="flex justify-center py-1">
                <div className="w-24 h-1 bg-white rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
        {/* Side Buttons */}
        <div className="absolute right-[-4px] top-32 w-1 h-10 bg-gray-700 rounded-r"></div>
        <div className="absolute right-[-4px] top-50 w-1 h-12 bg-gray-700 rounded-r"></div>
        <div className="absolute right-[-4px] top-64 w-1 h-12 bg-gray-700 rounded-r"></div>
      </div>
    </div>
  );
}
