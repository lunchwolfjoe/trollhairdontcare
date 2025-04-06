#!/bin/bash

# Script to fix audience targeting for announcements in the database
echo "Fixing audience targeting for announcements..."

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
echo "Running SQL to add audience column and fix RLS policies..."
psql -f sql/announcements_audience_fix.sql "$DATABASE_URL"

if [ $? -eq 0 ]; then
  echo "✅ Announcements audience targeting has been fixed successfully!"
  echo "You can now target specific audiences with your announcements."
else
  echo "❌ Error: Failed to fix announcements audience targeting."
  echo "Please check your database connection and permissions."
  exit 1
fi

echo "Done!" 