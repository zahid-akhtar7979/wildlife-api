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
    transformation: [
      {
        width: 1280,
        height: 720,
        crop: 'limit',
        quality: 'auto:good',
        video_codec: 'h264'
      }
    ],
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

    // Generate responsive image URLs
    const imageData = {
      id: req.file.public_id,
      url: req.file.secure_url,
      caption,
      alt,
      sizes: {
        thumbnail: cloudinary.url(req.file.public_id, {
          width: 300,
          height: 200,
          crop: 'fill',
          quality: 'auto:good',
          fetch_format: 'auto',
          secure: true
        }),
        medium: cloudinary.url(req.file.public_id, {
          width: 800,
          height: 600,
          crop: 'limit',
          quality: 'auto:good',
          fetch_format: 'auto',
          secure: true
        }),
        large: cloudinary.url(req.file.public_id, {
          width: 1200,
          height: 800,
          crop: 'limit',
          quality: 'auto:good',
          fetch_format: 'auto',
          secure: true
        }),
        original: req.file.secure_url
      }
    };

    res.json({
      success: true,
      message: 'Image uploaded successfully',
      data: { image: imageData }
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Image upload failed'
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
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No video file provided'
      });
    }

    const { caption = '' } = req.body;

    // Generate video thumbnail
    const thumbnail = cloudinary.url(req.file.public_id, {
      resource_type: 'video',
      format: 'jpg',
      transformation: [
        { width: 800, height: 450, crop: 'fill' },
        { quality: 'auto:good' }
      ],
      secure: true
    });

    const videoData = {
      id: req.file.public_id,
      url: req.file.secure_url,
      caption,
      thumbnail,
      duration: req.file.duration || null,
      format: req.file.format
    };

    res.json({
      success: true,
      message: 'Video uploaded successfully',
      data: { video: videoData }
    });
  } catch (error) {
    console.error('Video upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Video upload failed'
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
      id: file.public_id,
      url: file.secure_url,
      caption: '',
      alt: '',
      sizes: {
        thumbnail: cloudinary.url(file.public_id, {
          width: 300,
          height: 200,
          crop: 'fill',
          quality: 'auto:good',
          fetch_format: 'auto',
          secure: true
        }),
        medium: cloudinary.url(file.public_id, {
          width: 800,
          height: 600,
          crop: 'limit',
          quality: 'auto:good',
          fetch_format: 'auto',
          secure: true
        }),
        large: cloudinary.url(file.public_id, {
          width: 1200,
          height: 800,
          crop: 'limit',
          quality: 'auto:good',
          fetch_format: 'auto',
          secure: true
        }),
        original: file.secure_url
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
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files'
      });
    }
  }
  
  if (error.message === 'Only image files are allowed!' || 
      error.message === 'Only video files are allowed!') {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }

  next(error);
});

module.exports = router; 