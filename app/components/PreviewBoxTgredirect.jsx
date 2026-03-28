"use client";
import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Phone,
  Video,
  Camera,
  Mic,
  Image,
  Plus,
  User,
  SendHorizontal,
} from "lucide-react";

export default function PreviewBoxTgredirect({
  keywords,
  anyKeywordMode,
  description,
  buttons,
}) {
  const [selectedButtonIndex, setSelectedButtonIndex] = useState(null);
  const [showResponse, setShowResponse] = useState(false);

  const userMessage = anyKeywordMode
    ? "Sends any message"
    : keywords.length > 0
    ? ` ${keywords[0]}`
    : "website";

  const handleButtonClick = (index) => {
    setSelectedButtonIndex(index);
    setShowResponse(false);
    setTimeout(() => {
      setShowResponse(true);
    }, 2000);
  };

  const handleLinkButtonClick = (url) => {
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  useEffect(() => {
    if (selectedButtonIndex === null) {
      setShowResponse(false);
    }
  }, [selectedButtonIndex]);

  return (
    <div className="flex items-center justify-center min-h-screen p-4 overflow-hidden">
      <div className="relative">
        <div className="w-80 h-[630px] bg-black rounded-[2.5rem] p-2 shadow-2xl">
          <div className="w-full h-full bg-black rounded-[2rem] overflow-hidden relative">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-28 h-5 bg-white/20 rounded-b-2xl z-10"></div>
            <div className="max-w-sm mx-auto bg-black text-white h-full flex flex-col">
              <div className="flex items-center justify-between px-3 py-2 mt-4">
                <div className="flex items-center gap-2">
                  <ArrowLeft className="w-5 h-5 text-white" />
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-sky-500 to-lime-500 p-0.5">
                    <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                      <div className="w-7 h-7 bg-gray-600 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-gray-300" />
                      </div>
                    </div>
                  </div>
                  <span className="font-semibold text-xs">Aviral Yadav</span>
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
                className="flex-1 overflow-y-auto px-4 py-4 bg-black scrollbar-hide pr-2"
                style={{
                  height: "380px",
                  scrollbarWidth: "none", // Firefox
                  msOverflowStyle: "none", // IE/Edge
                }}
              >
                <div className="space-y-4">
                  <div className="flex justify-end">
                    <div className="max-w-[70%]">
                      <div className="bg-gradient-to-r from-sky-400 to-sky-600 rounded-2xl rounded-br-xs px-4 py-2">
                        <p className="text-white text-xs">{userMessage}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-start items-end space-x-1">
                    <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-3 h-3 text-gray-300" />
                    </div>
                    <div className="max-w-[70%] space-y-2">
                      <div className="bg-white/20 rounded-2xl rounded-bl-xs px-4 py-2">
                        <p className="text-white text-xs mb-2 break-words">
                          {description || "Write a message"}
                        </p>
                        {buttons.length > 0 && (
                          <div className="flex flex-col space-y-2">
                            {buttons.map((btn, idx) => (
                              <button
                                key={idx}
                                onClick={() => handleButtonClick(idx)}
                                className="bg-white/10 text-white cursor-pointer text-xs font-medium py-1 px-4 rounded-sm border border-white/20 hover:bg-white/20 transition-colors"
                              >
                                {btn.name || "Button"}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  {selectedButtonIndex !== null && (
                    <>
                      <div className="flex justify-end">
                        <div className="max-w-[70%]">
                          <div className="bg-gradient-to-r from-sky-400 to-sky-600 rounded-2xl rounded-br-xs px-4 py-2">
                            <p className="text-white text-xs">
                              {buttons[selectedButtonIndex].name ||
                                "Clicked button"}
                            </p>
                          </div>
                        </div>
                      </div>
                      {showResponse && (
                        <div className="flex justify-start items-end space-x-1">
                          <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="w-3 h-3 text-gray-300" />
                          </div>
                          <div className="max-w-[70%] space-y-2">
                            <div className="bg-white/20 rounded-2xl rounded-bl-xs px-4 py-2">
                              <p className="text-white text-xs mb-2 break-words">
                                {buttons[selectedButtonIndex].response ||
                                  "Response message"}
                              </p>
                              {buttons[selectedButtonIndex].buttonLabel && (
                                <button
                                  onClick={() =>
                                    handleLinkButtonClick(
                                      buttons[selectedButtonIndex].linkUrl
                                    )
                                  }
                                  className="w-full text-center bg-white/10 text-white cursor-pointer text-xs font-medium py-1 px-4 rounded-sm border border-white/20 hover:bg-white/20 transition-colors"
                                >
                                  {buttons[selectedButtonIndex].buttonLabel}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
              <div className="py-2 bg-black border-t border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="flex-1 bg-gray-700 rounded-full px-3 py-1 flex items-center border border-gray-500">
                    <button className="p-1.5">
                      <span className="text-xl">😊</span>
                    </button>
                    <textarea
                      rows={1}
                      placeholder="Type a message"
                      className="bg-transparent text-sm text-white placeholder-gray-500 flex-1 outline-none resize-none overflow-hidden"
                      style={{ maxHeight: "100px" }}
                    />
                    <button className="p-1 ml-1">
                      <Plus className="w-4 h-4 text-white" />
                    </button>
                    <button className="p-1 ml-1">
                      <Image className="w-4 h-4 text-white" />
                    </button>
                    <button className="p-2 ml-1 bg-gradient-to-tr from-sky-400 to-sky-600 rounded-full">
                      <SendHorizontal className="w-4 h-4 text-white" />
                    </button>
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
