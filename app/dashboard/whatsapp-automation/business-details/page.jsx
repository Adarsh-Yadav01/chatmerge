"use client";

import React, { useState, useEffect } from "react";
import {
  Share2,
  Copy,
  Phone,
  MessageCircle,
  QrCode,
  ExternalLink,
  Check,
  X,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

export default function BusinessCard() {
  const businessName = "Your Super Business";
  const shortLink = "wa.me/7905470224";
  const whatsappLink = "wa.me/7905470224";
  const phoneNumber = "+91 7905470224";

  // State for copy feedback
  const [copiedItem, setCopiedItem] = useState(null);
  const [showQR, setShowQR] = useState(false);

  // Business image - you can replace this with actual image URL
  const businessImage =
    "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop&crop=center";

  const copyToClipboard = (text, itemId) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(itemId);

    // Reset after 2 seconds
    setTimeout(() => {
      setCopiedItem(null);
    }, 2000);
  };

  const shareLink = () => {
    if (navigator.share) {
      navigator.share({
        title: businessName,
        text: "Get traffic by sharing business details",
        url: `https://${whatsappLink}`,
      });
    }
  };

  // QR Code component (using a simple QR generator service)
  const QRCodeModal = () => {
    if (!showQR) return null;

    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://${whatsappLink}`;

    return (
      <div className="fixed inset-0 bg-black/40 bg-opacity-80 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">QR Code</h3>
            <button
              onClick={() => setShowQR(false)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="text-center">
            <img src={qrUrl} alt="QR Code" className="mx-auto mb-4" />
            <p className="text-sm text-gray-600">
              Scan to connect with {businessName}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen  p-4">
      <div className="max-w-6xl mx-auto">
        {/* Main Container - Side by Side Layout */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="flex flex-col lg:flex-row min-h-[600px]">
            {/* Left Side - Image */}
            <div className="lg:w-1/2 bg-green-50 rounded-r-4xl flex items-center justify-center p-8">
              <div className="text-center">
                {/* Business Image */}
                <div className="w-130 h-130 rounded-lg overflow-hidden ">
                  <img
                    src="/wa.jpg"
                    alt={businessName}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Right Side - Content */}
            <div className="lg:w-1/2 p-8">
              {/* Business Header */}
              <div className="mb-8">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-lg overflow-hidden mr-4 shadow-md">
                    <img
                      src={businessImage}
                      alt={businessName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                      {businessName}
                    </h1>
                    <p className="text-green-600 font-medium">{shortLink}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <button
                    onClick={shareLink}
                    className="p-2 bg-green-100 hover:bg-green-200 rounded-lg transition-colors"
                    aria-label="Share"
                  >
                    <Share2 className="w-5 h-5 text-green-600" />
                  </button>

                  <button
                    onClick={() =>
                      copyToClipboard(`https://${whatsappLink}`, "header-copy")
                    }
                    className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    aria-label="Copy link"
                  >
                    {copiedItem === "header-copy" ? (
                      <Check className="w-5 h-5 text-green-600" />
                    ) : (
                      <Copy className="w-5 h-5 text-gray-600" />
                    )}
                  </button>

                  <button
                    onClick={() => setShowQR(true)}
                    className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    aria-label="QR Code"
                  >
                    <QrCode className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Description */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-800 mb-3">
                  Get traffic by sharing business details
                </h2>
                <p className="text-gray-600">
                  Share WhatsApp link and phone number so that customers can
                  start a chat with you in seconds.
                </p>
              </div>

              {/* Contact Links */}
              <div className="space-y-4">
                {/* WhatsApp Link */}
                <a
                  href={`https://${whatsappLink}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between bg-gray-50 rounded-lg p-4 hover:bg-green-50 transition-all duration-300 border border-gray-200 hover:border-green-200"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                      <FaWhatsapp className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">WhatsApp Chat</p>
                      <p className="text-sm text-green-600">{whatsappLink}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        copyToClipboard(
                          `https://${whatsappLink}`,
                          "whatsapp-copy"
                        );
                      }}
                      className="p-1 hover:bg-white rounded transition-colors"
                      aria-label="Copy WhatsApp link"
                    >
                      {copiedItem === "whatsapp-copy" ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-500" />
                      )}
                    </button>
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                  </div>
                </a>

                {/* Phone Number */}
                <a
                  href={`tel:${phoneNumber}`}
                  className="group flex items-center justify-between bg-gray-50 rounded-lg p-4 hover:bg-green-50 transition-all duration-300 border border-gray-200 hover:border-green-200"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                      <Phone className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">Call Now</p>
                      <p className="text-sm text-green-600">{phoneNumber}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        copyToClipboard(phoneNumber, "phone-copy");
                      }}
                      className="p-1 hover:bg-white rounded transition-colors"
                      aria-label="Copy phone number"
                    >
                      {copiedItem === "phone-copy" ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-500" />
                      )}
                    </button>
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                  </div>
                </a>
              </div>

              {/* Footer */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-500 text-center">
                  Tap to connect instantly • Professional business solutions
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      <QRCodeModal />
    </div>
  );
}
