# Troubleshooting Guide

Common issues and solutions for the Productivity Copilot application.

## Deployment Issues

### Issue: Health Check Failures

**Symptoms:**
- Deployment fails with "Health check failed"
- Environment shows "Degraded" status

**Solutions:**

1. Check application logs:
   ```bash
   eb logs
   ```

2. Verify health endpoint locally:
   ```bash
   npm run server
   curl http://localhost:8080/health
   ```

3. Check environment variables:
   ```bash
   eb printenv
   ```

4. Verify Node.js version:
   ```bash
   eb ssh
   node --version  # Should be 18.x
   ```

5. Check memory usage:
   - Health check fails if memory > 400MB
   - Consider upgrading to t3.small

### Issue: Build Failures

**Symptoms:**
- Deployment fails during build phase
- "npm run build" errors

**Solutions:**

1. Run build validation locally:
   ```bash
   bash scripts/validate-build.sh
   ```

2. Check for TypeScript errors:
   ```bash
   npm run type-check
   ```

3. Check for linting errors:
   ```bash
   npm run lint
   ```

4. Verify bundle size:
   ```bash
   npm run build
   npm run analyze-bundle
   ```

### Issue: Environment Variables Not Set

**Symptoms:**
- "API key is required" errors
- "AWS region is required" errors

**Solutions:**

1. List current environment variables:
   ```bash
   eb printenv
   ```

2. Set missing variables:
   ```bash
   eb setenv VITE_AI_PROVIDER=gemini VITE_GEMINI_API_KEY=your_key
   ```

3. Verify in application logs:
   ```bash
   eb logs | grep "AI provider selected"
   ```

## API Issues

### Issue: Gemini Authentication Errors

**Symptoms:**
- "Authentication failed" errors
- "Invalid API key" messages

**Solutions:**

1. Verify API key is correct:
   - Go to https://makersuite.google.com/app/apikey
   - Generate new key if needed

2. Check environment variable:
   ```bash
   eb printenv | grep GEMINI
   ```

3. Test API key locally:
   ```bash
   curl -H "Content-Type: application/json" \
     -d '{"contents":[{"parts":[{"text":"Hello"}]}]}' \
     "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=YOUR_KEY"
   ```

### Issue: Bedrock Authentication Errors

**Symptoms:**
- "UnrecognizedClientException" errors
- "InvalidSignatureException" errors

**Solutions:**

1. Verify AWS credentials:
   ```bash
   aws sts get-caller-identity
   ```

2. Check IAM permissions:
   - Ensure role has `bedrock:InvokeModel` permission
   - Check model access in Bedrock console

3. Verify region:
   - Bedrock is not available in all regions
   - Use us-east-1 or us-west-2

4. Test Bedrock access:
   ```bash
   aws bedrock-runtime invoke-model \
     --model-id anthropic.claude-3-5-sonnet-20241022-v2:0 \
     --body '{"anthropic_version":"bedrock-2023-05-31","max_tokens":10,"messages":[{"role":"user","content":"Hi"}]}' \
     --region us-east-1 \
     output.json
   ```

### Issue: Rate Limit Errors

**Symptoms:**
- "Rate limit exceeded" messages
- 429 HTTP status codes

**Solutions:**

1. Check rate limit configuration:
   ```bash
   eb printenv | grep RATE
   ```

2. Increase limits (if needed):
   ```bash
   eb setenv VITE_MAX_REQUESTS_PER_MINUTE=120
   ```

3. Implement request queuing in application

4. For Gemini: Wait for rate limit reset (1 minute)

5. For Bedrock: Request quota increase in AWS Console

### Issue: Timeout Errors

**Symptoms:**
- "Request timed out" messages
- Requests taking > 5 seconds

**Solutions:**

1. Check API service status:
   - Gemini: https://status.cloud.google.com/
   - AWS: https://status.aws.amazon.com/

2. Verify network connectivity:
   ```bash
   eb ssh
   curl -I https://generativelanguage.googleapis.com
   ```

3. Check CloudWatch metrics for latency

4. Consider increasing timeout in code

## Performance Issues

### Issue: Slow Page Load

**Symptoms:**
- LCP > 2.5s
- TTI > 3.5s

**Solutions:**

1. Check bundle size:
   ```bash
   npm run analyze-bundle
   ```

2. Verify compression is enabled:
   ```bash
   curl -H "Accept-Encoding: gzip" -I https://your-app-url/
   ```

3. Check CloudFront configuration (if using)

4. Verify lazy loading is working:
   - Open DevTools → Network
   - Navigate between pages
   - Check that chunks load on demand

### Issue: High Memory Usage

**Symptoms:**
- Health check fails with memory error
- Application crashes

**Solutions:**

1. Check memory usage:
   ```bash
   eb ssh
   free -m
   node -e "console.log(process.memoryUsage())"
   ```

2. Upgrade instance type:
   ```bash
   eb scale 1 --instance-type t3.small
   ```

3. Check for memory leaks:
   - Review cache size limits
   - Check for unclosed connections

### Issue: Cache Not Working

**Symptoms:**
- Every request hits API
- High API costs
- Slow response times

**Solutions:**

1. Check localStorage:
   - Open DevTools → Application → Local Storage
   - Verify cache entries exist

2. Check cache configuration:
   ```javascript
   // In browser console
   localStorage.getItem('cache_opt_xxxxx')
   ```

3. Verify cache TTL:
   - Default is 1 hour
   - Check if entries are expiring too quickly

4. Clear cache and test:
   ```javascript
   localStorage.clear()
   ```

## Cost Issues

### Issue: Unexpected AWS Charges

**Symptoms:**
- Higher than expected AWS bill
- Bedrock costs increasing

**Solutions:**

1. Check CloudWatch metrics:
   - Go to CloudWatch → Metrics
   - Check request count and data transfer

2. Review Bedrock usage:
   ```bash
   aws ce get-cost-and-usage \
     --time-period Start=2024-01-01,End=2024-01-31 \
     --granularity MONTHLY \
     --metrics BlendedCost \
     --filter file://filter.json
   ```

3. Enable cost alerts:
   - Go to AWS Billing → Budgets
   - Create budget with alerts

4. Optimize caching:
   - Increase cache TTL
   - Implement request deduplication

5. Consider switching to Gemini for development

### Issue: Exceeding Free Tier

**Symptoms:**
- Charges for EC2, data transfer, or API calls

**Solutions:**

1. Monitor Free Tier usage:
   - Go to AWS Billing Dashboard
   - Check Free Tier usage

2. Reduce instance hours:
   - Stop environment when not in use:
     ```bash
     eb terminate productivity-copilot-prod
     ```

3. Optimize data transfer:
   - Enable CloudFront
   - Compress responses
   - Reduce bundle size

## Security Issues

### Issue: CSP Violations

**Symptoms:**
- Console errors about blocked resources
- Features not working

**Solutions:**

1. Check CSP headers:
   ```bash
   curl -I https://your-app-url/
   ```

2. Update CSP policy in `server/middleware.ts`

3. Test locally:
   ```bash
   npm run server
   ```

### Issue: CORS Errors

**Symptoms:**
- API calls blocked by CORS
- "Access-Control-Allow-Origin" errors

**Solutions:**

1. Verify API endpoints:
   - Gemini: https://generativelanguage.googleapis.com
   - Bedrock: https://bedrock-runtime.*.amazonaws.com

2. Check CSP connect-src directive

3. Test API call directly:
   ```bash
   curl -X POST https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=YOUR_KEY
   ```

## Getting Help

If you're still experiencing issues:

1. **Check logs**:
   ```bash
   eb logs --stream
   ```

2. **Enable debug logging**:
   ```bash
   eb setenv LOG_LEVEL=debug
   ```

3. **Review CloudWatch Logs**:
   - Go to CloudWatch → Log Groups
   - Check `/aws/elasticbeanstalk/productivity-copilot/nodejs`

4. **Test locally**:
   - Reproduce issue in development
   - Check browser console for errors

5. **Open an issue**:
   - Include error messages
   - Include relevant logs
   - Describe steps to reproduce

## Common Error Messages

### "Bundle size exceeds limit"

**Solution**: Reduce bundle size by:
- Removing unused dependencies
- Optimizing images
- Splitting code further

### "Health check response time exceeded 100ms"

**Solution**: Optimize health check:
- Remove expensive checks
- Cache health check results
- Upgrade instance type

### "Failed to flush logs to CloudWatch"

**Solution**: Check IAM permissions:
- Ensure role has `logs:PutLogEvents` permission
- Verify log group exists

### "Service worker registration failed"

**Solution**: Check HTTPS:
- Service workers require HTTPS
- Test on localhost or HTTPS domain

### "Cannot read property of undefined"

**Solution**: Check initialization:
- Verify environment variables are set
- Check provider initialization
- Review error stack trace
