"use client";
import React, { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import {
  ChevronLeft,
  ChevronRight,
  CheckCheck,
  Airplay,
  MessagesSquare,
  SquareDashedMousePointer,
  MessageSquarePlus,
  SendHorizontal,
  Images,
  Video,
  Layers,
  Calendar,
  AlertCircle,
  CircleX,
} from "lucide-react";
import Image from "next/image";
import instalogo from "../../../../public/instalogo.webp";
import { useRouter, useParams } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";

const Automation = ({
  onPostSelect,
  onToggleAllPosts,
  automationSteps,
  onStepChange,
  onKeywordsChange,
  onEnabledAnyWordChange,
  onMessageChange,
  onToggleMessage,
  openingMessage,
  onOpeningMessageChange,
  openingButtonLabel,
  onOpeningButtonLabelChange,
  linkDescription,
  onLinkDescriptionChange,
  linkButtonLabel,
  onLinkButtonLabelChange,
  dmLink,
  onDmLinkChange,
}) => {
  const { data: session, status } = useSession();
  const [mediaId, setMediaId] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [media, setMedia] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [keyword, setKeyword] = useState("");
  const [keywords, setKeywords] = useState([]);
  const [enabledAnyWord, setEnabledAnyWord] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState([1]);
  const [message1, setMessage1] = useState("Hey! Check your DM");
  const [message2, setMessage2] = useState("Check your inbox, details sent 💬");
  const [message3, setMessage3] = useState("Nice! Check your DMs!");
  const [message4, setMessage4] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Add these state variables to track selected comment replies
  const [commentReplies, setCommentReplies] = useState([]);
  const [dmError, setDmError] = useState(null);
  const [dmSuccess, setDmSuccess] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [afterCursor, setAfterCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [keywordOption, setKeywordOption] = useState("custom");
  const observerRef = useRef(null);
  const router = useRouter();
  const params = useParams();

  // Add validation function before handleSubmit
  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/api/auth/signin");
    } else if (status === "authenticated" && params.id) {
      setIsEditing(true);
      setMediaId(params.id);
      fetchAutoDm(params.id);
    }
  }, [status, router, params.id]);

  const fetchAutoDm = async (mediaId) => {
    try {
      setLoading(true);
      console.log("Fetching DM settings for mediaId:", mediaId);
      const response = await fetch(`/api/media/settings?mediaId=${mediaId}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to fetch DM settings");
      }
      const data = await response.json();
      console.log("API response data:", data);

      const mediaData = data.media;
      console.log("Parsed mediaData:", mediaData);

      setSelectedPost({
        id: mediaData.mediaId,
        media_url: mediaData.mediaUrl,
        media_type: mediaData.mediaType,
        permalink: mediaData.permalink,
        caption: mediaData.caption,
        timestamp: mediaData.timestamp,
      });

      onPostSelect?.({
        id: mediaData.mediaId,
        media_url: mediaData.mediaUrl,
        media_type: mediaData.mediaType,
      });

      setKeywords(mediaData.keywords || []);
      setEnabledAnyWord(mediaData.keywords?.includes("any") || false);
      setKeywordOption(mediaData.keywords?.includes("any") ? "any" : "custom");
      setCommentReplies(mediaData.commentReplies || []);

      // Set public reply messages
      const replies = mediaData.commentReplies || [];
      setMessage1(replies[0] || "Hey! Check your DM");
      setMessage2(replies[1] || "Check your inbox, details sent 💬");
      setMessage3(replies[2] || "Nice! Check your DMs!");
      setMessage4(replies[3] || "");
      setSelectedMessages(
        replies
          .map((reply, index) => {
            if (reply) return index + 1; // Map to message IDs (1, 2, 3, 4)
            return null;
          })
          .filter(Boolean)
      );

      onOpeningMessageChange?.(mediaData.openingDmMessage || "");
      onOpeningButtonLabelChange?.(
        mediaData.postbackButtonLabel || "Send me the link"
      );
      onLinkDescriptionChange?.(mediaData.dmMessage || "Write a message");
      onLinkButtonLabelChange?.(mediaData.dmLinkButtonLabel || "");
      onDmLinkChange?.(mediaData.dmLink || "");
      setEnabled(false);
    } catch (err) {
      console.error("Error in fetchAutoDm:", err);
      setDmError(err.message);
      toast.error(err.message, { position: "top-center" });
    } finally {
      setLoading(false);
    }
  };

  // Update handleSubmit function (around line 95)
  const handleSubmit = async () => {
    setDmError(null);
    setDmSuccess(null);
    setIsSubmitted(true); // Set to true on submit

    // Validation
    if (openingMessage.length > 640) {
      setDmError("Opening DM message must be 640 characters or less");
      toast.error("Opening DM message must be 640 characters or less", {
        position: "top-center",
      });
      return;
    }

    if (linkDescription.length > 640) {
      setDmError("Follow-up DM message must be 640 characters or less");
      toast.error("Follow-up DM message must be 640 characters or less", {
        position: "top-center",
      });
      return;
    }

    if (dmLink && !isValidUrl(dmLink)) {
      setDmError("DM link must be a valid URL");
      toast.error("DM link must be a valid URL", { position: "top-center" });
      return;
    }
    if (openingButtonLabel.length > 20) {
      setDmError("Postback button label must be 20 characters or less");
      toast.error("Postback button label must be 20 characters or less", {
        position: "top-center",
      });
      return;
    }
    if (linkButtonLabel.length > 20) {
      setDmError("DM link button label must be 20 characters or less");
      toast.error("DM link button label must be 20 characters or less", {
        position: "top-center",
      });
      return;
    }
    if (keywordOption === "custom" && keywords.length === 0) {
      setDmError(
        "Please add at least one custom keyword or enable 'Any Word on Post or Reel'"
      );
      toast.error(
        "Please add at least one custom keyword or enable 'Any Word on Post or Reel'",
        { position: "top-center" }
      );
      return;
    }
    if (selectedMessages.length === 0) {
      setDmError("Please select at least one public reply message");
      toast.error("Please select at least one public reply message", {
        position: "top-center",
      });
      return;
    }

    if (
      !openingMessage.trim() ||
      !openingButtonLabel.trim() ||
      !linkDescription.trim()
    ) {
      setDmError("All fields are required");
      toast.error("All fields are required", { position: "top-center" });
      return;
    }

    const submissionData = {
      mediaId: selectedPost?.id || null,
      commentReplies: commentReplies,
      keywords: keywordOption === "any" ? ["any"] : keywords,
      openingDmMessage: openingMessage,
      postbackButtonLabel: openingButtonLabel,
      dmMessage: linkDescription,
      dmLinkButtonLabel: linkButtonLabel || "",
      dmLink: dmLink || "",
      mediaType: selectedPost?.media_type || null,
      mediaUrl: selectedPost?.media_url || null,
      permalink: selectedPost?.permalink || null,
      caption: selectedPost?.caption || null,
      timestamp: selectedPost?.timestamp || null,
      email: session?.user?.email || null,
    };

    try {
      setLoading(true);
      const url = isEditing
        ? `/api/media/settings?mediaId=${mediaId}`
        : "/api/media/settings";
      const method = isEditing ? "PUT" : "POST";
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionData),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to save DM settings");
      }
      setDmSuccess("DM settings saved successfully");
      toast.success(
        isEditing
          ? "Your Auto Reply in DM automation updated successfully"
          : "Your Auto Reply in DM automation added successfully",
        { position: "top-center" }
      );
      setMedia(
        media.map((post) =>
          post.id === selectedPost?.id
            ? {
                ...post,
                dmMessage: submissionData.dmMessage,
                dmLink: submissionData.dmLink,
                openingDmMessage: submissionData.openingDmMessage,
                dmLinkButtonLabel: submissionData.dmLinkButtonLabel,
                postbackButtonLabel: submissionData.postbackButtonLabel,
                keywords: submissionData.keywords,
                commentReplies: submissionData.commentReplies,
                mediaType: submissionData.mediaType,
                mediaUrl: submissionData.mediaUrl,
                permalink: submissionData.permalink,
                caption: submissionData.caption,
                timestamp: submissionData.timestamp,
              }
            : post
        )
      );
      setSelectedPost(null);
      setEnabled(false);
      setKeyword("");
      setKeywords([]);
      setEnabledAnyWord(false);
      setKeywordOption("custom");
      setSelectedMessages([]);
      setMessage1("Hey! Check your DM");
      setMessage2("Check your inbox, details sent 💬");
      setMessage3("Nice! Check your DMs!");
      setMessage4("");
      onOpeningMessageChange?.(
        "Hey there! I’m so happy you’re here, thanks so much for your interest 😊\n\nClick below and I’ll send you the link in just a sec ✨"
      );
      onOpeningButtonLabelChange?.("Send me the link");
      onLinkDescriptionChange?.("Write a message");
      onLinkButtonLabelChange?.("");
      onDmLinkChange?.("");
      setCommentReplies([]);
      setIsSubmitted(false); // Reset after successful submission
      try {
        const fetchResponse = await fetch(
          `/api/instagram/analytics?email=${encodeURIComponent(
            session.user.email
          )}`
        );
        const fetchData = await fetchResponse.json();
        if (!fetchResponse.ok) {
          throw new Error(fetchData.message || "Failed to fetch posts");
        }
        setMedia(fetchData.media || []);
      } catch (err) {
        setDmError(err.message);
        toast.error(err.message, { position: "top-center" });
      }
      router.push("/dashboard/auto-dm-comment-link");
    } catch (err) {
      console.error("Error saving DM settings:", err);
      setDmError(err.message || "Failed to save DM settings");
      toast.error(err.message || "Failed to save DM settings", {
        position: "top-center",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    onKeywordsChange?.(keywords);
    onEnabledAnyWordChange?.(enabledAnyWord);
  }, [keywords, enabledAnyWord, onKeywordsChange, onEnabledAnyWordChange]);

  const steps = [
    {
      id: 1,
      title: "Post Selection",
      icon: SquareDashedMousePointer,
    },
    {
      id: 2,
      title: "Add Keyword",
      icon: MessageSquarePlus,
    },
    {
      id: 3,
      title: "Opening DM ",
      icon: MessagesSquare,
    },
  ];

  // Fetch Instagram posts
  const fetchPosts = async (after = "") => {
    if (loading || loadingMore || !hasMore) return;
    const setLoadingState = after ? setLoadingMore : setLoading;
    setLoadingState(true);
    try {
      const response = await fetch(
        `/api/instagram/analytics?email=${encodeURIComponent(
          session.user.email
        )}${after ? `&after=${after}` : ""}`
      );
      const data = await response.json();
      console.log("Fetched posts:", data);
      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch posts");
      }
      setMedia((prev) => {
        const newMedia = data.media.filter(
          (newPost) =>
            !prev.some((existingPost) => existingPost.id === newPost.id)
        );
        return [...prev, ...newMedia];
      });
      setAfterCursor(data.paging?.cursors?.after || null);
      setHasMore(!!data.paging?.next);
    } catch (err) {
      console.error("Error fetching posts:", err);
      setError(err.message);
    } finally {
      setLoadingState(false);
    }
  };
  console;

  useEffect(() => {
    if (status === "loading" || !session || session.user.role !== "USER")
      return;
    if (currentStep === 1) {
      fetchPosts();
    }
  }, [session, status, currentStep]);

  useEffect(() => {
    if (currentStep !== 1 || !hasMore || loading || loadingMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          fetchPosts(afterCursor);
        }
      },
      { threshold: 0.1 }
    );
    if (observerRef.current) {
      observer.observe(observerRef.current);
    }
    return () => {
      if (observerRef.current) {
        observer.unobserve(observerRef.current);
      }
    };
  }, [currentStep, afterCursor, hasMore, loading, loadingMore]);

  const nextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, 3));
    onStepChange(Math.min(currentStep + 1, 3));
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    onStepChange(Math.max(currentStep - 1, 1)); // Use onStepChange
  };

  const getMediaIcon = (type) => {
    switch (type) {
      case "IMAGE":
        return <Images className="w-4 h-4" />;
      case "VIDEO":
        return <Video className="w-4 h-4" />;
      case "CAROUSEL_ALBUM":
        return <Layers className="w-4 h-4" />;
      default:
        return <Images className="w-4 h-4" />;
    }
  };

  // Add this effect to clear selected post when "Any Post or Reel" is enabled
  useEffect(() => {
    if (enabled) {
      setSelectedPost(null);
      onPostSelect?.(null); // Clear post selection in parent
    }
  }, [enabled, onPostSelect]);

  // In Automation component, modify the handlePostSelect function (around line 350)
  const handlePostSelect = (post) => {
    console.log("handlePostSelect called with post:", post);
    if (!enabled) {
      setSelectedPost(post);
      console.log("Calling onPostSelect with post:", post);
      onPostSelect?.({
        id: post.id,
        media_url: post.media_url,
        media_type: post.media_type,
      }); // Add media_type
    }
  };
  const handleAddKeyword = () => {
    const trimmed = keyword.trim();
    if (trimmed && keywordOption === "custom" && !keywords.includes(trimmed)) {
      setKeywords([trimmed, ...keywords]);
      setKeyword("");
    }
  };

  const handleRemoveKeyword = (index) => {
    if (keywordOption === "custom") {
      setKeywords(keywords.filter((_, i) => i !== index));
    }
  };

  // In case 2 of renderStepContent
  // Replace the useEffect for enabledAnyWord (around line 320)
  useEffect(() => {
    if (enabledAnyWord) {
      setKeyword("");
      setKeywords(["any"]);
      setKeywordOption("any");
    } else {
      setKeywordOption("custom");
      setKeywords([]);
    }
    onKeywordsChange?.(keywords);
    onEnabledAnyWordChange?.(enabledAnyWord);
  }, [enabledAnyWord, onKeywordsChange, onEnabledAnyWordChange]);

  const message1Ref = useRef(null);
  const message2Ref = useRef(null);
  const message3Ref = useRef(null);
  const message4Ref = useRef(null);

  const handleToggleMessage = (messageId) => {
    setSelectedMessages((prev) => {
      if (prev.includes(messageId)) {
        return prev.filter((id) => id !== messageId);
      } else {
        return [...prev, messageId];
      }
    });
    onToggleMessage?.(messageId);
    // Focus the corresponding input field
    if (messageId === 1) message1Ref.current?.focus();
    if (messageId === 2) message2Ref.current?.focus();
    if (messageId === 3) message3Ref.current?.focus();
    if (messageId === 4) message4Ref.current?.focus();
  };

  useEffect(() => {
    const replies = [];
    if (selectedMessages.includes(1)) replies.push(message1);
    if (selectedMessages.includes(2)) replies.push(message2);
    if (selectedMessages.includes(3)) replies.push(message3);
    if (selectedMessages.includes(4)) replies.push(message4);
    setCommentReplies(replies);
  }, [selectedMessages, message1, message2, message3, message4]);

  {
    dmError && (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg mb-6">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-red-400" />
          <p className="ml-3 text-red-700 font-medium">{dmError}</p>
        </div>
      </div>
    );
  }
  {
    dmSuccess && (
      <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg mb-6">
        <div className="flex items-center">
          <CheckCheck className="h-5 w-5 text-green-400" />
          <p className="ml-3 text-green-700 font-medium">{dmSuccess}</p>
        </div>
      </div>
    );
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center bg-black/6 border-b-1 rounded-t-lg p-2">
              <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 bg-clip-text text-transparent">
                Select a Post or Reel for Auto-DM
              </h2>
              <p className="text-sm text-black/70 mt-2">
                Choose which post will trigger automatic DMs when users comment
              </p>
            </div>
            {!loading && !error && media.length > 0 && (
              <div>
                <div className=" px-4 mx-auto -mt-3 ">
                  <div className="flex items-center justify-between border rounded-lg p-4 shadow-sm">
                    <div className="flex flex-col">
                      <h3 className="text-sm sm:text-base font-medium text-gray-900">
                        Any Post or Reel
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-500 mt-1">
                        Monitor comments on all of your posts or reels to
                        trigger DMs.
                      </p>
                    </div>
                    {/* <button
                      onClick={() => {
                        setEnabled(!enabled);
                        onToggleAllPosts(!enabled); // Pass toggle state to parent
                      }}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        enabled
                          ? "bg-gradient-to-br from-green-400 via-green-500 to-green-600"
                          : "bg-gray-300"
                      }`}
                      role="switch"
                      aria-checked={enabled}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          enabled ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button> */}
                    <button
                      disabled
                      className="relative inline-flex h-6 w-11 shrink-0 cursor-not-allowed rounded-full border-2 border-transparent bg-gray-300 focus:outline-none"
                      role="switch"
                      aria-checked={false}
                    >
                      <span className="inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out translate-x-0" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="min-h-[400px] md:min-h-[400px]  pl-4 pt-4">
              {/* Loading State */}
              {loading && (
                <div className="flex items-center justify-center h-full">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin"></div>
                    <p className="text-blue-800 text-sm font-medium">
                      Loading your posts...
                    </p>
                  </div>
                </div>
              )}

              {/* Posts Grid */}
              {!loading && !error && media.length > 0 && (
                <div>
                  <div className="flex items-center justify-between -mt-6 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <Image
                        src={instalogo}
                        alt="Instagram Logo"
                        className="w-5 h-5 mr-2 rounded-sm"
                      />
                      Your Posts ({media.length})
                    </h3>
                    {selectedPost && !enabled && (
                      <div className="text-sm px-6 text-green-600 font-medium">
                        ✓ Post Selected
                      </div>
                    )}
                    {enabled && (
                      <div className="text-sm px-6 text-green-600 font-medium">
                        All Posts Monitored
                      </div>
                    )}
                  </div>

                  <div
                    className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 max-h-100 overflow-y-auto transition-all duration-300 ${
                      enabled ? "opacity-50 pointer-events-none" : "opacity-100"
                    }`}
                  >
                    {media.map((post) => (
                      <div
                        key={post.id}
                        className={`bg-white border-2 rounded-lg overflow-hidden transition-all duration-200 ${
                          enabled
                            ? "border-gray-200 cursor-not-allowed"
                            : selectedPost?.id === post.id
                            ? "border-blue-500 ring-2 ring-blue-200 cursor-pointer hover:shadow-md"
                            : "border-gray-200 hover:border-gray-300 cursor-pointer hover:shadow-md"
                        }`}
                        onClick={() => handlePostSelect(post)}
                      >
                        {/* Media Preview */}
                        {post.media_url && (
                          <div className="aspect-square relative bg-gray-100">
                            {post.media_type === "VIDEO" ? (
                              <video
                                src={post.media_url}
                                controls
                                className="w-full h-full object-cover"
                                loading="lazy"
                                onError={(e) => {
                                  console.error(
                                    `Video load error for post ID: ${post.id}, URL: ${post.media_url}`
                                  );
                                  e.target.src = "/fallback-video.mp4";
                                }}
                              >
                                Your browser does not support the video tag.
                              </video>
                            ) : (
                              <img
                                src={post.media_url}
                                alt="Instagram post"
                                className="w-full h-full object-cover"
                                loading="lazy"
                                onError={(e) => {
                                  console.error(
                                    `Image load error for post ID: ${post.id}, URL: ${post.media_url}`
                                  );
                                  e.target.src = "/fallback-image.jpg";
                                }}
                              />
                            )}
                            {/* Selection Indicator - only show when toggle is OFF */}
                            {selectedPost?.id === post.id && !enabled && (
                              <div className="absolute inset-0 bg-blue-500/50 flex items-center justify-center">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 via-blue-500 to-blue-700 rounded-full flex items-center justify-center">
                                  <CheckCheck className="w-6 h-6 text-white" />
                                </div>
                              </div>
                            )}
                            {/* Disabled overlay when toggle is ON */}
                            {enabled && (
                              <div className="absolute inset-0 bg-gray-500/30 flex items-center justify-center">
                                <div className="bg-white/90 px-3 py-1 rounded-full">
                                  <span className="text-xs font-medium text-gray-600">
                                    All posts monitored
                                  </span>
                                </div>
                              </div>
                            )}
                            {/* Media Type Badge */}
                            <div className="absolute top-2 left-2">
                              <div className="bg-black/60 text-white px-2 py-1 rounded-lg text-xs font-medium flex items-center space-x-1">
                                {getMediaIcon(post.media_type)}
                                <span className="capitalize">
                                  {post.media_type
                                    .toLowerCase()
                                    .replace("_", " ")}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="">
                          {/* Date */}
                          <div className="flex items-center text-xs text-black/70 font-semibold p-1 ml-2">
                            <Calendar className="w-3 h-3 mr-1" />
                            <span>
                              {new Date(post.timestamp).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                }
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {hasMore && (
                      <div
                        ref={observerRef}
                        className="flex justify-center items-center w-full py-8"
                      >
                        {loadingMore ? (
                          <div className="flex items-center  space-x-3">
                            <div className="w-4 h-4 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin"></div>
                            <p className="text-blue-800 text-sm font-medium">
                              Loading more posts...
                            </p>
                          </div>
                        ) : (
                          <div className="h-10" />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center bg-black/6 border-b-1 rounded-t-lg p-2">
              <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 bg-clip-text text-transparent">
                This Comment has a specific word or words
              </h2>
              <p className="text-sm text-black/70 mt-2">
                Automatic DMs will be sent when users comment with specific
                word(s) on the selected post
              </p>
            </div>

            <div className="min-h-[400px] md:min-h-[400px] px-5">
              <div className="flex items-center md:space-x-4 space-x-1">
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddKeyword();
                    }
                  }}
                  onBlur={handleAddKeyword}
                  placeholder="Enter a word or multiple words"
                  className={`flex-1 p-2 text-base font-semibold border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                    isSubmitted && keywordOption === "custom" && !keyword.trim()
                      ? "border-red-500"
                      : keywordOption === "any"
                      ? "bg-gray-100 cursor-not-allowed"
                      : "border-blue-600"
                  }`}
                  disabled={keywordOption === "any"}
                />
                <button
                  onClick={handleAddKeyword}
                  disabled={!keyword.trim() || keywordOption === "any"}
                  className={`md:px-4 md:py-2 p-1 rounded-lg font-medium transition-all ${
                    keyword.trim() && keywordOption === "custom"
                      ? "bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 text-white hover:bg-blue-700 cursor-pointer"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  Add Keyword
                </button>
              </div>
              <div className="flex flex-wrap gap-3 mt-4">
                {keywords.map((kw, index) => (
                  <div
                    key={index}
                    className="flex items-center bg-gradient-to-br from-purple-500 via-pink-400 to-red-400 text-white text-md font-medium px-4 py-1 rounded-full"
                  >
                    {kw}
                    <button
                      onClick={() => handleRemoveKeyword(index)}
                      className="ml-2 focus:outline-none"
                      disabled={keywordOption === "any"}
                    >
                      <CircleX
                        className={`w-4 h-4 font-bold text-white ${
                          keywordOption === "any"
                            ? "cursor-not-allowed"
                            : "hover:text-black/50 cursor-pointer"
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>

              <div className="mx-auto mt-4">
                <div className="flex items-center justify-between border rounded-lg p-4 shadow-sm">
                  <div className="flex flex-col">
                    <h3 className="text-sm sm:text-base font-medium text-gray-900">
                      Any Word on Post or Reel
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">
                      Monitor comments with any words on the selected post or
                      reel.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      const newEnabledAnyWord = !enabledAnyWord;
                      setEnabledAnyWord(newEnabledAnyWord);
                      setKeywordOption(newEnabledAnyWord ? "any" : "custom");
                      setKeywords(newEnabledAnyWord ? ["any"] : []);
                      setKeyword("");
                      onEnabledAnyWordChange(newEnabledAnyWord);
                    }}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      enabledAnyWord
                        ? "bg-gradient-to-br from-green-400 via-green-500 to-green-600"
                        : "bg-gray-300"
                    }`}
                    role="switch"
                    aria-checked={enabledAnyWord}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        enabledAnyWord ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="mx-auto mt-4">
                <div className="border rounded-lg p-4 shadow-sm">
                  <h3 className="text-sm sm:text-base font-medium text-gray-900">
                    Select Public Reply Messages & Editable Own Message Reply
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">
                    Choose messages to reply under the post. You can select
                    multiple messages.
                  </p>
                  <div className="flex flex-col space-y-2 mt-4 w-full">
                    <div className="relative">
                      <input
                        type="text"
                        ref={message1Ref}
                        className={`border rounded px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full ${
                          selectedMessages.includes(1) && !message1.trim()
                            ? "border-red-500"
                            : selectedMessages.includes(1)
                            ? "border-blue-500"
                            : "border-gray-300"
                        }`}
                        value={message1}
                        onChange={(e) => {
                          setMessage1(e.target.value);
                          onMessageChange?.(1, e.target.value);
                        }}
                      />
                      <input
                        type="checkbox"
                        checked={selectedMessages.includes(1)}
                        onChange={() => handleToggleMessage(1)}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2"
                      />
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        ref={message2Ref}
                        className={`border rounded px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full ${
                          selectedMessages.includes(2) && !message2.trim()
                            ? "border-red-500"
                            : selectedMessages.includes(2)
                            ? "border-blue-500"
                            : "border-gray-300"
                        }`}
                        value={message2}
                        onChange={(e) => {
                          setMessage2(e.target.value);
                          onMessageChange?.(2, e.target.value);
                        }}
                      />
                      <input
                        type="checkbox"
                        checked={selectedMessages.includes(2)}
                        onChange={() => handleToggleMessage(2)}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2"
                      />
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        ref={message3Ref}
                        className={`border rounded px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full ${
                          selectedMessages.includes(3) && !message3.trim()
                            ? "border-red-500"
                            : selectedMessages.includes(3)
                            ? "border-blue-500"
                            : "border-gray-300"
                        }`}
                        value={message3}
                        onChange={(e) => {
                          setMessage3(e.target.value);
                          onMessageChange?.(3, e.target.value);
                        }}
                      />
                      <input
                        type="checkbox"
                        checked={selectedMessages.includes(3)}
                        onChange={() => handleToggleMessage(3)}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2"
                      />
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        ref={message4Ref}
                        className={`border rounded px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full ${
                          selectedMessages.includes(4) && !message4.trim()
                            ? "border-red-500"
                            : selectedMessages.includes(4)
                            ? "border-blue-500"
                            : "border-gray-300"
                        }`}
                        value={message4}
                        onChange={(e) => {
                          setMessage4(e.target.value);
                          onMessageChange?.(4, e.target.value);
                        }}
                        placeholder="Enter your custom message"
                      />
                      <input
                        type="checkbox"
                        checked={selectedMessages.includes(4)}
                        onChange={() => handleToggleMessage(4)}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2"
                      />
                    </div>
                    {selectedMessages.length === 0 && (
                      <p className="text-red-500 text-xs mt-2">
                        Please select at least one public reply message.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="text-center bg-gray-100 border-b rounded-t-lg p-4 shadow-sm">
              <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 bg-clip-text text-transparent">
                Automated DM Link Sender
              </h2>
              <p className="text-sm text-gray-600 mt-2">
                When a user comments, they’ll automatically receive a DM with
                the link and details.
              </p>
            </div>

            <div className=" min-h-[400px] md:min-h-[400px] grid grid-cols-1 md:grid-cols-1 gap-6 px-4">
              {/* Box 1 */}
              <div className="flex flex-col">
                <div className="text-center bg-gray-50 border-b rounded-t-xl p-3 shadow-sm">
                  <h3 className="text-lg sm:text-xl font-semibold bg-gradient-to-r from-black via-black/70 to-black/80 bg-clip-text text-transparent">
                    an opening DM
                  </h3>
                </div>
                <div className="flex-1 bg-white p-4 sm:p-6 rounded-b-lg shadow-md border border-gray-200">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Opening Message Content
                      </label>
                      <textarea
                        className={`w-full p-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                          isSubmitted && !openingMessage.trim()
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        rows="4"
                        value={openingMessage}
                        onChange={(e) =>
                          onOpeningMessageChange?.(e.target.value)
                        }
                      ></textarea>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Button Label
                      </label>
                      <input
                        type="text"
                        className={`w-full p-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                          isSubmitted && !openingButtonLabel.trim()
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        value={openingButtonLabel}
                        onChange={(e) =>
                          onOpeningButtonLabelChange?.(e.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Box 2 */}
              <div className="flex flex-col">
                <div className="text-center bg-gray-50 border-b rounded-t-xl p-3 shadow-sm">
                  <h3 className="text-lg sm:text-xl font-semibold bg-gradient-to-r from-black via-black/70 to-black/80 bg-clip-text text-transparent">
                    a DM with the link
                  </h3>
                </div>
                <div className="flex-1 bg-white p-4 sm:p-6 rounded-b-lg shadow-md border border-gray-200">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Link Description
                      </label>
                      <textarea
                        className={`w-full p-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                          isSubmitted && !linkDescription.trim()
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        rows="4"
                        value={linkDescription}
                        onChange={(e) =>
                          onLinkDescriptionChange?.(e.target.value)
                        }
                        placeholder="Write a Message..."
                      ></textarea>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Button Label (Optional)
                      </label>
                      <input
                        type="text"
                        className="w-full p-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 border-gray-300"
                        value={linkButtonLabel}
                        onChange={(e) =>
                          onLinkButtonLabelChange?.(e.target.value)
                        }
                        placeholder="Add a button label (optional)"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Add a Link URL (Optional)
                      </label>
                      <input
                        type="url"
                        className="w-full p-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 border-gray-300"
                        placeholder="Enter link URL (optional)..."
                        value={dmLink}
                        onChange={(e) => onDmLinkChange?.(e.target.value)}
                      />
                    </div>
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
    <div className="">
      <Toaster position="top-center" />
      <div className="max-w-4xl mx-auto">
        {/* Stepper */}
        <div className="mb-6 md:mb-8 -mr-18">
          <div className="flex items-center justify-between px-1 sm:px-2 sm:ml-20  lg:ml-20">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = step.id === currentStep;
              const isCompleted = step.id < currentStep;

              return (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                        isCompleted
                          ? "bg-gradient-to-br from-green-400 via-green-500 to-green-700 text-white"
                          : isActive
                          ? "bg-gradient-to-br from-blue-400 via-blue-600 to-blue-700 text-white"
                          : "bg-white border-gray-300 text-gray-400"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCheck className="w-3 h-3 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                      ) : (
                        <StepIcon className="w-3 h-3 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                      )}
                    </div>
                    <div className="mt-1 sm:mt-2 text-center max-w-[70px] sm:max-w-none">
                      <p
                        className={`text-[10px] text-xs sm:text-xs md:text-base font-medium leading-tight
                        ${
                          isCompleted
                            ? "text-green-600"
                            : isActive
                            ? "text-blue-600"
                            : "text-gray-500"
                        }
                      `}
                      >
                        {step.title}
                      </p>
                    </div>
                  </div>

                  {index < steps.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 ${
                        step.id < currentStep ? "bg-green-500" : "bg-gray-300"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white border-2 rounded-xl shadow-lg">
          {renderStepContent()}

          <div className="flex flex-row justify-between items-center mt-6 md:mt-8 pt-2 border-t border-gray-200 gap-2 p-4">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`flex items-center px-2 md:px-4 py-1 md:py-2 cursor-pointer rounded-lg font-medium transition-all w-auto sm:w-auto ${
                currentStep === 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-br from-blue-300 via-blue-500 to-blue-500 text-white hover:bg-white"
              }`}
            >
              <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 mr-2" />
              Prev
            </button>

            <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 bg-clip-text text-transparent text-base font-medium text-center">
              Step {currentStep} of {steps.length}
            </div>

            {currentStep < steps.length ? (
              // Update the "Next" button disabled condition in the render (around line 600)
              <button
                onClick={nextStep}
                disabled={
                  (currentStep === 1 && !selectedPost && !enabled) ||
                  (currentStep === 2 &&
                    keywordOption === "custom" &&
                    keywords.length === 0 &&
                    selectedMessages.length === 0)
                }
                className={`flex items-center px-2 md:px-4 py-1 md:py-2 cursor-pointer rounded-lg font-medium transition-all w-auto sm:w-auto ${
                  (currentStep === 1 && !selectedPost && !enabled) ||
                  (currentStep === 2 &&
                    keywordOption === "custom" &&
                    keywords.length === 0 &&
                    selectedMessages.length === 0)
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                Next
                <ChevronRight className="w-4 h-4 md:w-5 md:h-5 ml-2" />
              </button>
            ) : (
              // Update the submit button disabled condition (around line 596)
              <button
                onClick={handleSubmit}
                // disabled={
                //   !openingMessage.trim() ||
                //   !openingButtonLabel.trim() ||
                //   !linkDescription.trim()
                // }
                className={`flex items-center px-2 cursor-pointer md:px-4 py-1 md:py-2 rounded-lg font-medium transition-all duration-200 ease-in-out transform active:translate-y-1 active:shadow-inner hover:scale-105 w-auto sm:w-auto ${
                  !openingMessage.trim() ||
                  !openingButtonLabel.trim() ||
                  !linkDescription.trim()
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-br from-green-400 via-green-500 to-green-600 text-white shadow-md hover:shadow-lg"
                }`}
              >
                <SendHorizontal className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                {isEditing ? "Changes Go Live" : "Go Live"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Automation;
