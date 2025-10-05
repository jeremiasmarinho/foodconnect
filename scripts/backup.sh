#!/bin/bash

# FoodConnect Database Backup Script
# This script creates automated backups of the PostgreSQL database

set -e

# Configuration
BACKUP_DIR="/app/backups"
DB_NAME=${POSTGRES_DB:-foodconnect}
DB_USER=${POSTGRES_USER:-foodconnect}
DB_PASSWORD=${POSTGRES_PASSWORD}
DB_HOST=${POSTGRES_HOST:-postgres}
DB_PORT=${POSTGRES_PORT:-5432}
RETENTION_DAYS=7
MAX_BACKUPS=10

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🗄️ Starting database backup...${NC}"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Generate backup filename with timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/foodconnect_backup_$TIMESTAMP.sql"
BACKUP_FILE_COMPRESSED="$BACKUP_FILE.gz"

echo -e "${YELLOW}📁 Backup location: $BACKUP_FILE_COMPRESSED${NC}"

# Set password for pg_dump
export PGPASSWORD=$DB_PASSWORD

# Create database backup
echo -e "${YELLOW}💾 Creating database dump...${NC}"
if pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME \
    --verbose \
    --clean \
    --if-exists \
    --create \
    --format=plain \
    --no-owner \
    --no-privileges > $BACKUP_FILE; then
    
    echo -e "${GREEN}✅ Database dump created successfully${NC}"
    
    # Compress the backup
    echo -e "${YELLOW}🗜️ Compressing backup...${NC}"
    gzip $BACKUP_FILE
    
    # Get file size
    BACKUP_SIZE=$(du -h $BACKUP_FILE_COMPRESSED | cut -f1)
    echo -e "${GREEN}✅ Backup compressed: $BACKUP_SIZE${NC}"
    
else
    echo -e "${RED}❌ Database backup failed!${NC}"
    exit 1
fi

# Clean up old backups
echo -e "${YELLOW}🧹 Cleaning up old backups...${NC}"

# Remove backups older than retention period
find $BACKUP_DIR -name "foodconnect_backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete

# Keep only the most recent backups
BACKUP_COUNT=$(ls -1 $BACKUP_DIR/foodconnect_backup_*.sql.gz | wc -l)
if [ $BACKUP_COUNT -gt $MAX_BACKUPS ]; then
    EXCESS=$((BACKUP_COUNT - MAX_BACKUPS))
    ls -1t $BACKUP_DIR/foodconnect_backup_*.sql.gz | tail -n $EXCESS | xargs rm -f
    echo -e "${YELLOW}🗑️ Removed $EXCESS old backup(s)${NC}"
fi

# List current backups
echo -e "${BLUE}📋 Current backups:${NC}"
ls -la $BACKUP_DIR/foodconnect_backup_*.sql.gz | awk '{print $9, $5, $6, $7, $8}'

# Verify backup integrity
echo -e "${YELLOW}🔍 Verifying backup integrity...${NC}"
if gzip -t $BACKUP_FILE_COMPRESSED; then
    echo -e "${GREEN}✅ Backup integrity verified${NC}"
else
    echo -e "${RED}❌ Backup integrity check failed!${NC}"
    exit 1
fi

# Optional: Upload to cloud storage (uncomment and configure as needed)
# echo -e "${YELLOW}☁️ Uploading to cloud storage...${NC}"
# aws s3 cp $BACKUP_FILE_COMPRESSED s3://your-backup-bucket/foodconnect/
# echo -e "${GREEN}✅ Backup uploaded to cloud storage${NC}"

echo -e "${GREEN}🎉 Backup completed successfully!${NC}"
echo -e "${BLUE}📊 Backup summary:${NC}"
echo -e "   File: $BACKUP_FILE_COMPRESSED"
echo -e "   Size: $BACKUP_SIZE"
echo -e "   Timestamp: $TIMESTAMP"

# Clean up password environment variable
unset PGPASSWORD