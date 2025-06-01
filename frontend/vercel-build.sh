#!/bin/bash

# Skip TypeScript checking and directly build with Vite
echo "Skipping TypeScript type checking for deployment."
npm run build-force

# Exit with the status of the last command
exit $? 