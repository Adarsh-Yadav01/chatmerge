
'use client';
import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { AlertCircle, Send, Plus, Trash2, Images, Film, RotateCcw, Crop } from 'lucide-react';
import Swal from 'sweetalert2';
import Loader from '@/app/components/Loader';
import Image from 'next/image';
import getImageSize from 'browser-image-size';
import instalogo from '../../../public/instalogo.webp';

export default function PublishPage() {
  const { data: session, status } = useSession();
  const [mediaType, setMediaType] = useState('IMAGE');
  const [mediaUrls, setMediaUrls] = useState(['']);
  const [files, setFiles] = useState([]);
  const [captions, setCaptions] = useState(['']);
  const [altTexts, setAltTexts] = useState(['']);
  const [customDimensions, setCustomDimensions] = useState([{ width: '', height: '', maintainAspectRatio: true }]);
  const [isCarousel, setIsCarousel] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validations, setValidations] = useState([]);
  const canvasRef = useRef(null);

  // Instagram constraints
  const MAX_IMAGE_SIZE = 8 * 1024 * 1024; // 8MB
  const MAX_REELS_SIZE = 100 * 1024 * 1024; // 100MB
  const VALID_IMAGE_TYPES = ['image/jpeg'];
  const VALID_REELS_TYPES = ['video/mp4', 'video/mpeg', 'video/webm'];
  const MIN_IMAGE_DIMENSION = 150;
  const MAX_IMAGE_DIMENSION = 1920;
  const VALID_ASPECT_RATIOS = [[1, 1], [4, 5], [1.91, 1]];
  const MAX_REELS_DURATION = 60; // seconds

  // Validate URL
  const isValidMediaUrl = (url) => {
    try {
      const parsedUrl = new URL(url);
      return ['http:', 'https:'].includes(parsedUrl.protocol) && !url.startsWith('data:');
    } catch {
      return false;
    }
  };

  // Validate media file
  const validateMedia = async (file, index) => {
    const validation = { index, status: 'pending', message: '' };
    if (!file) {
      validation.status = 'invalid';
      validation.message = 'No file selected';
      return validation;
    }

    // Check file type
    const isReels = mediaType === 'REELS';
    const validTypes = isReels ? VALID_REELS_TYPES : VALID_IMAGE_TYPES;
    if (!validTypes.includes(file.type)) {
      validation.status = 'invalid';
      validation.message = `Invalid file type. Use ${isReels ? 'MP4, MPEG, or WebM' : 'JPEG'}`;
      return validation;
    }

    // Check file size
    const maxSize = isReels ? MAX_REELS_SIZE : MAX_IMAGE_SIZE;
    if (file.size > maxSize) {
      validation.status = 'invalid';
      validation.message = `File size exceeds ${maxSize / (1024 * 1024)}MB limit`;
      return validation;
    }

    if (mediaType === 'IMAGE') {
      try {
        const { width, height } = await getImageSize(file);
        if (width < MIN_IMAGE_DIMENSION || height < MIN_IMAGE_DIMENSION) {
          validation.status = 'invalid';
          validation.message = `Image dimensions must be at least ${MIN_IMAGE_DIMENSION}x${MIN_IMAGE_DIMENSION}`;
          return validation;
        }
        if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
          validation.status = 'invalid';
          validation.message = `Image dimensions must not exceed ${MAX_IMAGE_DIMENSION}x${MAX_IMAGE_DIMENSION}`;
          return validation;
        }
        const aspectRatio = width / height;
        const isValidAspectRatio = VALID_ASPECT_RATIOS.some(([w, h]) => {
          const ratio = w / h;
          return Math.abs(aspectRatio - ratio) < 0.1 || Math.abs((1 / aspectRatio) - ratio) < 0.1;
        });
        if (!isValidAspectRatio) {
          validation.status = 'invalid';
          validation.message = 'Image aspect ratio must be approximately 1:1, 4:5, or 1.91:1';
          return validation;
        }
        validation.status = 'valid';
        validation.message = 'Image is valid';
      } catch (err) {
        validation.status = 'invalid';
        validation.message = 'Failed to validate image dimensions';
      }
    } else if (mediaType === 'REELS') {
      const video = document.createElement('video');
      video.src = URL.createObjectURL(file);
      await new Promise((resolve) => {
        video.onloadedmetadata = () => resolve();
      });
      const duration = video.duration;
      if (duration > MAX_REELS_DURATION) {
        validation.status = 'invalid';
        validation.message = `Reels duration exceeds ${MAX_REELS_DURATION} seconds`;
        return validation;
      }
      validation.status = 'valid';
      validation.message = 'Reels is valid';
      URL.revokeObjectURL(video.src);
    }
    return validation;
  };

  // Resize image
  const resizeImage = async (file, index, targetWidth, targetHeight, maintainAspectRatio = true) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
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
      canvas.toBlob(resolve, 'image/jpeg', 0.9)
    );
    const resizedFile = new File([blob], file.name, { type: 'image/jpeg' });
    URL.revokeObjectURL(img.src);

    const newFiles = [...files];
    newFiles[index] = resizedFile;
    setFiles(newFiles);
    handleFileChange(index, resizedFile);
    return resizedFile;
  };

  // Crop image
  const cropImage = async (file, index, targetAspectRatio) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
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
    ctx.drawImage(img, (width - newWidth) / 2, (height - newHeight) / 2, newWidth, newHeight, 0, 0, newWidth, newHeight);
    const blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', 0.9)
    );
    const croppedFile = new File([blob], file.name, { type: 'image/jpeg' });
    URL.revokeObjectURL(img.src);

    const newFiles = [...files];
    newFiles[index] = croppedFile;
    setFiles(newFiles);
    handleFileChange(index, croppedFile);
    return croppedFile;
  };

  const handleAddMedia = () => {
    if (mediaUrls.length < 10) {
      setMediaUrls([...mediaUrls, '']);
      setFiles([...files, null]);
      setCaptions([...captions, '']);
      setAltTexts([...altTexts, '']);
      setCustomDimensions([...customDimensions, { width: '', height: '', maintainAspectRatio: true }]);
      setValidations([...validations, { index: mediaUrls.length, status: 'pending', message: '' }]);
    }
  };

  const handleRemoveMedia = (index) => {
    setMediaUrls(mediaUrls.filter((_, i) => i !== index));
    setFiles(files.filter((_, i) => i !== index));
    setCaptions(captions.filter((_, i) => i !== index));
    setAltTexts(altTexts.filter((_, i) => i !== index));
    setCustomDimensions(customDimensions.filter((_, i) => i !== index));
    setValidations(validations.filter((v) => v.index !== index).map((v, i) => ({ ...v, index: i })));
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

  const handleFileChange = async (index, file) => {
    if (!file) return;
    const newFiles = [...files];
    newFiles[index] = file;
    setFiles(newFiles);

    const validation = await validateMedia(file, index);
    const newValidations = [...validations];
    newValidations[index] = validation;
    setValidations(newValidations);

    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('mediaType', mediaType);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to upload file');
      }

      const newUrls = [...mediaUrls];
      newUrls[index] = data.url;
      setMediaUrls(newUrls);
      newValidations[index] = { index, status: 'valid', message: 'File uploaded successfully' };
      setValidations(newValidations);
    } catch (err) {
      console.error('File upload error:', err);
      setError(err.message);
      newValidations[index] = { index, status: 'invalid', message: `Upload failed: ${err.message}` };
      setValidations(newValidations);
    } finally {
      setLoading(false);
    }
  };

  const handleFixImage = async (index, action, param) => {
    const file = files[index];
    if (!file || mediaType !== 'IMAGE') return;

    setLoading(true);
    try {
      let newFile;
      if (action === 'resize') {
        newFile = await resizeImage(file, index, MAX_IMAGE_DIMENSION, MAX_IMAGE_DIMENSION);
      } else if (action === 'crop') {
        newFile = await cropImage(file, index, param);
      }
      const validation = await validateMedia(newFile, index);
      const newValidations = [...validations];
      newValidations[index] = validation;
      setValidations(newValidations);
    } catch (err) {
      setError('Failed to process image');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const validUrls = mediaUrls.filter((url) => url.trim() !== '');
    for (const [index, url] of validUrls.entries()) {
      if (!isValidMediaUrl(url)) {
        setError(`Invalid URL at position ${index + 1}. Use a public HTTP/HTTPS URL.`);
        setLoading(false);
        return;
      }
    }

    if (validUrls.length === 0) {
      setError('At least one valid media URL is required.');
      setLoading(false);
      return;
    }

    if (validations.some((v) => v.status === 'invalid')) {
      setError('Please fix all invalid media before publishing.');
      setLoading(false);
      return;
    }

    // Show publishing modal
    Swal.fire({
      title: 'Publishing...',
      html: '<div class="flex justify-center"><div class="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div></div>',
      allowOutsideClick: false,
      showConfirmButton: false,
      backdrop: 'rgba(0,0,0,0.7)',
      customClass: {
        popup: 'rounded-2xl shadow-xl',
        title: 'text-xl font-bold text-gray-900',
      },
    });

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
      if (!response.ok) {
        throw new Error(data.message || 'Failed to publish media');
      }

      await Swal.fire({
        title: 'Success!',
        text: `Media published successfully with ID: ${data.mediaId}`,
        icon: 'success',
        confirmButtonText: 'Awesome!',
        confirmButtonColor: '#4f46e5',
        backdrop: 'rgba(0,0,0,0.7)',
        customClass: {
          popup: 'rounded-2xl shadow-xl',
          title: 'text-2xl font-bold text-gray-900',
          content: 'text-gray-600',
          confirmButton: 'py-2 px-6 rounded-lg text-white font-semibold',
        },
      });

      setMediaUrls(['']);
      setFiles([]);
      setCaptions(['']);
      setAltTexts(['']);
      setCustomDimensions([{ width: '', height: '', maintainAspectRatio: true }]);
      setValidations([{ index: 0, status: 'pending', message: '' }]);
      setIsCarousel(false);
    } catch (err) {
      console.error('Publish error:', err);
      setError(err.message);
      Swal.close();
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return <Loader />;
  }

  if (!session || session.user.role !== 'USER') {
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
    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-pink-500 via-red-500 to-yellow-500 rounded-2xl flex items-center justify-center shadow-md">
              <Image src={instalogo} alt="Instagram Logo" width={40} height={40} className="rounded-md" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Publish to Instagram</h1>
              <p className="text-gray-600 mt-1">
                Share stunning images or reels. Upload files or use public URLs with ease.
              </p>
            </div>
          </div>
        </header>

        {error && (
          <div className="mb-6 p-4 border border-red-200 bg-red-50 rounded-2xl shadow-sm">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Media Type</label>
                <div className="flex flex-wrap gap-4">
                  {['IMAGE', 'REELS'].map((type) => (
                    <label
                      key={type}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-full border transition-all duration-200 ${
                        mediaType === type
                          ? 'bg-indigo-100 border-indigo-500 text-indigo-700'
                          : 'border-gray-300 text-gray-600 hover:border-indigo-500 hover:bg-indigo-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="mediaType"
                        value={type}
                        checked={mediaType === type}
                        onChange={(e) => {
                          setMediaType(e.target.value);
                          setValidations(mediaUrls.map((_, i) => ({ index: i, status: 'pending', message: '' })));
                          setCustomDimensions(mediaUrls.map(() => ({ width: '', height: '', maintainAspectRatio: true })));
                        }}
                        className="sr-only"
                      />
                      <span className="flex items-center">
                        {type === 'IMAGE' && <Images className="w-4 h-4 mr-2" />}
                        {type === 'REELS' && <Film className="w-4 h-4 mr-2" />}
                        {type}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Carousel Post?</label>
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={isCarousel}
                    onChange={(e) => setIsCarousel(e.target.checked)}
                    className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 rounded"
                  />
                  <span className="text-sm text-gray-600">Enable carousel (up to 10 media items)</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Media Items</label>
              <p className="text-sm text-gray-500 mb-4">
                Upload JPEG images or MP4/MPEG/WebM reels. Or paste public URLs. Previews and tools below.
              </p>
              <div className="space-y-6">
                {mediaUrls.map((url, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 rounded-xl p-4 md:p-6 border border-gray-200 hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-sm font-medium text-gray-800">Media Item {index + 1}</h3>
                      {mediaUrls.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMedia(index)}
                          className="p-1 text-red-500 hover:text-red-700 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <input
                            type="file"
                            accept={mediaType === 'IMAGE' ? 'image/jpeg' : 'video/mp4,video/mpeg,video/webm'}
                            onChange={(e) => handleFileChange(index, e.target.files[0])}
                            className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                          />
                        </div>
                        <div>
                          <input
                            type="url"
                            value={url}
                            onChange={(e) => handleMediaUrlChange(index, e.target.value)}
                            placeholder="https://example.com/media.jpg"
                            className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                          />
                        </div>
                        {validations[index] && (
                          <p
                            className={`text-sm p-2 rounded-md ${
                              validations[index].status === 'valid'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {validations[index].message}
                          </p>
                        )}
                      </div>
                      <div className="space-y-4">
                        {files[index] && (
                          <div className="relative group">
                            {mediaType === 'IMAGE' ? (
                              <img
                                src={URL.createObjectURL(files[index])}
                                alt="Preview"
                                className="w-full max-h-48 object-cover rounded-lg shadow-sm group-hover:shadow-md transition-shadow"
                                onLoad={(e) => URL.revokeObjectURL(e.target.src)}
                              />
                            ) : (
                              <video
                                src={URL.createObjectURL(files[index])}
                                controls
                                className="w-full max-h-48 object-cover rounded-lg shadow-sm group-hover:shadow-md transition-shadow"
                                onLoadedMetadata={(e) => URL.revokeObjectURL(e.target.src)}
                              />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    {mediaType === 'IMAGE' && validations[index]?.status === 'invalid' && (
                      <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                        <p className="text-sm text-yellow-700 mb-2">Quick Fixes:</p>
                        <div className="flex flex-wrap gap-2">
                          {validations[index].message.includes('dimensions') && (
                            <button
                              type="button"
                              onClick={() => handleFixImage(index, 'resize', MAX_IMAGE_DIMENSION)}
                              className="flex items-center px-3 py-1 bg-white border border-indigo-200 rounded-full text-sm text-indigo-600 hover:bg-indigo-50 transition"
                            >
                              <RotateCcw className="w-4 h-4 mr-1" />
                              Resize to Max
                            </button>
                          )}
                          {validations[index].message.includes('aspect ratio') && (
                            VALID_ASPECT_RATIOS.map(([w, h], i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() => handleFixImage(index, 'crop', w / h)}
                                className="flex items-center px-3 py-1 bg-white border border-indigo-200 rounded-full text-sm text-indigo-600 hover:bg-indigo-50 transition"
                              >
                                <Crop className="w-4 h-4 mr-1" />
                                Crop to {w}:{h}
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                    {mediaType === 'REELS' && validations[index]?.status === 'invalid' && (
                      <div className="mt-4 p-3 bg-yellow-50 rounded-lg text-sm text-yellow-700">
                        {validations[index].message.includes('duration') && (
                          <p>
                            Trim reels to 60s using tools like FFmpeg.
                          </p>
                        )}
                        {validations[index].message.includes('file type') && (
                          <p>
                            Convert to MP4/MPEG/WebM using tools like FFmpeg.
                          </p>
                        )}
                      </div>
                    )}
                    {mediaType === 'IMAGE' && files[index] && (
                      <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Custom Resize</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Width</label>
                            <input
                              type="number"
                              value={customDimensions[index].width}
                              onChange={(e) => handleDimensionChange(index, 'width', e.target.value)}
                              placeholder="150–1920"
                              className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Height</label>
                            <input
                              type="number"
                              value={customDimensions[index].height}
                              onChange={(e) => handleDimensionChange(index, 'height', e.target.value)}
                              placeholder="150–1920"
                              className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500"
                            />
                          </div>
                        </div>
                        <div className="flex items-center mt-3 space-x-3">
                          <input
                            type="checkbox"
                            checked={customDimensions[index].maintainAspectRatio}
                            onChange={() => handleAspectRatioToggle(index)}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 rounded"
                          />
                          <span className="text-sm text-gray-600">Maintain Aspect Ratio</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleApplyDimensions(index)}
                          className="mt-3 w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center justify-center text-sm"
                        >
                          <RotateCcw className="w-4 h-4 mr-2" />
                          Apply Resize
                        </button>
                      </div>
                    )}
                    <div className="mt-4 space-y-4">
                      {mediaType === 'IMAGE' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Alt Text</label>
                          <input
                            type="text"
                            value={altTexts[index]}
                            onChange={(e) => handleAltTextChange(index, e.target.value)}
                            placeholder="Describe for accessibility..."
                            className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                      )}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Caption</label>
                        <textarea
                          value={captions[index]}
                          onChange={(e) => handleCaptionChange(index, e.target.value)}
                          placeholder="Write an engaging caption..."
                          className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 resize-y min-h-[80px]"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                {mediaUrls.length < 10 && (
                  <button
                    type="button"
                    onClick={handleAddMedia}
                    className="w-full py-3 bg-gray-100 text-indigo-600 rounded-xl hover:bg-gray-200 transition flex items-center justify-center text-sm font-medium"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Add Media Item
                  </button>
                )}
              </div>
            </div>

            <canvas ref={canvasRef} style={{ display: 'none' }} />

            <button
              type="submit"
              disabled={loading || validations.some((v) => v.status === 'invalid')}
              className={`w-full py-3 px-4 rounded-xl text-white font-semibold flex items-center justify-center space-x-2 transition duration-200 ${
                loading || validations.some((v) => v.status === 'invalid')
                  ? 'bg-indigo-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 shadow-md hover:shadow-lg'
              }`}
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>Publish to Instagram</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
