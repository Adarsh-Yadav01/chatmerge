"use client";
import React, { useState, useCallback } from "react";
import Automation from "./page";
import PreviewBoxWa from "../../../../components/PreviewBoxWaRequest";

export default function AutoDMCommentLinkPage() {
  const [keywords, setKeywords] = useState([]);
  const [keywordInput, setKeywordInput] = useState("");
  const [anyKeywordMode, setAnyKeywordMode] = useState(false);
  const [description, setDescription] = useState("👋 Hi, ! Thanks for reaching out! We're happy to assist you, and we can't wait to get started.");
  const [subDescription, setSubDescription] = useState("Please select one of the options available:");
  const [menuButtonLabel, setMenuButtonLabel] = useState(" Open Menu");
  const [buttons, setButtons] = useState([
    { name: "🚨 Report an Issue", response: "Uh-oh! 😲 We are sorry to hear that you have a problem. Please tell us more about what's going on. ", buttonLabel: "", linkUrl: "" },
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
          subDescription={subDescription}
          onSubDescriptionChange={setSubDescription}
          menuButtonLabel={menuButtonLabel}
          onMenuButtonLabelChange={setMenuButtonLabel}
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
          <PreviewBoxWa
            keywords={keywords}
            anyKeywordMode={anyKeywordMode}
            description={description}
            subDescription={subDescription}
            menuButtonLabel={menuButtonLabel}
            buttons={buttons}
          />
        </div>
      </div>
    </div>
  );
}
