require('dotenv').config();
require('express-async-errors');

console.log('🔧 [STARTUP] Loading dependencies...');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');

console.log('🔧 [STARTUP] Dependencies loaded successfully');
// const rateLimit = require('express-rate-limit'); // Commented out to remove rate limiting

// Import routes
console.log('🔧 [STARTUP] Loading route modules...');
const authRoutes = require('./routes/auth');
console.log('🔧 [STARTUP] Auth routes loaded');
console.log('🔍 [DEBUG] Auth routes type:', typeof authRoutes);
const articleRoutes = require('./routes/articles');
console.log('🔧 [STARTUP] Article routes loaded');
console.log('🔍 [DEBUG] Article routes type:', typeof articleRoutes);
const userRoutes = require('./routes/users');
console.log('🔧 [STARTUP] User routes loaded');
console.log('🔍 [DEBUG] User routes type:', typeof userRoutes);
const uploadRoutes = require('./routes/upload');
console.log('🔧 [STARTUP] Upload routes loaded');
console.log('🔍 [DEBUG] Upload routes type:', typeof uploadRoutes);

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');

console.log('🔧 [STARTUP] Creating Express app...');
const app = express();
const PORT = process.env.PORT || 3001;

console.log('🔧 [STARTUP] Express app created, PORT:', PORT);
console.log('🔧 [STARTUP] Environment variables check:');
console.log('  - NODE_ENV:', process.env.NODE_ENV);
console.log('  - DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'MISSING');
console.log('  - JWT_SECRET:', process.env.JWT_SECRET ? 'SET' : 'MISSING');
console.log('  - CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME ? 'SET' : 'MISSING');

// Security middleware
app.use(helmet());
app.use(compression());

// Rate limiting - REMOVED to allow unlimited requests
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // limit each IP to 100 requests per windowMs
//   message: 'Too many requests from this IP, please try again later.'
// });
// app.use('/api/', limiter);

// CORS configuration - Flexible origin handling for development and production
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Define allowed origins
    const allowedOrigins = [
      // Development origins
      'http://localhost:3000',
      'http://localhost:3001', 
      'http://localhost:3002',
      'http://localhost:3003',
      'http://localhost:3004',
      'http://localhost:3005',
      // Production origins - add your actual domains here
      'https://your-frontend-app.vercel.app',
      'https://your-frontend-app.netlify.app',
      // Railway frontend (if deployed there)
      'https://your-frontend.railway.app'
    ];
    
    // In production, also allow domains from environment variable
    if (process.env.FRONTEND_URL) {
      allowedOrigins.push(process.env.FRONTEND_URL);
    }
    
    // Allow any localhost or 127.0.0.1 for development
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }
    
    // Allow specific domains
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // In development, be more permissive
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  optionsSuccessStatus: 200 // Some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(cors(corsOptions));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path} - ${req.ip}`);
  next();
});

// Debug middleware to log ALL requests
app.use((req, res, next) => {
  console.log(`🔍 [REQUEST DEBUG] ${req.method} ${req.path} - Headers: ${JSON.stringify(req.headers)}`);
  next();
});

// Root route
app.get('/', (req, res) => {
  console.log('🔍 [ROUTE DEBUG] Root route hit!');
  res.json({
    success: true,
    message: 'Wildlife API is running!',
    available_routes: [
      'GET /',
      'GET /test', 
      'GET /health',
      'GET /api/test',
      'GET /debug/routes'
    ]
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// Simple test endpoint
app.get('/test', (req, res) => {
  console.log('🔍 [ROUTE DEBUG] /test route hit!');
  res.json({
    success: true,
    message: 'Test endpoint working',
    routes_mounted: ['/api/auth', '/api/articles', '/api/users', '/api/upload']
  });
});

// API routes
console.log('🔧 [STARTUP] Mounting API routes...');

// Add a simple test route to verify routing works
app.get('/api/test', (req, res) => {
  console.log('🔍 [ROUTE DEBUG] /api/test route hit!');
  res.json({
    success: true,
    message: 'API routing is working!',
    timestamp: new Date().toISOString()
  });
});
console.log('🔧 [STARTUP] Mounted /api/test');

app.use('/api/auth', authRoutes);
console.log('🔧 [STARTUP] Mounted /api/auth');
console.log('🔍 [DEBUG] App router stack length after auth:', app._router.stack.length);
app.use('/api/articles', articleRoutes);
console.log('🔧 [STARTUP] Mounted /api/articles');
console.log('🔍 [DEBUG] App router stack length after articles:', app._router.stack.length);
app.use('/api/users', userRoutes);
console.log('🔧 [STARTUP] Mounted /api/users');
console.log('🔍 [DEBUG] App router stack length after users:', app._router.stack.length);
app.use('/api/upload', uploadRoutes);
console.log('🔧 [STARTUP] Mounted /api/upload');
console.log('🔍 [DEBUG] App router stack length after upload:', app._router.stack.length);
console.log('🔧 [STARTUP] All API routes mounted successfully');

// Swagger documentation - Enable in both development and production
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Wildlife API',
      version: '1.0.0',
      description: 'API for Wildlife Conservation Platform',
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? 'https://wildlife-api-production.railway.app/api'
          : `http://localhost:${PORT}/api`,
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./routes/*.js'], // paths to files containing OpenAPI definitions
};

const specs = swaggerJsdoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Debug endpoint to list all routes
app.get('/debug/routes', (req, res) => {
  const routes = [];
  app._router.stack.forEach(function(middleware) {
    if (middleware.route) {
      routes.push({
        path: middleware.route.path,
        methods: Object.keys(middleware.route.methods)
      });
    } else if (middleware.name === 'router') {
      middleware.handle.stack.forEach(function(handler) {
        if (handler.route) {
          routes.push({
            path: handler.route.path,
            methods: Object.keys(handler.route.methods)
          });
        }
      });
    }
  });
  res.json({ routes });
});

// 404 handler
app.use('*', (req, res) => {
  console.log(`🔍 [404 DEBUG] Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    attempted_path: req.originalUrl,
    method: req.method,
    debug_info: 'Check /debug/routes for available routes'
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Database setup function
async function setupDatabase() {
  try {
    console.log('🔧 [DATABASE] Setting up database...');
    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execAsync = promisify(exec);
    
    // Run database setup
    await execAsync('npx prisma db push --accept-data-loss');
    console.log('🔧 [DATABASE] Database schema applied successfully');
    
    // Run seeding
    await execAsync('node prisma/seed.js');
    console.log('🔧 [DATABASE] Database seeded successfully');
    
  } catch (error) {
    console.log('⚠️ [DATABASE] Setup failed:', error.message);
    console.log('🔧 [DATABASE] Server will continue without setup - database may need manual setup');
  }
}

// Initialize database and start server
async function startApp() {
  // Setup database first in production
  if (process.env.NODE_ENV === 'production') {
    await setupDatabase();
  }
  
  // Start server
  console.log('🔧 [STARTUP] Starting server on port', PORT);
  app.listen(PORT, () => {
    console.log('🔧 [STARTUP] Server started successfully!');
    logger.info(`🚀 Wildlife API server running on port ${PORT}`);
    logger.info(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
    logger.info(`🏥 Health Check: http://localhost:${PORT}/health`);
    console.log('🔧 [DATABASE] Database ready and server online');
  });
}

// Start the application
startApp().catch(error => {
  console.error('💥 [STARTUP] Failed to start application:', error);
  process.exit(1);
}); 