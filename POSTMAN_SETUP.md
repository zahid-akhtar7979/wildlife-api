# Wildlife API - Postman Collection Setup

This guide will help you set up and use the Postman collection for testing the Wildlife API.

## 📥 Download Files

The following files are ready for download in your project directory:

### 1. Postman Collection
**File:** `Wildlife_API.postman_collection.json`
**Location:** `/Users/zahidakhtar/Documents/repo/wildlife/wildlife-api/Wildlife_API.postman_collection.json`

### 2. Postman Environment  
**File:** `Wildlife_API.postman_environment.json`
**Location:** `/Users/zahidakhtar/Documents/repo/wildlife/wildlife-api/Wildlife_API.postman_environment.json`

## 🚀 Quick Setup

### Step 1: Import Collection
1. Open Postman
2. Click **Import** button (top left)
3. Drag and drop `Wildlife_API.postman_collection.json` or click **Upload Files**
4. Select the collection file and click **Import**

### Step 2: Import Environment
1. In Postman, click **Import** again
2. Drag and drop `Wildlife_API.postman_environment.json` or click **Upload Files**
3. Select the environment file and click **Import**

### Step 3: Set Environment
1. In the top-right corner of Postman, select **Wildlife API Environment** from the environment dropdown

## 🔑 Authentication Flow

### Option 1: Login as Admin
1. Navigate to **Authentication > Login User**
2. Click **Send** (uses admin credentials by default)
3. The auth token will be automatically saved to environment variables

### Option 2: Login as Researcher  
1. Navigate to **Authentication > Login Researcher**
2. Click **Send** (uses researcher credentials)
3. The auth token will be automatically saved to environment variables

## 📋 API Endpoints Included

### 🏥 Health Check
- **Health Check** - Test if server is running

### 🔐 Authentication
- **Register User** - Create new account
- **Login User** (Admin) - Login with admin credentials
- **Login Researcher** - Login with researcher credentials  
- **Get Profile** - Get current user profile
- **Update Profile** - Update user profile

### 📰 Articles
- **Get All Articles** - List published articles with filtering
- **Get Featured Articles** - Get featured articles
- **Get All Tags** - Get available tags
- **Get All Categories** - Get available categories
- **Get Article by ID** - Get specific article
- **Get Articles by Author** - Get user's articles
- **Create Article** - Create new article
- **Update Article** - Update existing article
- **Publish Article** - Publish/unpublish article
- **Delete Article** - Delete article

### 👥 User Management (Admin Only)
- **Get All Users** - List all users
- **Get User by ID** - Get specific user
- **Update User** - Update user details
- **Approve User** - Approve/disapprove user
- **Enable/Disable User** - Toggle user status
- **Delete User** - Delete user account

### 📁 File Upload
- **Upload Image** - Upload image to Cloudinary
- **Upload Video** - Upload video to Cloudinary

## 🔧 Environment Variables

The environment includes these pre-configured variables:

| Variable | Description | Default Value |
|----------|-------------|---------------|
| `baseUrl` | API base URL | `http://localhost:3001` |
| `authToken` | JWT token (auto-filled on login) | - |
| `userId` | Current user ID (auto-filled on login) | - |
| `adminEmail` | Admin email | `admin@wildlife.com` |
| `adminPassword` | Admin password | `admin123` |
| `researcherEmail` | Researcher email | `researcher@wildlife.com` |
| `researcherPassword` | Researcher password | `researcher123` |

## ⚡ Quick Test Flow

1. **Start the API server:**
   ```bash
   cd /Users/zahidakhtar/Documents/repo/wildlife/wildlife-api
   npm run dev
   ```

2. **Test Health Check:**
   - Run **Health Check** endpoint
   - Should return server status

3. **Login:**
   - Run **Authentication > Login User** (admin)
   - Token will be automatically saved

4. **Test Article endpoints:**
   - Run **Get All Articles**
   - Run **Get Featured Articles**
   - Run **Create Article** (requires auth)

5. **Test Admin endpoints:**
   - Run **Get All Users** (admin only)
   - Run **Get User by ID**

## 🎯 Testing Tips

### For Article Testing:
- Use **Get All Articles** first to see existing data
- Note article IDs for testing **Get Article by ID**
- Create articles with **Create Article** then publish with **Publish Article**

### For User Management:
- Login as admin first for user management endpoints
- Test user approval flow with **Approve User**
- Test user status toggle with **Enable/Disable User**

### For File Uploads:
- Use **Upload Image** with actual image files
- Test **Upload Video** with video files
- Note: Cloudinary credentials need to be configured in `.env`

## 🚨 Troubleshooting

### Server Not Running
- Error: Connection refused
- **Solution:** Start the API server with `npm run dev`

### Authentication Errors
- Error: Unauthorized (401)
- **Solution:** Run login endpoint first to get auth token

### Database Errors
- Error: Database connection failed
- **Solution:** Ensure PostgreSQL is running and `.env` is configured

### Environment Variables
- Issue: Variables not working
- **Solution:** Ensure **Wildlife API Environment** is selected in Postman

## 📊 Default Test Data

The API comes with pre-seeded data:

### Users:
- **Admin:** admin@wildlife.com / admin123
- **Researcher:** researcher@wildlife.com / researcher123

### Articles:
- 3 published articles about wildlife conservation
- 1 draft article about elephants
- Various categories: Big Cats, Ecosystems, Climate Change, Large Mammals
- Multiple tags for filtering

## 🔄 Auto-Authentication

The collection includes test scripts that automatically:
- Save JWT tokens after successful login
- Set user ID for subsequent requests
- Handle token expiration (manual re-login required)

---

**Happy Testing! 🦁🌿**

For any issues, check the server logs or API documentation at http://localhost:3001/api-docs 