#!/bin/bash

# Script to fix the messages table in the database
echo "Fixing messages table to properly handle announcements..."

# Check for required environment variables
if [ -z "$DATABASE_URL" ]; then
  if [ -f .env ]; then
    # Try to load from .env file
    export $(grep -v '^#' .env | xargs)
  else
    echo "Error: DATABASE_URL environment variable not set"
    echo "Please set the DATABASE_URL or create a .env file with DATABASE_URL"
    exit 1
  fi
fi

# Execute the SQL file
echo "Running SQL to fix message table structure and policies..."
psql -f sql/fix_messages_recipient_id.sql "$DATABASE_URL"

if [ $? -eq 0 ]; then
  echo "✅ Messages table has been fixed successfully!"
  echo "Announcements should now work properly with the correct RLS policies."
  exit 0
else
  echo "❌ Error fixing messages table."
  echo "Please check the error output and try again."
  exit 1
fi 