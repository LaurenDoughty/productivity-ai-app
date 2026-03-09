# Render.com Deployment Guide

This guide will help you deploy your Productivity Copilot app to Render.com for free.

## Prerequisites

1. A GitHub account
2. A Render.com account (sign up at https://render.com - free)
3. Your Groq API key: `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`

## Step 1: Push Your Code to GitHub

If you haven't already, create a GitHub repository and push your code:

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Productivity Copilot"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

## Step 2: Connect to Render

1. Go to https://render.com and sign up/login
2. Click "New +" button in the top right
3. Select "Web Service"
4. Connect your GitHub account if you haven't already
5. Select your repository from the list

## Step 3: Configure Your Service

Render will auto-detect your `render.yaml` file. Verify these settings:

- **Name**: productivity-copilot (or choose your own)
- **Region**: Oregon (or closest to you)
- **Branch**: main
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Plan**: Free

## Step 4: Add Environment Variables

In the Render dashboard, add this environment variable:

- **Key**: `GROQ_API_KEY`
- **Value**: `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`

## Step 5: Deploy

1. Click "Create Web Service"
2. Render will automatically build and deploy your app
3. Wait 5-10 minutes for the first deployment
4. You'll get a URL like: `https://productivity-copilot.onrender.com`

## Step 6: Test Your Deployment

Once deployed, visit your URL and test the AI Optimizer feature!

## Important Notes

### Free Tier Limitations
- Your app will spin down after 15 minutes of inactivity
- First request after spin-down takes 30-60 seconds to wake up
- 750 hours/month of runtime (plenty for personal use)

### Keeping Your API Key Secure
- Never commit `.env.production` to GitHub
- Always use Render's environment variables for secrets
- The API key is only stored in Render's secure environment

### Updating Your App

To deploy updates:
```bash
git add .
git commit -m "Your update message"
git push
```

Render will automatically rebuild and redeploy!

## Troubleshooting

### Build Fails
- Check the build logs in Render dashboard
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility

### App Won't Start
- Check the logs in Render dashboard
- Verify `GROQ_API_KEY` is set correctly
- Ensure port is set to 10000 (Render's default)

### API Errors
- Verify your Groq API key is valid
- Check server logs for detailed error messages
- Test the `/health` endpoint first

## Support

- Render Docs: https://render.com/docs
- Render Community: https://community.render.com
