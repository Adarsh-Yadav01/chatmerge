"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
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
import instalogo from "../../../../public/instalogo.webp";
import v2 from "../../../../public/v2.png";
import { Suspense } from "react";
import Loader from "../../../components/Loader";
import toast, { Toaster } from "react-hot-toast";
export default function RespondToAllYourDMPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [dmSettings, setDmSettings] = useState([]);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const totalItems = dmSettings.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const currentItems = dmSettings.slice().reverse().slice(startIndex, endIndex);
  const [isLoading, setIsLoading] = useState(true);

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

  const handleDelete = (id) => {
    setDeleteId(id);
    setShowDeletePopup(true);
  };

  const confirmDelete = async () => {
    try {
      const res = await fetch(`/api/instagram/dm-settings/${deleteId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchDmSettings();
        toast.success("Deleted successfully", { position: "top-center" });
      } else {
        setError("Failed to delete DM setting");
        toast.error("Failed to delete DM setting", { position: "top-center" });
      }
    } catch (err) {
      setError("An error occurred while deleting DM setting");
      toast.error("An error occurred while deleting DM setting", {
        position: "top-center",
      });
    }
    setShowDeletePopup(false);
    setDeleteId(null);
  };

  // Added cancelDelete function
  const cancelDelete = () => {
    setShowDeletePopup(false);
    setDeleteId(null);
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/api/auth/signin");
    } else if (status === "authenticated") {
      setIsLoading(true);
      fetchDmSettings().finally(() => setIsLoading(false));
    }
  }, [status, router]);

  const fetchDmSettings = async () => {
    try {
      const res = await fetch("/api/instagram/dm-settings");
      if (res.ok) {
        const data = await res.json();
        setDmSettings(data);
        console.log("data", data);
      } else {
        setError("Failed to fetch DM settings");
      }
    } catch (err) {
      setError("An error occurred while fetching DM settings");
    }
  };

  const handleEdit = (setting) => {
    router.push(`/dashboard/respond-to-all-your-dm/automation/${setting.id}`);
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
          {/* add the automation */}
           <div className="bg-gray-50 rounded-2xl lg:rounded-4xl overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-4 items-center min-h-[400px] lg:min-h-[610px] ">
              <div className="order-2 lg:order-1 p-4 sm:px-8   space-y-4 lg:space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Image
                      src={instalogo}
                      alt="instagram logo"
                      width={32}
                      height={32}
                      className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
                    />
                  </div>
                  <span className="text-sm sm:text-base font-medium text-gray-600">
                    Instagram
                  </span>
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-3xl xl:text-3xl font-bold text-gray-900 leading-tight">
                    Respond to all your DM
                  </h1>
                </div>
                <div className="space-y-3 sm:space-y-4">
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900">
                    How does it work?
                  </h2>
                  <p className="text-sm sm:text-base lg:text-lg text-gray-700 leading-relaxed">
                    You can earn real money from Instagram as easy as a comment,
                    and show off the products you have in a cool little product
                    gallery. You'll give your followers what they want, and show
                    'em what else you've got to offer — right in their DM inbox.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 pt-4 sm:pt-6 px-2">
                  <Link
                    href="/dashboard/instagram-automation/respond-to-all-your-dm/automation/"
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

          {/* Professional DM Settings Table */}
          <div             id="automation-history"
 className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden my-8">
            {/* Table Header */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg">
                    <MessageSquareReply className="w-4 h-4 text-blue-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    DM Automation Saved History{" "}
                  </h2>
                </div>
                <div className="hidden sm:flex items-center text-sm text-gray-600">
                  <MessageCircle className="w-4 h-4 mr-1" />
                  {dmSettings.length} {dmSettings.length === 1 ? "DM" : "DMs"}
                </div>
              </div>
            </div>

            {/* Error Message */}
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

            {/* Table Content */}
            <div className="overflow-x-auto ">
              {/* Desktop Table */}
              <div className="hidden lg:block h-[504px] overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-200 table-fixed">
                  <thead className="bg-black/6">
                    <tr>
                      <th className="w-[30%] px-3 py-4 text-left text-xs font-semibold text-black/80 uppercase tracking-wider">
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
    <td colSpan="5" className="px-6 py-16 text-center">
      <div className="flex items-center justify-center h-full">
        <div className="flex items-center space-x-3">
          <div className="w-4 h-4 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-blue-800 text-sm font-medium">
            Loading your DMs Details...
          </p>
        </div>
      </div>
    </td>
  </tr>
) : dmSettings.length === 0 ? (
  <tr>
    <td colSpan="5" className="px-6 py-16 text-center">
      <div className="flex flex-col items-center">
        <div className="flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
          <Plus className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-lg font-medium text-gray-900 mb-2">
          No DM Configuration found
        </p>
        <p className="text-sm text-gray-500 mb-4">
          Create your first DM automation to get started
        </p>
        <Link
          href="/dashboard/respond-to-all-your-dm/automation/"
          className="inline-flex items-center px-4 py-2 bg-gradient-to-b from-blue-400 to-blue-700 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create DMs automation
        </Link>
      </div>
    </td>
  </tr>
) : (
  currentItems.map((setting, index) => (
    <tr
      key={setting.id}
      className={`${
        index % 2 === 0 ? "bg-white" : "bg-gray-50"
      } hover:bg-gray-100 transition-colors`}
    >
      <td className="px-2 py-3">
        <div className="flex flex-wrap gap-1 overflow-hidden">
          {setting.keywords.map((keyword, keywordIndex) => (
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
            title={setting.dmMessage}
          >
            {setting.dmMessage}
          </p>
        </div>
      </td>
      <td className="px-2 py-3">
        <a
          href={setting.dmLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline"
        >
          <ExternalLink className="w-4 h-4 mr-1" />
          View Link
        </a>
      </td>
      <td className="px-2 py-3">
        <span className="text-sm text-gray-900">
          {formatDate(setting.createdAt)}
        </span>
      </td>
      <td className="px-2 py-3">
        <div className="flex items-center justify-center space-x-2">
          <button
            onClick={() => handleEdit(setting)}
            className="inline-flex items-center cursor-pointer p-2 text-amber-600 hover:text-amber-800 hover:bg-amber-100 rounded-lg transition-all duration-200 active:scale-90 active:shadow-inner transform"
            title="Edit DM"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(setting.id)}
            className="inline-flex items-center cursor-pointer p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-lg transition-all duration-200 active:scale-90 active:shadow-inner transform"
            title="Delete DM"
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

              {/* Mobile/Tablet Card Layout */}
              <div className="lg:hidden">
                {dmSettings.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="flex flex-col items-center">
                      <div className="flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                        <Plus className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-lg font-medium text-gray-900 mb-2">
                        No DM settings found
                      </p>
                      <p className="text-sm text-gray-500 mb-4">
                        Create your first DM automation to get started
                      </p>
                      <Link
                        href="/dashboard/respond-to-all-your-dm/automation/"
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create Setting
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {currentItems.map((setting, index) => (
                      <div
                        key={setting.id}
                        className="p-6 hover:bg-gray-50 transition-colors"
                      >
                        <div className="space-y-4">
                          {/* Keywords */}
                          <div>
                            <h3 className="text-sm font-medium text-gray-500 mb-2">
                              Keywords
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              {setting.keywords.map((keyword, keywordIndex) => (
                                <span
                                  key={keywordIndex}
                                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200"
                                >
                                  {keyword}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* DM Message */}
                          <div>
                            <h3 className="text-sm font-medium text-gray-500 mb-2">
                              DM Message
                            </h3>
                            <p className="text-sm text-gray-900 break-words">
                              {setting.dmMessage}
                            </p>
                          </div>

                          {/* Link and Button */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <h3 className="text-sm font-medium text-gray-500 mb-2">
                                Link
                              </h3>
                              <a
                                href={setting.dmLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline"
                              >
                                <ExternalLink className="w-4 h-4 mr-1" />
                                View Link
                              </a>
                            </div>
                            <div>
                              <h3 className="text-sm font-medium text-gray-500 mb-2">
                                Button Label
                              </h3>
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                                {setting.dmLinkButtonLabel}
                              </span>
                            </div>
                          </div>

                          {/* Created At */}
                          <div>
                            <h3 className="text-sm font-medium text-gray-500 mb-2">
                              Created At
                            </h3>
                            <span className="text-sm text-gray-900">
                              {formatDate(setting.createdAt)}
                            </span>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center space-x-3 pt-2">
                            <button
                              onClick={() => handleEdit(setting)}
                              className="inline-flex items-center px-3 py-2 text-amber-700 bg-amber-100 hover:bg-amber-200 rounded-lg text-sm font-medium transition-all duration-200"
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(setting.id)}
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
                {totalItems} DMs
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
            <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-sm w-full">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Confirm Delete
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  Are you sure you want to delete this automation?
                </p>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={cancelDelete}
                    className="px-4 py-2 cursor-pointer text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="px-4 py-2 text-white cursor-pointer bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium transition-all"
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
