const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, requireContributor, requireOwnershipOrAdmin } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

/**
 * @swagger
 * /articles:
 *   get:
 *     summary: Get all published articles with filtering and search
 *     tags: [Articles]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in title, content, and excerpt
 *       - in: query
 *         name: tags
 *         schema:
 *           type: string
 *         description: Comma-separated list of tags
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: featured
 *         schema:
 *           type: boolean
 *         description: Filter featured articles
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 */
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { search, tags, category, featured, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * parseInt(limit);

    // Build where clause
    const where = {
      published: true
    };

          if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { content: { contains: search, mode: 'insensitive' } },
          { excerpt: { contains: search, mode: 'insensitive' } }
        ];
      }

      if (tags) {
        const tagArray = tags.split(',').map(tag => tag.trim());
        where.tags = {
          hasSome: tagArray
        };
      }

      if (category) {
        where.category = category;
      }

      if (featured !== undefined) {
        where.featured = featured === 'true';
      }

      // Get articles with pagination
      const [articles, total] = await Promise.all([
        prisma.article.findMany({
          where,
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          },
          orderBy: { publishDate: 'desc' },
          skip,
          take: parseInt(limit)
        }),
        prisma.article.count({ where })
      ]);

      const totalPages = Math.ceil(total / parseInt(limit));

          res.json({
        success: true,
        data: {
          articles,
          pagination: {
            current: parseInt(page),
            pages: totalPages,
            total,
            hasNext: page < totalPages,
            hasPrev: page > 1
          }
        }
      });
  } catch (error) {
    console.error('Get articles error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @swagger
 * /articles/featured:
 *   get:
 *     summary: Get featured articles
 *     tags: [Articles]
 */
router.get('/featured', async (req, res) => {
  try {
    const articles = await prisma.article.findMany({
      where: {
        published: true,
        featured: true
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { publishDate: 'desc' },
      take: 6
    });

    res.json({
      success: true,
      data: { articles }
    });
  } catch (error) {
    console.error('Get featured articles error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @swagger
 * /articles/tags:
 *   get:
 *     summary: Get all available tags
 *     tags: [Articles]
 */
router.get('/tags', async (req, res) => {
  try {
    const articles = await prisma.article.findMany({
      where: { published: true },
      select: { tags: true }
    });

    // Extract unique tags
    const allTags = articles.flatMap(article => article.tags);
    const uniqueTags = [...new Set(allTags)].sort();

    res.json({
      success: true,
      data: { tags: uniqueTags }
    });
  } catch (error) {
    console.error('Get tags error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @swagger
 * /articles/categories:
 *   get:
 *     summary: Get all available categories
 *     tags: [Articles]
 */
router.get('/categories', async (req, res) => {
  try {
    const categories = await prisma.article.findMany({
      where: { 
        published: true,
        category: { not: null }
      },
      select: { category: true },
      distinct: ['category']
    });

    const categoryList = categories.map(item => item.category).filter(Boolean);

    res.json({
      success: true,
      data: { categories: categoryList }
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @swagger
 * /articles/{id}:
 *   get:
 *     summary: Get article by ID
 *     tags: [Articles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const article = await prisma.article.findUnique({
      where: { 
        id: parseInt(id),
        published: true
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    // Increment view count
    await prisma.article.update({
      where: { id: parseInt(id) },
      data: { views: { increment: 1 } }
    });

    res.json({
      success: true,
      data: { article: { ...article, views: article.views + 1 } }
    });
  } catch (error) {
    console.error('Get article error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @swagger
 * /articles/author/{authorId}:
 *   get:
 *     summary: Get articles by author
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: authorId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number (default 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of articles per page (default 10)
 */
router.get('/author/:authorId', authenticateToken, async (req, res) => {
  try {
    const { authorId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const userId = parseInt(authorId);
    const skip = (page - 1) * parseInt(limit);

    // Check if user can access these articles
    if (req.user.role !== 'ADMIN' && req.user.id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only access your own articles'
      });
    }

    // Get articles with pagination
    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where: { authorId: userId },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.article.count({ where: { authorId: userId } })
    ]);

    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      success: true,
      data: { 
        articles,
        pagination: {
          current: parseInt(page),
          pages: totalPages,
          total,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get articles by author error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @swagger
 * /articles:
 *   post:
 *     summary: Create a new article
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - excerpt
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               excerpt:
 *                 type: string
 *               category:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               images:
 *                 type: array
 *               videos:
 *                 type: array
 */
router.post('/', authenticateToken, requireContributor, [
  body('title').trim().isLength({ min: 5 }).withMessage('Title must be at least 5 characters'),
  body('excerpt').trim().isLength({ min: 10, max: 500 }).withMessage('Excerpt must be between 10 and 500 characters'),
  body('content').optional(),
  body('category').optional().trim(),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('images').optional().isArray().withMessage('Images must be an array'),
  body('videos').optional().isArray().withMessage('Videos must be an array'),
  body('published').optional().isBoolean().withMessage('Published must be a boolean'),
  body('featured').optional().isBoolean().withMessage('Featured must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { title, content, excerpt, category, tags = [], images = [], videos = [], published = false, featured = false } = req.body;

    console.log('🔍 CREATE ARTICLE - Full request body:', JSON.stringify(req.body, null, 2));
    console.log('🔍 CREATE ARTICLE - Extracted values:', {
      title: title?.substring(0, 50) + '...',
      published,
      featured,
      hasContent: !!content,
      hasExcerpt: !!excerpt,
      tagsCount: tags.length,
      imagesCount: images.length
    });

    const article = await prisma.article.create({
      data: {
        title,
        content,
        excerpt,
        category,
        tags,
        images,
        videos,
        published,
        featured,
        publishDate: published ? new Date() : null,
        authorId: req.user.id
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Article created successfully',
      data: { article }
    });
  } catch (error) {
    console.error('Create article error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @swagger
 * /articles/{id}:
 *   put:
 *     summary: Update article
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 */
router.put('/:id', authenticateToken, requireContributor, [
  body('title').optional().trim().isLength({ min: 5 }).withMessage('Title must be at least 5 characters'),
  body('excerpt').optional().trim().isLength({ min: 10, max: 500 }).withMessage('Excerpt must be between 10 and 500 characters'),
  body('content').optional(),
  body('category').optional().trim(),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('images').optional().isArray().withMessage('Images must be an array'),
  body('videos').optional().isArray().withMessage('Videos must be an array'),
  body('published').optional().isBoolean().withMessage('Published must be a boolean'),
  body('featured').optional().isBoolean().withMessage('Featured must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { title, content, excerpt, category, tags, images, videos, published, featured } = req.body;

    // Check if article exists and user has permission
    const existingArticle = await prisma.article.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingArticle) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    // Check ownership or admin
    if (req.user.role !== 'ADMIN' && existingArticle.authorId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own articles'
      });
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (excerpt !== undefined) updateData.excerpt = excerpt;
    if (category !== undefined) updateData.category = category;
    if (tags !== undefined) updateData.tags = tags;
    if (images !== undefined) updateData.images = images;
    if (videos !== undefined) updateData.videos = videos;
    if (published !== undefined) {
      updateData.published = published;
      updateData.publishDate = published ? new Date() : null;
    }
    if (featured !== undefined) updateData.featured = featured;

    const article = await prisma.article.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Article updated successfully',
      data: { article }
    });
  } catch (error) {
    console.error('Update article error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @swagger
 * /articles/{id}/publish:
 *   patch:
 *     summary: Publish or unpublish article
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               published:
 *                 type: boolean
 */
router.patch('/:id/publish', authenticateToken, requireContributor, [
  body('published').isBoolean().withMessage('Published must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { published } = req.body;

    // Check if article exists and user has permission
    const existingArticle = await prisma.article.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingArticle) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    // Check ownership or admin
    if (req.user.role !== 'ADMIN' && existingArticle.authorId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only publish your own articles'
      });
    }

    const updateData = {
      published,
      publishDate: published ? new Date() : null
    };

    const article = await prisma.article.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.json({
      success: true,
      message: `Article ${published ? 'published' : 'unpublished'} successfully`,
      data: { article }
    });
  } catch (error) {
    console.error('Publish article error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @swagger
 * /articles/{id}:
 *   delete:
 *     summary: Delete article
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 */
router.delete('/:id', authenticateToken, requireContributor, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if article exists and user has permission
    const existingArticle = await prisma.article.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingArticle) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    // Check ownership or admin
    if (req.user.role !== 'ADMIN' && existingArticle.authorId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own articles'
      });
    }

    await prisma.article.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      success: true,
      message: 'Article deleted successfully'
    });
  } catch (error) {
    console.error('Delete article error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router; 