# HomeChef Backend Deployment Guide

## 🚀 Deploy to Railway (Primary)

### Step 1: Create MongoDB Database

You already have a Railway MongoDB database configured:
```
mongodb://mongo:fqbUIzQheZPoFYSTnmMPjWbgKAIHfhDB@mongodb.railway.internal:27017
```

### Step 2: Link to Railway Project

```bash
npx @railway/cli login
npx @railway/cli link
```

### Step 3: Configure Environment Variables

```bash
npx @railway/cli variables set MONGODB_URI="mongodb://mongo:fqbUIzQheZPoFYSTnmMPjWbgKAIHfhDB@mongodb.railway.internal:27017"
npx @railway/cli variables set JWT_SECRET="your-super-secret-jwt-key-here-min-32-chars"
npx @railway/cli variables set NODE_ENV="production"
npx @railway/cli variables set PORT="3001"
npx @railway/cli variables set CORS_ORIGIN="https://expo.dev"
```

### Step 4: Deploy

```bash
npx @railway/cli up
```

Your API will be available at: `https://homechef-backend.railway.app`

### Step 5: Test the API

Test these endpoints:
- `GET https://homechef-backend.railway.app/health`
- `POST https://homechef-backend.railway.app/api/auth/login`

## 📱 Update Mobile App

The mobile app is already configured to use Railway in production.

## ⚠️ Important Notes

- **Railway MongoDB**: Internal database already configured
- **Environment Variables**: Set via Railway CLI
- **Free Tier**: Railway provides good free tier limits

## 🎯 Production Checklist

- [x] Railway MongoDB database configured
- [ ] Environment variables set
- [ ] Backend deployed successfully
- [ ] API endpoints tested
- [ ] Mobile app using correct API URL

Your backend will be live and ready for testing! 🎉 