# Pandan Leaf - Home Business Marketplace

A comprehensive mobile platform connecting customers with local home-based businesses across various categories including food, crafts, services, and more.

## 🌿 About Pandan Leaf

Pandan Leaf is a React Native application built with Expo that serves as a marketplace for home businesses. It enables:

- **Business Owners**: Create profiles, showcase products/services, manage orders
- **Customers**: Discover local home businesses, browse products, place orders  
- **Admins**: Manage platform users and business applications

## 🏪 Supported Business Types

- **Food & Beverages**: Home-cooked meals, baked goods, beverages
- **Handmade Crafts**: Jewelry, artwork, pottery, textiles
- **Personal Services**: Tutoring, pet care, beauty services
- **Digital Services**: Web design, photography, consulting
- **Other Categories**: Clothing, home decor, wellness, repairs

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- MongoDB database
- Android/iOS device or emulator

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd pandanleaf
   ```

2. **Install frontend dependencies**
   ```bash
   cd PandanLeafApp
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd ../pandanleaf-backend
   npm install
   ```

4. **Configure environment variables**
   ```bash
   # Backend (.env)
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   PORT=5000
   NODE_ENV=development
   ```

5. **Start the backend server**
   ```bash
   cd pandanleaf-backend
   npm run dev
   ```

6. **Start the mobile app**
   ```bash
   cd ../PandanLeafApp
   npx expo start
   ```

## 📱 App Structure

```
PandanLeafApp/
├── app/
│   ├── (auth)/          # Login/signup screens
│   ├── (tabs)/          # Main app tabs
│   │   ├── browse.tsx   # Product browsing
│   │   ├── vendor.tsx   # Business owner dashboard
│   │   ├── orders.tsx   # Order management
│   │   ├── admin.tsx    # Admin panel
│   │   └── profile.tsx  # User profile
│   └── index.tsx        # Welcome screen
├── components/          # Reusable UI components
├── contexts/           # React context providers
├── utils/             # Utility functions
└── config/            # App configuration
```

## 🔧 Key Features

### For Business Owners
- Business profile creation and management
- Product/service listings with photos
- Image upload via camera or gallery
- Order management and tracking
- Real-time inventory updates

### For Customers
- Browse products by business type
- Search and filter functionality
- Product detail views with images
- Shopping cart and checkout
- Order history tracking

### For Admins
- Business application approval
- User management
- Platform analytics
- Content moderation

## 🛠 Technology Stack

**Frontend:**
- React Native (Expo)
- TypeScript
- Expo Router for navigation
- AsyncStorage for local data
- Expo Image Picker for photo capture

**Backend:**
- Node.js with Express
- MongoDB with Mongoose
- JWT authentication
- RESTful API design
- Image processing and compression

## 📊 API Endpoints

### Business Endpoints
- `GET /api/vendors` - List all approved businesses
- `POST /api/vendors` - Create business profile
- `GET /api/vendors/:id/products` - Get products by business

### Product Endpoints
- `GET /api/products` - List all products
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Admin Endpoints
- `PUT /api/admin/vendors/:id/approve` - Approve/reject business
- `GET /api/admin/users` - Manage users

## 🧪 Testing

The app includes comprehensive test accounts for different user roles:

- **Admin**: Full platform management access
- **Business Owners**: Product/service management for different categories
- **Customers**: Browse and purchase functionality

See `BETA_TESTING_GUIDE_V2.md` for detailed testing instructions.

## 📱 Deployment

### Mobile App (EAS Build)
```bash
cd PandanLeafApp
eas build --platform android --profile preview
```

### Backend (Railway/Heroku)
```bash
cd pandanleaf-backend
# Deploy to your preferred platform
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly across different business types
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 📞 Support

For support or questions about the platform, please contact the development team or create an issue in the repository.

---

**Pandan Leaf - Empowering Home Businesses, Connecting Communities** 🌿✨
