import mongoose, { Document, Schema } from 'mongoose';

export interface IOrder extends Document {
  customerId: mongoose.Types.ObjectId;
  chefId: mongoose.Types.ObjectId;
  items: {
    productId: mongoose.Types.ObjectId;
    quantity: number;
    price: number;
    specialInstructions?: string;
  }[];
  pricing: {
    subtotal: number;
    deliveryFee: number;
    serviceFee: number;
    taxes: number;
    total: number;
  };
  delivery: {
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
    instructions?: string;
    scheduledTime?: Date;
    estimatedDelivery: Date;
    actualDelivery?: Date;
  };
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivering' | 'delivered' | 'cancelled';
  payment: {
    method: 'card' | 'cash' | 'wallet';
    status: 'pending' | 'paid' | 'failed' | 'refunded';
    transactionId?: string;
    paidAt?: Date;
  };
  timeline: {
    placedAt: Date;
    confirmedAt?: Date;
    preparingAt?: Date;
    readyAt?: Date;
    deliveringAt?: Date;
    deliveredAt?: Date;
    cancelledAt?: Date;
  };
  rating?: {
    food: number;
    delivery: number;
    overall: number;
    comment?: string;
    ratedAt: Date;
  };
  communication: {
    customerPhone?: string;
    chefPhone?: string;
    messages: {
      from: 'customer' | 'chef';
      message: string;
      timestamp: Date;
    }[];
  };
  cancellation?: {
    reason: string;
    cancelledBy: 'customer' | 'chef' | 'admin';
    refundAmount: number;
    refundStatus: 'pending' | 'processed' | 'failed';
  };
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new Schema<IOrder>({
  customerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Customer ID is required']
  },
  chefId: {
    type: Schema.Types.ObjectId,
    ref: 'Chef',
    required: [true, 'Chef ID is required']
  },
  items: [{
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product ID is required']
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1']
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative']
    },
    specialInstructions: {
      type: String,
      maxlength: [200, 'Special instructions cannot exceed 200 characters']
    }
  }],
  pricing: {
    subtotal: {
      type: Number,
      required: [true, 'Subtotal is required'],
      min: [0, 'Subtotal cannot be negative']
    },
    deliveryFee: {
      type: Number,
      required: [true, 'Delivery fee is required'],
      min: [0, 'Delivery fee cannot be negative']
    },
    serviceFee: {
      type: Number,
      required: [true, 'Service fee is required'],
      min: [0, 'Service fee cannot be negative']
    },
    taxes: {
      type: Number,
      required: [true, 'Taxes are required'],
      min: [0, 'Taxes cannot be negative']
    },
    total: {
      type: Number,
      required: [true, 'Total is required'],
      min: [0, 'Total cannot be negative']
    }
  },
  delivery: {
    address: {
      street: {
        type: String,
        required: [true, 'Street address is required']
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
        required: [true, 'ZIP code is required']
      },
      country: {
        type: String,
        required: [true, 'Country is required'],
        default: 'United States'
      }
    },
    instructions: {
      type: String,
      maxlength: [300, 'Delivery instructions cannot exceed 300 characters']
    },
    scheduledTime: Date,
    estimatedDelivery: {
      type: Date,
      required: [true, 'Estimated delivery time is required']
    },
    actualDelivery: Date
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'ready', 'delivering', 'delivered', 'cancelled'],
    default: 'pending'
  },
  payment: {
    method: {
      type: String,
      enum: ['card', 'cash', 'wallet'],
      required: [true, 'Payment method is required']
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending'
    },
    transactionId: String,
    paidAt: Date
  },
  timeline: {
    placedAt: {
      type: Date,
      default: Date.now
    },
    confirmedAt: Date,
    preparingAt: Date,
    readyAt: Date,
    deliveringAt: Date,
    deliveredAt: Date,
    cancelledAt: Date
  },
  rating: {
    food: {
      type: Number,
      min: [1, 'Food rating must be at least 1'],
      max: [5, 'Food rating cannot exceed 5']
    },
    delivery: {
      type: Number,
      min: [1, 'Delivery rating must be at least 1'],
      max: [5, 'Delivery rating cannot exceed 5']
    },
    overall: {
      type: Number,
      min: [1, 'Overall rating must be at least 1'],
      max: [5, 'Overall rating cannot exceed 5']
    },
    comment: {
      type: String,
      maxlength: [500, 'Rating comment cannot exceed 500 characters']
    },
    ratedAt: Date
  },
  communication: {
    customerPhone: String,
    chefPhone: String,
    messages: [{
      from: {
        type: String,
        enum: ['customer', 'chef'],
        required: [true, 'Message sender is required']
      },
      message: {
        type: String,
        required: [true, 'Message content is required'],
        maxlength: [500, 'Message cannot exceed 500 characters']
      },
      timestamp: {
        type: Date,
        default: Date.now
      }
    }]
  },
  cancellation: {
    reason: {
      type: String,
      maxlength: [300, 'Cancellation reason cannot exceed 300 characters']
    },
    cancelledBy: {
      type: String,
      enum: ['customer', 'chef', 'admin']
    },
    refundAmount: {
      type: Number,
      min: [0, 'Refund amount cannot be negative']
    },
    refundStatus: {
      type: String,
      enum: ['pending', 'processed', 'failed']
    }
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
orderSchema.index({ customerId: 1 });
orderSchema.index({ chefId: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ 'payment.status': 1 });
orderSchema.index({ 'delivery.estimatedDelivery': 1 });
orderSchema.index({ 'timeline.placedAt': -1 });
orderSchema.index({ customerId: 1, status: 1 });
orderSchema.index({ chefId: 1, status: 1 });

// Compound index for order history queries
orderSchema.index({ customerId: 1, 'timeline.placedAt': -1 });
orderSchema.index({ chefId: 1, 'timeline.placedAt': -1 });

export default mongoose.model<IOrder>('Order', orderSchema); 