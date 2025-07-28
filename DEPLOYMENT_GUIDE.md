# 🚀 AsianChef Deployment Guide for Beta Testing

This guide will help you deploy both the backend API and mobile app for beta testers.

## 📋 Prerequisites

- [ ] GitHub account
- [ ] Railway account (free tier available)
- [ ] Expo account
- [ ] iOS Developer Account (for iOS testing)
- [ ] Google Play Console account (for Android testing)

---

## 🌐 Part 1: Deploy Backend API

### Option A: Railway Deployment (Recommended)

1. **Create Railway Account**
   ```bash
   # Visit https://railway.app and sign up with GitHub
   ```

2. **Prepare Backend for Deployment**
   ```bash
   cd homechef-backend
   npm run build  # Ensure it builds successfully
   ```

3. **Deploy to Railway**
   - Go to [Railway.app](https://railway.app)
   - Click "Start a New Project"
   - Select "Deploy from GitHub repo"
   - Choose your `homechef` repository
   - Select the `homechef-backend` folder as root

4. **Set Environment Variables in Railway**
   ```
   NODE_ENV=production
   PORT=3001
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRE=30d
   FRONTEND_URL=*
   ```

5. **Your API will be available at:**
   ```
   https://your-app-name.railway.app
   ```

### Option B: Render Deployment (Alternative)

1. Go to [Render.com](https://render.com)
2. Connect GitHub repository
3. Create "Web Service"
4. Set build command: `npm install && npm run build`
5. Set start command: `npm start`
6. Add environment variables (same as above)

---

## 📱 Part 2: Deploy Mobile App for Beta Testing

### Update Backend URL in App

First, update your app to use the deployed backend:

```bash
cd HomeChefApp
```

Create `config/api.ts`:
```typescript
const API_BASE_URL = __DEV__ 
  ? 'http://localhost:3001' 
  : 'https://your-railway-app.railway.app';

export { API_BASE_URL };
```

### iOS Beta Testing (TestFlight)

1. **Install Expo CLI**
   ```bash
   npm install -g @expo/cli
   npm install -g eas-cli
   ```

2. **Configure EAS Build**
   ```bash
   cd HomeChefApp
   eas build:configure
   ```

3. **Build for iOS**
   ```bash
   eas build --platform ios --profile preview
   ```

4. **Submit to TestFlight**
   ```bash
   eas submit --platform ios
   ```

5. **Invite Beta Testers**
   - Go to App Store Connect
   - Select your app → TestFlight
   - Add external testers with email addresses

### Android Beta Testing (Google Play Console)

1. **Build for Android**
   ```bash
   eas build --platform android --profile preview
   ```

2. **Submit to Google Play Console**
   ```bash
   eas submit --platform android
   ```

3. **Set up Internal Testing Track**
   - Go to Google Play Console
   - Select your app → Testing → Internal testing
   - Create new release and upload APK
   - Add tester email addresses

### Quick Testing Option (Expo Go)

**For immediate testing (limited functionality):**

1. **Publish to Expo**
   ```bash
   cd HomeChefApp
   expo publish
   ```

2. **Share with Testers**
   - Send them the Expo Go app link
   - Share your project URL: `exp://exp.host/@yourusername/asianchef`

---

## 🔧 Part 3: Testing Configuration

### Backend Health Check

Test your deployed API:
```bash
curl https://your-railway-app.railway.app/health

# Expected response:
# {"status":"success","message":"HomeChef API is running!","timestamp":"...","environment":"production"}
```

### Test API Endpoints

```bash
# Test registration
curl -X POST https://your-railway-app.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password","role":"customer"}'

# Test login
curl -X POST https://your-railway-app.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

### Update Mobile App Configuration

Update your app's API configuration:

```typescript
// HomeChefApp/config/api.ts
export const API_CONFIG = {
  BASE_URL: 'https://your-railway-app.railway.app',
  ENDPOINTS: {
    AUTH: '/api/auth',
    PRODUCTS: '/api/products',
    ORDERS: '/api/orders',
    CHEFS: '/api/chefs'
  }
};
```

---

## 👥 Part 4: Beta Tester Instructions

### For TestFlight (iOS) Testers

Send this to your iOS beta testers:

```
📱 AsianChef Beta Testing - iOS

1. Download TestFlight from the App Store
2. Click this invitation link: [TestFlight Link]
3. Install AsianChef Beta
4. Test the app and provide feedback

App Features to Test:
✅ Browse Asian dishes
✅ User registration/login
✅ Add items to cart
✅ Chef dashboard
✅ Order management
```

### For Google Play Console (Android) Testers

Send this to your Android beta testers:

```
📱 AsianChef Beta Testing - Android

1. Click this opt-in link: [Play Console Internal Testing Link]
2. Download and install the app
3. Test the app and provide feedback

App Features to Test:
✅ Browse Asian dishes
✅ User registration/login
✅ Add items to cart
✅ Chef dashboard
✅ Order management
```

### For Expo Go Testing

```
📱 AsianChef Beta Testing - Expo Go

1. Download Expo Go from App Store/Play Store
2. Scan this QR code or open: exp://exp.host/@yourusername/asianchef
3. Test the app and provide feedback

Note: Some features may be limited in Expo Go
```

---

## 📊 Part 5: Monitoring & Analytics

### Backend Monitoring

- **Railway Dashboard**: Monitor deployment logs and metrics
- **Health Check**: Set up uptime monitoring with Uptime Robot
- **Logs**: Check Railway logs for API usage and errors

### Mobile App Analytics

- **Expo Analytics**: Built-in analytics in Expo dashboard
- **Crashlytics**: Add Firebase Crashlytics for crash reporting
- **User Feedback**: Implement in-app feedback mechanism

---

## 🐛 Troubleshooting

### Common Backend Issues

1. **Build Fails**
   ```bash
   cd homechef-backend
   npm install
   npm run build
   # Fix TypeScript errors if any
   ```

2. **API Not Responding**
   - Check Railway logs
   - Verify environment variables
   - Test health endpoint

3. **CORS Issues**
   - Update FRONTEND_URL environment variable
   - Check CORS configuration in server.ts

### Common Mobile App Issues

1. **Build Fails**
   ```bash
   cd HomeChefApp
   npm install
   expo doctor  # Check for issues
   ```

2. **API Connection Issues**
   - Verify backend URL in app configuration
   - Check network permissions
   - Test API endpoints manually

---

## 🎯 Beta Testing Checklist

### Before Launching Beta

- [ ] Backend deployed and health check passes
- [ ] All API endpoints tested
- [ ] Mobile app builds successfully
- [ ] Test user flows work end-to-end
- [ ] Crash reporting configured
- [ ] Feedback mechanism in place

### Beta Testing Goals

- [ ] User registration/authentication
- [ ] Browse and search functionality  
- [ ] Cart and ordering process
- [ ] Chef dashboard features
- [ ] Performance on different devices
- [ ] UI/UX feedback
- [ ] Bug identification

### Post-Beta Actions

- [ ] Collect and analyze feedback
- [ ] Fix critical bugs
- [ ] Implement feature improvements
- [ ] Prepare for production release

---

## 🚀 Quick Start Commands

```bash
# Deploy Backend
cd homechef-backend
npm run build
# Deploy to Railway via dashboard

# Build Mobile App
cd HomeChefApp
expo install
eas build --platform all --profile preview

# Test Everything
curl https://your-railway-app.railway.app/health
```

**Your AsianChef app is now ready for beta testing! 🎉**

For support, check the Railway and Expo documentation or reach out to the development team. 