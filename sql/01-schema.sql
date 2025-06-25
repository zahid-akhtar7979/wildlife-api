-- Wildlife Conservation Database Schema
-- PostgreSQL Database Setup Script
-- Generated from Prisma schema for production deployment

-- Create database (uncomment if creating new database)
-- CREATE DATABASE wildlife_db;
-- \c wildlife_db;

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types/enums
DO $$ BEGIN
    CREATE TYPE "Role" AS ENUM ('ADMIN', 'CONTRIBUTOR');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create users table
CREATE TABLE IF NOT EXISTS "users" (
    "id" SERIAL PRIMARY KEY,
    "email" VARCHAR(255) NOT NULL UNIQUE,
    "name" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'CONTRIBUTOR',
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create articles table
CREATE TABLE IF NOT EXISTS "articles" (
    "id" SERIAL PRIMARY KEY,
    "title" VARCHAR(255) NOT NULL,
    "content" TEXT,
    "excerpt" VARCHAR(500) NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "category" VARCHAR(100),
    "views" INTEGER NOT NULL DEFAULT 0,
    "tags" TEXT[] DEFAULT '{}',
    "images" JSONB[] DEFAULT '{}',
    "videos" JSONB[] DEFAULT '{}',
    "publish_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "author_id" INTEGER NOT NULL
);

-- Create foreign key constraints
ALTER TABLE "articles" 
ADD CONSTRAINT "articles_author_id_fkey" 
FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "idx_users_email" ON "users"("email");
CREATE INDEX IF NOT EXISTS "idx_users_role" ON "users"("role");
CREATE INDEX IF NOT EXISTS "idx_users_approved" ON "users"("approved");

CREATE INDEX IF NOT EXISTS "idx_articles_author_id" ON "articles"("author_id");
CREATE INDEX IF NOT EXISTS "idx_articles_published" ON "articles"("published");
CREATE INDEX IF NOT EXISTS "idx_articles_featured" ON "articles"("featured");
CREATE INDEX IF NOT EXISTS "idx_articles_category" ON "articles"("category");
CREATE INDEX IF NOT EXISTS "idx_articles_publish_date" ON "articles"("publish_date");
CREATE INDEX IF NOT EXISTS "idx_articles_created_at" ON "articles"("created_at");
CREATE INDEX IF NOT EXISTS "idx_articles_views" ON "articles"("views");

-- Create GIN indexes for array and JSONB columns
CREATE INDEX IF NOT EXISTS "idx_articles_tags" ON "articles" USING GIN ("tags");
CREATE INDEX IF NOT EXISTS "idx_articles_images" ON "articles" USING GIN ("images");
CREATE INDEX IF NOT EXISTS "idx_articles_videos" ON "articles" USING GIN ("videos");

-- Create full-text search indexes
CREATE INDEX IF NOT EXISTS "idx_articles_title_search" ON "articles" USING GIN (to_tsvector('english', "title"));
CREATE INDEX IF NOT EXISTS "idx_articles_content_search" ON "articles" USING GIN (to_tsvector('english', COALESCE("content", '')));
CREATE INDEX IF NOT EXISTS "idx_articles_excerpt_search" ON "articles" USING GIN (to_tsvector('english', "excerpt"));

-- Create function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON "users";
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON "users"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_articles_updated_at ON "articles";
CREATE TRIGGER update_articles_updated_at
    BEFORE UPDATE ON "articles"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create function for full-text search
CREATE OR REPLACE FUNCTION search_articles(search_term TEXT)
RETURNS TABLE(
    id INTEGER,
    title VARCHAR(255),
    excerpt VARCHAR(500),
    category VARCHAR(100),
    tags TEXT[],
    author_name VARCHAR(255),
    publish_date TIMESTAMP(3),
    rank REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id,
        a.title,
        a.excerpt,
        a.category,
        a.tags,
        u.name as author_name,
        a.publish_date,
        ts_rank(
            to_tsvector('english', a.title || ' ' || a.excerpt || ' ' || COALESCE(a.content, '')),
            plainto_tsquery('english', search_term)
        ) as rank
    FROM articles a
    JOIN users u ON a.author_id = u.id
    WHERE a.published = true
    AND (
        to_tsvector('english', a.title || ' ' || a.excerpt || ' ' || COALESCE(a.content, '')) 
        @@ plainto_tsquery('english', search_term)
    )
    ORDER BY rank DESC, a.publish_date DESC;
END;
$$ LANGUAGE plpgsql;

-- Create view for published articles with author info
CREATE OR REPLACE VIEW published_articles_with_authors AS
SELECT 
    a.id,
    a.title,
    a.content,
    a.excerpt,
    a.category,
    a.tags,
    a.images,
    a.videos,
    a.views,
    a.featured,
    a.publish_date,
    a.created_at,
    a.updated_at,
    u.id as author_id,
    u.name as author_name,
    u.email as author_email
FROM articles a
JOIN users u ON a.author_id = u.id
WHERE a.published = true
ORDER BY a.publish_date DESC;

-- Create view for article statistics
CREATE OR REPLACE VIEW article_statistics AS
SELECT 
    COUNT(*) as total_articles,
    COUNT(CASE WHEN published = true THEN 1 END) as published_articles,
    COUNT(CASE WHEN published = false THEN 1 END) as draft_articles,
    COUNT(CASE WHEN featured = true THEN 1 END) as featured_articles,
    SUM(views) as total_views,
    AVG(views) as average_views,
    COUNT(DISTINCT category) as unique_categories,
    COUNT(DISTINCT author_id) as unique_authors
FROM articles;

-- Grant permissions (adjust as needed for your user)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_app_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_app_user;
-- GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO your_app_user;

-- Insert default admin user if not exists (password: admin123)
INSERT INTO "users" ("email", "name", "password", "role", "approved", "enabled")
SELECT 'admin@wildlife.com', 'Admin User', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ADMIN', true, true
WHERE NOT EXISTS (SELECT 1 FROM "users" WHERE "email" = 'admin@wildlife.com');

COMMIT;

-- Show success message
DO $$
BEGIN
    RAISE NOTICE 'Wildlife database schema created successfully!';
    RAISE NOTICE 'Default admin user: admin@wildlife.com / admin123';
    RAISE NOTICE 'Tables created: users, articles';
    RAISE NOTICE 'Indexes, triggers, and functions configured';
END $$; 