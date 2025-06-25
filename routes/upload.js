const express = require('express');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const { authenticateToken, requireContributor } = require('../middleware/auth');

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage configuration for images
const imageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'wildlife-images',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'avif'],
    transformation: [
      {
        width: 1200,
        height: 800,
        crop: 'limit',
        quality: 'auto:good',
        fetch_format: 'auto'
      }
    ],
    public_id: (req, file) => {
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 15);
      return `wildlife_${timestamp}_${random}`;
    },
  },
});

// Storage configuration for videos
const videoStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'wildlife-videos',
    resource_type: 'video',
    allowed_formats: ['mp4', 'mov', 'avi', 'mkv', 'webm'],
    // Make transformations asynchronous to handle large videos
    eager: [
      {
        width: 1280,
        height: 720,
        crop: 'limit',
        quality: 'auto:good',
        video_codec: 'h264'
      }
    ],
    eager_async: true, // Process transformations asynchronously
    public_id: (req, file) => {
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 15);
      return `wildlife_video_${timestamp}_${random}`;
    },
  },
});

// Multer upload middleware
const uploadImage = multer({
  storage: imageStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for images
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
});

const uploadVideo = multer({
  storage: videoStorage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit for videos
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed!'), false);
    }
  },
});

/**
 * @swagger
 * /upload/image:
 *   post:
 *     summary: Upload an image
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *               caption:
 *                 type: string
 *               alt:
 *                 type: string
 */
router.post('/image', authenticateToken, requireContributor, uploadImage.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    const { caption = '', alt = '' } = req.body;

    // Extract Cloudinary data from multer-storage-cloudinary properties
    const cloudinaryUrl = req.file.path; // This is the secure_url from Cloudinary
    const publicId = req.file.filename; // This is the public_id from Cloudinary

    // Generate responsive image URLs
    const imageData = {
      id: publicId,
      url: cloudinaryUrl,
      caption,
      alt,
      sizes: {
        thumbnail: cloudinary.url(publicId, {
          width: 300,
          height: 200,
          crop: 'fill',
          quality: 'auto:good',
          fetch_format: 'auto',
          secure: true
        }),
        medium: cloudinary.url(publicId, {
          width: 800,
          height: 600,
          crop: 'limit',
          quality: 'auto:good',
          fetch_format: 'auto',
          secure: true
        }),
        large: cloudinary.url(publicId, {
          width: 1200,
          height: 800,
          crop: 'limit',
          quality: 'auto:good',
          fetch_format: 'auto',
          secure: true
        }),
        original: cloudinaryUrl
      }
    };

    res.json({
      success: true,
      message: 'Image uploaded successfully',
      data: { image: imageData }
    });
  } catch (error) {
    console.error('Image upload error:', error.message || error);
    console.error('Full error object:', JSON.stringify(error, null, 2));
    res.status(500).json({
      success: false,
      message: 'Image upload failed',
      error: error.message || 'Unknown error'
    });
  }
});

/**
 * @swagger
 * /upload/video:
 *   post:
 *     summary: Upload a video
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               video:
 *                 type: string
 *                 format: binary
 *               caption:
 *                 type: string
 */
router.post('/video', authenticateToken, requireContributor, uploadVideo.single('video'), async (req, res) => {
  try {
    console.log('🎥 VIDEO UPLOAD REQUEST received');
    console.log('🎥 Request file:', req.file ? 'Present' : 'Missing');
    console.log('🎥 Request body:', req.body);
    
    if (!req.file) {
      console.log('❌ No video file provided in request');
      return res.status(400).json({
        success: false,
        message: 'No video file provided'
      });
    }

    console.log('🎥 Video file details:', {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      filename: req.file.filename,
      path: req.file.path
    });

    const { caption = '' } = req.body;

    // Extract Cloudinary data from multer-storage-cloudinary properties
    const cloudinaryUrl = req.file.path; // This is the secure_url from Cloudinary
    const publicId = req.file.filename; // This is the public_id from Cloudinary

    console.log('🎥 Cloudinary data extracted:', {
      publicId,
      cloudinaryUrl,
      caption
    });

    // Generate video thumbnail
    const thumbnail = cloudinary.url(publicId, {
      resource_type: 'video',
      format: 'jpg',
      transformation: [
        { width: 800, height: 450, crop: 'fill' },
        { quality: 'auto:good' }
      ],
      secure: true
    });

    console.log('🎥 Generated thumbnail URL:', thumbnail);

    const videoData = {
      id: publicId,
      url: cloudinaryUrl,
      caption,
      thumbnail,
      duration: req.file.duration || null,
      format: req.file.format
    };

    console.log('🎥 Final video data:', videoData);

    res.json({
      success: true,
      message: 'Video uploaded successfully',
      data: { video: videoData }
    });
  } catch (error) {
    console.error('❌ Video upload error - Message:', error.message || error);
    console.error('❌ Video upload error - Stack:', error.stack);
    console.error('❌ Video upload error - Full object:', JSON.stringify(error, null, 2));
    console.error('❌ Request file at error:', req.file);
    console.error('❌ Request body at error:', req.body);
    
    res.status(500).json({
      success: false,
      message: 'Video upload failed',
      error: error.message || 'Unknown error'
    });
  }
});

/**
 * @swagger
 * /upload/multiple-images:
 *   post:
 *     summary: Upload multiple images
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 */
router.post('/multiple-images', authenticateToken, requireContributor, uploadImage.array('images', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No image files provided'
      });
    }

    const uploadedImages = req.files.map(file => ({
      id: file.filename,
      url: file.path,
      caption: '',
      alt: '',
      sizes: {
        thumbnail: cloudinary.url(file.filename, {
          width: 300,
          height: 200,
          crop: 'fill',
          quality: 'auto:good',
          fetch_format: 'auto',
          secure: true
        }),
        medium: cloudinary.url(file.filename, {
          width: 800,
          height: 600,
          crop: 'limit',
          quality: 'auto:good',
          fetch_format: 'auto',
          secure: true
        }),
        large: cloudinary.url(file.filename, {
          width: 1200,
          height: 800,
          crop: 'limit',
          quality: 'auto:good',
          fetch_format: 'auto',
          secure: true
        }),
        original: file.path
      }
    }));

    res.json({
      success: true,
      message: `${uploadedImages.length} images uploaded successfully`,
      data: { images: uploadedImages }
    });
  } catch (error) {
    console.error('Multiple images upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Images upload failed'
    });
  }
});

/**
 * @swagger
 * /upload/delete/{publicId}:
 *   delete:
 *     summary: Delete a file from Cloudinary
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: publicId
 *         required: true
 *         schema:
 *           type: string
 *         description: Cloudinary public ID of the file
 *       - in: query
 *         name: resourceType
 *         schema:
 *           type: string
 *           enum: [image, video]
 *           default: image
 *         description: Type of resource to delete
 */
router.delete('/delete/:publicId', authenticateToken, requireContributor, async (req, res) => {
  try {
    const { publicId } = req.params;
    const { resourceType = 'image' } = req.query;

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType
    });

    if (result.result === 'ok') {
      res.json({
        success: true,
        message: 'File deleted successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'File not found or already deleted'
      });
    }
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete file'
    });
  }
});

/**
 * @swagger
 * /upload/transform-image/{publicId}:
 *   post:
 *     summary: Get transformed image URL
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: publicId
 *         required: true
 *         schema:
 *           type: string
 *         description: Cloudinary public ID of the image
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               width:
 *                 type: integer
 *               height:
 *                 type: integer
 *               crop:
 *                 type: string
 *                 enum: [fill, fit, limit, scale, crop]
 *                 default: limit
 *               quality:
 *                 type: string
 *                 default: auto:good
 */
router.post('/transform-image/:publicId', authenticateToken, requireContributor, async (req, res) => {
  try {
    const { publicId } = req.params;
    const { 
      width = 800, 
      height = 600, 
      crop = 'limit', 
      quality = 'auto:good' 
    } = req.body;

    const transformedUrl = cloudinary.url(publicId, {
      width,
      height,
      crop,
      quality,
      fetch_format: 'auto',
      secure: true
    });

    res.json({
      success: true,
      data: { 
        url: transformedUrl,
        transformation: { width, height, crop, quality }
      }
    });
  } catch (error) {
    console.error('Transform image error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to transform image'
    });
  }
});

// Error handling middleware for multer
router.use((error, req, res, next) => {
  console.error('❌ Upload middleware error:', error);
  
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Please use a smaller file.'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files'
      });
    }
  }
  
  // Handle Cloudinary-specific errors
  if (error.message && error.message.includes('too large to process synchronously')) {
    return res.status(400).json({
      success: false,
      message: 'Video file is too large. Please use a smaller video file (under 50MB recommended).'
    });
  }
  
  if (error.message && error.message.includes('Video file size too large')) {
    return res.status(400).json({
      success: false,
      message: 'Video file exceeds maximum size limit. Please compress your video or use a smaller file.'
    });
  }
  
  if (error.message === 'Only image files are allowed!' || 
      error.message === 'Only video files are allowed!') {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }

  // Generic error for any other upload issues
  if (error.message) {
    return res.status(400).json({
      success: false,
      message: `Upload failed: ${error.message}`
    });
  }

  next(error);
});

module.exports = router; 