# Wildlife Database SQL Scripts

This directory contains SQL scripts for setting up and managing the Wildlife Conservation PostgreSQL database.

## 📁 Script Files

### Core Setup Scripts
- **`00-setup.sql`** - Complete database setup (schema + seed data)
- **`01-schema.sql`** - Database schema only (tables, indexes, functions)
- **`02-seed-data.sql`** - Sample data insertion

### Utility Scripts
- **`99-reset.sql`** - Reset/clean database (⚠️ DESTRUCTIVE)
- **`run-scripts.sh`** - Shell script to execute SQL files

## 🚀 Quick Start

### Option 1: Complete Setup (Recommended)
```bash
# Run the complete setup script
psql -d your_database_name -f 00-setup.sql
```

### Option 2: Step by Step
```bash
# 1. Create schema
psql -d your_database_name -f 01-schema.sql

# 2. Insert sample data
psql -d your_database_name -f 02-seed-data.sql
```

### Option 3: Using the Shell Script
```bash
# Make script executable
chmod +x run-scripts.sh

# Run complete setup
./run-scripts.sh setup

# Or run individual scripts
./run-scripts.sh schema
./run-scripts.sh seed
```

## 🗃️ Database Schema

### Tables Created

#### `users` table
- Primary key: `id` (SERIAL)
- Unique constraint: `email`
- Roles: `ADMIN`, `CONTRIBUTOR`
- Default role: `CONTRIBUTOR`
- Approval system: `approved` (boolean)

#### `articles` table  
- Primary key: `id` (SERIAL)
- Foreign key: `author_id` → `users.id`
- Full-text search enabled
- JSONB arrays for images/videos
- Text arrays for tags
- Soft publishing with `published` flag

### Indexes Created
- **Performance indexes**: email, role, published status, dates
- **Search indexes**: GIN indexes for full-text search
- **Array indexes**: GIN indexes for tags, images, videos

### Views Created
- `published_articles_with_authors` - Published articles with author info
- `article_statistics` - Database statistics summary

### Functions Created
- `update_updated_at_column()` - Auto-update timestamp trigger
- `search_articles(text)` - Full-text search function

## 📊 Sample Data

### Default Users
| Email | Password | Role | Status |
|-------|----------|------|--------|
| admin@wildlife.com | admin123 | ADMIN | Approved |
| researcher@wildlife.com | researcher123 | CONTRIBUTOR | Approved |

### Sample Articles
- **3 Published articles** with rich content and images
- **1 Draft article** for testing
- Various categories: Big Cats, Ecosystems, Climate Change, Large Mammals
- Sample tags and featured articles

## 🔧 Common Operations

### Connect to Database
```bash
# Local connection
psql -d wildlife_db

# Remote connection  
psql -h hostname -U username -d database_name
```

### Verify Setup
```sql
-- Check tables
\dt

-- Check data
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM articles;
SELECT COUNT(*) FROM articles WHERE published = true;

-- Test search function
SELECT * FROM search_articles('tiger');
```

### Reset Database
```bash
# ⚠️ WARNING: This deletes ALL data
psql -d your_database_name -f 99-reset.sql
```

## 🌐 Deployment Environments

### Development
```bash
# Local PostgreSQL
createdb wildlife_dev
psql -d wildlife_dev -f 00-setup.sql
```

### Production
```bash
# Using environment variables
export DATABASE_URL="postgresql://user:pass@host:port/db"
psql $DATABASE_URL -f 00-setup.sql
```

### Cloud Platforms

#### Railway
```bash
# Using Railway CLI
railway run psql -f 00-setup.sql
```

#### Heroku
```bash
# Using Heroku CLI
heroku pg:psql DATABASE_URL --app your-app < 00-setup.sql
```

#### DigitalOcean
```bash
# Connect to managed database
psql "postgresql://user:pass@host:port/db?sslmode=require" -f 00-setup.sql
```

## 🔍 Troubleshooting

### Common Issues

**Permission Denied**
```bash
# Grant permissions to user
GRANT ALL PRIVILEGES ON DATABASE wildlife_db TO your_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_user;
```

**Extension Missing**
```sql
-- Install required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
```

**Foreign Key Violations**
```sql
-- Check referential integrity
SELECT * FROM articles WHERE author_id NOT IN (SELECT id FROM users);
```

### Useful Queries

**Database Statistics**
```sql
SELECT 
    schemaname,
    tablename,
    attname,
    n_distinct,
    correlation
FROM pg_stats 
WHERE schemaname = 'public';
```

**Table Sizes**
```sql
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

**Index Usage**
```sql
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

## 🔄 Migration Strategy

### From Development to Production
1. Export schema: `pg_dump --schema-only`
2. Export data: `pg_dump --data-only` 
3. Apply to production database
4. Run tests to verify

### Version Updates
1. Create migration scripts: `migration-v1-to-v2.sql`
2. Test on staging environment
3. Backup production database
4. Apply migration
5. Verify data integrity

## 📝 Best Practices

### Security
- Change default passwords immediately
- Use environment variables for credentials
- Enable SSL in production
- Regular security updates

### Performance
- Monitor query performance
- Regular VACUUM and ANALYZE
- Index optimization
- Connection pooling

### Backup
- Regular automated backups
- Test restore procedures
- Point-in-time recovery setup
- Disaster recovery plan

## 🆘 Support

### Documentation
- [PostgreSQL Official Docs](https://www.postgresql.org/docs/)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)

### Tools
- **pgAdmin** - Web-based administration
- **DBeaver** - Universal database tool  
- **psql** - Command-line interface

### Monitoring
- **pg_stat_statements** - Query performance
- **pg_stat_user_tables** - Table statistics
- **pg_stat_user_indexes** - Index usage

---

**Happy Wildlife Conservation! 🦁🌍** 