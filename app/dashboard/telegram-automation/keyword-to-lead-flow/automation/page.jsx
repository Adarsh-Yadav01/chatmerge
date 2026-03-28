
"use client";
import React, { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  X,
  CircleX,
  Settings,
  SendHorizontal,
  Tag,
  MessageSquare,
  Image as ImageIcon,
  File,
  Link,
  Type,
  Upload,
  Check,
  ArrowRight,
  Sparkles,
  Zap,
  Bot
} from "lucide-react";

// Enhanced ButtonItem component with compact design
const ButtonItem = ({ button, index, updateButton, removeButton }) => {
  const [preview, setPreview] = useState(button.imageAttachment || { url: "", name: "", type: "" });
  const [isExpanded, setIsExpanded] = useState(false);
  const fileRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const attachment = { url, name: file.name, type: file.type };
      setPreview(attachment);
      updateButton(index, "imageAttachment", attachment);
    }
  };

  const handleRemove = () => {
    setPreview({ url: "", name: "", type: "" });
    updateButton(index, "imageAttachment", { url: "", name: "", type: "" });
  };

  const renderFilePreview = (attachment) => {
    if (!attachment.url) return null;
    if (attachment.type.startsWith("image/")) {
      return (
        <div className="relative group">
          <img src={attachment.url} alt="preview" className="w-full h-20 object-cover rounded-lg" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-lg transition-all duration-300" />
        </div>
      );
    }
    return (
      <div className="flex items-center justify-center p-3 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200">
        <File className="w-4 h-4 text-slate-500 mr-2" />
        <div>
          <p className="text-xs font-semibold text-slate-900">{attachment.name}</p>
          <a href={attachment.url} download={attachment.name} className="text-green-600 text-xs hover:underline font-medium">
            Download File
          </a>
        </div>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -15, scale: 0.98 }}
      transition={{ duration: 0.3, type: "spring", bounce: 0.2 }}
      className="group relative"
    >
      <div className="absolute -inset-0.5 bg-gradient-to-r from-green-600 via-green-600 to-cyan-600 rounded-lg blur-sm opacity-20 group-hover:opacity-25 transition duration-300" />
      <div className="relative p-4 bg-white border border-slate-200/60 rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-gradient-to-br from-green-500 to-green-600 rounded-lg">
              <MessageSquare className="w-3 h-3 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-slate-900">Button #{index + 1}</h3>
              <p className="text-xs text-slate-500">Configure action</p>
            </div>
          </div>
          <button
            onClick={() => removeButton(index)}
            className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          {/* Button Name */}
          <div className="space-y-1">
            <label className="flex items-center space-x-1 text-xs font-semibold text-slate-700">
              <Type className="w-3 h-3 text-green-500" />
              <span>Button Name</span>
            </label>
            <input
              type="text"
              value={button.name || ""}
              onChange={(e) => updateButton(index, "name", e.target.value)}
              placeholder="e.g., Get Pricing"
              className="w-full px-2 py-1.5 text-sm bg-slate-50/50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200 placeholder:text-slate-400"
            />
          </div>

          {/* Response Message */}
          <div className="space-y-1">
            <label className="flex items-center space-x-1 text-xs font-semibold text-slate-700">
              <MessageSquare className="w-3 h-3 text-green-500" />
              <span>Response Message</span>
            </label>
            <div className="relative">
              <textarea
                rows={2}
                value={button.response || ""}
                onChange={(e) => updateButton(index, "response", e.target.value)}
                placeholder="Auto response when clicked..."
                className="w-full px-2 py-1.5 text-sm bg-slate-50/50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200 resize-none placeholder:text-slate-400"
              />
              <div className="absolute bottom-1 right-2 text-xs text-slate-400">
                {(button.response || "").length}/300
              </div>
            </div>
          </div>

          {/* Collapsible Advanced Options */}
          <div className="border-t border-slate-100 pt-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center justify-between w-full p-2 bg-slate-50/50 hover:bg-slate-100/50 rounded-lg transition-all duration-200"
            >
              <span className="flex items-center space-x-1 text-xs font-medium text-slate-700">
                <Settings className="w-3 h-3 text-slate-500" />
                <span>Advanced</span>
              </span>
              <motion.div
                animate={{ rotate: isExpanded ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ArrowRight className="w-3 h-3 text-slate-500" />
              </motion.div>
            </button>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-2 space-y-2 overflow-hidden"
                >
                  {/* File Attachment */}
                  <div className="space-y-1">
                    <label className="flex items-center space-x-1 text-xs font-semibold text-slate-700">
                      <ImageIcon className="w-3 h-3 text-green-500" />
                      <span>Attachment</span>
                    </label>
                    <div className="relative">
                      {!preview.url ? (
                        <div
                          onClick={() => fileRef.current.click()}
                          className="border-2 border-dashed border-slate-300 hover:border-green-400 rounded-lg p-4 cursor-pointer transition-all duration-200 hover:bg-green-50/50"
                        >
                          <div className="text-center">
                            <Upload className="w-4 h-4 text-slate-400 mx-auto mb-1" />
                            <p className="text-xs font-medium text-slate-600">Upload file</p>
                          </div>
                        </div>
                      ) : (
                        <div className="relative">
                          {renderFilePreview(preview)}
                          <div className="absolute top-1 right-1 flex space-x-1">
                            <button
                              onClick={handleRemove}
                              className="p-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-all duration-200"
                            >
                              <X className="w-2 h-2" />
                            </button>
                            <button
                              onClick={() => fileRef.current.click()}
                              className="p-1 bg-green-500 text-white rounded-md hover:bg-green-600 transition-all duration-200"
                            >
                              <Upload className="w-2 h-2" />
                            </button>
                          </div>
                        </div>
                      )}
                      <input
                        type="file"
                        ref={fileRef}
                        accept="*/*"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </div>
                  </div>

                  {/* Button Label */}
                  <div className="space-y-1">
                    <label className="flex items-center space-x-1 text-xs font-semibold text-slate-700">
                      <Tag className="w-3 h-3 text-yellow-500" />
                      <span>Label</span>
                    </label>
                    <input
                      type="text"
                      value={button.buttonLabel || ""}
                      onChange={(e) => updateButton(index, "buttonLabel", e.target.value)}
                      placeholder="Button label"
                      className="w-full px-2 py-1.5 text-sm bg-slate-50/50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-yellow-500/20 focus:border-yellow-500 transition-all duration-200 placeholder:text-slate-400"
                    />
                  </div>

                  {/* Link URL */}
                  <div className="space-y-1">
                    <label className="flex items-center space-x-1 text-xs font-semibold text-slate-700">
                      <Link className="w-3 h-3 text-cyan-500" />
                      <span>Link URL</span>
                    </label>
                    <input
                      type="url"
                      value={button.linkUrl || ""}
                      onChange={(e) => updateButton(index, "linkUrl", e.target.value)}
                      placeholder="https://example.com"
                      className="w-full px-2 py-1.5 text-sm bg-slate-50/50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all duration-200 placeholder:text-slate-400"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const WhatsAppKeywordForm = ({
  keywords,
  onKeywordsChange,
  keywordInput,
  onKeywordInputChange,
  anyKeywordMode,
  onAnyKeywordModeChange,
  description,
  onDescriptionChange,
  greetingAttachment,
  onGreetingAttachmentChange,
  buttons,
  onButtonsChange,
}) => {
  const [greetingPreview, setGreetingPreview] = useState(greetingAttachment || { url: "", name: "", type: "" });
  const [currentStep, setCurrentStep] = useState(1);
  const greetingFileRef = useRef(null);

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
      { name: "", response: "", buttonLabel: "", linkUrl: "", imageAttachment: { url: "", name: "", type: "" } },
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

  const handleGreetingFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const attachment = { url, name: file.name, type: file.type };
      setGreetingPreview(attachment);
      onGreetingAttachmentChange(attachment);
    }
  };

  const handleGreetingRemove = () => {
    setGreetingPreview({ url: "", name: "", type: "" });
    onGreetingAttachmentChange({ url: "", name: "", type: "" });
  };

  const renderFilePreview = (attachment) => {
    if (!attachment.url) return null;
    if (attachment.type.startsWith("image/")) {
      return (
        <div className="relative group">
          <img src={attachment.url} alt="preview" className="w-full h-24 object-cover rounded-lg" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-lg transition-all duration-300" />
        </div>
      );
    }
    return (
      <div className="flex items-center justify-center p-3 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200">
        <File className="w-4 h-4 text-slate-500 mr-2" />
        <div>
          <p className="text-xs font-semibold text-slate-900">{attachment.name}</p>
          <a href={attachment.url} download={attachment.name} className="text-green-600 text-xs hover:underline font-medium">
            Download File
          </a>
        </div>
      </div>
    );
  };

  const steps = [
    { id: 1, title: "Keywords", icon: Tag, description: "Set triggers" },
    { id: 2, title: "Response", icon: MessageSquare, description: "Configure greeting" },
    { id: 3, title: "Buttons", icon: Settings, description: "Add actions" },
  ];

  return (
    <div className="min-h-screen p-3">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center space-x-2 p-3 bg-white/80 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg mb-4"
          >
            <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-lg">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-xl font-bold bg-gradient-to-r from-green-600 via-green-600 to-cyan-600 bg-clip-text text-transparent">
                WhatsApp Auto-Reply Bot
              </h1>
              <p className="text-sm text-slate-600 font-medium">Create automated responses</p>
            </div>
          </motion.div>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-2">
            {steps.map((step) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;

              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: step.id * 0.1 }}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-xl border-2 transition-all duration-300 ${isActive
                    ? "bg-gradient-to-r from-green-500 to-green-600 text-white border-transparent shadow-md"
                    : isCompleted
                      ? "bg-green-100 border-green-300 text-green-700"
                      : "bg-white/50 border-slate-200 text-slate-600"
                    }`}
                >
                  <div className={`p-1.5 rounded-lg ${isActive ? "bg-white/20" : isCompleted ? "bg-green-200" : "bg-slate-100"}`}>
                    {isCompleted ? <Check className="w-3 h-3" /> : <Icon className="w-3 h-3" />}
                  </div>
                  <div>
                    <p className="font-semibold text-xs">{step.title}</p>
                    <p className={`text-xs ${isActive ? "text-white/80" : "text-slate-500"}`}>{step.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-3xl mx-auto">
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.4 }}
                className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-6"
              >
                <div className="space-y-6">
                  <div className="text-center">

                    <h2 className="text-lg font-bold text-slate-800 mb-1">Keyword Triggers</h2>
                    <p className="text-sm text-slate-600">Define activation words</p>
                  </div>

                  {/* Any Keyword Toggle */}
                  <div className="flex items-center justify-between p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gradient-to-br from-green-500 to-pink-600 rounded-lg">
                        <Zap className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm text-slate-800">Universal Trigger</h3>
                        <p className="text-xs text-slate-600">Respond to any message</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        onAnyKeywordModeChange(!anyKeywordMode);
                        if (!anyKeywordMode) {
                          onKeywordsChange([]);
                        }
                      }}
                      className={`relative inline-flex h-6 w-12 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-300 ease-in-out ${anyKeywordMode ? "bg-gradient-to-r from-green-500 to-green-600" : "bg-slate-300"
                        }`}
                    >
                      <motion.span
                        animate={{ x: anyKeywordMode ? 24 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="inline-block h-6 w-6 transform rounded-full bg-white shadow-lg"
                      />
                    </button>
                  </div>

                  {/* Keyword Input */}
                  {!anyKeywordMode && (
                    <div className="space-y-3">
                      <div className="flex space-x-2">
                        <div className="flex-1 relative">
                          <input
                            type="text"
                            value={keywordInput}
                            onChange={(e) => onKeywordInputChange(e.target.value)}
                            onKeyPress={handleKeywordKeyPress}
                            placeholder="Enter keywords like 'pricing', 'support'..."
                            className="w-full px-3 py-2 bg-white border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200 placeholder:text-slate-400 text-sm font-medium"
                          />
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <Tag className="w-4 h-4 text-slate-400" />
                          </div>
                        </div>
                        <button
                          onClick={addKeyword}
                          disabled={!keywordInput.trim()}
                          className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      {keywords.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-slate-600">Active Keywords:</p>
                          <div className="flex flex-wrap gap-2">
                            {keywords.map((keyword, index) => (
                              <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="flex items-center space-x-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-2 py-1 rounded-full text-xs font-medium shadow-sm"
                              >
                                <span>{keyword}</span>
                                <button
                                  onClick={() => removeKeyword(index)}
                                  className="p-0.5 hover:bg-white/20 rounded-full transition-colors"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex justify-end">
                    <button
                      onClick={() => setCurrentStep(2)}
                      className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-md hover:shadow-lg text-sm"
                    >
                      <span>Next</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.4 }}
                className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-6"
              >
                <div className="space-y-6">
                  <div className="text-center">

                    <h2 className="text-lg font-bold text-slate-800 mb-1">Greeting Message</h2>
                    <p className="text-sm text-slate-600">Create your auto-reply</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-2">Your Greeting Message</label>
                      <div className="relative">
                        <textarea
                          value={description}
                          onChange={(e) => onDescriptionChange(e.target.value)}
                          placeholder="Hi there! Thanks for reaching out. I'll get back to you as soon as possible..."
                          rows={4}
                          className="w-full px-3 py-2 bg-white border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200 resize-none placeholder:text-slate-400 text-sm"
                        />
                        <div className="absolute bottom-2 right-2 text-xs text-slate-400 bg-slate-50 px-1 py-0.5 rounded">
                          {description.length}/500
                        </div>
                      </div>
                    </div>

                    {/* Greeting Attachment */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-2">Add Attachment (Optional)</label>
                      {!greetingPreview.url ? (
                        <div
                          onClick={() => greetingFileRef.current.click()}
                          className="border-2 border-dashed border-slate-300 hover:border-green-400 rounded-xl p-6 cursor-pointer transition-all duration-200 hover:bg-green-50/50 text-center"
                        >
                          <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                          <p className="text-sm font-medium text-slate-600">Upload file</p>
                          <p className="text-xs text-slate-500 mt-1">Any file type</p>
                        </div>
                      ) : (
                        <div className="relative">
                          {renderFilePreview(greetingPreview)}
                          <div className="absolute top-2 right-2 flex space-x-1">
                            <button
                              onClick={handleGreetingRemove}
                              className="p-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200 shadow-sm"
                            >
                              <X className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => greetingFileRef.current.click()}
                              className="p-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-200 shadow-sm"
                            >
                              <Upload className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      )}

                      <input
                        type="file"
                        ref={greetingFileRef}
                        accept="*/*"
                        className="hidden"
                        onChange={handleGreetingFileChange}
                      />
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="flex items-center space-x-2 px-6 py-3 bg-slate-200 text-slate-700 rounded-2xl font-medium hover:bg-slate-300 transition-all duration-200"
                    >
                      <ArrowRight className="w-4 h-4 rotate-180" />
                      <span>Back</span>
                    </button>
                    <button
                      onClick={() => setCurrentStep(3)}
                      className="flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-green-500 to-pink-600 text-white rounded-2xl font-semibold hover:from-green-600 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      <span>Next</span>
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.4 }}
                className="space-y-8"
              >
                <div className="bg-white/70 backdrop-blur-sm rounded-3xl border border-white/20 shadow-xl p-8">
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center space-x-2 p-4 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl mb-4">
                      <Settings className="w-6 h-6 text-white" />
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Interactive Buttons</h2>
                    <p className="text-slate-600">Create interactive buttons for common user actions</p>
                  </div>

                  <AnimatePresence>
                    {buttons.map((button, index) => (
                      <div key={index} className="mb-6">
                        <ButtonItem
                          button={button}
                          index={index}
                          updateButton={updateButton}
                          removeButton={removeButton}
                        />
                      </div>
                    ))}
                  </AnimatePresence>

                  <div className="text-center">
                    <button
                      onClick={addButton}
                      className="inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-2xl font-semibold hover:from-green-600 hover:to-teal-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 transform"
                    >
                      <Plus className="w-5 h-5" />
                      <span>Add New Button</span>
                    </button>
                  </div>

                  <div className="flex justify-between mt-8 pt-6 border-t border-slate-200">
                    <button
                      onClick={() => setCurrentStep(2)}
                      className="flex items-center space-x-2 px-6 py-3 bg-slate-200 text-slate-700 rounded-2xl font-medium hover:bg-slate-300 transition-all duration-200"
                    >
                      <ArrowRight className="w-4 h-4 rotate-180" />
                      <span>Back</span>
                    </button>

                    <div className="flex space-x-4">
                      <button
                        onClick={() => setCurrentStep(1)}
                        className="px-6 py-3 bg-white border-2 border-slate-300 text-slate-700 rounded-2xl font-medium hover:bg-slate-50 transition-all duration-200"
                      >
                        Review Setup
                      </button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="submit"
                        className="flex items-center space-x-3 px-10 py-4 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-600 text-white rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden group"
                      >
                        <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                        <SendHorizontal className="w-5 h-5 relative z-10" />
                        <span className="relative z-10">Deploy Bot</span>
                        <Sparkles className="w-5 h-5 relative z-10" />
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Summary Panel */}
        {currentStep > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-6 right-6 w-80 bg-white/90 backdrop-blur-sm border border-white/20 rounded-2xl shadow-xl p-4"
          >
            <h3 className="font-bold text-slate-800 mb-2 flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>Quick Summary</span>
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Keywords:</span>
                <span className="font-medium text-slate-800">
                  {anyKeywordMode ? "Any message" : `${keywords.length} keywords`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Greeting:</span>
                <span className="font-medium text-slate-800">
                  {description ? "✓ Ready" : "⚠ Missing"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Buttons:</span>
                <span className="font-medium text-slate-800">{buttons.length} actions</span>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default WhatsAppKeywordForm;



















// "use client";
// import React, { useState, useCallback, useRef } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   Plus,
//   X,
//   CircleX,
//   Settings,
//   SendHorizontal,
//   Tag,
//   AlignVerticalDistributeStart,
//   Image as ImageIcon,
// } from "lucide-react";

// // New ButtonItem component to handle individual button rendering
// const ButtonItem = ({ button, index, updateButton, removeButton }) => {
//   const [preview, setPreview] = useState(button.imageUrl || "");
//   const fileRef = useRef(null);

//   const handleFileChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       const url = URL.createObjectURL(file);
//       setPreview(url);
//       updateButton(index, "imageUrl", url);
//     }
//   };

//   const handleRemove = () => {
//     setPreview("");
//     updateButton(index, "imageUrl", "");
//   };

//   return (
//     <motion.div
//       key={index}
//       initial={{ opacity: 0, height: 0 }}
//       animate={{ opacity: 1, height: "auto" }}
//       exit={{ opacity: 0, height: 0 }}
//       transition={{ duration: 0.3 }}
//       className="p-4 border border-sky-500 rounded-lg space-y-3 bg-black/2"
//     >
//       <div className="flex items-center justify-between">
//         <h3 className="font-medium text-gray-900">When This Button is Pressed:</h3>
//         <button
//           onClick={() => removeButton(index)}
//           className="text-red-500 hover:text-red-700 cursor-pointer transition-colors hover:scale-110"
//         >
//           <X className="w-5 h-5" />
//         </button>
//       </div>

//       <div className="grid grid-cols-1 md:grid-row-3 gap-3">
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">
//             Button Label Name
//           </label>
//           <input
//             type="text"
//             value={button.name || ""}
//             onChange={(e) => updateButton(index, "name", e.target.value)}
//             placeholder="Name of button"
//             className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 transition-all"
//           />
//         </div>
//         <h3 className="font-medium text-gray-700 mt-8">
//           Then these messages will now be sent to the user:
//         </h3>

//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">
//             Description Message
//           </label>
//           <textarea
//             rows={3}
//             value={button.response || ""}
//             onChange={(e) => updateButton(index, "response", e.target.value)}
//             placeholder="Message when clicked"
//             className="w-full p-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 resize-none transition-all"
//           />
//         </div>

//         <div className="mt-4">
//           <label className="block text-sm font-medium text-gray-700 mb-1">
//             Button Image (Optional)
//           </label>
//           <div className="relative border-2 border-dashed rounded-lg cursor-pointer p-6 flex flex-col items-center justify-center text-gray-500 hover:border-sky-400 transition">
//             {!preview && (
//               <>
//                 <ImageIcon
//                   onClick={() => fileRef.current.click()}
//                   className="w-8 h-8 mb-2 cursor-pointer text-sky-500"
//                 />
//                 <button
//                   type="button"
//                   onClick={() => fileRef.current.click()}
//                   className="text-sky-600 cursor-pointer hover:underline"
//                 >
//                   Upload image
//                 </button>
//               </>
//             )}

//             {preview && (
//               <div className="w-full text-center relative">
//                 <img
//                   src={preview}
//                   alt="preview"
//                   className="mx-auto mb-3 max-h-40 rounded-lg"
//                 />
//                 <button
//                   type="button"
//                   onClick={handleRemove}
//                   className="absolute top-0 right-0 text-red-500 hover:text-red-700 p-1 cursor-pointer rounded-full hover:bg-red-50 transition-colors hover:scale-110"
//                 >
//                   <X className="w-4 h-4" />
//                 </button>
//                 <button
//                   type="button"
//                   onClick={() => fileRef.current.click()}
//                   className="text-sky-600 cursor-pointer hover:underline mt-2 block"
//                 >
//                   Choose another image
//                 </button>
//               </div>
//             )}

//             <input
//               type="file"
//               ref={fileRef}
//               accept="image/*"
//               className="hidden"
//               onChange={handleFileChange}
//             />
//           </div>
//         </div>

//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">
//             Button Label Name (Optional)
//           </label>
//           <input
//             type="text"
//             value={button.buttonLabel || ""}
//             onChange={(e) => updateButton(index, "buttonLabel", e.target.value)}
//             placeholder="Label for button"
//             className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 transition-all"
//           />
//         </div>

//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">
//             Add a Link URL (Optional)
//           </label>
//           <input
//             type="url"
//             value={button.linkUrl || ""}
//             onChange={(e) => updateButton(index, "linkUrl", e.target.value)}
//             placeholder="https://example.com"
//             className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 transition-all"
//           />
//         </div>
//       </div>
//     </motion.div>
//   );
// };

// const WhatsAppKeywordForm = ({
//   keywords,
//   onKeywordsChange,
//   keywordInput,
//   onKeywordInputChange,
//   anyKeywordMode,
//   onAnyKeywordModeChange,
//   description,
//   onDescriptionChange,
//   greetingImage,
//   onGreetingImageChange,
//   buttons,
//   onButtonsChange,
// }) => {
//   const [greetingPreview, setGreetingPreview] = useState(greetingImage || "");
//   const greetingFileRef = useRef(null);

//   const addKeyword = useCallback(() => {
//     if (keywordInput.trim() && !keywords.includes(keywordInput.trim())) {
//       onKeywordsChange([...keywords, keywordInput.trim()]);
//       onKeywordInputChange("");
//     }
//   }, [keywords, keywordInput, onKeywordsChange, onKeywordInputChange]);

//   const removeKeyword = useCallback(
//     (indexToRemove) => {
//       onKeywordsChange(keywords.filter((_, index) => index !== indexToRemove));
//     },
//     [keywords, onKeywordsChange]
//   );

//   const addButton = useCallback(() => {
//     onButtonsChange([
//       ...buttons,
//       { name: "", response: "", buttonLabel: "", linkUrl: "", imageUrl: "" },
//     ]);
//   }, [buttons, onButtonsChange]);

//   const updateButton = useCallback(
//     (index, field, value) => {
//       const updatedButtons = buttons.map((button, i) =>
//         i === index ? { ...button, [field]: value } : button
//       );
//       onButtonsChange(updatedButtons);
//     },
//     [buttons, onButtonsChange]
//   );

//   const removeButton = useCallback(
//     (index) => {
//       onButtonsChange(buttons.filter((_, i) => i !== index));
//     },
//     [buttons, onButtonsChange]
//   );

//   const handleKeywordKeyPress = useCallback(
//     (e) => {
//       if (e.key === "Enter") {
//         addKeyword();
//       }
//     },
//     [addKeyword]
//   );

//   const handleGreetingFileChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       const url = URL.createObjectURL(file);
//       setGreetingPreview(url);
//       onGreetingImageChange(url);
//     }
//   };

//   const handleGreetingRemove = () => {
//     setGreetingPreview("");
//     onGreetingImageChange("");
//   };

//   return (
//     <div className="max-w-4xl mx-auto border-2 rounded-2xl bg-white shadow-lg">
//       <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
//         <div className="text-center bg-gray-100 rounded-t-2xl p-2">
//           <h2 className="text-3xl font-bold bg-gradient-to-r from-green-500 via-indigo-500 to-cyan-500 bg-clip-text text-transparent">
//             Auto Reply to frequent requests
//           </h2>
//           <p className="text-sm text-gray-600 mt-2">
//             Configure keywords and DM settings for automatic Message sending.
//           </p>
//         </div>

//         <div className="p-6 space-y-8">
//           <div className="space-y-4">
//             <div className="flex items-center space-x-2">
//               <Tag className="w-5 h-5 text-sky-500" />
//               <h2 className="text-lg font-medium text-gray-900">
//                 Keywords Setup: When Users Send These Keywords
//               </h2>
//             </div>

//             <div className="space-y-3">
//               <div className="flex space-x-2">
//                 <input
//                   type="text"
//                   value={keywordInput}
//                   onChange={(e) => onKeywordInputChange(e.target.value)}
//                   onKeyPress={handleKeywordKeyPress}
//                   placeholder="Enter specific or multiple keywords..."
//                   disabled={anyKeywordMode}
//                   className={`flex-1 p-2 text-base font-semibold border rounded focus:outline-none focus:ring-1 focus:ring-sky-500 ${anyKeywordMode
//                       ? "bg-gray-100 text-gray-500 cursor-not-allowed"
//                       : "bg-white"
//                     }`}
//                 />
//                 <button
//                   onClick={addKeyword}
//                   disabled={anyKeywordMode || !keywordInput.trim()}
//                   className={`px-4 py-2 rounded-lg font-medium transition-all ${anyKeywordMode || !keywordInput.trim()
//                       ? "bg-gray-300 text-gray-500 cursor-not-allowed"
//                       : "bg-gradient-to-br from-sky-400 via-sky-500 to-sky-600 text-white cursor-pointer hover:bg-sky-700"
//                     }`}
//                 >
//                   Add Keyword
//                 </button>
//               </div>

//               {keywords.length > 0 && (
//                 <div className="flex flex-wrap gap-2">
//                   {keywords.map((keyword, index) => (
//                     <div
//                       key={index}
//                       className="flex gap-2 items-center bg-gradient-to-br from-sky-400 via-sky-500 to-sky-600 text-white text-md font-medium px-4 py-1 rounded-full"
//                     >
//                       <span>{keyword}</span>
//                       <button
//                         onClick={() => removeKeyword(index)}
//                         className="rounded-full p-0.5 transition-colors"
//                       >
//                         <CircleX className="w-4 h-4 text-white hover:text-black/50 cursor-pointer" />
//                       </button>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>

//             <div className="flex items-center mt-6 justify-between p-4 bg-gray-50 rounded-lg border shadow-sm">
//               <div>
//                 <h3 className="font-medium text-gray-900">Accept Any Keyword</h3>
//                 <p className="text-sm text-gray-600">
//                   Allow users to send any keyword to trigger the bot
//                 </p>
//               </div>
//               <button
//                 onClick={() => {
//                   onAnyKeywordModeChange(!anyKeywordMode);
//                   if (!anyKeywordMode) {
//                     onKeywordsChange([]);
//                   }
//                 }}
//                 className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${anyKeywordMode ? "bg-sky-500" : "bg-gray-300"}`}
//               >
//                 <span
//                   className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${anyKeywordMode ? "translate-x-5" : "translate-x-0"}`}
//                 />
//               </button>
//             </div>
//           </div>

//           <div className="space-y-4 mt-12">
//             <div className="flex items-center space-x-2">
//               <Settings className="w-5 h-5 text-sky-600" />
//               <h2 className="text-lg font-medium text-gray-900">
//                 Keyword Response: Greeting Message
//               </h2>
//             </div>

//             <textarea
//               value={description}
//               onChange={(e) => onDescriptionChange(e.target.value)}
//               placeholder="Enter your greeting message for users..."
//               rows={4}
//               className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 resize-none transition-all"
//             />

//             <div className="mt-4">
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Greeting Image (Optional)
//               </label>
//               <div className="relative border-2 border-dashed rounded-lg cursor-pointer p-6 flex flex-col items-center justify-center text-gray-500 hover:border-sky-400 transition">
//                 {!greetingPreview && (
//                   <>
//                     <ImageIcon
//                       onClick={() => greetingFileRef.current.click()}
//                       className="w-8 h-8 mb-2 cursor-pointer text-sky-500"
//                     />
//                     <button
//                       type="button"
//                       onClick={() => greetingFileRef.current.click()}
//                       className="text-sky-600 cursor-pointer hover:underline"
//                     >
//                       Upload image
//                     </button>
//                   </>
//                 )}

//                 {greetingPreview && (
//                   <div className="w-full text-center relative">
//                     <img
//                       src={greetingPreview}
//                       alt="preview"
//                       className="mx-auto mb-3 max-h-40 rounded-lg"
//                     />
//                     <button
//                       type="button"
//                       onClick={handleGreetingRemove}
//                       className="absolute top-0 right-0 text-red-500 hover:text-red-700 p-1 cursor-pointer rounded-full hover:bg-red-50 transition-colors hover:scale-110"
//                     >
//                       <X className="w-4 h-4" />
//                     </button>
//                     <button
//                       type="button"
//                       onClick={() => greetingFileRef.current.click()}
//                       className="text-sky-600 cursor-pointer hover:underline mt-2 block"
//                     >
//                       Choose another image
//                     </button>
//                   </div>
//                 )}

//                 <input
//                   type="file"
//                   ref={greetingFileRef}
//                   accept="image/*"
//                   className="hidden"
//                   onChange={handleGreetingFileChange}
//                 />
//               </div>
//             </div>
//           </div>

//           <div className="space-y-4">
//             <div className="flex items-center space-x-2">
//               <AlignVerticalDistributeStart className="w-5 h-5 text-sky-600" />
//               <h2 className="text-lg font-medium text-gray-900">
//                 Add functionality to each button to trigger its specific message
//                 action.
//               </h2>
//             </div>

//             <AnimatePresence>
//               {buttons.map((button, index) => (
//                 <ButtonItem
//                   key={index}
//                   button={button}
//                   index={index}
//                   updateButton={updateButton}
//                   removeButton={removeButton}
//                 />
//               ))}
//             </AnimatePresence>

//             <div className="text-center">
//               <button
//                 onClick={addButton}
//                 className="inline-flex items-center cursor-pointer space-x-2 px-4 py-2 bg-gradient-to-br from-sky-400 via-sky-500 to-sky-600 text-white rounded-lg hover:bg-sky-700 active:bg-sky-800 transition-all font-medium"
//               >
//                 <Plus className="w-4 h-4" />
//                 <span>Add Button</span>
//               </button>
//             </div>
//           </div>

//           <div className="flex justify-end -mt-4 border-t border-sky-500 -mr-4 p-2">
//             <button
//               type="submit"
//               className="flex items-center px-8 py-2 rounded-lg cursor-pointer mr-2 font-medium transition-all duration-200 ease-in-out transform active:translate-y-1 active:shadow-inner hover:scale-105 bg-gradient-to-br from-green-400 via-green-500 to-green-600 text-white shadow-md hover:shadow-lg"
//             >
//               <SendHorizontal className="w-5 h-5 mr-2" />
//               Go Live
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default WhatsAppKeywordForm;