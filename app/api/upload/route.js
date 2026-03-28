
import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { mkdir } from 'fs/promises';
import { fileTypeFromBuffer } from 'file-type';
import imageSize from 'image-size';

// Instagram constraints
const MAX_IMAGE_SIZE = 8 * 1024 * 1024; // 8MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB for videos/reels
const VALID_IMAGE_TYPES = ['image/jpeg'];
const VALID_VIDEO_TYPES = ['video/mp4', 'video/mpeg', 'video/webm'];
const MIN_IMAGE_DIMENSION = 150; // Minimum width/height
const MAX_IMAGE_DIMENSION = 1920; // Maximum width/height
const VALID_ASPECT_RATIOS = [
  [1, 1], // Square (1:1)
  [4, 5], // Vertical (4:5)
  [1.91, 1], // Horizontal (1.91:1)
];

export async function POST(req) {
  const requestId = crypto.randomUUID();
  const logPrefix = `[${new Date().toISOString()}] [${requestId}]`;
  console.log(`${logPrefix} POST /api/upload`);

  try {
    const formData = await req.formData();
    const file = formData.get('file');
    const mediaType = formData.get('mediaType');

    if (!file || !mediaType) {
      console.error(`${logPrefix} Missing file or mediaType`);
      return NextResponse.json({ message: 'File and mediaType are required', requestId }, { status: 400 });
    }

    // Validate file type
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileType = await fileTypeFromBuffer(buffer);
    const isVideo = mediaType === 'VIDEO' || mediaType === 'REELS';
    const validTypes = isVideo ? VALID_VIDEO_TYPES : VALID_IMAGE_TYPES;

    if (!fileType || !validTypes.includes(fileType.mime)) {
      console.error(`${logPrefix} Invalid file type:`, fileType?.mime || 'Unknown');
      return NextResponse.json({
        message: `Invalid file type. For ${mediaType}, use ${isVideo ? 'MP4, MPEG, or WebM' : 'JPEG'}`,
        requestId,
      }, { status: 400 });
    }

    // Validate file size
    const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
    if (buffer.length > maxSize) {
      console.error(`${logPrefix} File too large:`, buffer.length);
      return NextResponse.json({
        message: `File size exceeds ${maxSize / (1024 * 1024)}MB limit`,
        requestId,
      }, { status: 400 });
    }

    // Validate image dimensions and aspect ratio (for images only)
    if (mediaType === 'IMAGE') {
      const { width, height, type } = imageSize(buffer);
      if (type !== 'jpg') {
        console.error(`${logPrefix} Invalid image format:`, type);
        return NextResponse.json({
          message: 'Image must be in JPEG format',
          requestId,
        }, { status: 400 });
      }

      if (width < MIN_IMAGE_DIMENSION || height < MIN_IMAGE_DIMENSION) {
        console.error(`${logPrefix} Image too small: ${width}x${height}`);
        return NextResponse.json({
          message: `Image dimensions must be at least ${MIN_IMAGE_DIMENSION}x${MIN_IMAGE_DIMENSION}`,
          requestId,
        }, { status: 400 });
      }

      if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
        console.error(`${logPrefix} Image too large: ${width}x${height}`);
        return NextResponse.json({
          message: `Image dimensions must not exceed ${MAX_IMAGE_DIMENSION}x${MAX_IMAGE_DIMENSION}`,
          requestId,
        }, { status: 400 });
      }

      const aspectRatio = width / height;
      const isValidAspectRatio = VALID_ASPECT_RATIOS.some(([w, h]) => {
        const ratio = w / h;
        return Math.abs(aspectRatio - ratio) < 0.1 || Math.abs((1 / aspectRatio) - ratio) < 0.1;
      });

      if (!isValidAspectRatio) {
        console.error(`${logPrefix} Invalid aspect ratio: ${aspectRatio}`);
        return NextResponse.json({
          message: 'Image aspect ratio must be approximately 1:1, 4:5, or 1.91:1',
          requestId,
        }, { status: 400 });
      }
    }

    // Save file to public/uploads
    const filename = `${crypto.randomUUID()}${path.extname(file.name)}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    const filePath = path.join(uploadDir, filename);

    await mkdir(uploadDir, { recursive: true });
    await writeFile(filePath, buffer);
    console.log(`${logPrefix} File saved:`, filePath);

    // Generate public URL
    const publicUrl = `${process.env.NEXTAUTH_URL}/uploads/${filename}`;
    console.log(`${logPrefix} Generated public URL:`, publicUrl);

    // Verify URL accessibility
    try {
      const response = await fetch(publicUrl, { method: 'HEAD' });
      if (!response.ok) {
        console.error(`${logPrefix} URL not accessible:`, response.status);
        return NextResponse.json({
          message: `Uploaded file is not accessible (HTTP ${response.status})`,
          requestId,
        }, { status: 500 });
      }
    } catch (error) {
      console.error(`${logPrefix} Failed to verify URL:`, error.message);
      return NextResponse.json({
        message: 'Uploaded file is not publicly accessible',
        requestId,
      }, { status: 500 });
    }

    return NextResponse.json({ url: publicUrl, requestId });
  } catch (error) {
    console.error(`${logPrefix} Upload error:`, error.message, error.stack);
    return NextResponse.json({ message: 'Failed to upload file', details: error.message, requestId }, { status: 500 });
  }
}
