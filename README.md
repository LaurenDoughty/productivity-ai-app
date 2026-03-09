# Productivity Copilot

AI-powered productivity optimization tool optimized for AWS Elastic Beanstalk deployment within Free Tier constraints.

## Features

- **Hybrid AI Provider System**: Switch between Google Gemini (free tier) and AWS Bedrock (Claude 3.5 Sonnet) without code changes
- **Multi-Level Caching**: Memory, localStorage, and service worker caching to minimize API costs
- **Optimized Build**: Bundle size < 500KB (gzipped) with code splitting and lazy loading
- **Production Ready**: Health checks, monitoring, logging, and error handling
- **AWS Free Tier Optimized**: Designed to run on t3.micro instances with minimal costs

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- AWS account (for deployment)
- EB CLI (for deployment)

### Installation

```bash
npm install
```

### Configuration

1. Copy the environment template:
```bash
cp .env.template .env
```

2. Configure your AI provider:

**For Gemini (Development/Free Tier):**
```env
VITE_AI_PROVIDER=gemini
VITE_GEMINI_API_KEY=your_api_key_here
```

**For Bedrock (Production/AWS-Native):**
```env
VITE_AI_PROVIDER=bedrock
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Test

```bash
npm run test
npm run test:unit
npm run test:property
```

## AI Provider Comparison

### Google Gemini
- **Cost**: Free tier available (60 requests/minute)
- **Best for**: Development, testing, low-volume production
- **Pros**: No cost, easy setup, good performance
- **Cons**: External service, rate limits, less AWS integration

### AWS Bedrock (Claude 3.5 Sonnet)
- **Cost**: $3.00 per million input tokens, $15.00 per million output tokens
- **Best for**: Production, high-volume, AWS-native deployments
- **Pros**: AWS-native, better integration, higher limits
- **Cons**: Paid service, requires AWS credentials

## Deployment

### Deploy to Elastic Beanstalk

1. Initialize EB:
```bash
eb init -p node.js-18 productivity-copilot --region us-east-1
```

2. Create environment:
```bash
eb create productivity-copilot-prod --instance-type t3.micro --single
```

3. Set environment variables:
```bash
eb setenv VITE_AI_PROVIDER=gemini VITE_GEMINI_API_KEY=your_key
```

4. Deploy:
```bash
bash deployment/deploy.sh
```

### Rollback

```bash
bash deployment/rollback.sh
```

## Architecture

```
├── src/
│   ├── components/          # React components
│   ├── views/               # Page views (lazy loaded)
│   ├── hooks/               # Custom React hooks
│   ├── services/
│   │   ├── ai/              # AI provider abstraction
│   │   ├── cache/           # Multi-level caching
│   │   ├── logging/         # Structured logging
│   │   └── monitoring/      # Performance monitoring
│   └── utils/               # Utilities
├── server/                  # Express server
├── deployment/              # Deployment scripts
├── .ebextensions/           # Elastic Beanstalk config
└── .platform/               # Platform hooks
```

## Performance Budgets

- **LCP**: < 2.5s
- **FID**: < 100ms
- **CLS**: < 0.1
- **Bundle Size**: < 500KB (gzipped)
- **TTI**: < 3.5s

## Security

- Content Security Policy (CSP)
- Input sanitization
- Rate limiting
- HTTPS-only in production
- Secure headers (X-Frame-Options, X-XSS-Protection, etc.)

## Monitoring

- Web Vitals tracking (LCP, FID, CLS, TTFB, FCP)
- API response time tracking
- Error logging with stack traces
- CloudWatch Logs integration
- Usage metrics and cost tracking

## Cost Optimization

- Client-side caching (1-hour TTL)
- Request debouncing (500ms)
- Rate limiting (60 requests/minute)
- Bundle optimization (< 500KB)
- Single t3.micro instance
- CloudFront CDN for static assets

## Troubleshooting

### Health Check Failures

Check logs:
```bash
eb logs
```

Verify environment variables:
```bash
eb printenv
```

### API Errors

- **Authentication Error**: Check API key or AWS credentials
- **Rate Limit Error**: Wait and retry, or increase limits
- **Network Error**: Check internet connection and firewall
- **Timeout Error**: Check API service status

### Build Failures

Run validation:
```bash
bash scripts/validate-build.sh
```

Check bundle size:
```bash
npm run analyze-bundle
```

## License

Apache-2.0

## Support

For issues and questions, please open an issue on GitHub.
