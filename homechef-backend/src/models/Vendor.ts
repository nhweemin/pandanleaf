import mongoose, { Document, Schema } from 'mongoose';

export interface IVendor extends Document {
  userId: mongoose.Types.ObjectId;
  businessName: string;
  businessType: string;
  description: string;
  location: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  contact: {
    phone: string;
    email: string;
    website?: string;
    socialMedia?: {
      facebook?: string;
      instagram?: string;
      twitter?: string;
    };
  };
  businessInfo: {
    yearsOfExperience: number;
    specialties: string[];
    certifications?: string[];
    operatingHours?: {
      [key: string]: {
        open: string;
        close: string;
        closed: boolean;
      };
    };
  };
  portfolio: {
    images: string[];
    description: string;
  };
  verification: {
    status: 'pending' | 'approved' | 'rejected';
    documents: string[];
    reviewedAt?: Date;
    reviewedBy?: string;
    reviewNotes?: string;
  };
  ratings: {
    average: number;
    count: number;
  };
  isApproved: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const VendorSchema = new Schema<IVendor>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    unique: true
  },
  businessName: {
    type: String,
    required: [true, 'Business name is required'],
    trim: true,
    maxlength: [100, 'Business name cannot exceed 100 characters']
  },
  businessType: {
    type: String,
    required: [true, 'Business type is required'],
    enum: [
      'Food & Beverages',
      'Handmade Crafts',
      'Baked Goods',
      'Personal Services',
      'Digital Services',
      'Home Decor',
      'Beauty & Wellness',
      'Clothing & Accessories',
      'Pet Services',
      'Tutoring & Education',
      'Other'
    ]
  },
  description: {
    type: String,
    required: [true, 'Business description is required'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  location: {
    address: {
      type: String,
      required: [true, 'Address is required']
    },
    city: {
      type: String,
      required: [true, 'City is required']
    },
    state: {
      type: String,
      required: [true, 'State is required']
    },
    zipCode: {
      type: String,
      required: [true, 'Zip code is required']
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  contact: {
    phone: {
      type: String,
      required: [true, 'Phone number is required']
    },
    email: {
      type: String,
      required: [true, 'Contact email is required']
    },
    website: String,
    socialMedia: {
      facebook: String,
      instagram: String,
      twitter: String
    }
  },
  businessInfo: {
    yearsOfExperience: {
      type: Number,
      required: [true, 'Years of experience is required'],
      min: [0, 'Experience cannot be negative']
    },
    specialties: [{
      type: String,
      trim: true
    }],
    certifications: [String],
    operatingHours: {
      type: Map,
      of: {
        open: String,
        close: String,
        closed: Boolean
      }
    }
  },
  portfolio: {
    images: [String],
    description: String
  },
  verification: {
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    documents: [String],
    reviewedAt: Date,
    reviewedBy: {
      type: String // Changed from ObjectId to String to match admin data
    },
    reviewNotes: String
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
  isApproved: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
VendorSchema.index({ userId: 1 });
VendorSchema.index({ businessType: 1 });
VendorSchema.index({ isApproved: 1, isActive: 1 });
VendorSchema.index({ 'location.city': 1, 'location.state': 1 });
VendorSchema.index({ 'ratings.average': -1 });

export default mongoose.model<IVendor>('Vendor', VendorSchema); 