import mongoose, { Document, Schema } from 'mongoose';

export interface IChef extends Document {
  userId: mongoose.Types.ObjectId;
  businessName: string;
  description: string;
  specialties: string[];
  experience: number;
  certifications: string[];
  kitchenPhotos: string[];
  serviceArea: {
    radius: number;
    cities: string[];
  };
  pricing: {
    deliveryFee: number;
    minimumOrder: number;
  };
  availability: {
    days: string[];
    hours: {
      start: string;
      end: string;
    };
  };
  rating: {
    average: number;
    count: number;
  };
  verification: {
    status: 'pending' | 'approved' | 'rejected';
    submittedAt: Date;
    reviewedAt?: Date;
    reviewedBy?: mongoose.Types.ObjectId;
    documents: {
      healthPermit?: string;
      businessLicense?: string;
      insurance?: string;
    };
  };
  isActive: boolean;
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const chefSchema = new Schema<IChef>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  businessName: {
    type: String,
    required: [true, 'Business name is required'],
    trim: true,
    maxlength: [100, 'Business name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  specialties: {
    type: [String],
    required: [true, 'At least one specialty is required'],
    validate: {
      validator: function(v: string[]) {
        return v && v.length > 0;
      },
      message: 'Please provide at least one specialty'
    }
  },
  experience: {
    type: Number,
    required: [true, 'Experience is required'],
    min: [0, 'Experience cannot be negative']
  },
  certifications: [String],
  kitchenPhotos: {
    type: [String],
    validate: {
      validator: function(v: string[]) {
        return v && v.length >= 2;
      },
      message: 'At least 2 kitchen photos are required'
    }
  },
  serviceArea: {
    radius: {
      type: Number,
      required: [true, 'Service radius is required'],
      min: [1, 'Service radius must be at least 1 mile'],
      max: [50, 'Service radius cannot exceed 50 miles']
    },
    cities: [String]
  },
  pricing: {
    deliveryFee: {
      type: Number,
      required: [true, 'Delivery fee is required'],
      min: [0, 'Delivery fee cannot be negative']
    },
    minimumOrder: {
      type: Number,
      required: [true, 'Minimum order amount is required'],
      min: [0, 'Minimum order cannot be negative']
    }
  },
  availability: {
    days: {
      type: [String],
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      required: [true, 'Available days are required']
    },
    hours: {
      start: {
        type: String,
        required: [true, 'Start time is required'],
        match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please provide time in HH:MM format']
      },
      end: {
        type: String,
        required: [true, 'End time is required'],
        match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please provide time in HH:MM format']
      }
    }
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be negative'],
      max: [5, 'Rating cannot exceed 5']
    },
    count: {
      type: Number,
      default: 0,
      min: [0, 'Rating count cannot be negative']
    }
  },
  verification: {
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    submittedAt: {
      type: Date,
      default: Date.now
    },
    reviewedAt: Date,
    reviewedBy: {
      type: String
    },
    documents: {
      healthPermit: String,
      businessLicense: String,
      insurance: String
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isApproved: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for efficient queries
chefSchema.index({ userId: 1 });
chefSchema.index({ 'verification.status': 1 });
chefSchema.index({ isActive: 1, isApproved: 1 });
chefSchema.index({ specialties: 1 });
chefSchema.index({ 'serviceArea.cities': 1 });

export default mongoose.model<IChef>('Chef', chefSchema); 