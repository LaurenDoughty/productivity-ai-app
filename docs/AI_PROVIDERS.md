# AI Provider Comparison

This document provides a detailed comparison of the two supported AI providers: Google Gemini and AWS Bedrock (Claude 3.5 Sonnet).

## Overview

The application uses a provider abstraction layer that allows seamless switching between AI providers without code changes. Simply set the `VITE_AI_PROVIDER` environment variable to switch providers.

## Google Gemini

### Overview
Google's Gemini is a family of multimodal AI models that can understand and generate text, code, images, and more.

### Pricing
- **Free Tier**: 60 requests per minute
- **Paid Tier**: Pay-as-you-go pricing (varies by model)
- **Model Used**: gemini-pro

### Pros
✅ Free tier available for development and low-volume production  
✅ Easy setup - just need an API key  
✅ Good performance and quality  
✅ No AWS account required  
✅ Fast response times  
✅ Generous rate limits (60 req/min)  

### Cons
❌ External service (not AWS-native)  
❌ Rate limits on free tier  
❌ Less integration with AWS services  
❌ Requires internet access to Google APIs  
❌ Token usage not precisely tracked (estimated)  

### Best For
- Development and testing
- Low-volume production applications
- Cost-sensitive projects
- Quick prototyping
- Applications without AWS infrastructure

### Setup

1. Get API key from: https://makersuite.google.com/app/apikey

2. Set environment variables:
   ```bash
   VITE_AI_PROVIDER=gemini
   VITE_GEMINI_API_KEY=your_api_key_here
   ```

3. Deploy:
   ```bash
   eb setenv VITE_AI_PROVIDER=gemini VITE_GEMINI_API_KEY=your_key
   ```

### Rate Limits
- **Free Tier**: 60 requests per minute
- **Paid Tier**: Higher limits available

### Example Cost (Free Tier)
- **1,000 requests/day**: $0/month
- **10,000 requests/day**: $0/month (within limits)
- **100,000 requests/day**: May exceed free tier

## AWS Bedrock (Claude 3.5 Sonnet)

### Overview
AWS Bedrock provides access to foundation models including Anthropic's Claude 3.5 Sonnet through a fully managed API.

### Pricing
- **Input Tokens**: $3.00 per million tokens
- **Output Tokens**: $15.00 per million tokens
- **No Free Tier**: Pay for what you use
- **Model Used**: anthropic.claude-3-5-sonnet-20241022-v2:0

### Pros
✅ AWS-native integration  
✅ Better for production AWS deployments  
✅ Higher rate limits  
✅ Precise token usage tracking  
✅ IAM role-based authentication  
✅ CloudWatch integration  
✅ Enterprise support available  
✅ Data stays within AWS  

### Cons
❌ No free tier - costs from first request  
❌ More expensive than Gemini free tier  
❌ Requires AWS account and credentials  
❌ More complex setup  
❌ Not available in all AWS regions  
❌ Requires IAM permissions configuration  

### Best For
- Production applications on AWS
- High-volume applications
- Enterprise deployments
- Applications requiring AWS integration
- Compliance-sensitive workloads
- Applications needing precise cost tracking

### Setup

1. Enable Bedrock in AWS Console:
   - Go to AWS Bedrock console
   - Request access to Claude 3.5 Sonnet model
   - Wait for approval (usually instant)

2. Create IAM role with permissions:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "bedrock:InvokeModel"
         ],
         "Resource": "arn:aws:bedrock:*::foundation-model/anthropic.claude-3-5-sonnet-20241022-v2:0"
       }
     ]
   }
   ```

3. Set environment variables:
   ```bash
   VITE_AI_PROVIDER=bedrock
   AWS_REGION=us-east-1
   ```

4. Deploy with IAM role (recommended):
   ```bash
   eb setenv VITE_AI_PROVIDER=bedrock AWS_REGION=us-east-1
   ```

   Or with credentials (not recommended for production):
   ```bash
   eb setenv VITE_AI_PROVIDER=bedrock AWS_REGION=us-east-1 \
     AWS_ACCESS_KEY_ID=your_key AWS_SECRET_ACCESS_KEY=your_secret
   ```

### Rate Limits
- **Default**: Much higher than Gemini
- **Throttling**: Can request quota increases
- **Burst**: Supports burst traffic

### Example Costs

#### Low Volume (1,000 requests/day)
- Average request: 500 input tokens, 200 output tokens
- Daily cost: (500k × $3/M) + (200k × $15/M) = $1.50 + $3.00 = $4.50/day
- Monthly cost: ~$135/month

#### Medium Volume (10,000 requests/day)
- Average request: 500 input tokens, 200 output tokens
- Daily cost: (5M × $3/M) + (2M × $15/M) = $15 + $30 = $45/day
- Monthly cost: ~$1,350/month

#### High Volume (100,000 requests/day)
- Average request: 500 input tokens, 200 output tokens
- Daily cost: (50M × $3/M) + (20M × $15/M) = $150 + $300 = $450/day
- Monthly cost: ~$13,500/month

## Comparison Table

| Feature | Gemini | Bedrock (Claude 3.5) |
|---------|--------|---------------------|
| **Cost** | Free tier available | $3-15 per million tokens |
| **Setup Complexity** | Simple (API key) | Complex (IAM, permissions) |
| **AWS Integration** | None | Native |
| **Rate Limits** | 60 req/min (free) | High (configurable) |
| **Token Tracking** | Estimated | Precise |
| **Best For** | Development, low-volume | Production, high-volume |
| **Free Tier** | Yes | No |
| **Response Quality** | Excellent | Excellent |
| **Latency** | Low | Low |
| **Availability** | Global | AWS regions only |

## Switching Between Providers

### At Development Time

1. Update `.env` file:
   ```bash
   # Switch to Gemini
   VITE_AI_PROVIDER=gemini
   VITE_GEMINI_API_KEY=your_key

   # Or switch to Bedrock
   VITE_AI_PROVIDER=bedrock
   AWS_REGION=us-east-1
   ```

2. Restart application:
   ```bash
   npm run dev
   ```

### At Deployment Time

1. Update environment variables:
   ```bash
   # Switch to Gemini
   eb setenv VITE_AI_PROVIDER=gemini VITE_GEMINI_API_KEY=your_key

   # Or switch to Bedrock
   eb setenv VITE_AI_PROVIDER=bedrock AWS_REGION=us-east-1
   ```

2. Redeploy (optional - environment variables update immediately):
   ```bash
   eb deploy
   ```

### No Code Changes Required

The provider abstraction layer ensures:
- Same request/response format
- Same error handling
- Same retry logic
- Same caching behavior
- Same user experience

## Recommendations

### For Development
**Use Gemini**
- Free tier is sufficient
- Easy setup
- Fast iteration

### For Production (Low Volume)
**Use Gemini**
- Cost-effective
- Good performance
- Simple maintenance

### For Production (High Volume)
**Use Bedrock**
- Better AWS integration
- Higher rate limits
- Precise cost tracking
- Enterprise support

### For Enterprise
**Use Bedrock**
- AWS-native
- Compliance features
- IAM integration
- CloudWatch monitoring

## Cost Optimization Tips

### For Gemini
1. Stay within free tier (60 req/min)
2. Implement aggressive caching
3. Use request debouncing
4. Monitor rate limits

### For Bedrock
1. Optimize prompt length (reduce input tokens)
2. Set appropriate max_tokens (reduce output tokens)
3. Implement caching (1-hour TTL)
4. Use request batching where possible
5. Monitor costs in CloudWatch
6. Set up billing alerts

## Monitoring

### Gemini
- Track request count
- Monitor rate limit errors
- Log response times
- Estimate token usage

### Bedrock
- Track precise token usage
- Monitor costs in real-time
- Set up CloudWatch alarms
- Review cost reports

## Support

### Gemini
- Documentation: https://ai.google.dev/docs
- Community: Google AI forums
- Status: https://status.cloud.google.com/

### Bedrock
- Documentation: https://docs.aws.amazon.com/bedrock/
- Support: AWS Support (if subscribed)
- Status: https://status.aws.amazon.com/

## Future Providers

The abstraction layer is designed to support additional providers:
- OpenAI GPT-4
- Azure OpenAI
- Cohere
- AI21 Labs

To add a new provider:
1. Implement the `AIProvider` interface
2. Add to `AIProviderFactory`
3. Update environment configuration
4. Document in this file
