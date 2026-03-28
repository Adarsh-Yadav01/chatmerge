"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { CircleX, SendHorizontal } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
const Automation = ({
  onKeywordsChange = () => {},
  onLinkDescriptionChange = () => {},
  onLinkButtonLabelChange = () => {},
}) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const [keyword, setKeyword] = useState("");
  const [keywords, setKeywords] = useState([]);
  const [linkDescription, setLinkDescription] = useState("Write a message");
  const [linkButtonLabel, setLinkButtonLabel] = useState("");
  const [dmLink, setDmLink] = useState("");
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [formId, setFormId] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/api/auth/signin");
    } else if (status === "authenticated" && params.id) {
      setIsEditing(true);
      fetchDmSetting(params.id);
    }
  }, [status, router, params.id]);

  const fetchDmSetting = async (id) => {
    try {
      const res = await fetch(`/api/instagram/dm-settings/${id}`);
      if (res.ok) {
        const data = await res.json();
        setKeywords(data.keywords || []);
        setLinkDescription(data.dmMessage || "Write a message");
        setDmLink(data.dmLink || "");
        setLinkButtonLabel(data.dmLinkButtonLabel || "");
        setFormId(data.id || "");
        onKeywordsChange(data.keywords || []);
        onLinkDescriptionChange(data.dmMessage || "Write a message");
        onLinkButtonLabelChange(data.dmLinkButtonLabel || "");
      } else {
        setError("Failed to fetch DM setting");
      }
    } catch (err) {
      setError("An error occurred while fetching DM setting");
    }
  };

  const handleAddKeyword = () => {
    const trimmed = keyword.trim();
    if (trimmed && !keywords.includes(trimmed)) {
      const newKeywords = [trimmed, ...keywords];
      setKeywords(newKeywords);
      setKeyword("");
      onKeywordsChange(newKeywords);
    }
  };

  const handleRemoveKeyword = (index) => {
    const newKeywords = keywords.filter((_, i) => i !== index);
    setKeywords(newKeywords);
    onKeywordsChange(newKeywords);
  };

  const handleLinkDescriptionChange = (e) => {
    setLinkDescription(e.target.value);
    onLinkDescriptionChange(e.target.value);
  };

  const handleLinkButtonLabelChange = (e) => {
    setLinkButtonLabel(e.target.value);
    onLinkButtonLabelChange(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitted(true);

    if (keywords.length === 0) {
      toast.error("At least one keyword is required", {
        position: "top-center",
      });
      return;
    }
    if (!linkDescription.trim()) {
      toast.error("DM message is required", { position: "top-center" });
      return;
    }

    const payload = {
      keywords,
      dmMessage: linkDescription,
      dmLink,
      dmLinkButtonLabel: linkButtonLabel || "",
    };

    try {
      const url = isEditing
        ? `/api/instagram/dm-settings/${formId}`
        : "/api/instagram/dm-settings";
      const method = isEditing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.message || "Failed to save DM setting");
        toast.error(data.message || "Failed to save DM setting", {
          position: "top-center",
        });
      } else {
        setKeywords([]);
        setLinkDescription("Write a message");
        setDmLink("");
        setLinkButtonLabel("");
        setIsEditing(false);
        setFormId("");
        setIsSubmitted(false);
        toast.success(
          isEditing
            ? "Your DM automation updated successfully"
            : "Your DM automation added successfully",
          { position: "top-center" }
        );
        router.push("/dashboard/instagram-automation/respond-to-all-your-dm");
      }
    } catch (err) {
      setError("An error occurred while saving DM setting");
      toast.error("An error occurred while saving DM setting", {
        position: "top-center",
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto border-2 rounded-2xl bg-white shadow-lg">
      <Toaster position="top-center" />
      <div className="text-center bg-gray-100 rounded-t-2xl p-2">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 bg-clip-text text-transparent">
          Automated DM Link Sender
        </h2>
        <p className="text-sm text-gray-600 mt-2">
          Configure keywords and DM settings for automatic link sending.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 p-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            When someone DMs you with
          </h3>
          <div className="flex items-center space-x-2 mt-2">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onBlur={handleAddKeyword}
              placeholder="Enter a specific word or words"
              className={`flex-1 p-2 text-base font-semibold border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                isSubmitted && keywords.length === 0
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
            />
            <button
              onClick={handleAddKeyword}
              disabled={!keyword.trim()}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                keyword.trim()
                  ? "bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 text-white cursor-pointer hover:bg-blue-700"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              Add Keyword
            </button>
          </div>
          <div className="flex flex-wrap gap-3 mt-4">
            {keywords.map((kw, index) => (
              <div
                key={index}
                className="flex items-center bg-gradient-to-r from-purple-500 to-pink-500 text-white text-md font-medium px-4 py-1 rounded-full"
              >
                {kw}
                <button
                  onClick={() => handleRemoveKeyword(index)}
                  className="ml-2 focus:outline-none"
                >
                  <CircleX className="w-4 h-4 text-white hover:text-black/50 cursor-pointer" />
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col">
          <div className="text-center bg-gray-50 border rounded-t-xl p-3">
            <h3 className="text-lg font-semibold bg-gradient-to-r from-black via-black/70 to-black/80 bg-clip-text text-transparent">
              They’ll get a DM back from you with a link
            </h3>
          </div>
          <div className="flex-1 bg-white p-4 rounded-b-lg shadow-md border border-gray-200">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Link Description
                </label>
                <textarea
                  className={`w-full p-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                    isSubmitted && !linkDescription.trim()
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  rows="3"
                  value={linkDescription}
                  onChange={handleLinkDescriptionChange}
                  placeholder="Write a Message..."
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Button Label
                </label>
                <input
                  type="text"
                  className="w-full p-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 border-gray-300"
                  value={linkButtonLabel}
                  onChange={handleLinkButtonLabelChange}
                  placeholder="Add a button label e.g Open"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  DM Link Url
                </label>
                <input
                  type="url"
                  value={dmLink}
                  onChange={(e) => setDmLink(e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 border-gray-300"
                  placeholder="https://example.com"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end -mt-4 -mr-4 p-2">
          <button
            type="submit"
            className={`flex items-center px-8 py-2 rounded-lg cursor-pointer mr-2 font-medium transition-all duration-200 ease-in-out transform active:translate-y-1 active:shadow-inner hover:scale-105 ${
              keywords.length === 0 || !linkDescription.trim()
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-gradient-to-br from-green-400 via-green-500 to-green-600 text-white shadow-md hover:shadow-lg"
            }`}
          >
            <SendHorizontal className="w-5 h-5 mr-2" />
            {isEditing ? "Changes Go Live" : "Go Live"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Automation;
