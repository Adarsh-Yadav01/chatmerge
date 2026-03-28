"use client";
import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import {
  AlertCircle,
  Send,
  Plus,
  Trash2,
  Images,
  ChevronRight,
  Film,
  RotateCcw,
  Crop,
  Upload,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { toast, Toaster } from "react-hot-toast";
import Swal from 'sweetalert2';
import Loader from "@/app/components/Loader";
import Image from "next/image";
import getImageSize from "browser-image-size";
import PreviewBoxPublish from "@/app/components/PreviewBoxPublish";
import instalogo from "../../../../../public/instalogo.webp";
import {
  CheckCheck,
  CloudUpload,
  ImageIcon,
  ImageUpscale,
  ImagePlay,
  FileText,
  ChevronLeft,
  SendHorizontal,
} from "lucide-react";

// Modified Automation component that accepts props for post selection
export default function Automation({ onPostSelect, onToggleAllPosts }) {
  const { data: session, status } = useSession();
  const [currentStep, setCurrentStep] = useState(1);
  const [mediaType, setMediaType] = useState("");
  const [isCarousel, setIsCarousel] = useState(false);
  const [mediaUrls, setMediaUrls] = useState([""]);
  const [files, setFiles] = useState([]);
  const [captions, setCaptions] = useState([""]);
  const [altTexts, setAltTexts] = useState([""]);
  const [customDimensions, setCustomDimensions] = useState([
    { width: "", height: "", maintainAspectRatio: true },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validations, setValidations] = useState([]);
  const canvasRef = useRef(null);

  // Instagram constraints
  const MAX_IMAGE_SIZE = 8 * 1024 * 1024; // 8MB
  const MAX_REELS_SIZE = 100 * 1024 * 1024; // 100MB
  const VALID_IMAGE_TYPES = ["image/jpeg"];
  const VALID_REELS_TYPES = ["video/mp4", "video/mpeg", "video/webm"];
  const MIN_IMAGE_DIMENSION = 150;
  const MAX_IMAGE_DIMENSION = 1920;
  const VALID_ASPECT_RATIOS = [
    [1, 1],
    [4, 5],
    [1.91, 1],
  ];
  const MAX_REELS_DURATION = 60; // seconds

  // Validate URL
  const isValidMediaUrl = (url) => {
    try {
      const parsedUrl = new URL(url);
      return (
        ["http:", "https:"].includes(parsedUrl.protocol) &&
        !url.startsWith("data:")
      );
    } catch {
      return false;
    }
  };

  // Function to create preview data and send to parent
  const updatePreview = (updatedFiles, updatedCaptions, updatedMediaType, updatedIsCarousel) => {
    console.log("🔄 updatePreview called with:", {
      updatedFiles: updatedFiles.map(f => f ? f.name : null),
      updatedCaptions,
      updatedMediaType,
      updatedIsCarousel
    });

    const validFiles = updatedFiles.filter(file => file !== null);
    console.log("✅ Valid files found:", validFiles.length);

    if (validFiles.length === 0) {
      console.log("❌ No valid files, sending null to preview");
      onPostSelect(null);
      return;
    }

    // Create preview object similar to Instagram post format
    const previewPost = {
      id: `preview-${Date.now()}`,
      media_type: updatedMediaType,
      caption: updatedCaptions[0] || "",
      timestamp: new Date().toISOString(),
    };

    if (updatedIsCarousel && validFiles.length > 1) {
      console.log("🎠 Creating carousel preview with", validFiles.length, "files");
      // For carousel posts
      previewPost.media_urls = validFiles.map((file, index) => {
        const url = URL.createObjectURL(file);
        console.log(`📸 Carousel image ${index + 1} URL:`, url);
        return {
          media_url: url,
          media_type: updatedMediaType,
        };
      });
    } else {
      // For single posts
      const url = URL.createObjectURL(validFiles[0]);
      console.log("📱 Single post URL:", url);
      previewPost.media_url = url;
    }

    console.log("📤 Sending preview data:", previewPost);
    onPostSelect(previewPost);
  };

  const validateMedia = async (file, index) => {
    const validation = { index, status: "pending", message: "" };
    if (!file) {
      validation.status = "invalid";
      validation.message = "No file selected";
      return validation;
    }

    const isReels = mediaType === "REELS";
    const validTypes = isReels ? VALID_REELS_TYPES : VALID_IMAGE_TYPES;
    if (!validTypes.includes(file.type)) {
      validation.status = "invalid";
      validation.message = `Invalid file type. Use ${isReels ? "MP4, MPEG, or WebM" : "JPEG"}`;
      return validation;
    }

    const maxSize = isReels ? MAX_REELS_SIZE : MAX_IMAGE_SIZE;
    if (file.size > maxSize) {
      validation.status = "invalid";
      validation.message = `File size exceeds ${maxSize / (1024 * 1024)}MB limit`;
      return validation;
    }

    if (mediaType === "IMAGE") {
      try {
        const { width, height } = await getImageSize(file);
        if (width < MIN_IMAGE_DIMENSION || height < MIN_IMAGE_DIMENSION) {
          validation.status = "invalid";
          validation.message = `Image dimensions must be at least ${MIN_IMAGE_DIMENSION}x${MIN_IMAGE_DIMENSION}`;
          return validation;
        }
        if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
          validation.status = "invalid";
          validation.message = `Image dimensions must not exceed ${MAX_IMAGE_DIMENSION}x${MAX_IMAGE_DIMENSION}`;
          return validation;
        }
        const aspectRatio = width / height;
        const isValidAspectRatio = VALID_ASPECT_RATIOS.some(([w, h]) => {
          const ratio = w / h;
          return (
            Math.abs(aspectRatio - ratio) < 0.1 ||
            Math.abs(1 / aspectRatio - ratio) < 0.1
          );
        });
        if (!isValidAspectRatio) {
          validation.status = "invalid";
          validation.message = "Image aspect ratio must be approximately 1:1, 4:5, or 1.91:1";
          return validation;
        }
        validation.status = "valid";
        validation.message = "Image is valid";
      } catch (err) {
        validation.status = "invalid";
        validation.message = "Failed to validate image dimensions";
      }
    } else if (mediaType === "REELS") {
      const video = document.createElement("video");
      video.src = URL.createObjectURL(file);
      await new Promise((resolve) => {
        video.onloadedmetadata = () => resolve();
      });
      const duration = video.duration;
      if (duration > MAX_REELS_DURATION) {
        validation.status = "invalid";
        validation.message = `Reels duration exceeds ${MAX_REELS_DURATION} seconds`;
        return validation;
      }
      validation.status = "valid";
      validation.message = "Reels is valid";
      URL.revokeObjectURL(video.src);
    }
    return validation;
  };

  const resizeImage = async (file, index, targetWidth, targetHeight, maintainAspectRatio = true) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new window.Image();
    img.src = URL.createObjectURL(file);
    await new Promise((resolve) => {
      img.onload = () => resolve();
    });

    let newWidth = targetWidth;
    let newHeight = targetHeight;
    if (maintainAspectRatio) {
      const aspectRatio = img.width / img.height;
      if (targetWidth / targetHeight > aspectRatio) {
        newWidth = targetHeight * aspectRatio;
      } else {
        newHeight = targetWidth / aspectRatio;
      }
    }

    canvas.width = newWidth;
    canvas.height = newHeight;
    ctx.drawImage(img, 0, 0, newWidth, newHeight);
    const blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.9)
    );
    const resizedFile = new File([blob], file.name, { type: "image/jpeg" });
    URL.revokeObjectURL(img.src);

    const newFiles = [...files];
    newFiles[index] = resizedFile;
    setFiles(newFiles);
    handleFileChange(index, resizedFile);
    return resizedFile;
  };

  const cropImage = async (file, index, targetAspectRatio) => {
    console.log(`🖼️ Cropping image at index ${index} to aspect ratio ${targetAspectRatio}`);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new window.Image();
    img.src = URL.createObjectURL(file);
    await new Promise((resolve) => {
      img.onload = () => resolve();
    });

    let { width, height } = await getImageSize(file);
    let newWidth, newHeight;
    const currentAspectRatio = width / height;
    if (currentAspectRatio > targetAspectRatio) {
      newWidth = height * targetAspectRatio;
      newHeight = height;
    } else {
      newWidth = width;
      newHeight = width / targetAspectRatio;
    }

    canvas.width = newWidth;
    canvas.height = newHeight;
    ctx.drawImage(
      img,
      (width - newWidth) / 2,
      (height - newHeight) / 2,
      newWidth,
      newHeight,
      0,
      0,
      newWidth,
      newHeight
    );
    const blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.9)
    );
    const croppedFile = new File([blob], file.name, { type: "image/jpeg" });
    URL.revokeObjectURL(img.src);

    const newFiles = [...files];
    newFiles[index] = croppedFile;
    setFiles(newFiles);
    handleFileChange(index, croppedFile);

    console.log(`✅ Image cropped successfully at index ${index}`);
    return croppedFile;
  };

  const handleAddMedia = () => {
    if (mediaUrls.length < 10) {
      const newMediaUrls = [...mediaUrls, ""];
      const newFiles = [...files, null];
      const newCaptions = [...captions, ""];
      const newAltTexts = [...altTexts, ""];
      const newDimensions = [...customDimensions, { width: "", height: "", maintainAspectRatio: true }];
      const newValidations = [...validations, { index: mediaUrls.length, status: "pending", message: "" }];

      setMediaUrls(newMediaUrls);
      setFiles(newFiles);
      setCaptions(newCaptions);
      setAltTexts(newAltTexts);
      setCustomDimensions(newDimensions);
      setValidations(newValidations);
    }
  };

  const handleRemoveMedia = (index) => {
    const newMediaUrls = mediaUrls.filter((_, i) => i !== index);
    const newFiles = files.filter((_, i) => i !== index);
    const newCaptions = captions.filter((_, i) => i !== index);
    const newAltTexts = altTexts.filter((_, i) => i !== index);
    const newDimensions = customDimensions.filter((_, i) => i !== index);
    const newValidations = validations.filter((v) => v.index !== index).map((v, i) => ({ ...v, index: i }));

    setMediaUrls(newMediaUrls);
    setFiles(newFiles);
    setCaptions(newCaptions);
    setAltTexts(newAltTexts);
    setCustomDimensions(newDimensions);
    setValidations(newValidations);

    updatePreview(newFiles, newCaptions, mediaType, isCarousel);
  };

  const handleMediaUrlChange = (index, value) => {
    const newUrls = [...mediaUrls];
    newUrls[index] = value;
    setMediaUrls(newUrls);
    const newValidations = [...validations];
    newValidations[index] = { index, status: 'pending', message: isValidMediaUrl(value) ? 'Valid URL' : 'Invalid URL' };
    setValidations(newValidations);
  };

  const handleCaptionChange = (index, value) => {
    const newCaptions = [...captions];
    newCaptions[index] = value;
    setCaptions(newCaptions);
    updatePreview(files, newCaptions, mediaType, isCarousel);
  };

  const handleAltTextChange = (index, value) => {
    const newAltTexts = [...altTexts];
    newAltTexts[index] = value;
    setAltTexts(newAltTexts);
  };

  const handleDimensionChange = (index, field, value) => {
    const newDimensions = [...customDimensions];
    newDimensions[index] = { ...newDimensions[index], [field]: value };
    setCustomDimensions(newDimensions);
  };

  const handleAspectRatioToggle = (index) => {
    const newDimensions = [...customDimensions];
    newDimensions[index] = { ...newDimensions[index], maintainAspectRatio: !newDimensions[index].maintainAspectRatio };
    setCustomDimensions(newDimensions);
  };

  const handleApplyDimensions = async (index) => {
    const file = files[index];
    if (!file || mediaType !== 'IMAGE') return;

    const { width, height, maintainAspectRatio } = customDimensions[index];
    const parsedWidth = parseInt(width, 10);
    const parsedHeight = parseInt(height, 10);

    if (isNaN(parsedWidth) || isNaN(parsedHeight)) {
      setError('Please enter valid width and height values.');
      return;
    }

    if (parsedWidth < MIN_IMAGE_DIMENSION || parsedHeight < MIN_IMAGE_DIMENSION) {
      setError(`Dimensions must be at least ${MIN_IMAGE_DIMENSION}x${MIN_IMAGE_DIMENSION}.`);
      return;
    }

    if (parsedWidth > MAX_IMAGE_DIMENSION || parsedHeight > MAX_IMAGE_DIMENSION) {
      setError(`Dimensions must not exceed ${MAX_IMAGE_DIMENSION}x${MAX_IMAGE_DIMENSION}.`);
      return;
    }

    setLoading(true);
    try {
      const resizedFile = await resizeImage(file, index, parsedWidth, parsedHeight, maintainAspectRatio);
      const validation = await validateMedia(resizedFile, index);
      const newValidations = [...validations];
      newValidations[index] = validation;
      setValidations(newValidations);
    } catch (err) {
      setError('Failed to resize image');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (index, selectedFiles) => {
    if (!selectedFiles || selectedFiles.length === 0) return;

    setLoading(true);
    setError(null);
    let newFiles = [...files];
    let newMediaUrls = [...mediaUrls];
    let newValidations = [...validations];
    let newCaptions = [...captions];
    let newAltTexts = [...altTexts];
    let newDimensions = [...customDimensions];

    // If multiple files are selected for carousel
    if (isCarousel && selectedFiles instanceof FileList) {
      const filesArray = Array.from(selectedFiles).slice(0, 10 - files.length);
      const startIndex = index;

      // Ensure arrays are large enough to accommodate new files
      for (let i = files.length; i < startIndex + filesArray.length; i++) {
        newMediaUrls.push("");
        newCaptions.push("");
        newAltTexts.push("");
        newDimensions.push({ width: "", height: "", maintainAspectRatio: true });
        newValidations.push({ index: i, status: "pending", message: "" });
      }

      for (let i = 0; i < filesArray.length; i++) {
        const file = filesArray[i];
        const currentIndex = startIndex + i;

        // Update files array
        newFiles[currentIndex] = file;

        // Upload the file with progress
        const toastId = toast.loading(`Uploading ${file.name}...`, {
          style: {
            background: '#fff',
            color: '#000',
          },
        });

        try {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('mediaType', mediaType);

          // Simulate progress for better UX (since fetch doesn't support real progress)
          let progress = 0;
          const progressInterval = setInterval(() => {
            progress += 10;
            if (progress <= 90) {
              toast.loading(`Uploading ${file.name}... ${progress}%`, {
                id: toastId,
                style: {
                  background: '#fff',
                  color: '#000',
                },
              });
            }
          }, 200);

          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });

          clearInterval(progressInterval);

          const data = await response.json();
          if (!response.ok) {
            throw new Error(data.message || 'Failed to upload file');
          }

          newMediaUrls[currentIndex] = data.url;

          toast.success(`${file.name} uploaded successfully!`, {
            id: toastId,
            duration: 2000,
          });

          // Validate the file AFTER successful upload
          const validation = await validateMedia(file, currentIndex);
          newValidations[currentIndex] = validation;

        } catch (err) {
          console.error('File upload error:', err);
          setError(err.message);
          newValidations[currentIndex] = { index: currentIndex, status: 'invalid', message: `Upload failed: ${err.message}` };

          toast.error(`Failed to upload ${file.name}`, {
            id: toastId,
            duration: 3000,
          });
        }
      }
    } else {
      // Single file upload
      const file = selectedFiles instanceof FileList ? selectedFiles[0] : selectedFiles;
      newFiles[index] = file;

      // Upload the file with progress
      const toastId = toast.loading(`Uploading ${file.name}...`, {
        style: {
          background: '#fff',
          color: '#000',
        },
      });

      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('mediaType', mediaType);

        // Simulate progress
        let progress = 0;
        const progressInterval = setInterval(() => {
          progress += 10;
          if (progress <= 90) {
            toast.loading(`Uploading ${file.name}... ${progress}%`, {
              id: toastId,
              style: {
                background: '#fff',
                color: '#000',
              },
            });
          }
        }, 200);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        clearInterval(progressInterval);

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || 'Failed to upload file');
        }

        newMediaUrls[index] = data.url;

        toast.success(`${file.name} uploaded successfully!`, {
          id: toastId,
          duration: 2000,
        });

        // Validate the file AFTER successful upload
        const validation = await validateMedia(file, index);
        newValidations[index] = validation;

      } catch (err) {
        console.error('File upload error:', err);
        setError(err.message);
        newValidations[index] = { index, status: 'invalid', message: `Upload failed: ${err.message}` };

        toast.error(`Failed to upload ${file.name}`, {
          id: toastId,
          duration: 3000,
        });
      }
    }

    setFiles(newFiles);
    setMediaUrls(newMediaUrls);
    setValidations(newValidations);
    setCaptions(newCaptions);
    setAltTexts(newAltTexts);
    setCustomDimensions(newDimensions);

    // Update preview with the new files
    updatePreview(newFiles, newCaptions, mediaType, isCarousel);

    setLoading(false);
  };

  const handleFixImage = async (index, action, param) => {
    const file = files[index];
    if (!file || mediaType !== "IMAGE") return;

    setLoading(true);
    try {
      let newFile;
      if (action === "resize") {
        newFile = await resizeImage(file, index, MAX_IMAGE_DIMENSION, MAX_IMAGE_DIMENSION);
      } else if (action === "crop") {
        newFile = await cropImage(file, index, param);
      }
      const validation = await validateMedia(newFile, index);
      const newValidations = [...validations];
      newValidations[index] = validation;
      setValidations(newValidations);
    } catch (err) {
      toast.error("Failed to process image");
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentStep === 1 && mediaType) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(3);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      // Clear media when going back from step 3 to step 2
      if (currentStep === 3) {
        setCurrentStep(currentStep - 1);
      }
      // Clear all uploaded media when going back from step 2 to step 1
      else if (currentStep === 2) {
        // Reset all media-related state
        setFiles([]);
        setMediaUrls([""]);
        setCaptions([""]);
        setAltTexts([""]);
        setCustomDimensions([{ width: "", height: "", maintainAspectRatio: true }]);
        setValidations([{ index: 0, status: "pending", message: "" }]);
        setError(null);
        // Clear preview
        onPostSelect(null);
        setCurrentStep(currentStep - 1);
      }
    }
  };

// Submit/Publish function - replace SweetAlert2 with react-hot-toast
const handleSubmit = async () => {
  setLoading(true);
  setError(null);

  const validUrls = mediaUrls.filter((url) => url.trim() !== '');

  for (const [index, url] of validUrls.entries()) {
    if (!isValidMediaUrl(url)) {
      setError(`Invalid URL at position ${index + 1}. Use a public HTTP/HTTPS URL.`);
      setLoading(false);
      toast.error(`Invalid URL at position ${index + 1}`);
      return;
    }
  }

  if (validUrls.length === 0) {
    setError('At least one valid media URL is required.');
    setLoading(false);
    toast.error('At least one valid media URL is required.');
    return;
  }

  if (validations.some((v) => v.status === "invalid")) {
    setError('Please fix all invalid media before publishing.');
    setLoading(false);
    toast.error('Please fix all invalid media before publishing.');
    return;
  }

  try {
    const response = await fetch('/api/instagram/publish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mediaType,
        mediaUrls: validUrls,
        caption: captions[0],
        altText: mediaType === 'IMAGE' ? altTexts[0] : undefined,
        isCarousel,
      }),
    });

    const data = await response.json();
    console.log("Publish response:", data);

    if (!response.ok) {
      throw new Error(data.message || 'Failed to publish media');
    }

    // Extract media ID from various possible locations in the response
    const mediaId = data.mediaId || 
                    data.id || 
                    data.media_id || 
                    data.containerId ||
                    data.container_id ||
                    (data.data && (data.data.id || data.data.mediaId || data.data.media_id)) ||
                    (data.result && (data.result.id || data.result.mediaId));

    if (mediaId) {
      toast.success(`Published Successfully! Media ID: ${mediaId}`, {
        duration: 6000,
      });
    } else {
      console.warn("Media ID not found in response:", data);
      toast.success('Media published successfully! Check Instagram for confirmation.', {
        duration: 5000,
      });
    }

    // Reset form after successful submission
    setMediaUrls(['']);
    setFiles([]);
    setCaptions(['']);
    setAltTexts(['']);
    setCustomDimensions([{ width: '', height: '', maintainAspectRatio: true }]);
    setValidations([{ index: 0, status: 'pending', message: '' }]);
    setIsCarousel(false);
    setCurrentStep(1);
    setMediaType('');
    onPostSelect(null);

  } catch (err) {
    console.error('Publish error:', err);
    setError(err.message);
    toast.error(`Failed to publish: ${err.message}`, {
      duration: 5000,
    });
  } finally {
    setLoading(false);
  }
};


  const canProceedFromStep1 = mediaType !== "";
  const canProceedFromStep2 = files.length > 0 && files.some((file) => file !== null);

  if (status === "loading") {
    return <div><Loader /></div>;
  }

  if (!session || session.user.role !== "USER") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-8 text-center max-w-md w-full">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Required</h2>
          <p className="text-gray-600">Please log in with a user account to publish content.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <Toaster position="top-center" />

      {/* Step Progress Bar */}
      <div className="mb-6 -mt-4 -mr-18">
        <div className="flex items-center justify-between px-1 sm:px-2 sm:ml-20 lg:ml-20">
          {[
            { id: 1, title: "Choose Type", icon: ImagePlay },
            { id: 2, title: "Upload Media", icon: CloudUpload },
            { id: 3, title: "Add Details", icon: FileText },
          ].map((step, index) => {
            const StepIcon = step.icon;
            const isActive = step.id === currentStep;
            const isCompleted = step.id < currentStep;

            return (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center border-2 transition-all ${isCompleted
                    ? "bg-gradient-to-br from-green-400 via-green-500 to-green-700 text-white"
                    : isActive
                      ? "bg-gradient-to-br from-blue-400 via-blue-600 to-blue-700 text-white"
                      : "bg-white border-gray-300 text-gray-400"
                    }`}>
                    {isCompleted ? (
                      <CheckCheck className="w-3 h-3 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                    ) : (
                      <StepIcon className="w-3 h-3 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                    )}
                  </div>
                  <div className="mt-1 sm:mt-2 text-center max-w-[70px] sm:max-w-none">
                    <p className={`text-[10px] text-xs sm:text-xs md:text-base font-medium leading-tight ${isCompleted ? "text-green-600" : isActive ? "text-blue-600" : "text-gray-500"
                      }`}>
                      {step.title}
                    </p>
                  </div>
                </div>
                {index < 2 && (
                  <div className={`flex-1 h-0.5 ${step.id < currentStep ? "bg-green-500" : "bg-gray-300"}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="bg-white border-2 rounded-xl shadow-lg">
          <header className="mb-1">
            <div className="text-center bg-black/6 border-b-1 rounded-t-lg p-2">
              <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 bg-clip-text text-transparent">
                Publish to Instagram
              </h2>
              <p className="text-sm text-black/70 mt-2">Create amazing posts with our step-by-step process</p>
            </div>
          </header>

          <div className="bg-white rounded-2xl shadow-lg px-6 py-4">
            {/* Step 1: Choose Type */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="text-left">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">What do you want to post?</h2>
                  <p className="text-gray-600">Select the type of content you want to share on Instagram</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div
                    onClick={() => {
                      setMediaType("IMAGE");
                      setIsCarousel(false);
                    }}
                    className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-lg ${mediaType === "IMAGE" && !isCarousel
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-gray-200 hover:border-indigo-300"
                      }`}
                  >
                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Images className="w-8 h-8 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Single Image</h3>
                      <p className="text-gray-600 text-sm">Post a single high-quality image</p>
                    </div>
                  </div>

                  <div
                    onClick={() => {
                      setMediaType("IMAGE");
                      setIsCarousel(true);
                    }}
                    className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-lg ${mediaType === "IMAGE" && isCarousel
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-gray-200 hover:border-indigo-300"
                      }`}
                  >
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <div className="flex space-x-1">
                          <div className="w-3 h-4 bg-green-600 rounded"></div>
                          <div className="w-3 h-4 bg-green-600 rounded"></div>
                          <div className="w-3 h-4 bg-green-600 rounded"></div>
                        </div>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Carousel Post</h3>
                      <p className="text-gray-600 text-sm">Upload multiple images (up to 10)</p>
                    </div>
                  </div>

                  <div
                    onClick={() => {
                      setMediaType("REELS");
                      setIsCarousel(false);
                    }}
                    className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-lg ${mediaType === "REELS" ? "border-indigo-500 bg-indigo-50" : "border-gray-200 hover:border-indigo-300"
                      }`}
                  >
                    <div className="text-center">
                      <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Film className="w-8 h-8 text-purple-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Reels</h3>
                      <p className="text-gray-600 text-sm">Share a short video (max 60 seconds)</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-row justify-end items-center mt-6 md:mt-8 pt-2 border-t border-gray-200 gap-2 p-2">
                  <button
                    onClick={handleNext}
                    disabled={!canProceedFromStep1}
                    className={`flex items-center px-2 md:px-4 py-1 md:py-2 cursor-pointer rounded-lg font-medium transition-all w-auto sm:w-auto ${canProceedFromStep1
                      ? "bg-gradient-to-br from-blue-300 via-blue-500 to-blue-500 text-white hover:bg-white"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                      }`}
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4 md:w-5 md:h-5 ml-2" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Upload Media */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="flex items-center w-full justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Upload Your {isCarousel ? "Images" : mediaType === "REELS" ? "Video" : "Image"}
                    </h2>
                    <p className="text-gray-600">
                      {mediaType === "IMAGE" && !isCarousel && "Upload a JPEG image with valid dimensions and aspect ratio"}
                      {mediaType === "IMAGE" && isCarousel && "Upload multiple JPEG images for your carousel post"}
                      {mediaType === "REELS" && "Upload an MP4, MPEG, or WebM video file (max 60 seconds)"}
                    </p>
                  </div>
                </div>

                {isCarousel ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                      {mediaUrls.map((url, index) => (
                        <div key={index} className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-indigo-400 transition-colors">
                          {files[index] ? (
                            <div className="space-y-3">
                              <div className="relative bg-gray-50 rounded-lg p-3 shadow-sm">
                                <label htmlFor={`replace-file-${index}`} className="cursor-pointer">
                                  <img
                                    src={URL.createObjectURL(files[index])}
                                    alt="Preview"
                                    className="w-full h-32 object-contain rounded-lg"
                                    onLoad={(e) => URL.revokeObjectURL(e.target.src)}
                                  />
                                </label>
                                <input
                                  type="file"
                                  accept="image/jpeg"
                                  multiple
                                  onChange={(e) => handleFileChange(index, e.target.files)}
                                  className="hidden"
                                  id={`replace-file-${index}`}
                                />
                                <p className="text-xs text-gray-600 mt-2 truncate">{files[index].name}</p>
                                {validations[index] && (
                                  <div className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center ${validations[index].status === "valid" ? "bg-green-100" : "bg-red-100"
                                    }`}>
                                    {validations[index].status === "valid" ? (
                                      <CheckCircle className="w-4 h-4 text-green-600" />
                                    ) : (
                                      <XCircle className="w-4 h-4 text-red-600" />
                                    )}
                                  </div>
                                )}
                              </div>

                              {validations[index] && (
                                <p className={`text-xs ${validations[index].status === "valid" ? "text-green-600" : "text-red-600"}`}>
                                  {validations[index].message}
                                </p>
                              )}

                              {/* Always show quick fixes for carousel images */}
                              {mediaType === "IMAGE" && (
                                <div className="bg-gray-50 rounded-lg p-3 border space-y-2">
                                  <p className="text-xs font-medium text-yellow-900">Quick Fixes Available:</p>
                                  <div className="grid grid-cols-3 gap-2">
                                    {VALID_ASPECT_RATIOS.map(([w, h], i) => {
                                      const aspectRatio = w / h;
                                      let label;
                                      if (aspectRatio === 1) label = "Square";
                                      else if (aspectRatio < 1) label = "Portrait";
                                      else label = "Landscape";

                                      return (
                                        <button
                                          key={i}
                                          type="button"
                                          onClick={() => handleFixImage(index, "crop", aspectRatio)}
                                          className="text-xs bg-white border border-black/30 cursor-pointer text-yellow-900 px-2 py-1 rounded-xl hover:bg-sky-50 transition w-full flex flex-col items-center justify-center"
                                        >
                                          <div className="flex items-center">
                                            <Crop className="w-3 h-3 inline mr-1" />
                                            <span>{w}:{h}</span>
                                          </div>
                                          <span className="text-xs opacity-75">{label}</span>
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}

                              <div className="flex justify-between gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveMedia(index)}
                                  className="text-xs text-red-600 cursor-pointer hover:text-red-800 transition"
                                >
                                  <Trash2 className="w-4 h-4 inline mr-1" />
                                  Remove
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <div className="flex flex-col items-center justify-center space-y-3">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                                  <Upload className="w-6 h-6 text-gray-400" />
                                </div>
                                <div>
                                  <input
                                    type="file"
                                    accept="image/jpeg"
                                    multiple
                                    onChange={(e) => handleFileChange(index, e.target.files)}
                                    className="hidden"
                                    id={`file-${index}`}
                                  />
                                  <label
                                    htmlFor={`file-${index}`}
                                    className="cursor-pointer text-sm bg-indigo-100 text-indigo-700 px-3 py-2 rounded-lg hover:bg-indigo-200 transition inline-block"
                                  >
                                    Choose a Image & Multiple Images
                                  </label>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}

                      {mediaUrls.length < 10 && (
                        <div
                          onClick={handleAddMedia}
                          className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-indigo-400 transition-colors"
                        >
                          <div className="space-y-3">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                              <Plus className="w-6 h-6 text-gray-400" />
                            </div>
                            <p className="text-sm text-gray-600">Add Another Image</p>
                            <p className="text-xs text-gray-500">{mediaUrls.length}/10</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="w-full mx-auto">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-sky-400 transition-colors">
                      {files[0] ? (
                        <div className="space-y-6">
                          <div className={`grid grid-cols-1 ${mediaType === "IMAGE" ? "md:grid-cols-2" : "md:grid-cols-1"} gap-6 items-start`}>                            {mediaType === "IMAGE" && (
                            <div className="bg-gradient-to-br from-sky-50 to-white border border-blue-200 rounded-xl p-6 shadow-lg shadow-blue-100/50">
                              <div className="flex items-center gap-3 mb-5">
                                <div className="bg-gradient-to-tr from-purple-500 via-pink-500 to-orange-500 p-2 rounded-lg shadow-md">
                                  <ImageUpscale className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                  <p className="text-lg text-left font-semibold text-slate-800">Quick Fixes</p>
                                  <p className="text-sm text-slate-500">Instantly crop to perfect ratios</p>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 gap-3">
                                {VALID_ASPECT_RATIOS.map(([w, h], i) => (
                                  <button
                                    key={i}
                                    type="button"
                                    onClick={() => handleFixImage(0, "crop", w / h)}
                                    className="group relative bg-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 border border-slate-200 hover:border-blue-300 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ease-in-out hover:shadow-md hover:shadow-blue-100/50 active:scale-[0.98]"
                                  >
                                    <div className="flex items-center cursor-pointer gap-4">
                                      <div className="relative w-6 h-6 flex items-center justify-center">
                                        <div
                                          className="bg-gradient-to-br from-blue-400 to-indigo-500 border-1 border-white rounded shadow-sm group-hover:shadow-md transition-shadow duration-200"
                                          style={{
                                            width: w > h ? "24px" : `${(w / h) * 24}px`,
                                            height: h > w ? "24px" : `${(h / w) * 24}px`,
                                          }}
                                        />
                                        <div className="absolute inset-0 bg-white/20 rounded-lg"></div>
                                      </div>

                                      <div className="flex items-center justify-between flex-1">
                                        <span className="text-slate-700 group-hover:text-blue-700 font-medium transition-colors duration-200">
                                          Crop to {w}:{h}
                                        </span>
                                        <span className="text-xs text-slate-400 group-hover:text-pink-500 transition-colors duration-200">
                                          {w === h ? "Square" : w > h ? "Landscape" : "Portrait"}
                                        </span>
                                      </div>

                                      <svg className="w-4 h-4 text-slate-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                      </svg>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                            <div className="relative bg-gradient-to-br from-sky-50 to-white border py-6 border-sky-200 rounded-xl shadow-blue-100/50">
                              {mediaType === "IMAGE" ? (
                                <label htmlFor="replace-main-file" className="cursor-pointer">
                                  <img
                                    src={URL.createObjectURL(files[0])}
                                    alt="Preview"
                                    className="w-full max-h-54 object-contain rounded-xl mx-auto"
                                    onLoad={(e) => URL.revokeObjectURL(e.target.src)}
                                  />
                                </label>
                              ) : (
                                <div className="relative bg-white  rounded-2xl p-6 shadow-sm  overflow-hidden">
                                  {/* Background pattern */}
                                  <div className="absolute inset-0 opacity-10">
                                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-orange-500/20"></div>
                                    <div className="absolute inset-0" style={{
                                      backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                                      backgroundSize: '20px 20px'
                                    }}></div>
                                  </div>

                                  {/* Header with Instagram-style branding */}
                                  <div className="relative mb-6 flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                      <div className="w-10 h-10 bg-gradient-to-tr from-purple-500 via-pink-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                                        <Film className="w-5 h-5 text-white" />
                                      </div>
                                      <div>
                                        <h3 className="text-black/80 font-semibold text-lg">Reels Preview</h3>
                                        {/* <p className="text-gray-400 text-sm">Professional video display</p> */}
                                      </div>
                                    </div>
                                    <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-purple-500/30 rounded-lg px-3 py-1">
                                      <span className="text-purple-700 text-xs font-medium">HD Quality</span>
                                    </div>
                                  </div>

                                  {validations[0] && (
                                    <p className={`text-base -mt-10 p-2 ${validations[0].status === "valid" ? "text-green-600" : "text-red-600"}`}>
                                      {validations[0].message}
                                    </p>
                                  )}


                                  {/* Enhanced Video Container - Now Centered */}
                                  <div className="relative bg-black rounded-2xl w-1/2 mx-auto overflow-hidden shadow-2xl shadow-purple-500/20 border border-gray-700">
                                    {/* Video element with enhanced styling */}

                                    <div className="relative aspect-[2/3] max-h-[200px] w-full">
                                      <video
                                        src={URL.createObjectURL(files[0])}
                                        controls
                                        className="w-full h-full object-cover rounded-2xl"
                                        controlsList="nodownload"
                                        onLoadedMetadata={(e) => URL.revokeObjectURL(e.target.src)}
                                        style={{
                                          filter: 'contrast(1.1) saturate(1.1) brightness(1.05)',
                                        }}
                                      />

                                      {/* Professional overlay controls */}
                                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
                                        <div className="flex items-center justify-between">
                                        </div>
                                      </div>
                                    </div>

                                    {/* Professional info bar */}
                                    <div className="bg-gradient-to-r from-gray-900 to-gray-800 border-t border-gray-700 p-4">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                          <div className="flex items-center space-x-2">
                                            <div className="w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
                                              <CheckCircle className="w-2 h-2 text-white" />
                                            </div>
                                            <span className="text-green-400 text-xs font-medium">Ready to Publish</span>
                                          </div>
                                        </div>

                                        <div className="flex items-center space-x-4 text-gray-400 text-xs">
                                          <span className="flex items-center space-x-1">
                                            <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
                                            <span>Professional Quality</span>
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* File info with enhanced styling */}
                                  <div className="relative mt-4 bg-white backdrop-blur-sm border border-gray-600 rounded-xl p-4">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-gradient-to-tr from-purple-500 via-pink-500 to-orange-500 rounded-lg flex items-center justify-center">
                                          <Film className="w-4 h-4 text-white" />
                                        </div>
                                        <div>
                                          <p className="text-black font-medium text-sm truncate max-w-[200px]">{files[0].name}</p>
                                          <p className="text-gray-700 text-xs">
                                            {(files[0].size / (1024 * 1024)).toFixed(2)} MB
                                          </p>
                                        </div>
                                      </div>

                                      <label htmlFor="replace-main-file" className="cursor-pointer">
                                        <div className="bg-white hover:from-blue-600 hover:to-sky-50 text-black border border-black/20 px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200 shadow-lg hover:shadow-purple-500/25 active:scale-95">
                                          Replace Video
                                        </div>
                                      </label>
                                    </div>
                                  </div>
                                </div>
                              )}
                              <input
                                type="file"
                                accept={mediaType === "IMAGE" ? "image/jpeg" : "video/mp4,video/mpeg,video/webm"}
                                onChange={(e) => handleFileChange(0, e.target.files)}
                                className="hidden"
                                id="replace-main-file"
                              />
                              {mediaType === "IMAGE" && <p className="text-xs text-gray-600 mt-2 truncate">{files[0].name}</p>}
                            </div>
                          </div>
                          {mediaType === "REELS" && validations[0]?.status === 'invalid' && (
                            <div className="mt-4 p-3 bg-yellow-50 rounded-lg text-sm text-yellow-700">
                              {validations[0].message.includes('duration') && (
                                <p>Trim reels to 60s using tools like FFmpeg.</p>
                              )}
                              {validations[0].message.includes('file type') && (
                                <p>Convert to MP4/MPEG/WebM using tools like FFmpeg.</p>
                              )}
                            </div>
                          )}

                          {/* Error Display */}
                          {error && (
                            <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                              <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                              <p className="text-sm text-red-700">{error}</p>
                            </div>
                          )}

                          {mediaType === "IMAGE" && files[0] && (
                            <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                              <h4 className="text-sm font-medium text-gray-700 mb-2">Custom Resize</h4>

                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-xs text-gray-600 mb-1">Width</label>
                                  <input
                                    type="number"
                                    value={customDimensions[0].width}
                                    onChange={(e) => handleDimensionChange(0, 'width', e.target.value)}
                                    placeholder="150–1920"
                                    className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs text-gray-600 mb-1">Height</label>
                                  <input
                                    type="number"
                                    value={customDimensions[0].height}
                                    onChange={(e) => handleDimensionChange(0, 'height', e.target.value)}
                                    placeholder="150–1920"
                                    className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500"
                                  />
                                </div>
                              </div>
                              <div className="flex items-center mt-3 space-x-3">
                                <input
                                  type="checkbox"
                                  checked={customDimensions[0].maintainAspectRatio}
                                  onChange={() => handleAspectRatioToggle(0)}
                                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 rounded"
                                />
                                <span className="text-sm text-gray-600">Maintain Aspect Ratio</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleApplyDimensions(0)}
                                className="mt-3 w-full py-2 bg-white border border-blue-500 text-blue-600 rounded-lg cursor-pointer hover:bg-sky-50 transition flex items-center justify-center text-sm"
                              >
                                <RotateCcw className="w-4 h-4 mr-2" />
                                Apply Resize
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="w-full -mt-4">
                          <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
                            <ImageIcon className="w-6 h-6 text-sky-500" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                              Upload your {mediaType === "REELS" ? "video" : "image"}
                            </h3>
                            <p className="text-gray-600 text-sm mb-4">
                              {mediaType === "IMAGE"
                                ? "Drag and drop a JPEG image or click to browse"
                                : "Drag and drop an MP4, MPEG, or WebM video or click to browse"}
                            </p>
                          </div>
                          <div className="space-y-3">
                            <input
                              type="file"
                              accept={mediaType === "IMAGE" ? "image/jpeg" : "video/mp4,video/mpeg,video/webm"}
                              onChange={(e) => handleFileChange(0, e.target.files)}
                              className="hidden"
                              id="main-file-input"
                            />
                            <div className="flex justify-center">
                              <label
                                htmlFor="main-file-input"
                                className="cursor-pointer flex items-center gap-2 bg-gradient-to-br from-sky-500 via-sky-600 to-blue-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition font-medium shadow-md w-auto"
                              >
                                <Upload className="w-5 h-5" />
                                <span>Choose File</span>
                              </label>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex flex-row justify-between items-center mt-6 md:mt-8 pt-2 border-t border-gray-200 gap-2 p-4">
                  <button
                    onClick={handleBack}
                    className="bg-gradient-to-br from-blue-300 via-blue-500 to-blue-500 text-white hover:bg-white flex items-center px-2 md:px-4 py-1 md:py-2 cursor-pointer rounded-lg font-medium transition-all w-auto sm:w-auto"
                  >
                    <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 mr-2 " />
                    <span>Prev</span>
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={!canProceedFromStep2}
                    className={`flex items-center px-2 md:px-4 py-1 md:py-2 cursor-pointer rounded-lg font-medium transition-all w-auto sm:w-auto ${canProceedFromStep2
                      ? "bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                      }`}
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4 md:w-5 md:h-5 ml-2" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Add Details */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Add Details</h2>
                    <p className="text-gray-600">Write a caption and add accessibility text</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {mediaType === "IMAGE" && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Alt Text (for accessibility)
                      </label>
                      <input
                        type="text"
                        value={altTexts[0]}
                        onChange={(e) => handleAltTextChange(0, e.target.value)}
                        placeholder="Describe your image for screen readers..."
                        className="w-full p-4 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">Help visually impaired users understand your content</p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Caption</label>
                    <textarea
                      value={captions[0]}
                      onChange={(e) => handleCaptionChange(0, e.target.value)}
                      placeholder="Write an engaging caption for your post..."
                      className="w-full p-4 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 resize-y min-h-[120px]"
                    />
                    <p className="text-xs text-gray-500 mt-1">Tell your story, add hashtags, and engage your audience</p>
                  </div>
                </div>

                <div className="flex flex-row justify-between items-center mt-6 md:mt-6 pt-3 border-t border-gray-200 gap-2 p-4">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex bg-gradient-to-br from-blue-300 via-blue-500 to-blue-500 text-white hover:bg-white items-center px-2 md:px-4 py-1 md:py-2 cursor-pointer rounded-lg font-medium transition-all w-auto sm:w-auto"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Prev</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading || validations.some((v) => v.status === "invalid")}
                    className={`flex items-center px-2 cursor-pointer md:px-4 py-1 md:py-2 rounded-lg font-medium transition-all duration-200 ease-in-out transform active:translate-y-1 active:shadow-inner hover:scale-105 w-auto sm:w-auto ${loading || validations.some((v) => v.status === "invalid")
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-br from-green-400 via-green-500 to-green-600 text-white shadow-md hover:shadow-lg"
                      }`}
                  >
                    {loading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Publishing...</span>
                      </div>
                    ) : (
                      <>
                        <span>Publish to Instagram</span>
                        <Send className="w-4 h-4 md:w-5 md:h-5 ml-2" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            <canvas ref={canvasRef} style={{ display: "none" }} />
          </div>
        </div>
      </div>
    </div>
  );
}