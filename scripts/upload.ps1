# upload.ps1 - Upload built Next.js app to S3 and invalidate CloudFront (PowerShell)
# Usage: .\scripts\upload.ps1 [-Environment production]

param(
    [string]$Environment = "production",
    [string]$AwsRegion = "ca-central-1"
)

$ErrorActionPreference = "Stop"
$StackName = "ciri-frontend-$Environment"
$BuildDir = "out"

Write-Host "📤 Uploading Ciri Frontend to S3" -ForegroundColor Cyan
Write-Host "   Environment: $Environment"
Write-Host ""

# Check if build directory exists
if (-not (Test-Path $BuildDir)) {
    Write-Host "❌ Error: Build directory '$BuildDir' not found" -ForegroundColor Red
    Write-Host "   Run 'npm run build' first"
    exit 1
}

# Get stack outputs
Write-Host "📊 Getting deployment targets..."

$BucketName = aws cloudformation describe-stacks `
    --stack-name $StackName `
    --region $AwsRegion `
    --query 'Stacks[0].Outputs[?OutputKey==`WebsiteBucketName`].OutputValue' `
    --output text

$DistributionId = aws cloudformation describe-stacks `
    --stack-name $StackName `
    --region $AwsRegion `
    --query 'Stacks[0].Outputs[?OutputKey==`CloudFrontDistributionId`].OutputValue' `
    --output text

$WebsiteUrl = aws cloudformation describe-stacks `
    --stack-name $StackName `
    --region $AwsRegion `
    --query 'Stacks[0].Outputs[?OutputKey==`WebsiteUrl`].OutputValue' `
    --output text

if (-not $BucketName) {
    Write-Host "❌ Error: Could not find S3 bucket" -ForegroundColor Red
    Write-Host "   Make sure the stack '$StackName' exists"
    exit 1
}

Write-Host "   Bucket: $BucketName"
Write-Host "   Distribution: $DistributionId"
Write-Host ""

# Sync static assets (long cache)
Write-Host "📦 Uploading static assets..."
aws s3 sync $BuildDir/ s3://$BucketName/ `
    --delete `
    --cache-control "public, max-age=31536000, immutable" `
    --exclude "*.html" `
    --exclude "*.json" `
    --region $AwsRegion

# Sync HTML files (no cache for SPA routing)
Write-Host "📄 Uploading HTML files..."
aws s3 sync $BuildDir/ s3://$BucketName/ `
    --cache-control "public, max-age=0, must-revalidate" `
    --exclude "*" `
    --include "*.html" `
    --region $AwsRegion

# Sync JSON files (short cache)
Write-Host "📋 Uploading manifest files..."
aws s3 sync $BuildDir/ s3://$BucketName/ `
    --cache-control "public, max-age=3600" `
    --exclude "*" `
    --include "*.json" `
    --region $AwsRegion

# Invalidate CloudFront cache
Write-Host ""
Write-Host "🔄 Invalidating CloudFront cache..."
$InvalidationResult = aws cloudfront create-invalidation `
    --distribution-id $DistributionId `
    --paths "/*" `
    --query 'Invalidation.Id' `
    --output text

Write-Host "   Invalidation ID: $InvalidationResult"

# Wait for invalidation to complete
Write-Host ""
Write-Host "⏳ Waiting for cache invalidation..."
aws cloudfront wait invalidation-completed `
    --distribution-id $DistributionId `
    --id $InvalidationResult

Write-Host ""
Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Website URL: $WebsiteUrl" -ForegroundColor Cyan
