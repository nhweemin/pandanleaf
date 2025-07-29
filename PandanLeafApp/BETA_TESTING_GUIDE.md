# 📱 HomeChef App - Beta Testing Guide

Welcome to the HomeChef beta testing program! Thank you for helping us improve our home cooking marketplace.

## 🎯 What is HomeChef?
HomeChef connects food lovers with talented home chefs in their area. Browse authentic homemade dishes, place orders, and discover culinary talents in your neighborhood.

## 📲 How to Install the App

### Android Users
1. **Download the APK** from the link provided
2. **Enable "Install from unknown sources"** in your phone settings
3. **Tap the downloaded file** to install
4. **Open HomeChef** and start testing!

### iOS Users  
1. **Follow the installation link** provided (TestFlight or direct install)
2. **Allow installation** when prompted
3. **Open HomeChef** and start testing!

## 🔑 Test Account Credentials

### 👑 Admin Account (Full Platform Access)
- **Email**: `admin@homechef.com`
- **Password**: `password123`
- **Features**: Manage chefs, view analytics, approve applications

### 👩‍🍳 Chef Accounts (Seller Experience)
- **Maria Rodriguez**: `maria@homechef.com` / `password123` (General cuisine)
- **Indah Sari**: `indah@homechef.com` / `password123` (Indonesian - Rendang, Ayam Penyet)
- **Elisa Chan**: `elisa@homechef.com` / `password123` (Hong Kong - Egg Tarts, Mooncakes)
- **Yar Ping**: `yarping@ypnutrition.sg` / `test123` (Health Food - Protein Bars)

### 👤 Customer Accounts (Buyer Experience)
- **John Customer**: `john@customer.com` / `password123`
- **Sarah Wilson**: `sarah@customer.com` / `password123`

## 🧪 Testing Scenarios

### 🛍️ Customer Journey Testing
1. **Browse & Search**
   - Browse products by category
   - Filter by chef or cuisine type
   - Search for specific dishes
   
2. **Shopping Experience**
   - Add items to cart
   - Update quantities
   - Remove items
   - Proceed to checkout

3. **Order Management**
   - View order history
   - Track order status
   - Rate completed orders

### 👩‍🍳 Chef Experience Testing
1. **Profile Management**
   - View chef dashboard
   - Update business information
   - Manage availability

2. **Product Management**
   - Add new dishes
   - Edit existing products
   - Update pricing and descriptions

3. **Order Processing**
   - Receive new orders
   - Update order status
   - Communicate with customers

### 👑 Admin Testing
1. **Chef Management**
   - Review pending chef applications
   - Approve/reject chef profiles
   - Create new chef accounts
   - Delete chef profiles

2. **Platform Analytics**
   - View user statistics
   - Monitor order metrics
   - Check chef performance

3. **User Management**
   - View all users
   - Manage user accounts

## 🎯 Key Features to Test

### ✅ Core Functionality
- [ ] User registration and login
- [ ] Role-based navigation (different tabs for different user types)
- [ ] Product browsing and filtering
- [ ] Cart functionality
- [ ] Order placement and tracking
- [ ] Chef profile creation and management
- [ ] Admin panel operations

### 🔍 Look Out For
- **UI/UX Issues**: Buttons not working, layout problems, text overflow
- **Performance**: Slow loading, app crashes, freezing
- **Navigation**: Incorrect tab visibility, navigation flow issues
- **Data**: Missing information, incorrect displays, API errors
- **Authentication**: Login problems, role restrictions not working

## 🐛 How to Report Issues

When you find a bug or have feedback:

1. **Screenshot/Screen Record** the issue
2. **Note the steps** to reproduce the problem
3. **Include your device info**: Phone model, OS version
4. **Send feedback to**: [Your feedback email/method]

### Bug Report Template
```
Device: [iPhone 14 / Samsung Galaxy S21 / etc.]
OS: [iOS 16 / Android 13 / etc.]
Account used: [admin@homechef.com / etc.]

Steps to reproduce:
1. Login as customer
2. Browse products
3. Add item to cart
4. Error occurred when...

Expected: Should show cart with item
Actual: App crashed / Error message appeared

Screenshot: [Attach screenshot]
```

## 🚀 Testing Checklist

### Account Testing
- [ ] Register new account
- [ ] Login with provided credentials  
- [ ] Switch between different user roles
- [ ] Logout functionality

### Browse & Search
- [ ] View all products
- [ ] Filter by chef
- [ ] Filter by category
- [ ] Search functionality
- [ ] Product detail views

### Cart & Orders  
- [ ] Add products to cart
- [ ] Modify cart items
- [ ] Place orders
- [ ] View order history
- [ ] Order status updates

### Chef Features
- [ ] Chef dashboard
- [ ] Add new products
- [ ] Edit existing products
- [ ] Manage orders
- [ ] Profile management

### Admin Features
- [ ] View platform statistics
- [ ] Manage chef applications
- [ ] Create/delete chef accounts
- [ ] User management

## 💡 Pro Testing Tips

1. **Test Edge Cases**: Try empty carts, invalid inputs, long text
2. **Test Network Issues**: Use airplane mode to test offline behavior
3. **Test Different Speeds**: Use slow internet to test loading states
4. **Test Multitasking**: Switch between apps while using HomeChef
5. **Test Orientation**: Rotate your device to test landscape mode

## 🎉 Thank You!

Your feedback is invaluable in making HomeChef the best home cooking marketplace. Every bug you find and suggestion you make helps us create a better experience for food lovers everywhere.

**Happy Testing!** 🍳✨

---
*Last Updated: December 2024*
*Beta Version: Preview Build*
*Backend: https://homechef-production.up.railway.app* 