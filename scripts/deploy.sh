#!/bin/bash
# deploy.sh - Deploy Ciri Frontend infrastructure to AWS
# Usage: ./scripts/deploy.sh [environment] [api-base-url]

set -e

ENVIRONMENT=${1:-production}
API_BASE_URL=${2:-$NEXT_PUBLIC_API_BASE_URL}
AWS_REGION=${AWS_REGION:-ca-central-1}
STACK_NAME="ciri-frontend-${ENVIRONMENT}"

echo "🚀 Deploying Ciri Frontend Infrastructure"
echo "   Environment: ${ENVIRONMENT}"
echo "   Region: ${AWS_REGION}"
echo "   Stack: ${STACK_NAME}"
echo ""

# Validate required variables
if [ -z "$API_BASE_URL" ]; then
  echo "❌ Error: API_BASE_URL is required"
  echo "   Usage: ./scripts/deploy.sh [environment] [api-base-url]"
  echo "   Or set NEXT_PUBLIC_API_BASE_URL environment variable"
  exit 1
fi

# Check AWS credentials
echo "📋 Checking AWS credentials..."
aws sts get-caller-identity > /dev/null 2>&1 || {
  echo "❌ Error: AWS credentials not configured"
  echo "   Run 'aws configure' or set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY"
  exit 1
}
echo "✅ AWS credentials valid"

# Deploy CloudFormation stack
echo ""
echo "📦 Deploying CloudFormation stack..."
aws cloudformation deploy \
  --template-file infrastructure/template.yaml \
  --stack-name $STACK_NAME \
  --parameter-overrides \
    Environment=$ENVIRONMENT \
    ApiBaseUrl=$API_BASE_URL \
  --capabilities CAPABILITY_IAM \
  --region $AWS_REGION \
  --no-fail-on-empty-changeset

# Get stack outputs
echo ""
echo "📊 Getting stack outputs..."
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

echo ""
echo "✅ Infrastructure deployed successfully!"
echo ""
echo "📋 Stack Outputs:"
echo "   S3 Bucket:       ${BUCKET_NAME}"
echo "   Distribution ID: ${DISTRIBUTION_ID}"
echo "   Website URL:     ${WEBSITE_URL}"
echo ""
echo "💡 Next steps:"
echo "   1. Build the application: npm run build"
echo "   2. Upload to S3: ./scripts/upload.sh ${ENVIRONMENT}"
