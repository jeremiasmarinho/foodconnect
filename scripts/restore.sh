#!/bin/bash

# FoodConnect Database Restore Script
# This script restores the PostgreSQL database from a backup

set -e

# Configuration
BACKUP_DIR="/app/backups"
DB_NAME=${POSTGRES_DB:-foodconnect}
DB_USER=${POSTGRES_USER:-foodconnect}
DB_PASSWORD=${POSTGRES_PASSWORD}
DB_HOST=${POSTGRES_HOST:-postgres}
DB_PORT=${POSTGRES_PORT:-5432}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to show usage
show_usage() {
    echo "Usage: $0 [backup_file]"
    echo ""
    echo "Arguments:"
    echo "  backup_file    Path to backup file (optional, will show list if not provided)"
    echo ""
    echo "Examples:"
    echo "  $0                                              # Show available backups"
    echo "  $0 /app/backups/foodconnect_backup_20231005_120000.sql.gz"
    echo ""
}

echo -e "${BLUE}🔄 FoodConnect Database Restore${NC}"

# If no backup file specified, show available backups
if [ $# -eq 0 ]; then
    echo -e "${YELLOW}📋 Available backups:${NC}"
    if ls $BACKUP_DIR/foodconnect_backup_*.sql.gz 1> /dev/null 2>&1; then
        ls -la $BACKUP_DIR/foodconnect_backup_*.sql.gz | awk '{print NR". " $9 " (" $5 " bytes, " $6 " " $7 " " $8 ")"}'
        echo ""
        echo -e "${BLUE}Please run the script again with the backup file path:${NC}"
        echo -e "${YELLOW}Example: $0 $BACKUP_DIR/foodconnect_backup_YYYYMMDD_HHMMSS.sql.gz${NC}"
    else
        echo -e "${RED}❌ No backup files found in $BACKUP_DIR${NC}"
    fi
    exit 1
fi

BACKUP_FILE=$1

# Validate backup file
if [ ! -f "$BACKUP_FILE" ]; then
    echo -e "${RED}❌ Backup file not found: $BACKUP_FILE${NC}"
    exit 1
fi

# Check if file is compressed
if [[ $BACKUP_FILE == *.gz ]]; then
    COMPRESSED=true
    TEMP_FILE="/tmp/restore_temp.sql"
else
    COMPRESSED=false
    TEMP_FILE=$BACKUP_FILE
fi

echo -e "${YELLOW}📁 Backup file: $BACKUP_FILE${NC}"

# Verify backup integrity
echo -e "${YELLOW}🔍 Verifying backup integrity...${NC}"
if [ "$COMPRESSED" = true ]; then
    if gzip -t $BACKUP_FILE; then
        echo -e "${GREEN}✅ Backup integrity verified${NC}"
    else
        echo -e "${RED}❌ Backup file is corrupted!${NC}"
        exit 1
    fi
fi

# Warning about data loss
echo -e "${RED}⚠️  WARNING: This will replace all data in the database!${NC}"
echo -e "${YELLOW}Database: $DB_NAME on $DB_HOST:$DB_PORT${NC}"
read -p "Are you sure you want to continue? (yes/no): " -r
if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    echo -e "${BLUE}❌ Restore cancelled${NC}"
    exit 1
fi

# Set password for psql
export PGPASSWORD=$DB_PASSWORD

# Extract compressed backup if needed
if [ "$COMPRESSED" = true ]; then
    echo -e "${YELLOW}📦 Extracting compressed backup...${NC}"
    gunzip -c $BACKUP_FILE > $TEMP_FILE
fi

# Stop application services to prevent connections
echo -e "${YELLOW}⏸️ Stopping application services...${NC}"
docker-compose stop backend frontend || true

echo -e "${YELLOW}🔄 Restoring database...${NC}"

# Restore database
if psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -f $TEMP_FILE; then
    echo -e "${GREEN}✅ Database restored successfully${NC}"
else
    echo -e "${RED}❌ Database restore failed!${NC}"
    
    # Clean up temp file
    if [ "$COMPRESSED" = true ]; then
        rm -f $TEMP_FILE
    fi
    
    exit 1
fi

# Clean up temp file
if [ "$COMPRESSED" = true ]; then
    rm -f $TEMP_FILE
    echo -e "${GREEN}🧹 Temporary files cleaned up${NC}"
fi

# Start application services
echo -e "${YELLOW}▶️ Starting application services...${NC}"
docker-compose start backend frontend

# Wait for services to be healthy
echo -e "${YELLOW}⏳ Waiting for services to be ready...${NC}"
sleep 10

# Verify restore
echo -e "${YELLOW}🔍 Verifying restore...${NC}"
if psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT COUNT(*) FROM users;" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Database is accessible after restore${NC}"
else
    echo -e "${RED}❌ Database verification failed${NC}"
    exit 1
fi

echo -e "${GREEN}🎉 Restore completed successfully!${NC}"
echo -e "${BLUE}📊 Restore summary:${NC}"
echo -e "   Source: $BACKUP_FILE"
echo -e "   Target: $DB_NAME on $DB_HOST:$DB_PORT"
echo -e "   Timestamp: $(date)"

# Clean up password environment variable
unset PGPASSWORD