-- FoodConnect PostgreSQL Initialization Script
-- This script sets up the database for production use

-- Create database extensions
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create application user if not exists
DO $$ BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'foodconnect') THEN
        CREATE ROLE foodconnect WITH LOGIN PASSWORD 'changeme_in_production_123!';
    END IF;
END $$;

-- Grant necessary permissions
GRANT CONNECT ON DATABASE foodconnect TO foodconnect;
GRANT USAGE ON SCHEMA public TO foodconnect;
GRANT CREATE ON SCHEMA public TO foodconnect;

-- Create indexes for full-text search
-- These will be created after Prisma migrations run
-- You can run these manually after deployment:

-- Full-text search indexes
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_restaurants_search 
--   ON restaurants USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '') || ' ' || city));

-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_search 
--   ON posts USING gin(to_tsvector('english', content));

-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_menu_items_search 
--   ON menu_items USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- Performance optimization settings
ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';
ALTER SYSTEM SET pg_stat_statements.max = 10000;
ALTER SYSTEM SET pg_stat_statements.track = 'all';

-- Connection and memory settings
ALTER SYSTEM SET max_connections = 200;
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET work_mem = '4MB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';

-- Write-ahead logging settings
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET checkpoint_completion_target = 0.7;
ALTER SYSTEM SET wal_writer_delay = '200ms';

-- Query planner settings
ALTER SYSTEM SET random_page_cost = 1.1;
ALTER SYSTEM SET effective_io_concurrency = 200;

-- Logging settings
ALTER SYSTEM SET log_destination = 'stderr';
ALTER SYSTEM SET logging_collector = on;
ALTER SYSTEM SET log_directory = 'pg_log';
ALTER SYSTEM SET log_filename = 'postgresql-%Y-%m-%d_%H%M%S.log';
ALTER SYSTEM SET log_min_duration_statement = 1000;
ALTER SYSTEM SET log_checkpoints = on;
ALTER SYSTEM SET log_connections = on;
ALTER SYSTEM SET log_disconnections = on;
ALTER SYSTEM SET log_lock_waits = on;

-- Reload configuration
SELECT pg_reload_conf();