"use client";
import React, { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal,
  User,
  Home,
  Search,
  PlusSquare,
  Video,
  ChevronLeft,
  ChevronRight,
  Play,
  Volume2,
  VolumeX,
  Film,
} from "lucide-react";

export default function PreviewBoxPublish({ selectedPost, allPostsSelected }) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const { data: session, status } = useSession();
  const [instagramDetails, setInstagramDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Refs for auto-functionality
  const carouselIntervalRef = useRef(null);
  const videoRef = useRef(null);

  // Check if current post is a reel (moved up before useEffects)
  const isReel =
    selectedPost?.media_type === "REELS" ||
    (selectedPost?.media_urls &&
      selectedPost.media_urls.some((media) => media.media_type === "VIDEO"));

  // Debug logging for props
  useEffect(() => {
    console.log("📱 PreviewBoxPublish received props:", {
      selectedPost,
      allPostsSelected,
      hasMediaUrl: !!selectedPost?.media_url,
      hasMediaUrls: !!selectedPost?.media_urls,
      mediaType: selectedPost?.media_type,
      caption: selectedPost?.caption,
    });
  }, [selectedPost, allPostsSelected]);

  // Reset carousel when post changes
  useEffect(() => {
    setCurrentSlide(0);
    setLiked(false);
    setSaved(false);
    setIsPlaying(false);
    setIsMuted(true);

    // Clear carousel interval when post changes
    if (carouselIntervalRef.current) {
      clearInterval(carouselIntervalRef.current);
    }
  }, [selectedPost]);

  // Auto-swipe functionality for carousel
  useEffect(() => {
    if (
      selectedPost?.media_urls &&
      Array.isArray(selectedPost.media_urls) &&
      selectedPost.media_urls.length > 1
    ) {
      // Clear any existing interval
      if (carouselIntervalRef.current) {
        clearInterval(carouselIntervalRef.current);
      }

      // Start auto-swipe every 2 seconds
      carouselIntervalRef.current = setInterval(() => {
        setCurrentSlide((prevSlide) => {
          const nextSlide = (prevSlide + 1) % selectedPost.media_urls.length;
          return nextSlide;
        });
      }, 3000);

      // Cleanup on unmount or when post changes
      return () => {
        if (carouselIntervalRef.current) {
          clearInterval(carouselIntervalRef.current);
        }
      };
    }
  }, [selectedPost?.media_urls]);

  // Auto-play functionality for reels
  useEffect(() => {
    if (isReel && videoRef.current) {
      const video = videoRef.current;

      // Auto-play when reel loads
      const playVideo = async () => {
        try {
          await video.play();
          setIsPlaying(true);
        } catch (error) {
          console.log("Auto-play failed, user interaction required:", error);
          setIsPlaying(false);
        }
      };

      // Small delay to ensure video is loaded
      const timeout = setTimeout(() => {
        playVideo();
      }, 100);

      return () => clearTimeout(timeout);
    }
  }, [selectedPost, isReel]);

  // Fetch Instagram user details - Same as PreviewBox same as before
  useEffect(() => {
    if (status === "loading" || !session || session.user.role !== "USER")
      return;

    const fetchInstagramDetails = async () => {
      setLoading(true);
      try {
        console.log("📞 Fetching Instagram details for:", session.user.email);
        console.log("👤 Session user:", session.user);

        const response = await fetch(
          `/api/instagram/user-details?userId=${encodeURIComponent(
            session.user.id
          )}`
        );

        const data = await response.json();

        console.log("📊 API Response:", data);
        console.log("🔍 Response status:", response.ok);

        if (!response.ok) {
          throw new Error(
            data.error?.message ||
              data.message ||
              "Failed to fetch Instagram details"
          );
        }

        setInstagramDetails({
          username: data.username || "Unknown User",
          profilePicture: data.profile_picture_url || null,
        });
        console.log("✅ Instagram details set:", {
          username: data.username,
          profilePicture: data.profile_picture_url,
        });
      } catch (err) {
        console.error("❌ Error fetching Instagram details:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInstagramDetails();
  }, [session, status]);

  const handleVideoToggle = (videoElement) => {
    if (videoElement) {
      if (isPlaying) {
        videoElement.pause();
      } else {
        videoElement.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Manual slide navigation (pauses auto-swipe temporarily)
  const goToSlide = (slideIndex) => {
    setCurrentSlide(slideIndex);

    // Temporarily pause auto-swipe
    if (carouselIntervalRef.current) {
      clearInterval(carouselIntervalRef.current);
    }

    // Resume auto-swipe after 5 seconds
    setTimeout(() => {
      if (selectedPost?.media_urls && selectedPost.media_urls.length > 1) {
        carouselIntervalRef.current = setInterval(() => {
          setCurrentSlide((prevSlide) => {
            const nextSlide = (prevSlide + 1) % selectedPost.media_urls.length;
            return nextSlide;
          });
        }, 2000);
      }
    }, 5000);
  };

  const renderMediaContent = () => {
    console.log("🎨 renderMediaContent called with:", {
      allPostsSelected,
      selectedPost,
      hasMediaUrl: !!selectedPost?.media_url,
      hasMediaUrls: !!selectedPost?.media_urls,
      mediaUrlsLength: selectedPost?.media_urls?.length,
    });

    if (allPostsSelected) {
      console.log("📂 Rendering 'all posts selected' view");
      return (
        <div className="w-full h-full bg-gray-700 flex items-center justify-center p-4">
          <span className="text-center text-white/80 text-md sm:text-lg leading-snug break-words max-w-xs sm:max-w-md">
            Selected all of your posts or reels
          </span>
        </div>
      );
    }

    if (!selectedPost?.media_url && !selectedPost?.media_urls) {
      console.log("🚫 No media found, showing placeholder");
      return (
        <div className="w-full h-full bg-white/30 flex items-center justify-center animate-pulse">
          <span className="text-gray-400 text-lg">
            Select a post to get started
          </span>
        </div>
      );
    }

    // Handle carousel posts
    if (
      selectedPost.media_urls &&
      Array.isArray(selectedPost.media_urls) &&
      selectedPost.media_urls.length > 1
    ) {
      console.log(
        "🎠 Rendering carousel with",
        selectedPost.media_urls.length,
        "slides, current slide:",
        currentSlide
      );
      const totalSlides = selectedPost.media_urls.length;

      return (
        <div className="relative w-full h-full overflow-hidden">
          {/* Carousel container */}
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {selectedPost.media_urls.map((media, index) => (
              <div key={index} className="w-full flex-shrink-0">
                {media.media_type === "VIDEO" ? (
                  <video
                    src={media.media_url}
                    className="w-full h-full object-cover"
                    controls
                    muted
                    playsInline
                    preload="metadata"
                  >
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <img
                    src={media.media_url}
                    alt={`Carousel slide ${index + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onLoad={() =>
                      console.log("✅ Carousel image loaded successfully")
                    }
                    onError={(e) =>
                      console.error("❌ Carousel image failed to load:", e)
                    }
                  />
                )}
              </div>
            ))}
          </div>

          {/* Navigation buttons */}
          {currentSlide > 0 && (
            <button
              onClick={() => goToSlide(currentSlide - 1)}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-6 h-6 cursor-pointer bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          {currentSlide < totalSlides - 1 && (
            <button
              onClick={() => goToSlide(currentSlide + 1)}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 cursor-pointer bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}

          {/* Pagination dots */}
          <div className="absolute top-2 right-2 bg-black/50 px-2 pb-1 rounded-full">
            <span className="text-white text-xs font-medium">
              {currentSlide + 1}/{totalSlides}
            </span>
          </div>
        </div>
      );
    }

    console.log(
      "📱 Rendering single media, type:",
      selectedPost.media_type,
      "URL:",
      selectedPost.media_url
    );

    // Handle single media (image or video)
    if (selectedPost.media_type === "REELS") {
      console.log("🎬 Rendering single video");
      return (
        <div className="relative w-full h-full">
          <video
            ref={videoRef}
            src={selectedPost.media_url}
            className="w-full h-full object-cover"
            muted={isMuted}
            playsInline
            preload="metadata"
            loop
            onClick={(e) => handleVideoToggle(e.target)}
            onLoadedData={() => console.log("✅ Video loaded successfully")}
            onError={(e) => console.error("❌ Video failed to load:", e)}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          >
            Your browser does not support the video tag.
          </video>

          {/* Play/Pause overlay */}
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 bg-black/50 rounded-full flex items-center justify-center">
                <Play className="w-8 h-8 text-white ml-1" />
              </div>
            </div>
          )}

          {/* Sound toggle button */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="absolute bottom-4 right-4 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>
        </div>
      );
    }

    console.log("🖼️ Rendering single image");
    return (
      <img
        src={selectedPost.media_url}
        alt="Selected Instagram post"
        className="w-full h-full object-cover"
        loading="lazy"
        onLoad={() => console.log("✅ Single image loaded successfully")}
        onError={(e) => console.error("❌ Single image failed to load:", e)}
      />
    );
  };

  // Render Reel Layout
  const renderReelLayout = () => {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        {/* iPhone Frame for Reels - Full screen style */}
        <div className="relative">
          {/* Phone Body */}
          <div className="w-[320px] h-[640px] bg-black rounded-[2.5rem] p-2 shadow-2xl">
            {/* Screen */}
            <div className="w-full h-full bg-black rounded-[2rem] overflow-hidden relative">
              {/* Notch */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-28 h-5 bg-white/20 rounded-b-2xl z-10"></div>

              {/* Reel Content - Full Screen */}
              <div className="max-w-sm mx-auto bg-black text-white h-full flex flex-col pt-6">
                {/* Header - Minimal for reels */}
                <div className="absolute top-8 left-0 right-0 z-20 px-4">
                  <div className="flex items-center justify-between">
                    <div className="text-white font-semibold text-sm">
                      Reels
                    </div>
                    <div className="w-6 h-6 rounded-full flex items-center justify-center">
                      <Film className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>

                {/* Full Screen Reel Media */}
                <div className="flex-1 relative">{renderMediaContent()}</div>

                {/* Reel Side Actions - Right side overlay */}
                <div className="absolute right-4 bottom-32 z-20 flex flex-col items-center space-y-6">
                  <button
                    onClick={() => setLiked(!liked)}
                    className="transition-colors"
                  >
                    <div className="flex flex-col items-center">
                      <Heart
                        className={`w-7 h-7 ${
                          liked ? "fill-red-500 text-red-500" : "text-white"
                        }`}
                      />
                      <span className="text-white text-xs mt-1">0</span>
                    </div>
                  </button>
                  <button>
                    <div className="flex flex-col items-center">
                      <MessageCircle className="w-7 h-7 text-white" />
                      <span className="text-white text-xs mt-1">0</span>
                    </div>
                  </button>
                  <button>
                    <div className="flex flex-col items-center">
                      <Send className="w-7 h-7 text-white" />
                      <span className="text-white text-xs mt-1">0</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setSaved(!saved)}
                    className="transition-colors"
                  >
                    <Bookmark
                      className={`w-7 h-7 text-white ${
                        saved ? "fill-white" : ""
                      }`}
                    />
                  </button>
                  <button className="transition-colors">
                    <MoreHorizontal className="w-7 h-7 text-white" />
                  </button>
                </div>

                {/* Bottom User Info and Caption - Overlay */}
                <div className="absolute bottom-20 left-0 right-0 z-20 px-4">
                  <div className="flex items-center mb-2">
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
                    <span className="font-semibold text-white text-sm ml-2">
                      {loading
                        ? "Loading..."
                        : instagramDetails?.username || "Unknown User"}
                    </span>
                    <button className="ml-3 px-3 py-1 border border-white rounded text-white text-xs font-semibold">
                      Follow
                    </button>
                  </div>

                  {selectedPost?.caption && (
                    <div className="text-white text-sm mb-2 line-clamp-2">
                      {selectedPost.caption}
                    </div>
                  )}
                </div>

                {/* Instagram Bottom Navigation */}
                <div className="bg-black border-t border-gray-800 px-3 py-2 mt-auto z-20">
                  <div className="flex justify-between items-center">
                    <button className="p-1">
                      <Home className="w-5 h-5 text-gray-100" />
                    </button>
                    <button className="p-1">
                      <Search className="w-5 h-5 text-gray-100" />
                    </button>
                    <button className="p-1">
                      <PlusSquare className="w-5 h-5 text-gray-100" />
                    </button>
                    <button className="p-1">
                      <Video className="w-5 h-5 text-white" />
                    </button>
                    <button className="p-1">
                      <div className="w-5 h-5 bg-gray-600 rounded-full flex items-center justify-center">
                        {instagramDetails?.profilePicture ? (
                          <img
                            src={instagramDetails.profilePicture}
                            alt="Profile"
                            className="w-5 h-5 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-5 h-5 bg-gray-600 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-gray-300" />
                          </div>
                        )}
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
  };

  // Render Normal Post Layout
  const renderPostLayout = () => {
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

              {/* Instagram Content */}
              <div className="max-w-sm mx-auto bg-black text-white h-full flex flex-col pt-5">
                {/* Header - User Info */}
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
                  <MoreHorizontal className="w-4 h-4 text-gray-400" />
                </div>

                {/* Post Media */}
                <div className="relative bg-black w-full h-[350px]">
                  {renderMediaContent()}
                </div>

                {/* Pagination dots for carousel */}
                {selectedPost?.media_urls &&
                  Array.isArray(selectedPost.media_urls) &&
                  selectedPost.media_urls.length > 1 && (
                    <div className="flex justify-center space-x-2 py-2">
                      {Array.from({
                        length: selectedPost.media_urls.length,
                      }).map((_, index) => (
                        <button
                          key={index}
                          onClick={() => goToSlide(index)}
                          className={`rounded-full transition-colors ${
                            index === currentSlide
                              ? "bg-white w-3 h-1.5"
                              : "bg-gray-400 w-1.5 h-1.5"
                          }`}
                        />
                      ))}
                    </div>
                  )}

                {/* Action Buttons */}
                <div className="flex items-center justify-between px-3 py-2">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setLiked(!liked)}
                      className="transition-colors"
                    >
                      <div className="flex gap-1 cursor-pointer">
                        <Heart
                          className={`w-5 h-5 ${
                            liked ? "fill-red-500 text-red-500" : "text-white"
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
                    <Bookmark
                      className={`w-5 h-5 ${saved ? "fill-white" : ""}`}
                    />
                  </button>
                </div>

                {/* Post Details */}
                <div className="px-3 pb-2">
                  <div className="flex items-start">
                    <div className="text-xs text-gray-300 ml-1 space-y-0.5">
                      {selectedPost?.caption && (
                        <div className="font-semibold text-xs text-white mb-2">
                          <span className="text-white">
                            {loading
                              ? "Loading..."
                              : instagramDetails?.username || "username"}
                          </span>{" "}
                          <span className="font-normal line-clamp-3 text-gray-300">
                            {selectedPost.caption}
                          </span>
                        </div>
                      )}
                      <div className="text-gray-500">
                        {selectedPost?.timestamp
                          ? new Date(selectedPost.timestamp).toLocaleDateString(
                              "en-US",
                              {
                                day: "2-digit",
                                month: "long",
                                year: "numeric",
                              }
                            )
                          : new Date().toLocaleDateString("en-US", {
                              day: "2-digit",
                              month: "long",
                              year: "numeric",
                            })}
                      </div>
                      <div className="font-semibold text-xs text-gray-500">
                        view all comments
                      </div>
                    </div>
                  </div>
                </div>

                {/* Instagram Bottom Navigation */}
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
                        {instagramDetails?.profilePicture ? (
                          <img
                            src={instagramDetails.profilePicture}
                            alt="Profile"
                            className="w-5 h-5 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-5 h-5 bg-gray-600 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-gray-300" />
                          </div>
                        )}
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
  };

  // Cleanup intervals on unmount
  useEffect(() => {
    return () => {
      if (carouselIntervalRef.current) {
        clearInterval(carouselIntervalRef.current);
      }
    };
  }, []);

  // Return appropriate layout based on content type
  return isReel ? renderReelLayout() : renderPostLayout();
}
