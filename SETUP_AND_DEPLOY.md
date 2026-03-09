# Complete Setup and Deployment Guide

## Step 1: Install Git (if not already installed)

Download and install Git from: https://git-scm.com/download/win

After installation, restart your terminal/PowerShell.

## Step 2: Create GitHub Account

If you don't have one, sign up at: https://github.com/signup

## Step 3: Initialize Git and Push to GitHub

Open PowerShell in your project folder and run:

```powershell
# Initialize git repository
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit - Productivity Copilot with Groq AI"
```

Now create a new repository on GitHub:
1. Go to https://github.com/new
2. Repository name: `productivity-copilot` (or your choice)
3. Keep it Public or Private (your choice)
4. **DO NOT** check "Initialize with README"
5. Click "Create repository"

Then push your code:

```powershell
# Replace YOUR_USERNAME with your GitHub username
# Replace YOUR_REPO with your repository name
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

## Step 4: Sign Up for Render.com

1. Go to https://render.com
2. Click "Get Started for Free"
3. Sign up with your GitHub account (easiest option)

## Step 5: Deploy to Render

1. In Render dashboard, click "New +" button (top right)
2. Select "Web Service"
3. Click "Connect" next to your GitHub repository
4. Render will show your repository - click "Connect"

### Configuration (should auto-fill from render.yaml):
- **Name**: productivity-copilot (or customize)
- **Region**: Oregon (or closest to you)
- **Branch**: main
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Plan**: Free

### Add Environment Variable:
Scroll down to "Environment Variables" section:
- Click "Add Environment Variable"
- **Key**: `GROQ_API_KEY`
- **Value**: `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`

6. Click "Create Web Service"

## Step 6: Wait for Deployment

- First deployment takes 5-10 minutes
- Watch the logs in real-time
- When you see "Your service is live 🎉", it's ready!

## Step 7: Access Your Live App

Your app will be at: `https://YOUR-APP-NAME.onrender.com`

Example: `https://productivity-copilot-abc123.onrender.com`

## Testing Your Deployed App

1. Visit your Render URL
2. Click "Optimizer" in the navigation
3. Enter a prompt like: "How can I be more productive?"
4. Click "Generate Optimization"
5. You should see AI-generated suggestions!

## Important Notes

### Free Tier Behavior
- App sleeps after 15 minutes of no activity
- First request after sleep takes 30-60 seconds to wake up
- This is normal for free tier!

### Updating Your App
Whenever you make changes:

```powershell
git add .
git commit -m "Description of your changes"
git push
```

Render automatically detects the push and redeploys!

## Troubleshooting

### "Git not found"
- Install Git from https://git-scm.com/download/win
- Restart PowerShell after installation

### "Permission denied" when pushing to GitHub
- You may need to set up SSH keys or use GitHub Desktop
- Alternative: Use GitHub Desktop app (easier for beginners)

### Build fails on Render
- Check the build logs in Render dashboard
- Common issue: Missing dependencies (should be auto-fixed)

### App shows error after deployment
- Check the logs in Render dashboard
- Verify GROQ_API_KEY is set correctly
- Try the /health endpoint first: `https://your-app.onrender.com/health`

## Alternative: Use GitHub Desktop (Easier!)

If command line is confusing:

1. Download GitHub Desktop: https://desktop.github.com
2. Install and sign in with your GitHub account
3. Click "Add" → "Create New Repository"
4. Choose your project folder
5. Click "Publish repository" button
6. Then follow Step 5 above to deploy on Render

## Need Help?

- Render Documentation: https://render.com/docs
- Render Community: https://community.render.com
- GitHub Guides: https://guides.github.com
