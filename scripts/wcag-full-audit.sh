#!/bin/bash

# Full WCAG 2.2 AA Audit Script
# This script runs pa11y on the local development server

URL="${1:-http://localhost:3001/#/how-it-works}"

echo "Running full WCAG 2.2 AA audit on: $URL"
echo "=========================================="
echo ""

# Wait for server to be ready
echo "Waiting for server to be ready..."
timeout=30
counter=0
while ! curl -s "$URL" > /dev/null 2>&1; do
    if [ $counter -ge $timeout ]; then
        echo "Error: Server not responding after ${timeout} seconds"
        exit 1
    fi
    sleep 1
    counter=$((counter + 1))
done

echo "Server is ready. Running audit..."
echo ""

# Run pa11y with WCAG 2.2 AA standard
npx pa11y "$URL" \
  --standard WCAG2AA \
  --reporter cli \
  --include-warnings \
  --include-notices \
  --threshold 0

echo ""
echo "Audit complete!"

