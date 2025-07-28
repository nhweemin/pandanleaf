# 🚀 Quick Backend Deployment Guide

## Option 1: Deploy to Render (Recommended - Easiest)

### 1. Create GitHub Repository
```bash
cd homechef-backend
git init
git add .
git commit -m "Initial commit"
# Create a new repository on GitHub named "homechef-backend"
git remote add origin https://github.com/YOUR_USERNAME/homechef-backend.git
git push -u origin main
```

### 2. Deploy to Render
1. Go to [render.com](https://render.com) and sign up
2. Click "New" → "Web Service"
3. Connect your GitHub account and select your `homechef-backend` repository
4. Use these settings:
   - **Name**: `homechef-api`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`

### 3. Add Environment Variables in Render
```
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/homechef
JWT_SECRET=your-super-secret-jwt-key-here-minimum-32-characters
CORS_ORIGIN=https://expo.dev
```

### 4. Create MongoDB Database
1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create free account → Create cluster (free tier)
3. Create database user and get connection string
4. Add connection string to Render environment variables

## Option 2: Use Railway (Alternative)

### 1. Deploy to Railway
```bash
cd homechef-backend
npx @railway/cli login
npx @railway/cli init
npx @railway/cli add -d mongodb
npx @railway/cli up
```

### 2. Add Environment Variables
```bash
npx @railway/cli variables set NODE_ENV=production
npx @railway/cli variables set JWT_SECRET=your-super-secret-jwt-key
npx @railway/cli variables set CORS_ORIGIN=https://expo.dev
```

## 📱 Update Mobile App

After deployment, update your mobile app:

1. Get your deployed API URL (e.g., `https://homechef-api.onrender.com`)
2. Update `HomeChefApp/config/api.ts` if needed
3. Publish update:
```bash
cd ../HomeChefApp
npx eas update --auto
```

## ✅ Test Your API

Test these endpoints with your deployed URL:
- `GET https://your-api-url.onrender.com/health`
- `POST https://your-api-url.onrender.com/api/auth/login`

## 🎯 Your backend will be live at:
- **Render**: `https://homechef-api.onrender.com`
- **Railway**: `https://your-app.railway.app`

**Total time: ~10 minutes** ⏱️

Both the mobile app and backend will then be fully deployed and testable without any local servers! 🎉 