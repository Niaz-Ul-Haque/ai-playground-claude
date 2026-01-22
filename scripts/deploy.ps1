# deploy.ps1 - Deploy Ciri Frontend infrastructure to AWS (PowerShell)
# Usage: .\scripts\deploy.ps1 [-Environment production] [-ApiBaseUrl "https://..."]

param(
    [string]$Environment = "production",
    [string]$ApiBaseUrl = $env:NEXT_PUBLIC_API_BASE_URL,
    [string]$AwsRegion = "ca-central-1"
)

$ErrorActionPreference = "Stop"
$StackName = "ciri-frontend-$Environment"

Write-Host "🚀 Deploying Ciri Frontend Infrastructure" -ForegroundColor Cyan
Write-Host "   Environment: $Environment"
Write-Host "   Region: $AwsRegion"
Write-Host "   Stack: $StackName"
Write-Host ""

# Validate required variables
if (-not $ApiBaseUrl) {
    Write-Host "❌ Error: ApiBaseUrl is required" -ForegroundColor Red
    Write-Host "   Usage: .\scripts\deploy.ps1 -ApiBaseUrl 'https://...'"
    Write-Host "   Or set NEXT_PUBLIC_API_BASE_URL environment variable"
    exit 1
}

# Check AWS credentials
Write-Host "📋 Checking AWS credentials..."
try {
    aws sts get-caller-identity | Out-Null
    Write-Host "✅ AWS credentials valid" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: AWS credentials not configured" -ForegroundColor Red
    Write-Host "   Run 'aws configure' or set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY"
    exit 1
}

# Deploy CloudFormation stack
Write-Host ""
Write-Host "📦 Deploying CloudFormation stack..."
aws cloudformation deploy `
    --template-file infrastructure/template.yaml `
    --stack-name $StackName `
    --parameter-overrides `
        Environment=$Environment `
        ApiBaseUrl=$ApiBaseUrl `
    --capabilities CAPABILITY_IAM `
    --region $AwsRegion `
    --no-fail-on-empty-changeset

# Get stack outputs
Write-Host ""
Write-Host "📊 Getting stack outputs..."

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

Write-Host ""
Write-Host "✅ Infrastructure deployed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Stack Outputs:" -ForegroundColor Cyan
Write-Host "   S3 Bucket:       $BucketName"
Write-Host "   Distribution ID: $DistributionId"
Write-Host "   Website URL:     $WebsiteUrl"
Write-Host ""
Write-Host "💡 Next steps:" -ForegroundColor Yellow
Write-Host "   1. Build the application: npm run build"
Write-Host "   2. Upload to S3: .\scripts\upload.ps1 -Environment $Environment"
