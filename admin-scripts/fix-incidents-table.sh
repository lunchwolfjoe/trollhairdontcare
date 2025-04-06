#!/bin/bash

# Script to fix the incidents table in the database
echo "Fixing incidents table in the database..."

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
echo "Running SQL to create and fix the incidents table..."
psql -f sql/create_incidents_table.sql "$DATABASE_URL"

if [ $? -eq 0 ]; then
  echo "✅ Incidents table has been fixed successfully!"
  echo "You can now log incidents in the application."
else
  echo "❌ Error: Failed to fix incidents table."
  echo "Please check your database connection and permissions."
  exit 1
fi

echo "Done!" 