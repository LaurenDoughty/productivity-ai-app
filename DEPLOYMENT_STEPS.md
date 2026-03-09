# Step-by-Step Deployment Guide

## Prerequisites

1. **AWS Account** - You need an active AWS account
2. **Gemini API Key** - Get it from https://makersuite.google.com/app/apikey (free tier available)

## Installation Steps

### 1. Install AWS EB CLI

Open PowerShell as Administrator and run:

```powershell
pip install awsebcli --upgrade --user
```

After installation, close and reopen your terminal, then verify:

```powershell
eb --version
```

### 2. Configure AWS Credentials

If you haven't configured AWS credentials yet:

```powershell
aws configure
```

You'll be prompted for:
- AWS Access Key ID
- AWS Secret Access Key
- Default region (use `us-east-1`)
- Default output format (use `json`)

**To get AWS credentials:**
1. Go to AWS Console → IAM → Users
2. Select your user (or create one)
3. Go to "Security credentials" tab
4. Click "Create access key"
5. Save the Access Key ID and Secret Access Key

### 3. Get Gemini API Key

1. Go to https://makersuite.google.com/app/apikey
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the API key (you'll need it in step 6)

## Deployment Steps

### 4. Build the Application

```powershell
cd "Python AI project sample"
npm install
npm run build
```

### 5. Initialize Elastic Beanstalk

```powershell
eb init
```

When prompted:
- Select region: Choose `us-east-1` (or your preferred region)
- Application name: Press Enter to use `productivity-copilot`
- Platform: Select `Node.js`
- Platform version: Select the latest Node.js 18 version
- CodeCommit: Select `n` (No)
- SSH: Select `n` (No) for now

### 6. Create Environment and Deploy

Replace `YOUR_GEMINI_API_KEY` with your actual API key:

```powershell
eb create productivity-copilot-prod `
  --instance-type t3.micro `
  --single `
  --envvars NODE_ENV=production,PORT=8080,VITE_AI_PROVIDER=gemini,VITE_GEMINI_API_KEY=YOUR_GEMINI_API_KEY,VITE_MAX_RETRIES=3,VITE_INITIAL_DELAY_MS=1000,VITE_MAX_DELAY_MS=10000,VITE_BACKOFF_MULTIPLIER=2,VITE_MAX_REQUESTS_PER_MINUTE=60,VITE_MAX_TOKENS_PER_MINUTE=100000,APP_VERSION=1.0.0
```

This will:
- Create a new environment called `productivity-copilot-prod`
- Use a t3.micro instance (eligible for AWS Free Tier)
- Deploy as a single instance (not load balanced)
- Set all required environment variables

**Wait 5-10 minutes** for the environment to be created and the application to deploy.

### 7. Verify Deployment

Check the status:

```powershell
eb status
```

Check health:

```powershell
eb health
```

Open the application in your browser:

```powershell
eb open
```

### 8. View Logs (if needed)

If something goes wrong:

```powershell
eb logs
```

## Future Deployments

After the initial setup, to deploy updates:

```powershell
npm run build
eb deploy
```

Or use the automated script:

```powershell
.\deploy-windows.ps1
```

## Cost Information

**AWS Free Tier (First 12 months):**
- 750 hours/month of t2.micro or t3.micro EC2 instance
- 15 GB data transfer out per month
- This deployment uses t3.micro, so it's covered by Free Tier

**Gemini API:**
- Free tier: 60 requests per minute
- No credit card required

**After Free Tier:**
- EC2 t3.micro: ~$7.50/month
- Data transfer: ~$0.09/GB
- Gemini: Still free for 60 req/min

## Monitoring

View application metrics:

```powershell
eb console
```

This opens the AWS Console where you can:
- Monitor CPU, memory, and network usage
- View application logs
- Configure auto-scaling (if needed)
- Set up alarms

## Troubleshooting

### Application won't start
```powershell
eb logs
```
Look for errors in the logs.

### Health check failing
The application has a health endpoint at `/health`. Check:
```powershell
curl https://your-app-url.elasticbeanstalk.com/health
```

### Environment variables not set
Update environment variables:
```powershell
eb setenv VITE_GEMINI_API_KEY=your_new_key
```

## Cleanup

To delete the environment and avoid charges:

```powershell
eb terminate productivity-copilot-prod
```

To delete the entire application:

```powershell
eb terminate --all
```

## Next Steps

1. **Set up a custom domain** (optional)
2. **Enable HTTPS** with AWS Certificate Manager (free)
3. **Set up CloudWatch alarms** for monitoring
4. **Configure auto-scaling** if traffic increases

## Support

For issues, check:
- `docs/TROUBLESHOOTING.md` - Common issues and solutions
- `docs/DEPLOYMENT.md` - Detailed deployment documentation
- AWS Elastic Beanstalk documentation
