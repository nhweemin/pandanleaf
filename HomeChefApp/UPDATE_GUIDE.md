# 📱 HomeChef App - Update Management Guide

## 🚀 How to Push Updates to Beta Testers

### ⚡ Quick Reference Commands

```bash
# Over-the-Air Update (JavaScript changes)
eas update --channel preview --message "Your update description"

# New Build (Native changes)  
eas build --profile preview --platform android

# Expo Go Testing (Immediate testing)
npx expo start --tunnel

# Check update status
eas update:list --channel preview

# View current build status
eas build:list --limit=5
```

---

## 🔄 Update Types Explained

### 📦 **Over-The-Air (OTA) Updates** ⭐ *Recommended for most changes*

**When to Use:**
- ✅ UI changes and bug fixes
- ✅ API endpoint updates
- ✅ New screens or navigation
- ✅ Business logic changes
- ✅ Text and styling updates

**How Testers Get It:**
1. Update publishes in ~30 seconds
2. Testers open the app
3. App automatically downloads update in background
4. User sees "Update available - Restart to apply"
5. App restarts with new version

**Example Commands:**
```bash
# Bug fix update
eas update --channel preview --message "Fixed login issue for chef accounts"

# Feature update
eas update --channel preview --message "Added search filters for cuisine types"

# UI improvement
eas update --channel preview --message "Updated product card design"
```

### 🔧 **New Build Updates**

**When to Use:**
- ✅ Added new npm packages
- ✅ Changed native permissions
- ✅ Updated Expo SDK version
- ✅ Modified app.json configuration
- ✅ Added native modules

**How Testers Get It:**
1. Build completes in 5-15 minutes
2. You share new download link
3. Testers download new APK
4. Install over existing app (data preserved)

**Example Commands:**
```bash
# After adding new package
npm install react-native-maps
eas build --profile preview --platform android

# After updating dependencies
npm update
eas build --profile preview --platform android
```

### 📲 **Expo Go Testing** ⚡ *Fastest for immediate testing*

**When to Use:**
- ✅ Immediate testing during development
- ✅ Quick feedback from developer friends
- ✅ No build time required (instant)
- ✅ Works on both iOS and Android
- ✅ Perfect for UI and logic testing

**How Testers Get It:**
1. Testers install "Expo Go" app from App Store/Play Store
2. You run development server with tunnel
3. Share QR code or link with testers
4. Testers scan QR code or open link in Expo Go
5. App loads instantly with live updates

**Example Workflow:**
```bash
# Start development server with tunnel (accessible from anywhere)
npx expo start --tunnel

# For local network only (faster, but requires same WiFi)
npx expo start --lan

# Clear cache if needed
npx expo start --clear
```

**Tester Instructions for Expo Go:**
1. **Download Expo Go**: Install from App Store (iOS) or Play Store (Android)
2. **Scan QR Code**: Use Expo Go's built-in scanner
3. **Or Open Link**: Share tunnel URL directly
4. **Instant Testing**: App loads immediately, updates live

**Limitations:**
- ⚠️ Some native features may not work
- ⚠️ Requires internet connection for tunnel
- ⚠️ Performance may be slower than native build
- ⚠️ Can't test app store submission flow

---

## 👥 Beta Tester Experience

### 🔄 **OTA Update Experience:**
```
📱 Tester opens HomeChef app
⬇️  "Checking for updates..." (background)
📥 "Update available! New features added."
🔄 "Restart to apply update" [Restart Now] [Later]
✅ App restarts with new version
```

### 📦 **New Build Experience:**
```
📧 Receives message: "New HomeChef build available!"
🔗 Clicks download link
📱 Downloads new APK file
⚙️  "Install over existing app?" [Install]
✅ App updates, opens with new version
```

### 📲 **Expo Go Experience:**
```
📧 Receives message: "Test latest HomeChef changes instantly!"
📱 Opens Expo Go app
📷 Scans QR code from your message
⚡ "Loading HomeChef..." (2-3 seconds)
✅ App opens with latest changes
🔄 Live updates as you make changes in real-time
```

---

## 📊 Update Management Workflow

### 🔄 **Daily Development Cycle:**

1. **Make Changes** → Edit code, fix bugs, add features
2. **Test Locally** → `npx expo start` to test changes
3. **Push OTA Update** → `eas update --channel preview --message "Description"`
4. **Notify Testers** → Send update message to beta group
5. **Collect Feedback** → Monitor for issues and suggestions

### ⚡ **Instant Testing Cycle (Expo Go):**

1. **Start Development Server** → `npx expo start --tunnel`
2. **Share QR Code** → Send to testers immediately
3. **Live Development** → Testers see changes in real-time
4. **Rapid Iteration** → Fix issues instantly
5. **Immediate Feedback** → Get feedback within minutes

### 📅 **Weekly Build Cycle:**

1. **Accumulate Changes** → Week's worth of improvements
2. **Add New Dependencies** → If needed
3. **Create New Build** → `eas build --profile preview --platform android`
4. **Distribute to Testers** → Share new download links
5. **Gather Comprehensive Feedback** → Full feature testing

---

## 🎯 Best Practices for Beta Updates

### ✅ **Do's:**
- **Use descriptive messages** in update commands
- **Test updates locally first** before pushing
- **Notify testers** when major updates are available
- **Use OTA updates** for quick fixes and improvements
- **Create new builds** when adding dependencies
- **Keep a changelog** of what changed in each update

### ❌ **Don'ts:**
- **Don't push untested updates** to beta channel
- **Don't use OTA** for native code changes
- **Don't spam testers** with too frequent updates
- **Don't forget to update version numbers** for major releases

---

## 📧 Tester Communication Templates

### 🔄 **OTA Update Notification:**
```
🚀 HomeChef Update Available!

What's New:
- Fixed cart calculation bug
- Improved chef search performance  
- Added cuisine filter to browse screen

How to Get It:
Open the HomeChef app - update will download automatically!

Please test and report any issues. Thanks! 🙏
```

### 📦 **New Build Notification:**
```
🆕 New HomeChef Build Available!

Version: 1.1.0
Major Changes:
- Added photo upload for chef profiles
- New payment integration
- Enhanced security features

Download Link: [EAS Build Link]

Installation:
1. Download APK from link above
2. Install over existing app
3. Your data will be preserved

Please test all major features and report feedback! 📱
```

### 📲 **Expo Go Testing Notification:**
```
⚡ Test HomeChef Instantly - No Download Required!

Latest Changes:
- Real-time cart updates
- Improved chef profile UI
- Enhanced search functionality

How to Test:
1. Install "Expo Go" app (if you haven't already)
   📱 iOS: App Store → Search "Expo Go"
   🤖 Android: Play Store → Search "Expo Go"

2. Scan this QR code with Expo Go:
   [QR CODE IMAGE HERE]

   Or open this link in Expo Go:
   exp://exp.host/@nhweemin/HomeChefApp?release-channel=default

3. App loads instantly - test away!

Benefits:
✅ Instant access (no build wait time)
✅ Live updates as I fix issues
✅ Works on both iOS and Android
✅ No storage space required

Test and let me know what you think! 🚀
```

---

## 🔍 Monitoring and Troubleshooting

### **Check Update Status:**
```bash
# View recent updates
eas update:list --channel preview --limit=10

# View specific update details
eas update:view [UPDATE_ID]

# Check build history
eas build:list --limit=10
```

### **Common Issues:**

**Update Not Appearing:**
- Check internet connection
- Force close and reopen app
- Verify update was pushed to correct channel

**Build Failed:**
- Check build logs in EAS dashboard
- Verify all dependencies are compatible
- Ensure code compiles locally first

**Tester Can't Install:**
- Verify APK downloaded completely
- Check Android "Unknown Sources" setting
- Try uninstalling and fresh install

**Expo Go Issues:**
- Verify Expo Go app is latest version
- Check internet connection (tunnel requires internet)
- Try clearing Expo Go cache
- Restart development server with --clear flag
- Ensure QR code/link is current and not expired

---

## 🎉 Update Success Metrics

### **Track These KPIs:**
- ✅ **Update Adoption Rate** - % of testers who got the update
- ✅ **Bug Reports** - Issues found after update
- ✅ **Performance** - App speed and stability
- ✅ **Feature Usage** - New features being tested
- ✅ **Feedback Quality** - Detailed vs basic reports

### **Success Indicators:**
- 📈 Smooth update delivery (no crashes)
- 📱 High tester engagement with new features  
- 🐛 Quick bug identification and fixes
- 💬 Positive feedback on improvements
- 🔄 Seamless user experience during updates

---

*Last Updated: December 2024*  
*Channel: preview*  
*Platform: Android* 