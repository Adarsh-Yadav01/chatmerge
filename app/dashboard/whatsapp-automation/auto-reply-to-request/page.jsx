"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  Edit,
  Trash2,
  ExternalLink,
  MessageCircle,
  MessageSquareReply,
  Plus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import texture from "../../../../public/texture.jpg";
import whatsapplogo from "../../../../public/whatlogo.png";
import v2 from "../../../../public/v2.png";
import { Suspense } from "react";
import Loader from "../../../components/Loader";
import toast, { Toaster } from "react-hot-toast";

export default function AutomaticReplyPage() {
  const [mediaList, setMediaList] = useState([]);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [commentData, setCommentData] = useState({
    hasComments: false,
    commentCount: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const itemsPerPage = 8;
  const totalItems = mediaList.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = mediaList.slice().reverse().slice(startIndex, endIndex);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleDelete = (mediaId) => {
    setDeleteId(mediaId);
    setShowDeletePopup(true);
  };

  const confirmDelete = () => {
    setMediaList((prev) => prev.filter((media) => media.mediaId !== deleteId));
    toast.success(
      commentData.hasComments
        ? `Media and ${commentData.commentCount} related comment(s) deleted successfully`
        : "Media deleted successfully",
      { position: "top-center" }
    );
    setShowDeletePopup(false);
    setDeleteId(null);
  };

  const handleEdit = (media) => {
    // Navigate to edit page
  };

  const cancelDelete = () => {
    setShowDeletePopup(false);
    setDeleteId(null);
  };

  const formatDate = (createdAt) => {
    if (!createdAt || isNaN(new Date(createdAt).getTime())) return "N/A";
    return new Date(createdAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <>
      <Suspense fallback={<Loader />}>
        <Toaster position="top-center" />
        <div className="max-w-6xl mx-auto">
          <div className="bg-gray-50 rounded-2xl lg:rounded-4xl  overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-4 items-center min-h-[400px] lg:min-h-[610px]">
              <div className="order-2 lg:order-1 p-4 sm:px-8 space-y-4 lg:space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-green-400 to-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Image
                      src={whatsapplogo}
                      alt="whatsapp logo"
                      width={32}
                      height={32}
                      className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
                    />
                  </div>
                  <span className="text-sm sm:text-base font-medium text-gray-600">
                    WhatsApp
                  </span>
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-3xl xl:text-3xl font-bold text-gray-900 leading-tight">
                    Set common automatic reply
                  </h1>
                </div>
                <div className="space-y-3 sm:space-y-4">
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900">
                    How does it work?
                  </h2>
                  <p className="text-sm sm:text-base lg:text-lg text-gray-700 leading-relaxed">
                    Answering each customer manually can be super overwhelming,
                    especially during the high season or sales periods. Luckily,
                    our keyword automation feature helps you handle most of it,
                    especially in cases of the most typical questions. Reply
                    instantly to your customers with helpful information and
                    save time spent chatting with customers manually.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 pt-4 sm:pt-6 px-2">
                  <Link
                    href="/dashboard/whatsapp-automation/auto-reply-to-request/automation/"
                    className="relative inline-flex items-center justify-center px-3 py-1 sm:px-4 sm:py-2 border-2 hover:border-blue-400 overflow-hidden font-medium transition-all bg-gradient-to-b from-blue-300 via-blue-400 to-blue-500 rounded-xl sm:rounded-2xl hover:bg-white group w-full sm:w-auto"
                  >
                    <span className="absolute inset-0 border-0 group-hover:border-[15px] sm:group-hover:border-[40px] ease-linear duration-200 transition-all border-white rounded-xl sm:rounded-2xl"></span>
                    <span className="relative w-full text-center sm:text-left text-white transition-colors duration-200 ease-in-out group-hover:text-blue-500 text-sm sm:text-base">
                      Set Up Template & Start Automation
                    </span>
                  </Link>
                  <button
                    onClick={() =>
                      document
                        .getElementById("automation-history")
                        .scrollIntoView({ behavior: "smooth" })
                    }
                    className="relative cursor-pointer inline-flex items-center justify-center px-3 py-1 sm:px-4 sm:py-2 border-2 hover:border-green-400 overflow-hidden font-medium transition-all bg-gradient-to-b from-green-400 via-green-500 to-green-600 rounded-xl sm:rounded-2xl hover:bg-white group w-full sm:w-auto"
                  >
                    <span className="absolute inset-0 border-0 group-hover:border-[15px] sm:group-hover:border-[40px] ease-linear duration-200 transition-all border-white rounded-xl sm:rounded-2xl"></span>
                    <span className="relative w-full text-center sm:text-left text-white transition-colors duration-200 ease-in-out group-hover:text-green-500 text-sm sm:text-base">
                      Automation History
                    </span>
                  </button>
                </div>
              </div>
              <div className="order-1 lg:order-2 relative">
                <div className="hidden lg:block lg:sticky">
                  <div className="bg-gradient-to-br from-blue-100 to-red-200 rounded-4xl p-4 xl:p-6 flex items-center justify-center min-h-[500px] xl:min-h-[600px] relative overflow-hidden">
                    <Image
                      src={texture}
                      alt="texture background"
                      fill
                      quality={75}
                      priority={true}
                      className="object-cover rounded-4xl opacity-80"
                    />
                    <div className="relative z-10">
                      <div className="w-64 h-[520px] xl:w-72 xl:h-[580px] bg-black rounded-[3rem] p-1.5 shadow-2xl">
                        <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden relative">
                          <Image
                            src={v2}
                            alt="phone mockup content"
                            fill
                            quality={85}
                            priority={true}
                            className="object-cover"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            id="automation-history"
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden my-8"
          >
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg">
                    <MessageSquareReply className="w-4 h-4 text-blue-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Auto-reply to frequent requests Automation Saved History
                  </h2>
                </div>
                <div className="hidden sm:flex items-center text-sm text-gray-600">
                  <MessageCircle className="w-4 h-4 mr-1" />
                  {mediaList.length}{" "}
                  {mediaList.length === 1 ? "Media" : "Media"}
                </div>
              </div>
            </div>

            {error && (
              <div className="mx-6 mt-4 bg-red-50 border-l-4 border-red-400 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-red-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="overflow-x-auto">
              <div className="hidden lg:block h-[504px] overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-200 table-fixed">
                  <thead className="bg-black/6">
                    <tr>
                      <th className="w-[10%] px-3 py-4 text-left text-xs font-semibold text-black/80 uppercase tracking-wider">
                        Post
                      </th>
                      <th className="w-[25%] px-3 py-4 text-left text-xs font-semibold text-black/80 uppercase tracking-wider">
                        Keywords
                      </th>
                      <th className="w-[30%] px-2 py-4 text-left text-xs font-semibold text-black/80 uppercase tracking-wider">
                        DM Message
                      </th>
                      <th className="w-[15%] px-2 py-4 text-left text-xs font-semibold text-black/80 uppercase tracking-wider">
                        Link
                      </th>
                      <th className="w-[15%] px-2 py-4 text-left text-xs font-semibold text-black/80 uppercase tracking-wider">
                        Created At
                      </th>
                      <th className="w-[10%] px-2 py-4 text-center text-xs font-semibold text-black/80 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {isLoading ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-16 text-center">
                          <div className="flex items-center justify-center h-full">
                            <div className="flex items-center space-x-3">
                              <div className="w-4 h-4 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin"></div>
                              <p className="text-blue-800 text-sm font-medium">
                                Loading your Auto Reply Details...
                              </p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : mediaList.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-16 text-center">
                          <div className="flex flex-col items-center">
                            <div className="flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                              <Plus className="w-8 h-8 text-gray-400" />
                            </div>
                            <p className="text-lg font-medium text-gray-900 mb-2">
                              No Media Settings Found
                            </p>
                            <p className="text-sm text-gray-500 mb-4">
                              Create your first media automation to get started
                            </p>
                            <Link
                              href="/dashboard/auto-dm-comment-link/automation/"
                              className="inline-flex items-center px-4 py-2 bg-gradient-to-b from-blue-400 to-blue-700 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Create Media Automation
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      currentItems.map((media, index) => (
                        <tr
                          key={media.mediaId}
                          className={`${
                            index % 2 === 0 ? "bg-white" : "bg-gray-50"
                          } hover:bg-gray-100 transition-colors`}
                        >
                          <td className="px-2 py-3">
                            <div className="flex items-center space-x-2">
                              {media.media_type === "VIDEO" ? (
                                <video
                                  src={media.media_url}
                                  className="w-10 h-10 object-cover rounded"
                                  muted
                                  playsInline
                                  preload="metadata"
                                  onError={(e) => {
                                    console.error(
                                      `Video preview load error for media ID: ${media.id}, URL: ${media.media_url}`
                                    );
                                    e.target.src = "/api/placeholder/40/40";
                                  }}
                                >
                                  Your browser does not support the video tag.
                                </video>
                              ) : (
                                <img
                                  src={media.media_url}
                                  alt="Media preview"
                                  className="w-10 h-10 object-cover rounded"
                                  onError={(e) => {
                                    console.error(
                                      `Image preview load error for media ID: ${media.id}, URL: ${media.media_url}`
                                    );
                                    e.target.src = "/api/placeholder/40/40";
                                  }}
                                />
                              )}
                            </div>
                          </td>
                          <td className="px-2 py-3">
                            <div className="flex flex-wrap gap-1 overflow-hidden">
                              {media.keywords?.map((keyword, keywordIndex) => (
                                <span
                                  key={keywordIndex}
                                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-tr from-purple-400 to-pink-400 text-white border border-blue-200 whitespace-nowrap"
                                >
                                  {keyword}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-2 py-3">
                            <div className="max-w-full">
                              <p
                                className="text-sm text-gray-900 break-words"
                                title={media.dmMessage}
                              >
                                {media.dmMessage || "Not configured"}
                              </p>
                            </div>
                          </td>
                          <td className="px-2 py-3">
                            <a
                              href={media.dmLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline"
                            >
                              <ExternalLink className="w-4 h-4 mr-1" />
                              {media.dmLink ? "View Link" : "No link"}
                            </a>
                          </td>
                          <td className="px-2 py-3">
                            <span className="text-sm text-gray-900">
                              {formatDate(media.createdAt)}
                            </span>
                          </td>
                          <td className="px-2 py-3">
                            <div className="flex items-center justify-center space-x-2">
                              <button
                                onClick={() => handleEdit(media)}
                                className="inline-flex items-center cursor-pointer p-2 text-amber-600 hover:text-amber-800 hover:bg-amber-100 rounded-lg transition-all duration-200 active:scale-90 active:shadow-inner transform"
                                title="Edit Media"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(media.mediaId)}
                                className="inline-flex items-center cursor-pointer p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-lg transition-all duration-200 active:scale-90 active:shadow-inner transform"
                                title="Delete Media"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="lg:hidden">
                {isLoading ? (
                  <div className="p-8 text-center">
                    <div className="flex flex-col items-center">
                      <div className="flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                        <Plus className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-lg font-medium text-gray-900 mb-2">
                        Loading your Auto Reply Details...
                      </p>
                      <p className="text-sm text-gray-500 mb-4">
                        Please wait while we fetch your media settings
                      </p>
                    </div>
                  </div>
                ) : mediaList.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="flex flex-col items-center">
                      <div className="flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                        <Plus className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-lg font-medium text-gray-900 mb-2">
                        No Media Settings Found
                      </p>
                      <p className="text-sm text-gray-500 mb-4">
                        Create your first media automation to get started
                      </p>
                      <Link
                        href="/dashboard/auto-dm-comment-link/automation/"
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create Media Automation
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {currentItems.map((media, index) => (
                      <div
                        key={media.mediaId}
                        className="p-6 hover:bg-gray-50 transition-colors"
                      >
                        <div className="space-y-4">
                          <div>
                            <h3 className="text-sm font-medium text-gray-500 mb-2">
                              Post Heading
                            </h3>
                            <div className="flex items-center space-x-2">
                              {media.media_type === "VIDEO" ? (
                                <video
                                  src={media.media_url}
                                  className="w-10 h-10 object-cover rounded"
                                  muted
                                  playsInline
                                  preload="metadata"
                                  onError={(e) => {
                                    console.error(
                                      `Video preview load error for media ID: ${media.id}, URL: ${media.media_url}`
                                    );
                                    e.target.src = "/api/placeholder/40/40";
                                  }}
                                >
                                  Your browser does not support the video tag.
                                </video>
                              ) : (
                                <img
                                  src={media.media_url}
                                  alt="Media preview"
                                  className="w-10 h-10 object-cover rounded"
                                  onError={(e) => {
                                    console.error(
                                      `Image preview load error for media ID: ${media.id}, URL: ${media.media_url}`
                                    );
                                    e.target.src = "/api/placeholder/40/40";
                                  }}
                                />
                              )}
                            </div>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-gray-500 mb-2">
                              Keywords
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              {media.keywords?.map((keyword, keywordIndex) => (
                                <span
                                  key={keywordIndex}
                                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200"
                                >
                                  {keyword}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-gray-500 mb-2">
                              DM Message
                            </h3>
                            <p className="text-sm text-gray-900 break-words">
                              {media.dmMessage || "Not configured"}
                            </p>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <h3 className="text-sm font-medium text-gray-500 mb-2">
                                Link
                              </h3>
                              <a
                                href={media.dmLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline"
                              >
                                <ExternalLink className="w-4 h-4 mr-1" />
                                {media.dmLink ? "View Link" : "No link"}
                              </a>
                            </div>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-gray-500 mb-2">
                              Created At
                            </h3>
                            <span className="text-sm text-gray-900">
                              {formatDate(media.createdAt)}
                            </span>
                          </div>
                          <div className="flex items-center space-x-3 pt-2">
                            <button
                              onClick={() => handleEdit(media)}
                              className="inline-flex items-center px-3 py-2 text-amber-700 bg-amber-100 hover:bg-amber-200 rounded-lg text-sm font-medium transition-all duration-200"
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(media.mediaId)}
                              className="inline-flex items-center px-3 py-2 text-red-700 bg-red-100 hover:bg-red-200 rounded-lg text-sm font-medium transition-all duration-200"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between px-6 py-2 bg-black/6 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of{" "}
                {totalItems} Media
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-lg ${
                    currentPage === 1
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-blue-600 hover:bg-blue-100"
                  }`}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded-lg ${
                    currentPage === totalPages
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-blue-600 hover:bg-blue-100"
                  }`}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
          {showDeletePopup && (
            <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-2">
              <div className="bg-white rounded-lg p-6 max-w-sm w-full">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Confirm Delete
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  {commentData.hasComments ? (
                    <>
                      This media has{" "}
                      <span className="font-semibold text-black">
                        {commentData.commentCount}
                      </span>{" "}
                      related comment(s). Deleting this media will also
                      permanently delete all related comments. Are you sure you
                      want to proceed?
                    </>
                  ) : (
                    "Are you sure you want to delete this automation?"
                  )}
                </p>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={cancelDelete}
                    className="px-4 py-2 text-gray-600 bg-gray-100 cursor-pointer hover:bg-gray-200 rounded-lg text-sm font-medium transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="px-4 py-2 text-white bg-red-600 cursor-pointer hover:bg-red-700 rounded-lg text-sm font-medium transition-all"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Suspense>
    </>
  );
}
