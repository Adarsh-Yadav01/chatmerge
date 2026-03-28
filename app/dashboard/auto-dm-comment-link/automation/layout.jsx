"use client";
// In AutoDMCommentLinkPage component
import React, { useState, useMemo, useCallback } from "react";
import Automation from "../automation/page";
import PreviewBox from "../../../components/PreviewBox";

export default function AutoDMCommentLinkPage() {
  const [selectedPost, setSelectedPost] = useState(null); // Change from selectedPostId to selectedPost
  const [allPostsSelected, setAllPostsSelected] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [keywords, setKeywords] = useState([]);
  const [enabledAnyWord, setEnabledAnyWord] = useState(false);
  const [enabledPublicReply, setEnabledPublicReply] = useState(true);
  const [messages, setMessages] = useState({
    1: "Hey! Check your DM",
    2: "Check your inbox, details sent 💬",
    3: "Nice! Check your DMs!",
  });
  const [selectedMessages, setSelectedMessages] = useState([1]);
  const [openingMessage, setOpeningMessage] = useState(
    "Hey there! I’m so happy you’re here, thanks so much for your interest 😊\n\nClick below and I’ll send you the link in just a sec ✨"
  );
  const [openingButtonLabel, setOpeningButtonLabel] =
    useState("Send me the link");
  const [linkDescription, setLinkDescription] = useState("Write a message");
  const [linkButtonLabel, setLinkButtonLabel] = useState("");
  const [dmLink, setDmLink] = useState("");

  const handlePostSelect = useCallback((post) => {
    setSelectedPost((prev) => {
      if (JSON.stringify(prev) !== JSON.stringify(post)) {
        return {
          id: post.id,
          media_url: post.media_url,
          media_type: post.media_type,
        }; // Include media_type
      }
      return prev;
    });
    setAllPostsSelected(false);
  }, []);

  const handleToggleAllPosts = useCallback((isEnabled) => {
    setAllPostsSelected(isEnabled);
    setSelectedPost(isEnabled ? { id: "all" } : null); // Update to set selectedPost
  }, []);

  const handleStepChange = useCallback((step) => {
    setCurrentStep(step);
  }, []);

  const handleKeywordsChange = useCallback((newKeywords) => {
    setKeywords((prev) => {
      if (JSON.stringify(prev) !== JSON.stringify(newKeywords)) {
        return newKeywords;
      }
      return prev;
    });
  }, []);

  const handleEnabledAnyWordChange = useCallback((isEnabled) => {
    setEnabledAnyWord(isEnabled);
  }, []);

  const handleEnabledPublicReplyChange = useCallback((isEnabled) => {
    setEnabledPublicReply(isEnabled);
  }, []);

  const handleMessageChange = useCallback((messageId, value) => {
    setMessages((prev) => ({
      ...prev,
      [messageId]: value,
    }));
  }, []);

  const handleToggleMessage = useCallback((messageId) => {
    setSelectedMessages((prev) =>
      prev.includes(messageId) ? [] : [messageId]
    );
  }, []);

  const handleOpeningMessageChange = useCallback((value) => {
    setOpeningMessage(value);
  }, []);

  const handleOpeningButtonLabelChange = useCallback((value) => {
    setOpeningButtonLabel(value);
  }, []);

  const handleLinkDescriptionChange = useCallback((value) => {
    setLinkDescription(value);
  }, []);

  const handleLinkButtonLabelChange = useCallback((value) => {
    setLinkButtonLabel(value);
  }, []);

  const handleDmLinkChange = useCallback((value) => {
    setDmLink(value);
  }, []);

  const stableSelectedPost = useMemo(() => selectedPost, [selectedPost]);

  return (
    <div className="flex flex-col lg:flex-row p-2">
      <div className="flex-1 lg:order-1 lg:w-[600px]">
        <Automation
          onPostSelect={handlePostSelect}
          onToggleAllPosts={handleToggleAllPosts}
          currentStep={currentStep}
          onStepChange={handleStepChange}
          onKeywordsChange={handleKeywordsChange}
          onEnabledAnyWordChange={handleEnabledAnyWordChange}
          onEnabledPublicReplyChange={handleEnabledPublicReplyChange}
          onMessageChange={handleMessageChange}
          onToggleMessage={handleToggleMessage}
          openingMessage={openingMessage}
          onOpeningMessageChange={handleOpeningMessageChange}
          openingButtonLabel={openingButtonLabel}
          onOpeningButtonLabelChange={handleOpeningButtonLabelChange}
          linkDescription={linkDescription}
          onLinkDescriptionChange={handleLinkDescriptionChange}
          linkButtonLabel={linkButtonLabel}
          onLinkButtonLabelChange={handleLinkButtonLabelChange}
          dmLink={dmLink}
          onDmLinkChange={handleDmLinkChange}
        />
      </div>
      <div className="w-full lg:w-[400px] lg:order-2">
        <div className="p-2 lg:fixed lg:right-2 lg:-top-3 lg:w-[400px]">
          <PreviewBox
            selectedPost={stableSelectedPost} // Pass selectedPost instead of selectedPostId
            currentStep={currentStep}
            keywords={keywords}
            enabledAnyWord={enabledAnyWord}
            enabledPublicReply={enabledPublicReply}
            messages={messages}
            selectedMessages={selectedMessages}
            openingMessage={openingMessage}
            openingButtonLabel={openingButtonLabel}
            linkDescription={linkDescription}
            linkButtonLabel={linkButtonLabel}
            dmLink={dmLink}
          />
        </div>
      </div>
    </div>
  );
}
