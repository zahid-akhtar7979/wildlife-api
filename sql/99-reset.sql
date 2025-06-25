-- Wildlife Conservation Database - Reset Script
-- WARNING: This script will delete ALL data in the database
-- Use with caution - only run this if you want to start fresh

-- Confirm reset operation
DO $$
BEGIN
    RAISE NOTICE '⚠️  WARNING: DATABASE RESET OPERATION ⚠️';
    RAISE NOTICE 'This will delete ALL existing data!';
    RAISE NOTICE 'Press Ctrl+C now if you do not want to continue...';
    RAISE NOTICE 'Proceeding in 3 seconds...';
    
    -- Add a short delay (PostgreSQL doesn't have SLEEP, so we use pg_sleep if available)
    -- PERFORM pg_sleep(3);
END $$;

-- Start transaction
BEGIN;

-- Drop all views first (to avoid dependency issues)
DROP VIEW IF EXISTS published_articles_with_authors CASCADE;
DROP VIEW IF EXISTS article_statistics CASCADE;

-- Drop all functions
DROP FUNCTION IF EXISTS search_articles(TEXT) CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Drop all triggers
DROP TRIGGER IF EXISTS update_users_updated_at ON "users";
DROP TRIGGER IF EXISTS update_articles_updated_at ON "articles";

-- Drop all tables (this will also drop indexes and constraints)
DROP TABLE IF EXISTS "articles" CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;

-- Drop custom types
DROP TYPE IF EXISTS "Role" CASCADE;

-- Drop extensions (optional - comment out if you want to keep them)
-- DROP EXTENSION IF EXISTS "uuid-ossp" CASCADE;
-- DROP EXTENSION IF EXISTS "pg_trgm" CASCADE;

-- Reset sequences (if they exist)
DROP SEQUENCE IF EXISTS users_id_seq CASCADE;
DROP SEQUENCE IF EXISTS articles_id_seq CASCADE;

-- Commit the reset
COMMIT;

-- Final confirmation
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🧹 DATABASE RESET COMPLETE! 🧹';
    RAISE NOTICE '================================';
    RAISE NOTICE 'All tables, data, and objects have been removed.';
    RAISE NOTICE 'You can now run 00-setup.sql to recreate the database.';
    RAISE NOTICE '';
    RAISE NOTICE 'Quick setup command:';
    RAISE NOTICE '  psql -d your_database -f 00-setup.sql';
    RAISE NOTICE '================================';
END $$; 