#!/bin/bash

# Skip TypeScript type checking and just run Vite build
echo "Building for production, skipping TypeScript type checking..."
node_modules/.bin/vite build --mode production --emptyOutDir 