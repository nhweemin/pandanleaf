# 📱 HomeChef - Expo Go Testing Instructions

## ⚡ Test HomeChef Instantly - No Download Required!

Welcome to instant testing! You can test the latest HomeChef features in real-time using the Expo Go app.

---

## 📲 Step 1: Install Expo Go

### 📱 **iOS Users:**
1. Open **App Store**
2. Search for **"Expo Go"**
3. Install the free app by **Expo**

### 🤖 **Android Users:**
1. Open **Google Play Store**
2. Search for **"Expo Go"**
3. Install the free app by **Expo**

---

## 🎯 Step 2: Access HomeChef

### **Method A: Scan QR Code** (Recommended)
1. Open **Expo Go** app
2. Tap **"Scan QR Code"**
3. **Scan the QR code** sent to you
4. App loads in 2-3 seconds! ⚡

### **Method B: Open Link**
1. **Click the tunnel URL** sent to you (starts with `exp://`)
2. Choose **"Open in Expo Go"**
3. App loads automatically! 🚀

---

## 🔑 Test Account Credentials

Use these accounts to test different user experiences:

### 👑 **Admin Account**
- **Email**: `admin@homechef.com`
- **Password**: `password123`
- **Features**: Manage chefs, view analytics, approve applications

### 👩‍🍳 **Chef Accounts**
- **Indah Sari** (Indonesian): `indah@homechef.com` / `password123`
- **Elisa Chan** (Hong Kong): `elisa@homechef.com` / `password123`  
- **Yar Ping** (Health Food): `yarping@ypnutrition.sg` / `test123`

### 👤 **Customer Accounts**
- **John Customer**: `john@customer.com` / `password123`
- **Sarah Wilson**: `sarah@customer.com` / `password123`

---

## 🧪 What to Test

### 🛍️ **Customer Experience** (Use customer accounts)
- [ ] **Browse products** by category and chef
- [ ] **Search** for specific dishes
- [ ] **Add items to cart** and modify quantities
- [ ] **Place orders** and view order history
- [ ] **Rate and review** completed orders

### 👩‍🍳 **Chef Experience** (Use chef accounts)
- [ ] **View chef dashboard** and statistics
- [ ] **Manage products** (add/edit dishes)
- [ ] **Process orders** and update status
- [ ] **Update profile** and business information

### 👑 **Admin Experience** (Use admin account)
- [ ] **View platform analytics** and user stats
- [ ] **Manage chef applications** (approve/reject)
- [ ] **Create and delete** chef accounts
- [ ] **Monitor orders** and user activity

---

## ⚡ Live Testing Benefits

### 🔄 **Real-Time Updates**
- Changes appear **instantly** on your device
- No need to refresh or reload
- Live development in action!

### 🌐 **Cross-Platform**
- Works on **both iOS and Android**
- Same experience across devices
- Test on your preferred platform

### 💾 **No Storage Required**
- Doesn't take up device space
- No permanent installation
- Clean testing environment

---

## 🐛 How to Report Issues

When you find bugs or have feedback:

### **Quick Bug Report:**
1. **Take a screenshot** of the issue
2. **Note which account** you were using
3. **Describe what you were doing** when it happened
4. **Send to the development team** with device info

### **Bug Report Template:**
```
Device: [iPhone 14 / Samsung Galaxy S21 / etc.]
Account: [admin@homechef.com / etc.]
Issue: [Brief description]

Steps:
1. Logged in as customer
2. Added item to cart
3. Error occurred when...

Expected: [What should happen]
Actual: [What actually happened]

Screenshot: [Attach image]
```

---

## 💡 Pro Testing Tips

### ✅ **Do:**
- Test different user flows (browse → cart → order)
- Try edge cases (empty cart, long text, etc.)
- Switch between different accounts
- Test on slow internet connection
- Explore all tabs and features

### ❌ **Don't:**
- Don't worry about app crashes (expected in testing)
- Don't test payment (using sandbox mode)
- Don't create real orders with personal info
- Don't share test credentials publicly

---

## 🔧 Troubleshooting

### **App Won't Load:**
- Check your internet connection
- Try closing and reopening Expo Go
- Ask for a fresh QR code/link

### **Features Not Working:**
- Some advanced features may be limited in Expo Go
- Report any major issues to development team
- Try the native build for full experience

### **Slow Performance:**
- Normal for development builds
- Production app will be much faster
- Focus on functionality testing

---

## 🎉 Thank You for Testing!

Your feedback helps make HomeChef the best home cooking marketplace. Every bug you find and suggestion you make improves the experience for food lovers everywhere.

### **Key Testing Areas:**
- 🛍️ **Shopping flow** - Browse, search, add to cart, checkout
- 👩‍🍳 **Chef management** - Profile, products, orders
- 👑 **Admin functions** - User management, analytics
- 📱 **Mobile experience** - Navigation, responsiveness, usability

**Happy Testing!** 🍳✨

---

### **Quick Access Links**
- 📱 **iOS Expo Go**: [App Store Link](https://apps.apple.com/app/expo-go/id982107779)
- 🤖 **Android Expo Go**: [Play Store Link](https://play.google.com/store/apps/details?id=host.exp.exponent)
- 🌐 **Expo Go Website**: [expo.dev/client](https://expo.dev/client)

*Last Updated: December 2024*  
*Testing Method: Expo Go Live Development*  
*Backend: https://homechef-production.up.railway.app* 