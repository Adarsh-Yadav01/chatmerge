"use client";
import React, { useState, useMemo, useCallback } from "react";
import Automation from "../automation/page";
import PreviewBox from "../../../components/PreviewBoxDm";

export default function RespondToAllYourDMPage() {
  const [keywords, setKeywords] = useState([]);
  const [linkDescription, setLinkDescription] = useState("Write a message");
  const [linkButtonLabel, setLinkButtonLabel] = useState("");
  const [dmLink, setDmLink] = useState("");

  const handleKeywordsChange = useCallback((newKeywords) => {
    setKeywords(newKeywords);
  }, []);

  const handleLinkDescriptionChange = useCallback((newDescription) => {
    setLinkDescription(newDescription);
  }, []);

  const handleLinkButtonLabelChange = useCallback((newLabel) => {
    setLinkButtonLabel(newLabel);
  }, []);

  const handleDmLinkChange = useCallback((newLink) => {
    setDmLink(newLink);
  }, []);

  const messages = useMemo(
    () => ({
      linkDescription,
      linkButtonLabel,
    }),
    [linkDescription, linkButtonLabel]
  );

  return (
    <div className="flex flex-col lg:flex-row p-2">
      <div className="flex-1 lg:order-1 lg:w-[600px]">
        <Automation
        onKeywordsChange={handleKeywordsChange}
  onLinkDescriptionChange={handleLinkDescriptionChange}
  onLinkButtonLabelChange={handleLinkButtonLabelChange}
  onDmLinkChange={handleDmLinkChange}
        />
      </div>
      <div className="w-full lg:w-[400px] lg:order-2">
        <div className="p-2 lg:fixed lg:right-2 lg:-top-3 lg:w-[400px]">
          <PreviewBox
            messages={messages}
            keywords={keywords}
            dmLink={dmLink}
          />
        </div>
      </div>
    </div>
  );
}