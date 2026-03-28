"use client";
import React, { useState, useEffect, useCallback } from "react";
import Automation from "./page";
import PreviewBoxPublish from "../../../../components/PreviewBoxPublish";


export default function AutoDMCommentLinkPage() {
  const [selectedPost, setSelectedPost] = useState(null);
  const [allPostsSelected, setAllPostsSelected] = useState(false);

  const handlePostSelect = useCallback((post) => {
    console.log("🎯 handlePostSelect called with:", post);
    setSelectedPost(post);
    setAllPostsSelected(false);
  }, []);

  const handleToggleAllPosts = useCallback((isEnabled) => {
    console.log("🔄 handleToggleAllPosts called with:", isEnabled);
    setAllPostsSelected(isEnabled);
    setSelectedPost(isEnabled ? { id: "all" } : null);
  }, []);

  // Debug current state
  useEffect(() => {
    console.log("🏠 Main component state:", {
      selectedPost,
      allPostsSelected,
      hasSelectedPost: !!selectedPost
    });
  }, [selectedPost, allPostsSelected]);

  return (
    <div className="flex flex-col lg:flex-row p-2">
      <div className="flex-1 lg:order-1 lg:w-[600px]">
        <Automation onPostSelect={handlePostSelect} onToggleAllPosts={handleToggleAllPosts} />
      </div>
      <div className="w-full lg:w-[400px] lg:order-2">
        <div className="p-2 lg:fixed lg:right-2 lg:top-2 lg:w-[400px]">
          <PreviewBoxPublish selectedPost={selectedPost} allPostsSelected={allPostsSelected} />
        </div>
      </div>
    </div>
  );
}