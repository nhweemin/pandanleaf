import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Import routes
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import chefRoutes from './routes/chefs';
import productRoutes from './routes/products';
import orderRoutes from './routes/orders';
import adminRoutes from './routes/admin';
import vendorsRouter from './routes/vendors';

// Import middleware
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Database connection
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pandanleaf';
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.warn('⚠️  MongoDB connection failed, running without database:', (error as Error).message);
    console.log('ℹ️  Install and start MongoDB to enable database functionality');
    // Don't exit, just continue without database
  }
};

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
  origin: process.env.FRONTEND_URL || 'exp://localhost:8081',
  credentials: true
})); // CORS configuration
app.use(morgan('combined')); // HTTP request logging
app.use(express.json({ limit: '10mb' })); // Parse JSON bodies
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Parse URL-encoded bodies

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Pandan Leaf API is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chefs', chefRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/vendors', vendorsRouter);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: '🌿 Welcome to Pandan Leaf API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      users: '/api/users',
      chefs: '/api/chefs',
      products: '/api/products',
      orders: '/api/orders',
      admin: '/api/admin'
    }
  });
});

// Error handling middleware (must be after routes)
app.use(notFound);
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      const environment = process.env.NODE_ENV || 'development';
      const healthCheckUrl = environment === 'production' 
        ? 'https://homechef-production.up.railway.app/health'
        : `http://localhost:${PORT}/health`;
        
      console.log(`🚀 Pandan Leaf API server running on port ${PORT}`);
      console.log(`📱 Environment: ${environment}`);
      console.log(`🌐 Health check: ${healthCheckUrl}`);
      console.log(`🔗 API URL: ${environment === 'production' ? 'https://homechef-production.up.railway.app' : `http://localhost:${PORT}`}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app; 