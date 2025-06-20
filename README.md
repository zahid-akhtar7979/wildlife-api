# 🦁 Wildlife API

A robust Node.js + Express + PostgreSQL API for the Wildlife UI application, featuring wildlife article management, user authentication, file uploads with Cloudinary, and comprehensive admin functionality.

## 🚀 Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **Article Management**: Full CRUD operations with search, filtering, and categorization
- **File Upload**: Image and video upload with Cloudinary integration and automatic optimization
- **User Management**: Admin panel for user approval and management
- **Search & Filtering**: Advanced search with tags, categories, and full-text search
- **API Documentation**: Swagger/OpenAPI documentation
- **Security**: Rate limiting, input validation, and security headers
- **Database**: PostgreSQL with Prisma ORM

## 📋 Prerequisites

- Node.js 16+ (18+ recommended)
- PostgreSQL 14+
- Cloudinary account (free tier available)

## 🛠️ Installation

### 1. Clone and Setup

```bash
cd /Users/zahidakhtar/Documents/repo/wildlife/wildlife-api
npm install
```

### 2. Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/wildlife_db"

# JWT
JWT_SECRET="your-super-secret-jwt-key-here-make-it-long-and-complex"
JWT_EXPIRES_IN="7d"

# Server
PORT=3001
NODE_ENV="development"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloudinary-cloud-name"
CLOUDINARY_API_KEY="your-cloudinary-api-key"
CLOUDINARY_API_SECRET="your-cloudinary-api-secret"

# CORS
CORS_ORIGIN="http://localhost:3000"

# Email (optional - for notifications)
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"
```

### 3. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Seed database with sample data
npm run db:seed
```

### 4. Start Development Server

```bash
npm run dev
```

The API will be available at `http://localhost:3001`

## 📚 API Documentation

Once the server is running, visit:
- **API Documentation**: http://localhost:3001/api-docs
- **Health Check**: http://localhost:3001/health

## 🗄️ Database Schema

### Users Table
- `id` - Primary key
- `email` - Unique email address
- `name` - Full name
- `password` - Hashed password
- `role` - ADMIN | CONTRIBUTOR
- `approved` - Boolean (requires admin approval)
- `enabled` - Boolean (account status)
- `createdAt`, `updatedAt` - Timestamps

### Articles Table
- `id` - Primary key
- `title` - Article title
- `content` - HTML content
- `excerpt` - Short description
- `authorId` - Foreign key to users
- `published` - Boolean
- `featured` - Boolean
- `category` - String
- `tags` - Array of strings
- `images` - JSON array of image objects
- `videos` - JSON array of video objects
- `views` - Integer
- `publishDate` - Timestamp
- `createdAt`, `updatedAt` - Timestamps

## 🔐 Authentication

### Default Users (after seeding)

**Admin User:**
- Email: `admin@wildlife.com`
- Password: `admin123`
- Role: ADMIN

**Researcher User:**
- Email: `researcher@wildlife.com`
- Password: `researcher123`
- Role: CONTRIBUTOR

### JWT Token Usage

Include the JWT token in API requests:

```http
Authorization: Bearer <your-jwt-token>
```

## 📋 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/update-profile` - Update profile
- `PUT /api/auth/change-password` - Change password

### Articles
- `GET /api/articles` - Get published articles (with search/filter)
- `GET /api/articles/featured` - Get featured articles
- `GET /api/articles/tags` - Get all tags
- `GET /api/articles/categories` - Get all categories
- `GET /api/articles/:id` - Get article by ID
- `GET /api/articles/author/:authorId` - Get articles by author
- `POST /api/articles` - Create article (auth required)
- `PUT /api/articles/:id` - Update article (auth required)
- `PATCH /api/articles/:id/publish` - Publish/unpublish article
- `DELETE /api/articles/:id` - Delete article

### Users (Admin only)
- `GET /api/users` - Get all users
- `GET /api/users/stats` - Get statistics
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `PATCH /api/users/:id/approve` - Approve/reject user
- `PATCH /api/users/:id/reset-password` - Reset password
- `DELETE /api/users/:id` - Delete user

### File Upload
- `POST /api/upload/image` - Upload single image
- `POST /api/upload/video` - Upload single video
- `POST /api/upload/multiple-images` - Upload multiple images
- `DELETE /api/upload/delete/:publicId` - Delete file
- `POST /api/upload/transform-image/:publicId` - Get transformed image URL

## 🔍 Search & Filtering

### Article Search Parameters
- `search` - Full-text search in title, content, excerpt
- `tags` - Comma-separated tags (e.g., "tigers,conservation")
- `category` - Filter by category
- `featured` - Filter featured articles (true/false)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 50)

Example:
```http
GET /api/articles?search=tiger&tags=conservation,endangered&category=Big%20Cats&page=1&limit=10
```

## 🖼️ File Upload Integration

### Cloudinary Setup

1. Create a free Cloudinary account at https://cloudinary.com
2. Get your cloud name, API key, and API secret from the dashboard
3. Add them to your `.env` file

### Image Upload Features
- Automatic optimization and format conversion
- Multiple size generation (thumbnail, medium, large)
- WebP/AVIF support for modern browsers
- 10MB file size limit for images
- 100MB file size limit for videos

### Supported Formats
- **Images**: JPG, JPEG, PNG, WebP, AVIF
- **Videos**: MP4, MOV, AVI, MKV, WebM

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

## 📊 Database Commands

```bash
# View database in Prisma Studio
npm run db:studio

# Reset database and reseed
npm run db:migrate -- --name reset
npm run db:seed

# Generate Prisma client after schema changes
npm run db:generate
```

## 🚀 Deployment

### Environment Setup
1. Set `NODE_ENV=production`
2. Use a production PostgreSQL database
3. Set a strong JWT secret
4. Configure proper CORS origins
5. Set up proper logging

### Recommended Hosting
- **API**: Railway, Render, or DigitalOcean
- **Database**: Railway Postgres, Supabase, or AWS RDS
- **Files**: Cloudinary (already configured)

### Production Commands
```bash
# Install production dependencies
npm ci --only=production

# Run database migrations
npm run db:migrate

# Start production server
npm start
```

## 🔧 Troubleshooting

### Common Issues

**Database Connection Error:**
- Check your `DATABASE_URL` in `.env`
- Ensure PostgreSQL is running
- Verify database name and credentials

**Cloudinary Upload Errors:**
- Verify your Cloudinary credentials in `.env`
- Check file size limits
- Ensure supported file formats

**JWT Token Errors:**
- Check if `JWT_SECRET` is set
- Verify token format: `Bearer <token>`
- Check token expiration

### Logs
- Development logs: Console output
- Production logs: `logs/combined.log` and `logs/error.log`

## 🤝 Integration with Frontend

Your React frontend should update the API base URL:

```javascript
// In your frontend authService.js
const API_BASE_URL = 'http://localhost:3001/api';
```

### Frontend Integration Checklist
- [ ] Update API base URL
- [ ] Test authentication endpoints
- [ ] Verify article CRUD operations
- [ ] Test file upload functionality
- [ ] Check admin panel integration

## 📝 API Response Format

All API responses follow this format:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data here
  }
}
```

Error responses:
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    // Validation errors (if any)
  ]
}
```

## 🛡️ Security Features

- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Helmet**: Security headers
- **Input Validation**: Express-validator
- **Password Hashing**: bcryptjs
- **JWT Tokens**: Secure authentication
- **CORS**: Configurable origins
- **File Upload**: Type and size validation

## 📞 Support

For issues and questions:
1. Check the troubleshooting section
2. Review API documentation at `/api-docs`
3. Check server logs for errors
4. Verify environment variables

---

**Happy Coding! 🦎🐯🦅** 