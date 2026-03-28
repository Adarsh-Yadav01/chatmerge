"use client";
import React, { useState, useCallback } from "react";
import Automation from "./page";
import PreviewBoxTgredirect from "../../../../components/PreviewBoxTgredirect";

export default function AutoDMCommentLinkPage() {
  const [keywords, setKeywords] = useState([]);
  const [keywordInput, setKeywordInput] = useState("website");
  const [anyKeywordMode, setAnyKeywordMode] = useState(false);
  const [description, setDescription] = useState("Hey {{first_name}}! 👋 Excited you are interested in our products 💬You can find all information about all items on our website by clicking the link below 🙌");
  const [buttons, setButtons] = useState([
    { name: "Go to Website", response: "🌶️ You can always find our hottest offers on this page: https://strch.quickshift.in/track", buttonLabel: "", linkUrl: "" },
  ]);

  const handleKeywordsChange = useCallback((newKeywords) => {
    setKeywords(newKeywords);
  }, []);

  const handleKeywordInputChange = useCallback((value) => {
    setKeywordInput(value);
  }, []);

  const handleAnyKeywordModeChange = useCallback((newMode) => {
    setAnyKeywordMode(newMode);
  }, []);

  const handleDescriptionChange = useCallback((value) => {
    setDescription(value);
  }, []);

  const handleButtonsChange = useCallback((newButtons) => {
    setButtons(newButtons);
  }, []);

  return (
    <div className="flex flex-col lg:flex-row p-2">
      <div className="flex-1 lg:order-1 lg:w-[600px]">
        <Automation
          keywords={keywords}
          onKeywordsChange={handleKeywordsChange}
          keywordInput={keywordInput}
          onKeywordInputChange={handleKeywordInputChange}
          anyKeywordMode={anyKeywordMode}
          onAnyKeywordModeChange={handleAnyKeywordModeChange}
          description={description}
          onDescriptionChange={handleDescriptionChange}
          buttons={buttons}
          onButtonsChange={handleButtonsChange}
        />
      </div>
      <div className="w-full lg:w-[400px] lg:order-2">
        <div className="p-2 lg:fixed lg:right-2 lg:top-5 lg:w-[400px]">
          <PreviewBoxTgredirect
            keywords={keywords}
            anyKeywordMode={anyKeywordMode}
            description={description}
            buttons={buttons}
          />    
        </div>
      </div>
    </div>
  );
}