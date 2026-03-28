"use client";
import React, { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  X,
  CircleX,
  Settings,
  SendHorizontal,
  Tag,
  AlignVerticalDistributeStart,
} from "lucide-react";

const WhatsAppKeywordForm = ({
  keywords,
  onKeywordsChange,
  keywordInput,
  onKeywordInputChange,
  anyKeywordMode,
  onAnyKeywordModeChange,
  description,
  onDescriptionChange,
  buttons,
  onButtonsChange,
}) => {
  const addKeyword = useCallback(() => {
    if (keywordInput.trim() && !keywords.includes(keywordInput.trim())) {
      onKeywordsChange([...keywords, keywordInput.trim()]);
      onKeywordInputChange("");
    }
  }, [keywords, keywordInput, onKeywordsChange, onKeywordInputChange]);

  const removeKeyword = useCallback(
    (indexToRemove) => {
      onKeywordsChange(keywords.filter((_, index) => index !== indexToRemove));
    },
    [keywords, onKeywordsChange]
  );

  const addButton = useCallback(() => {
    onButtonsChange([
      ...buttons,
      { name: "", response: "", buttonLabel: "", linkUrl: "" },
    ]);
  }, [buttons, onButtonsChange]);

  const updateButton = useCallback(
    (index, field, value) => {
      const updatedButtons = buttons.map((button, i) =>
        i === index ? { ...button, [field]: value } : button
      );
      onButtonsChange(updatedButtons);
    },
    [buttons, onButtonsChange]
  );

  const removeButton = useCallback(
    (index) => {
      onButtonsChange(buttons.filter((_, i) => i !== index));
    },
    [buttons, onButtonsChange]
  );

  const handleKeywordKeyPress = useCallback(
    (e) => {
      if (e.key === "Enter") {
        addKeyword();
      }
    },
    [addKeyword]
  );

  return (
    <div className="max-w-4xl mx-auto border-2 rounded-2xl bg-white shadow-lg">
      <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
        <div className="text-center bg-gray-100 rounded-t-2xl p-2">
          <h2
            className="text-3xl font-bold bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-500
 bg-clip-text text-transparent"
          >
            Redirect customers to your website
          </h2>
          <p className="text-sm text-gray-600 mt-2">
            Configure keywords and DM settings for automatic Message sending.
          </p>
        </div>

        <div className="p-6 space-y-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Tag className="w-5 h-5 text-sky-500" />
              <h2 className="text-lg font-medium text-gray-900">
                Keywords Setup: When Users Send These Keywords
              </h2>
            </div>

            <div className="space-y-3">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={keywordInput}
                  onChange={(e) => onKeywordInputChange(e.target.value)}
                  onKeyPress={handleKeywordKeyPress}
                  placeholder="Enter specific or multiple keywords..."
                  disabled={anyKeywordMode}
                  className={`flex-1 p-2 text-base font-semibold border rounded focus:outline-none focus:ring-1 focus:ring-sky-500 ${
                    anyKeywordMode
                      ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                      : "bg-white"
                  }`}
                />
                <button
                  onClick={addKeyword}
                  disabled={anyKeywordMode || !keywordInput.trim()}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    anyKeywordMode || !keywordInput.trim()
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-gradient-to-br from-sky-400 via-sky-500 to-sky-600 text-white cursor-pointer hover:bg-sky-700"
                  }`}
                >
                  Add Keyword
                </button>
              </div>

              {keywords.length > 0 && (
                <div className="flex flex-wrap gap-2 ">
                  {keywords.map((keyword, index) => (
                    <div
                      key={index}
                      className="flex gap-2 items-center bg-gradient-to-br from-sky-400 via-sky-500  to-sky-600 text-white text-md font-medium px-4 py-1 rounded-full"
                    >
                      <span>{keyword}</span>
                      <button
                        onClick={() => removeKeyword(index)}
                        className=" rounded-full p-0.5 transition-colors"
                      >
                        <CircleX className="w-4 h-4 text-white hover:text-black/50 cursor-pointer" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center mt-6 justify-between p-4 bg-gray-50 rounded-lg border shadow-sm">
              <div>
                <h3 className="font-medium text-gray-900">
                  Accept Any Keyword
                </h3>
                <p className="text-sm text-gray-600">
                  Allow users to send any keyword to trigger the bot
                </p>
              </div>
              <button
                onClick={() => {
                  onAnyKeywordModeChange(!anyKeywordMode);
                  if (!anyKeywordMode) {
                    onKeywordsChange([]);
                  }
                }}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out  ${
                  anyKeywordMode ? "bg-sky-500" : "bg-gray-300"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    anyKeywordMode ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="space-y-4 mt-12">
            <div className="flex items-center space-x-2">
              <Settings className="w-5 h-5 text-sky-600" />
              <h2 className="text-lg font-medium text-gray-900">
                Keyword Response : Greeting Message
              </h2>
            </div>

            <textarea
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              placeholder="Enter your greeting message for users..."
              rows={4}
              className="w-full px-4 py-3 border  rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 resize-none transition-all"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <AlignVerticalDistributeStart className="w-5 h-5 text-sky-600" />
              <h2 className="text-lg font-medium text-gray-900">
                Add functionality to each button to trigger its specific message
                action.{" "}
              </h2>
            </div>

            <AnimatePresence>
              {buttons.map((button, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="p-4 border border-sky-500 rounded-lg space-y-3 bg-black/2"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900">
                      When This Button is Pressed:
                    </h3>
                    <button
                      onClick={() => removeButton(index)}
                      className="text-red-500 hover:text-red-700 cursor-pointer transition-colors hover:scale-110"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-row-3 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Button Label Name
                      </label>
                      <input
                        type="text"
                        value={button.name || ""}
                        onChange={(e) =>
                          updateButton(index, "name", e.target.value)
                        }
                        placeholder="Name of button"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg  focus:outline-none focus:ring-1 focus:ring-sky-500 transition-all"
                      />
                    </div>
                    <h3 className="font-medium text-gray-700 mt-8">
                      Then these messages will now be sent to the user:{" "}
                    </h3>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 ">
                        Description Message
                      </label>
                      <textarea
                        rows={3}
                        value={button.response || ""}
                        onChange={(e) =>
                          updateButton(index, "response", e.target.value)
                        }
                        placeholder="Message when clicked"
                        className="w-full p-2 border  rounded-lg  focus:outline-none focus:ring-1 focus:ring-sky-500 resize-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Button Label Name (Optional)
                      </label>
                      <input
                        type="text"
                        value={button.buttonLabel || ""}
                        onChange={(e) =>
                          updateButton(index, "buttonLabel", e.target.value)
                        }
                        placeholder="Label for button"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg  focus:outline-none focus:ring-1 focus:ring-sky-500 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Add a Link URL (Optional)
                      </label>
                      <input
                        type="url"
                        value={button.linkUrl || ""}
                        onChange={(e) =>
                          updateButton(index, "linkUrl", e.target.value)
                        }
                        placeholder="https://example.com"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 transition-all"
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            <div className="text-center">
              <button
                onClick={addButton}
                className="inline-flex items-center cursor-pointer space-x-2 px-4 py-2 bg-gradient-to-br from-sky-400 via-sky-500 to-sky-600 text-white rounded-lg hover:bg-sky-700 active:bg-sky-800 transition-all font-medium"
              >
                <Plus className="w-4 h-4" />
                <span>Add Button</span>
              </button>
            </div>
          </div>

          <div className="flex justify-end -mt-4 border-t border-sky-500  -mr-4 p-2">
            <button
              type="submit"
              className="flex items-center px-8 py-2 rounded-lg cursor-pointer mr-2 font-medium transition-all duration-200 ease-in-out transform active:translate-y-1 active:shadow-inner hover:scale-105 bg-gradient-to-br from-green-400 via-green-500 to-green-600 text-white shadow-md hover:shadow-lg"
            >
              <SendHorizontal className="w-5 h-5 mr-2" />
              Go Live
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppKeywordForm;
