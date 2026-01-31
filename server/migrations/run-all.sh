#!/bin/bash

# Run all migrations in order
# Usage: ./run-all.sh [database-url]

DB_URL="${1:-$DATABASE_URL}"

if [ -z "$DB_URL" ]; then
  echo "Error: DATABASE_URL not provided"
  echo "Usage: ./run-all.sh postgresql://user:password@localhost:5432/dbname"
  echo "Or set DATABASE_URL environment variable"
  exit 1
fi

echo "Running migrations..."
echo "Database: $DB_URL"
echo ""

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

for migration in "$SCRIPT_DIR"/*.sql; do
  filename=$(basename "$migration")
  echo "Running migration: $filename"
  psql "$DB_URL" -f "$migration"
  
  if [ $? -eq 0 ]; then
    echo "✓ $filename completed successfully"
  else
    echo "✗ $filename failed"
    exit 1
  fi
  echo ""
done

echo "All migrations completed successfully!"
