"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  ArrowLeft,
  Phone,
  Video,
  Camera,
  Mic,
  Image,
  Plus,
  User,
} from "lucide-react";

export default function PreviewBox({ messages, keywords, dmLink }) {
  const [instagramDetails, setInstagramDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const { data: session, status } = useSession();

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
        if (!response.ok)
          throw new Error(
            data.error?.message || "Failed to fetch Instagram details"
          );
        setInstagramDetails({
          username: data.username || "Unknown User",
          profilePicture: data.profile_picture_url || null,
        });
      } catch (err) {
        console.error("Error fetching Instagram details:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchInstagramDetails();
  }, [session, status]);

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="relative">
        <div className="w-80 h-[640px] bg-black rounded-[2.5rem] p-2 shadow-2xl">
          <div className="w-full h-full bg-black rounded-[2rem] overflow-hidden relative">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-28 h-5 bg-white/20 rounded-b-2xl z-10"></div>
            <div className="max-w-sm mx-auto bg-black text-white h-full flex flex-col">
              <div className="flex items-center justify-between px-3 py-2 mt-4">
                <div className="flex items-center gap-2">
                  <ArrowLeft className="w-5 h-5 text-white" />
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
                  <span className="font-semibold text-xs">
                    {loading
                      ? "Loading..."
                      : instagramDetails?.username || "Unknown User"}
                  </span>
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
                  <div className="flex justify-end">
                    <div className="max-w-[70%]">
                      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl rounded-br-xs px-4 py-2">
                        <p className="text-white text-xs">
                          {keywords.length > 0
                            ? keywords[0]
                            : "write a message keyword"}
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
                          {messages.linkDescription || "Write a message"}
                        </p>
                        {messages.linkButtonLabel && (
                          <a
                            href={dmLink || "#"}
                            className="bg-white/20 w-full mt-2 p-1.5 text-xs rounded-md inline-block text-center"
                          >
                            {messages.linkButtonLabel}
                          </a>
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
              <div className="flex justify-center py-1">
                <div className="w-24 h-1 bg-white rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute right-[-4px] top-32 w-1 h-10 bg-gray-700 rounded-r"></div>
        <div className="absolute right-[-4px] top-50 w-1 h-12 bg-gray-700 rounded-r"></div>
        <div className="absolute right-[-4px] top-64 w-1 h-12 bg-gray-700 rounded-r"></div>
      </div>
    </div>
  );
}
