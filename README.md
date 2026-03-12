# Productivity Copilot

AI-powered productivity optimization tool optimized for AWS Elastic Beanstalk deployment within Free Tier constraints.

## Features

 - Groq LLM Integration (Working): AI-powered workflow optimization using Groq (API-key based)
 - Pluggable AI Provider Architecture: Provider abstraction designed to support additional providers (e.g., AWS Bedrock) as a future enhancement
 - Multi-Level Caching: Memory, localStorage, and service worker caching to minimize API costs and improve responsiveness
 - Production Ready: Health checks, monitoring/logging, and robust error handling
 - AWS Free Tier Optimized: Designed to run on Elastic Beanstalk single-instance environments (t3.micro) with minimal cost

## Relevance (Higher-Ed / Institutional Use)

- Designed for low-cost hosting and operational visibility (CloudWatch logs/health)
- No server-side storage of user data (privacy-friendly)
- Guardrails: rate limiting, input sanitization, CSP, secure headers
- Clear deployment/runbook steps

## Deployment Model
This application is deployed as a single Elastic Beanstalk environment. The Node/Express server hosts the API and serves the compiled React frontend from the same deployment artifact. Secrets (e.g., GROQ_API_KEY) are provided via Elastic Beanstalk environment variables and are not exposed to the client. Groq calls are made server-side via Express.

## AI Safety, Data Handling & Guardrails
- Data storage (client-side only)
- Secrets management (server env vars)
- Rate limiting / sanitization
- Logging policy (don’t log prompts)
- server processes requests in-memory and does not write prompts or results to a database or server-side file storage

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- AWS account (for deployment)
- EB CLI (for deployment)
- AWS CLI (often needed for EB CLI auth)
- Node version manager optional

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

**Groq: Current/Working**
```VITE_AI_PROVIDER=groq
VITE_GROQ_API_KEY=your_api_key_here
```

#### AWS Bedrock (Planned / Partial)
Bedrock support is under development. For AWS deployments, prefer IAM role-based access (instance profile). Do not store long-lived AWS credentials in `.env`.


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

### AI Provider Status
| Provider | Status | Notes |
|---|---:|---|
| Groq | ✅ Working | Current default provider; API key provided via server environment variable |
| AWS Bedrock (Claude 3.5 Sonnet) | 🟡 Partial | Under development; finalize IAM role-based auth + permissions |

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
- Secure headers (e.g., X-Frame-Options, Referrer-Policy, Permissions-Policy, X-Content-Type-Options)

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

## CI/CD
- GitHub Actions CI runs lint, tests, and build on pull requests and merges. (Planned / In progress)

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
Portions of this documentation were drafted with AI assistance and reviewed/edited for technical accuracy.
For issues and questions, please open an issue on GitHub.
