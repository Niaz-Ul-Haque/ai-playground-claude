#!/bin/bash
# upload.sh - Upload built Next.js app to S3 and invalidate CloudFront
# Usage: ./scripts/upload.sh [environment]

set -e

ENVIRONMENT=${1:-production}
AWS_REGION=${AWS_REGION:-ca-central-1}
STACK_NAME="ciri-frontend-${ENVIRONMENT}"
BUILD_DIR="out"

echo "📤 Uploading Ciri Frontend to S3"
echo "   Environment: ${ENVIRONMENT}"
echo ""

# Check if build directory exists
if [ ! -d "$BUILD_DIR" ]; then
  echo "❌ Error: Build directory '${BUILD_DIR}' not found"
  echo "   Run 'npm run build' first"
  exit 1
fi

# Get stack outputs
echo "📊 Getting deployment targets..."
BUCKET_NAME=$(aws cloudformation describe-stacks \
  --stack-name $STACK_NAME \
  --region $AWS_REGION \
  --query 'Stacks[0].Outputs[?OutputKey==`WebsiteBucketName`].OutputValue' \
  --output text)

DISTRIBUTION_ID=$(aws cloudformation describe-stacks \
  --stack-name $STACK_NAME \
  --region $AWS_REGION \
  --query 'Stacks[0].Outputs[?OutputKey==`CloudFrontDistributionId`].OutputValue' \
  --output text)

WEBSITE_URL=$(aws cloudformation describe-stacks \
  --stack-name $STACK_NAME \
  --region $AWS_REGION \
  --query 'Stacks[0].Outputs[?OutputKey==`WebsiteUrl`].OutputValue' \
  --output text)

if [ -z "$BUCKET_NAME" ]; then
  echo "❌ Error: Could not find S3 bucket"
  echo "   Make sure the stack '${STACK_NAME}' exists"
  exit 1
fi

echo "   Bucket: ${BUCKET_NAME}"
echo "   Distribution: ${DISTRIBUTION_ID}"
echo ""

# Sync static assets (long cache)
echo "📦 Uploading static assets..."
aws s3 sync $BUILD_DIR/ s3://$BUCKET_NAME/ \
  --delete \
  --cache-control "public, max-age=31536000, immutable" \
  --exclude "*.html" \
  --exclude "*.json" \
  --region $AWS_REGION

# Sync HTML files (no cache for SPA routing)
echo "📄 Uploading HTML files..."
aws s3 sync $BUILD_DIR/ s3://$BUCKET_NAME/ \
  --cache-control "public, max-age=0, must-revalidate" \
  --exclude "*" \
  --include "*.html" \
  --region $AWS_REGION

# Sync JSON files (short cache)
echo "📋 Uploading manifest files..."
aws s3 sync $BUILD_DIR/ s3://$BUCKET_NAME/ \
  --cache-control "public, max-age=3600" \
  --exclude "*" \
  --include "*.json" \
  --region $AWS_REGION

# Invalidate CloudFront cache
echo ""
echo "🔄 Invalidating CloudFront cache..."
INVALIDATION_ID=$(aws cloudfront create-invalidation \
  --distribution-id $DISTRIBUTION_ID \
  --paths "/*" \
  --query 'Invalidation.Id' \
  --output text)

echo "   Invalidation ID: ${INVALIDATION_ID}"

# Wait for invalidation to complete (optional)
echo ""
echo "⏳ Waiting for cache invalidation..."
aws cloudfront wait invalidation-completed \
  --distribution-id $DISTRIBUTION_ID \
  --id $INVALIDATION_ID

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🌐 Website URL: ${WEBSITE_URL}"
