-- Wildlife Conservation Database - Complete Setup Script
-- This script creates the schema and populates it with sample data
-- Run this script on a fresh PostgreSQL database

-- Start transaction
BEGIN;

-- Set client encoding and other settings
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET xmloption = content;
SET row_security = off;

-- Display setup information
DO $$
BEGIN
    RAISE NOTICE '=== Wildlife Conservation Database Setup ===';
    RAISE NOTICE 'Starting database initialization...';
    RAISE NOTICE 'PostgreSQL Version: %', version();
    RAISE NOTICE 'Current Database: %', current_database();
    RAISE NOTICE 'Current User: %', current_user;
    RAISE NOTICE '==========================================';
END $$;

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- For fuzzy text search

-- Create custom types/enums
DO $$ BEGIN
    CREATE TYPE "Role" AS ENUM ('ADMIN', 'CONTRIBUTOR');
EXCEPTION
    WHEN duplicate_object THEN
        RAISE NOTICE 'Role enum already exists, skipping...';
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
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'articles_author_id_fkey'
    ) THEN
        ALTER TABLE "articles" 
        ADD CONSTRAINT "articles_author_id_fkey" 
        FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

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

-- Seed data insertion starts here
RAISE NOTICE 'Schema created successfully. Inserting seed data...';

-- Insert default users (if they don't already exist)
-- Admin user (password: admin123)
INSERT INTO "users" ("email", "name", "password", "role", "approved", "enabled", "created_at", "updated_at")
SELECT 'admin@wildlife.com', 'Admin User', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ADMIN', true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "users" WHERE "email" = 'admin@wildlife.com');

-- Researcher user (password: researcher123)  
INSERT INTO "users" ("email", "name", "password", "role", "approved", "enabled", "created_at", "updated_at")
SELECT 'researcher@wildlife.com', 'Dr. Sarah Williams', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'CONTRIBUTOR', true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "users" WHERE "email" = 'researcher@wildlife.com');

-- Insert sample articles (only if no articles exist)
DO $$
DECLARE
    researcher_id INTEGER;
    admin_id INTEGER;
BEGIN
    SELECT id INTO researcher_id FROM "users" WHERE email = 'researcher@wildlife.com';
    SELECT id INTO admin_id FROM "users" WHERE email = 'admin@wildlife.com';
    
    IF NOT EXISTS (SELECT 1 FROM "articles") THEN
        -- Sample Article 1: Tigers
        INSERT INTO "articles" (
            "title", "content", "excerpt", "category", "tags", "images", 
            "published", "featured", "views", "author_id", "publish_date", "created_at", "updated_at"
        ) VALUES (
            'The Majestic Tigers of Sundarbans',
            '<p>The Sundarbans, the largest mangrove forest in the world, is home to the magnificent Royal Bengal Tiger. These incredible creatures have adapted to life in the wetlands, becoming excellent swimmers and fierce hunters.</p><p>Recent conservation efforts have shown promising results, with tiger populations slowly recovering from near extinction.</p>',
            'Exploring the magnificent Royal Bengal Tigers in the Sundarbans mangrove forests and recent conservation efforts.',
            'Big Cats',
            ARRAY['Tigers', 'Conservation', 'Sundarbans', 'Endangered Species'],
            ARRAY['{"id": "tiger-1", "url": "https://images.unsplash.com/photo-1605792657660-596af9009e82?w=800", "caption": "Royal Bengal Tiger", "alt": "Tiger"}'::jsonb],
            true, true, 1247, researcher_id, '2024-01-15 10:30:00'::timestamp, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        );

        -- Sample Article 2: Amazon
        INSERT INTO "articles" (
            "title", "content", "excerpt", "category", "tags", "images", 
            "published", "featured", "views", "author_id", "publish_date", "created_at", "updated_at"
        ) VALUES (
            'Amazon Rainforest: A Biodiversity Hotspot Under Threat',
            '<p>The Amazon rainforest, often called the "lungs of the Earth," is home to an incredible array of wildlife species. Climate change and deforestation pose significant threats to this irreplaceable ecosystem.</p>',
            'Documenting the incredible biodiversity of the Amazon rainforest and the urgent need for conservation.',
            'Ecosystems',
            ARRAY['Amazon', 'Rainforest', 'Biodiversity', 'Conservation'],
            ARRAY['{"id": "amazon-1", "url": "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800", "caption": "Amazon Rainforest", "alt": "Amazon"}'::jsonb],
            true, false, 892, researcher_id, '2024-01-20 14:15:00'::timestamp, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        );

        -- Sample Article 3: Arctic Wildlife
        INSERT INTO "articles" (
            "title", "content", "excerpt", "category", "tags", "images", 
            "published", "featured", "views", "author_id", "publish_date", "created_at", "updated_at"
        ) VALUES (
            'Arctic Wildlife: Adapting to a Changing Climate',
            '<p>The Arctic region is experiencing rapid environmental changes. Polar bears, Arctic foxes, and seals are among the species most affected by melting sea ice.</p>',
            'Studying how Arctic wildlife is adapting to rapid climate change and melting ice.',
            'Climate Change',
            ARRAY['Arctic', 'Climate Change', 'Polar Bears', 'Conservation'],
            ARRAY['{"id": "polar-bear-1", "url": "https://images.unsplash.com/photo-1551582045-6ec9c11d8697?w=800", "caption": "Polar Bear", "alt": "Polar Bear"}'::jsonb],
            true, true, 1534, researcher_id, '2024-01-10 09:00:00'::timestamp, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        );

        -- Sample Draft Article
        INSERT INTO "articles" (
            "title", "content", "excerpt", "category", "tags", "images", 
            "published", "featured", "views", "author_id", "publish_date", "created_at", "updated_at"
        ) VALUES (
            'African Elephants: The Gentle Giants of the Savanna',
            '<p>African elephants are among the most intelligent and emotionally complex animals on Earth. However, they face unprecedented threats from poaching and habitat loss.</p>',
            'Learn about the complex social structures of African elephants and conservation challenges.',
            'Large Mammals',
            ARRAY['Elephants', 'Conservation', 'Africa', 'Social Behavior'],
            ARRAY['{"id": "elephant-1", "url": "https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=800", "caption": "African Elephants", "alt": "Elephants"}'::jsonb],
            false, false, 0, researcher_id, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        );

        RAISE NOTICE 'Sample articles inserted successfully!';
    END IF;
END $$;

-- Create views and functions for enhanced functionality
CREATE OR REPLACE VIEW published_articles_with_authors AS
SELECT 
    a.id, a.title, a.content, a.excerpt, a.category, a.tags, a.images, a.videos,
    a.views, a.featured, a.publish_date, a.created_at, a.updated_at,
    u.id as author_id, u.name as author_name, u.email as author_email
FROM articles a
JOIN users u ON a.author_id = u.id
WHERE a.published = true
ORDER BY a.publish_date DESC;

-- Commit transaction
COMMIT;

-- Final status report
DO $$
DECLARE
    user_count INTEGER;
    article_count INTEGER;
    published_count INTEGER;
    draft_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO user_count FROM "users";
    SELECT COUNT(*) INTO article_count FROM "articles";
    SELECT COUNT(*) INTO published_count FROM "articles" WHERE published = true;
    SELECT COUNT(*) INTO draft_count FROM "articles" WHERE published = false;
    
    RAISE NOTICE '';
    RAISE NOTICE '🎉 WILDLIFE DATABASE SETUP COMPLETE! 🎉';
    RAISE NOTICE '==========================================';
    RAISE NOTICE '📊 Database Statistics:';
    RAISE NOTICE '   👥 Users: %', user_count;
    RAISE NOTICE '   📰 Total Articles: %', article_count;
    RAISE NOTICE '   ✅ Published: %', published_count;
    RAISE NOTICE '   📝 Drafts: %', draft_count;
    RAISE NOTICE '';
    RAISE NOTICE '🔑 Default Login Credentials:';
    RAISE NOTICE '   👤 Admin: admin@wildlife.com / admin123';
    RAISE NOTICE '   👤 Researcher: researcher@wildlife.com / researcher123';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 Your wildlife conservation database is ready!';
    RAISE NOTICE '==========================================';
END $$; 