# Render Deployment Checklist

Follow these steps to deploy your app to Render.com:

## ✅ Pre-Deployment Checklist

- [x] `render.yaml` configuration file created
- [x] `.gitignore` properly configured
- [x] Build scripts working locally
- [x] Groq API key ready
- [ ] GitHub repository created
- [ ] Code pushed to GitHub
- [ ] Render.com account created

## 🚀 Quick Start Commands

### 1. Initialize Git Repository
```powershell
git init
git add .
git commit -m "Initial commit - Productivity Copilot with Groq AI"
```

### 2. Create GitHub Repository
1. Go to https://github.com/new
2. Name it: `productivity-copilot` (or your choice)
3. Don't initialize with README (we already have files)
4. Click "Create repository"

### 3. Push to GitHub
```powershell
# Replace YOUR_USERNAME and YOUR_REPO with your actual values
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

### 4. Deploy on Render
1. Go to https://dashboard.render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Render will auto-detect `render.yaml`
5. Add environment variable:
   - Key: `GROQ_API_KEY`
   - Value: `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`
6. Click "Create Web Service"
7. Wait 5-10 minutes for deployment

### 5. Test Your Live Site
Your app will be available at: `https://YOUR-APP-NAME.onrender.com`

## 📝 What Gets Deployed

- ✅ Frontend (React app)
- ✅ Backend (Express server with AI proxy)
- ✅ All dependencies
- ✅ Production build optimizations

## 🔒 Security Notes

- API key is stored securely in Render's environment variables
- Never commit `.env.production` to GitHub
- The `.gitignore` file prevents sensitive files from being committed

## 🆓 Free Tier Details

- **Cost**: $0/month
- **Limitations**: 
  - App sleeps after 15 min of inactivity
  - 30-60 sec wake-up time on first request
  - 750 hours/month runtime
- **Perfect for**: Personal projects, demos, portfolios

## 🔄 Future Updates

To deploy updates:
```powershell
git add .
git commit -m "Description of changes"
git push
```

Render automatically rebuilds and redeploys!

## ❓ Need Help?

See `RENDER_DEPLOYMENT.md` for detailed instructions and troubleshooting.
