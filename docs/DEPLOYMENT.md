# Deployment Guide

This guide walks you through deploying the Productivity Copilot application to AWS Elastic Beanstalk.

## Prerequisites

1. **AWS Account**: You need an active AWS account
2. **EB CLI**: Install the Elastic Beanstalk CLI
   ```bash
   pip install awsebcli
   ```
3. **Node.js 18+**: Required for building the application
4. **Git**: For version control

## Step 1: Configure Environment Variables

1. Copy the environment template:
   ```bash
   cp .env.template .env
   ```

2. Choose your AI provider and configure accordingly:

### Option A: Gemini (Recommended for Development)

```env
VITE_AI_PROVIDER=gemini
VITE_GEMINI_API_KEY=your_gemini_api_key
```

Get your Gemini API key from: https://makersuite.google.com/app/apikey

### Option B: Bedrock (Recommended for Production)

```env
VITE_AI_PROVIDER=bedrock
AWS_REGION=us-east-1
```

You'll also need to configure AWS credentials (see Step 4).

## Step 2: Build and Test Locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run tests:
   ```bash
   npm run test
   ```

3. Build the application:
   ```bash
   npm run build
   ```

4. Test the server locally:
   ```bash
   npm run server
   ```

5. Verify health check:
   ```bash
   curl http://localhost:8080/health
   ```

## Step 3: Initialize Elastic Beanstalk

1. Initialize EB application:
   ```bash
   eb init -p node.js-18 productivity-copilot --region us-east-1
   ```

2. Create environment:
   ```bash
   eb create productivity-copilot-prod \
     --instance-type t3.micro \
     --single \
     --envvars NODE_ENV=production,PORT=8080
   ```

## Step 4: Configure Environment Variables in AWS

### For Gemini:

```bash
eb setenv \
  VITE_AI_PROVIDER=gemini \
  VITE_GEMINI_API_KEY=your_api_key_here \
  APP_VERSION=1.0.0
```

### For Bedrock:

```bash
eb setenv \
  VITE_AI_PROVIDER=bedrock \
  AWS_REGION=us-east-1 \
  AWS_ACCESS_KEY_ID=your_access_key \
  AWS_SECRET_ACCESS_KEY=your_secret_key \
  APP_VERSION=1.0.0
```

**Security Note**: For production, use IAM roles instead of access keys:
1. Create an IAM role with Bedrock permissions
2. Attach the role to your Elastic Beanstalk instance profile
3. Remove AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY from environment variables

## Step 5: Deploy

Use the automated deployment script:

```bash
bash deployment/deploy.sh
```

Or deploy manually:

```bash
npm run build
eb deploy
```

## Step 6: Verify Deployment

1. Check application status:
   ```bash
   eb status
   ```

2. View logs:
   ```bash
   eb logs
   ```

3. Open application:
   ```bash
   eb open
   ```

4. Test health endpoint:
   ```bash
   curl https://your-app-url.elasticbeanstalk.com/health
   ```

## Step 7: Configure CloudFront (Optional but Recommended)

For better performance and lower costs:

1. Create a CloudFront distribution
2. Set origin to your Elastic Beanstalk URL
3. Enable compression
4. Set cache behaviors for static assets
5. Update DNS to point to CloudFront

## Rollback

If deployment fails or causes issues:

```bash
bash deployment/rollback.sh
```

Or manually:

```bash
eb deploy --version previous-version-label
```

## Monitoring

### View Logs

```bash
# All logs
eb logs

# Follow logs in real-time
eb logs --stream

# Specific log file
eb logs --log-group /aws/elasticbeanstalk/productivity-copilot/nodejs
```

### Check Health

```bash
eb health
eb health --refresh
```

### CloudWatch Metrics

1. Go to AWS Console → CloudWatch
2. Navigate to Metrics → ElasticBeanstalk
3. Monitor:
   - CPU utilization
   - Network traffic
   - Request count
   - Latency

## Cost Optimization

### Free Tier Limits

- **EC2**: 750 hours/month of t2.micro or t3.micro
- **Data Transfer**: 15 GB/month outbound
- **CloudWatch**: 10 custom metrics, 10 alarms

### Tips to Stay Within Free Tier

1. Use single instance (not load balanced)
2. Use t3.micro instance type
3. Enable caching to reduce API calls
4. Use CloudFront for static assets
5. Monitor usage in AWS Billing Dashboard

### Estimated Costs (Beyond Free Tier)

**With Gemini:**
- EC2 t3.micro: ~$7.50/month
- Data transfer: ~$0.09/GB
- Gemini API: Free tier (60 req/min)

**With Bedrock:**
- EC2 t3.micro: ~$7.50/month
- Data transfer: ~$0.09/GB
- Bedrock Claude 3.5 Sonnet:
  - Input: $3.00 per million tokens
  - Output: $15.00 per million tokens
  - Example: 1000 requests/day ≈ $5-10/month

## Troubleshooting

See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for common issues and solutions.

## Security Best Practices

1. **Never commit secrets**: Use environment variables
2. **Use IAM roles**: Instead of access keys for Bedrock
3. **Enable HTTPS**: Use ACM certificates
4. **Set up WAF**: For production applications
5. **Regular updates**: Keep dependencies updated
6. **Monitor logs**: Set up CloudWatch alarms

## Updating the Application

1. Make changes to code
2. Run tests: `npm run test`
3. Build: `npm run build`
4. Deploy: `bash deployment/deploy.sh`
5. Verify: Check health endpoint and logs

## Scaling

### Vertical Scaling (Larger Instance)

```bash
eb scale 1 --instance-type t3.small
```

### Horizontal Scaling (Multiple Instances)

1. Convert to load-balanced environment:
   ```bash
   eb config
   ```

2. Update environment type to LoadBalanced

3. Set auto-scaling rules:
   ```bash
   eb scale 2  # Minimum 2 instances
   ```

Note: This will exceed Free Tier limits.

## Cleanup

To delete the environment and avoid charges:

```bash
eb terminate productivity-copilot-prod
```

To delete the application:

```bash
eb terminate --all
```
