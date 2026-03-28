"use client";
import React, { useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  X,
  SendHorizontal,
  Settings,
  AlignVerticalDistributeStart,
} from "lucide-react";

const WhatsAppKeywordForm = ({
  description,
  onDescriptionChange,
  subDescription,
  onSubDescriptionChange,
  menuButtonLabel,
  onMenuButtonLabelChange,
  buttons,
  onButtonsChange,
}) => {
  const addButton = useCallback(() => {
    onButtonsChange([
      ...buttons,
      { buttonLabel: "", response: "", linkUrl: "" },
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

  return (
    <div className="max-w-4xl mx-auto border-2 rounded-2xl bg-white shadow-lg">
      <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
        <div className="text-center bg-gray-100 rounded-t-2xl p-2">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-green-500 via-teal-500 to-lime-500 bg-clip-text text-transparent">
            Auto Reply to Requests
          </h2>
          <p className="text-sm text-gray-600 mt-2">
            Configure greeting message and menu buttons for auto responses.
          </p>
        </div>

        <div className="p-6 space-y-8">
          {/* Greeting Message */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Settings className="w-5 h-5 text-green-600" />
              <h2 className="text-lg font-medium text-gray-900">
                Greeting Message
              </h2>
            </div>
            <textarea
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              placeholder="Enter your greeting message for users..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 resize-none transition-all"
            />
          </div>

          {/* Sub Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sub Description
            </label>
            <input
              type="text"
              value={subDescription}
              onChange={(e) => onSubDescriptionChange(e.target.value)}
              placeholder="Enter a short sub description..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 transition-all"
            />
          </div>

          {/* Menu Button Label */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Menu Button Label
            </label>
            <input
              type="text"
              value={menuButtonLabel}
              onChange={(e) => onMenuButtonLabelChange(e.target.value)}
              placeholder="Label for menu button"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 transition-all"
            />
          </div>

          {/* Buttons Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <AlignVerticalDistributeStart className="w-5 h-5 text-green-600" />
              <h2 className="text-lg font-medium text-gray-900">
                Add functionality to each button to trigger its specific message
                action.
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
                  className="p-4 border border-green-500 rounded-lg space-y-4 bg-black/2"
                >
                  {/* When Section */}
                  <div>
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

                    <div className="mt-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Button Label
                      </label>
                      <input
                        type="text"
                        value={button.name || ""}
                        onChange={(e) =>
                          updateButton(index, "name", e.target.value)
                        }
                        placeholder="Enter button label"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 transition-all"
                      />
                    </div>
                  </div>

                  {/* Then Section */}
                  <div>
                    <h3 className="font-medium text-gray-700">
                      Then these messages will now be sent to the user:
                    </h3>

                    <div className="mt-3 grid gap-4">
                      {/* Description Message */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description Message
                        </label>
                        <textarea
                          rows={3}
                          value={button.response || ""}
                          onChange={(e) =>
                            updateButton(index, "response", e.target.value)
                          }
                          placeholder="Message when clicked"
                          className="w-full p-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 resize-none transition-all"
                        />
                      </div>

                      {/* Button Label Optional */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Button Label (Optional)
                        </label>
                        <input
                          type="text"
                          value={button.buttonLabel || ""}
                          onChange={(e) =>
                            updateButton(index, "buttonLabel", e.target.value)
                          }
                          placeholder="Secondary button label"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 transition-all"
                        />
                      </div>

                      {/* Link URL Optional */}
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            <div className="text-center">
              <button
                onClick={addButton}
                className="inline-flex items-center cursor-pointer space-x-2 px-4 py-2 bg-gradient-to-br from-green-400 via-green-500 to-green-600 text-white rounded-lg hover:bg-green-700 active:bg-green-800 transition-all font-medium"
              >
                <Plus className="w-4 h-4" />
                <span>Add Button</span>
              </button>
            </div>
          </div>

          {/* Go Live */}
          <div className="flex justify-end -mt-4 border-t border-green-500 -mr-4 p-2">
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
