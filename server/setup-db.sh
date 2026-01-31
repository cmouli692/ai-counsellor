#!/bin/bash
# Database Setup Script for AI Counsellor MVP
# Run this after PostgreSQL is installed and running

set -e

# Load environment variables
source .env

DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-ai_counsellor_dev}
DB_USER=${DB_USER:-postgres}
DB_PASSWORD=${DB_PASSWORD:-password}

echo "🗄️  Setting up PostgreSQL database..."
echo "Database: $DB_NAME"
echo "User: $DB_USER"
echo "Host: $DB_HOST:$DB_PORT"
echo ""

# Create database
echo "📝 Creating database '$DB_NAME'..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -tc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" | grep -q 1 || \
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -c "CREATE DATABASE $DB_NAME;"

echo "✅ Database created/exists"
echo ""

# Run schema
echo "🏗️  Loading schema..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f schema.sql

echo ""
echo "✅ Schema loaded successfully!"
echo ""
echo "📊 Database is ready:"
echo "   - 6 tables created"
echo "   - 30 universities seeded"
echo "   - Ready for application!"
echo ""
