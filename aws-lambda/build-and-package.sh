#!/bin/bash

# Build and package script for AWS Lambda deployment

echo "Building Lambda function..."

# Install dependencies
npm install

# Build TypeScript
npm run build

# Create deployment package
echo "Creating deployment package..."
cd ..
zip -r liftify-lambda.zip aws-lambda/dist/ aws-lambda/node_modules/ aws-lambda/package.json -x "*.git*" "*.DS_Store*" "*/test/*" "*/tests/*"

echo "Deployment package created: liftify-lambda.zip"
echo "Upload this ZIP file to AWS Lambda"