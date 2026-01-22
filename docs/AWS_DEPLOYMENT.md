# AWS Deployment Guide - Ciri AI Frontend

This guide covers deploying the Ciri AI frontend to AWS using S3 + CloudFront.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     GitHub Actions                               │
│                   (CI/CD Pipeline)                               │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                     CloudFront CDN                               │
│                 (Global Edge Locations)                          │
│              ┌──────────────────────────┐                        │
│              │  CloudFront Function     │                        │
│              │  (SPA Routing)           │                        │
│              └──────────────────────────┘                        │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                     S3 Bucket                                    │
│              (Static Website Hosting)                            │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ /index.html          (SPA entry point)                      ││
│  │ /_next/static/       (JS, CSS bundles - immutable cache)    ││
│  │ /static/             (Images, fonts - long cache)           ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

## Prerequisites

1. **AWS Account** with appropriate permissions
2. **AWS CLI** installed and configured
3. **Node.js 20+** and npm
4. **GitHub repository** for the project

## Setup Steps

### Step 1: Create IAM Role for GitHub Actions (OIDC)

This is the most secure way to allow GitHub Actions to deploy to AWS without storing credentials.

1. Go to **AWS Console → IAM → Identity providers**

2. Click **Add provider**:
   - Provider type: `OpenID Connect`
   - Provider URL: `https://token.actions.githubusercontent.com`
   - Audience: `sts.amazonaws.com`

3. Click **Add provider**

4. Create a new IAM Role:
   - Go to **IAM → Roles → Create role**
   - Trusted entity: `Web identity`
   - Identity provider: `token.actions.githubusercontent.com`
   - Audience: `sts.amazonaws.com`
   - GitHub organization: `your-org` (or username)
   - GitHub repository: `your-repo-name`
   - Branch: `main` (optional, for extra security)

5. Attach these policies to the role:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "cloudformation:*",
        "s3:*",
        "cloudfront:*",
        "iam:PassRole",
        "iam:GetRole",
        "iam:CreateRole",
        "iam:AttachRolePolicy"
      ],
      "Resource": "*"
    }
  ]
}
```

6. **Copy the Role ARN** - you'll need this for GitHub Secrets

### Step 2: Configure GitHub Secrets

Go to your GitHub repository → **Settings → Secrets and variables → Actions**

Add these secrets:

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `AWS_ROLE_ARN` | `arn:aws:iam::123456789012:role/GitHubActionsRole` | IAM role ARN from Step 1 |
| `API_BASE_URL` | `https://xxxxx.execute-api.ca-central-1.amazonaws.com/Stage` | Your backend API URL |

### Step 3: Update .gitignore

Make sure these are in your `.gitignore`:

```gitignore
# Environment files
.env.local
.env.*.local

# Build output
out/
.next/

# AWS
.aws-sam/
```

### Step 4: Push to Main Branch

The GitHub Actions workflow will automatically:

1. ✅ Build the Next.js application
2. ✅ Deploy CloudFormation stack (S3 + CloudFront)
3. ✅ Upload built files to S3
4. ✅ Invalidate CloudFront cache

```bash
git add .
git commit -m "Add AWS deployment infrastructure"
git push origin main
```

### Step 5: Monitor Deployment

1. Go to **GitHub → Actions** tab
2. Watch the "Deploy Frontend to AWS" workflow
3. Check the deployment summary for your website URL

---

## Manual Deployment

If you prefer to deploy manually:

### Windows (PowerShell)

```powershell
# Set environment variable
$env:NEXT_PUBLIC_API_BASE_URL = "https://xxxxx.execute-api.ca-central-1.amazonaws.com/Stage"

# Deploy infrastructure
.\scripts\deploy.ps1 -Environment production -ApiBaseUrl $env:NEXT_PUBLIC_API_BASE_URL

# Build the application
npm run build

# Upload to S3
.\scripts\upload.ps1 -Environment production
```

### Linux/Mac (Bash)

```bash
# Set environment variable
export NEXT_PUBLIC_API_BASE_URL="https://xxxxx.execute-api.ca-central-1.amazonaws.com/Stage"

# Deploy infrastructure
./scripts/deploy.sh production $NEXT_PUBLIC_API_BASE_URL

# Build the application
npm run build

# Upload to S3
./scripts/upload.sh production
```

---

## Infrastructure Details

### CloudFormation Resources

| Resource | Type | Purpose |
|----------|------|---------|
| `WebsiteBucket` | S3 Bucket | Stores static website files |
| `WebsiteBucketPolicy` | Bucket Policy | Allows CloudFront access |
| `CloudFrontOAC` | Origin Access Control | Secure S3 access |
| `CloudFrontDistribution` | Distribution | CDN for global delivery |
| `SPARoutingFunction` | CloudFront Function | SPA route handling |
| `StaticAssetsCachePolicy` | Cache Policy | Optimized caching |

### Caching Strategy

| File Type | Cache Duration | Reason |
|-----------|----------------|--------|
| `*.html` | 0 (no-cache) | Always fresh for SPA routing |
| `/_next/static/*` | 1 year (immutable) | Content-hashed, never changes |
| `*.json` | 1 hour | Manifests may update |
| Other assets | 1 year | Long-term caching |

### SPA Routing

The CloudFront Function handles SPA routing:
- Requests to files (with extensions) → serve the file
- Requests to paths (no extension) → serve `index.html`
- This allows client-side routing to work properly

---

## Troubleshooting

### Build Fails

```bash
# Check TypeScript errors
npx tsc --noEmit

# Ensure environment variable is set
echo $NEXT_PUBLIC_API_BASE_URL
```

### CloudFormation Stack Fails

```bash
# Check stack events
aws cloudformation describe-stack-events \
  --stack-name ciri-frontend-production \
  --query 'StackEvents[?ResourceStatus==`CREATE_FAILED`]'
```

### 403/404 Errors on Website

1. Check S3 bucket has files uploaded
2. Verify CloudFront OAC is configured
3. Check bucket policy allows CloudFront access

```bash
# List S3 bucket contents
aws s3 ls s3://ciri-frontend-production-123456789012/
```

### CloudFront Not Updating

```bash
# Create manual invalidation
aws cloudfront create-invalidation \
  --distribution-id EXXXXXXXXX \
  --paths "/*"
```

---

## Custom Domain (Optional)

To use a custom domain:

1. **Request ACM Certificate** in `us-east-1` region (required for CloudFront)
2. **Update stack parameters**:

```bash
aws cloudformation deploy \
  --template-file infrastructure/template.yaml \
  --stack-name ciri-frontend-production \
  --parameter-overrides \
    Environment=production \
    ApiBaseUrl=$API_BASE_URL \
    DomainName=app.yourdomain.com \
    CertificateArn=arn:aws:acm:us-east-1:123456789012:certificate/xxx \
  --capabilities CAPABILITY_IAM
```

3. **Create Route 53 record** pointing to CloudFront distribution

---

## Cost Estimate

| Service | Estimated Monthly Cost |
|---------|----------------------|
| S3 | ~$0.50 (storage + requests) |
| CloudFront | ~$1-5 (based on traffic) |
| **Total** | **~$2-6/month** |

*Costs vary based on traffic and data transfer*

---

## Security Features

- ✅ S3 bucket is private (no public access)
- ✅ CloudFront OAC for secure S3 access
- ✅ HTTPS enforced (redirect HTTP)
- ✅ TLS 1.2+ minimum
- ✅ OIDC authentication (no stored AWS credentials)
- ✅ Bucket versioning enabled
- ✅ Server-side encryption (AES-256)
