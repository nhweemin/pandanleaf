import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
  vendorId: mongoose.Types.ObjectId;
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  images: string[];
  videos: string[];
  price: number;
  currency: string;
  availability: {
    isAvailable: boolean;
    quantity?: number;
    maxOrdersPerDay?: number;
    advanceOrderDays: number;
  };
  tags: string[];
  specifications?: {
    [key: string]: string;
  };
  ratings: {
    average: number;
    count: number;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>({
  vendorId: {
    type: Schema.Types.ObjectId,
    ref: 'Vendor',
    required: [true, 'Vendor ID is required']
  },
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      // Food & Beverages
      'Appetizers', 'Main Course', 'Desserts', 'Soups', 'Salads',
      'Beverages', 'Snacks', 'Breakfast', 'Lunch', 'Dinner',
      'Baked Goods', 'Pastries', 'Bread', 'Cakes',
      // Crafts & Handmade
      'Jewelry', 'Home Decor', 'Artwork', 'Pottery', 'Textiles',
      'Woodwork', 'Candles', 'Soap', 'Skincare',
      // Services
      'Tutoring', 'Pet Care', 'Cleaning', 'Repairs', 'Digital Services',
      'Beauty Services', 'Wellness', 'Photography',
      // Clothing & Accessories
      'Clothing', 'Bags', 'Accessories', 'Shoes',
      // Other
      'Other'
    ]
  },
  subcategory: String,
  images: [{
    type: String,
    required: [true, 'At least one product image is required']
  }],
  videos: [{
    type: String,
    default: []
  }],
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  currency: {
    type: String,
    default: 'USD'
  },
  availability: {
    isAvailable: {
      type: Boolean,
      default: true
    },
    quantity: {
      type: Number,
      min: 0
    },
    maxOrdersPerDay: {
      type: Number,
      default: 10,
      min: 1
    },
    advanceOrderDays: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  tags: [String],
  specifications: {
    type: Map,
    of: String
  },
  ratings: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
ProductSchema.index({ vendorId: 1 });
ProductSchema.index({ category: 1 });
ProductSchema.index({ isActive: 1, 'availability.isAvailable': 1 });
ProductSchema.index({ 'ratings.average': -1 });
ProductSchema.index({ name: 'text', description: 'text' });

export default mongoose.model<IProduct>('Product', ProductSchema); 