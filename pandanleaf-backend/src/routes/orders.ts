import express from 'express';
import Order from '../models/Order';
import Product from '../models/Product';
import Chef from '../models/Chef';
import User from '../models/User';

const router = express.Router();

// @route   GET /api/orders
// @desc    Get user orders
// @access  Private
router.get('/', async (req, res) => {
  try {
    const { userId, chefId, status, limit = 20, page = 1 } = req.query;
    const filter: any = {};

    // Apply filters based on query parameters
    if (userId) {
      filter.customerId = userId;
    }
    if (chefId) {
      filter.chefId = chefId;
    }
    if (status) {
      filter.status = status;
    }

    // Calculate pagination
    const skip = (Number(page) - 1) * Number(limit);

    // Get orders with populated data
    const orders = await Order.find(filter)
      .populate('customerId', 'name email phone')
      .populate('chefId', 'businessName rating')
      .populate('items.productId', 'name images price')
      .sort({ 'timeline.placedAt': -1 })
      .limit(Number(limit))
      .skip(skip);

    const total = await Order.countDocuments(filter);

    return res.json({
      success: true,
      data: {
        orders,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching orders'
    });
  }
});

// @route   GET /api/orders/:id
// @desc    Get order by ID
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customerId', 'name email phone')
      .populate('chefId', 'businessName rating serviceArea')
      .populate('items.productId', 'name images price description');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    return res.json({
      success: true,
      data: { order }
    });
  } catch (error) {
    console.error('Get order error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching order'
    });
  }
});

// @route   POST /api/orders
// @desc    Create new order
// @access  Private
router.post('/', async (req, res) => {
  try {
    const {
      customerId,
      chefId,
      items,
      delivery,
      payment,
      specialInstructions
    } = req.body;

    // Verify customer exists
    const customer = await User.findById(customerId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Verify chef exists
    const chef = await Chef.findById(chefId);
    if (!chef) {
      return res.status(404).json({
        success: false,
        message: 'Chef not found'
      });
    }

    // Calculate pricing
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product ${item.productId} not found`
        });
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: product.price,
        specialInstructions: item.specialInstructions
      });
    }

    const deliveryFee = chef.pricing.deliveryFee;
    const serviceFee = subtotal * 0.05; // 5% service fee
    const taxes = (subtotal + deliveryFee + serviceFee) * 0.08; // 8% tax
    const total = subtotal + deliveryFee + serviceFee + taxes;

    // Create order
    const order = new Order({
      customerId,
      chefId,
      items: orderItems,
      pricing: {
        subtotal,
        deliveryFee,
        serviceFee,
        taxes,
        total
      },
      delivery: {
        ...delivery,
        estimatedDelivery: new Date(Date.now() + 60 * 60 * 1000) // 1 hour from now
      },
      payment,
      status: 'pending'
    });

    await order.save();

    // Update product order counts
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { 
          'orders.total': item.quantity,
          'orders.thisWeek': item.quantity,
          'orders.thisMonth': item.quantity
        }
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: { order }
    });
  } catch (error) {
    console.error('Create order error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error creating order'
    });
  }
});

// @route   PUT /api/orders/:id/status
// @desc    Update order status
// @access  Private (Chef/Admin)
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'delivering', 'delivered', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const updateFields: any = { status };

    // Update timeline based on status
    switch (status) {
      case 'confirmed':
        updateFields['timeline.confirmedAt'] = new Date();
        break;
      case 'preparing':
        updateFields['timeline.preparingAt'] = new Date();
        break;
      case 'ready':
        updateFields['timeline.readyAt'] = new Date();
        break;
      case 'delivering':
        updateFields['timeline.deliveringAt'] = new Date();
        break;
      case 'delivered':
        updateFields['timeline.deliveredAt'] = new Date();
        updateFields['delivery.actualDelivery'] = new Date();
        break;
      case 'cancelled':
        updateFields['timeline.cancelledAt'] = new Date();
        break;
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    return res.json({
      success: true,
      message: 'Order status updated successfully',
      data: { order }
    });
  } catch (error) {
    console.error('Update order status error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error updating order status'
    });
  }
});

// @route   POST /api/orders/:id/rating
// @desc    Rate an order
// @access  Private (Customer only)
router.post('/:id/rating', async (req, res) => {
  try {
    const { food, delivery, overall, comment } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.status !== 'delivered') {
      return res.status(400).json({
        success: false,
        message: 'Can only rate delivered orders'
      });
    }

    // Update order with rating
    order.rating = {
      food,
      delivery,
      overall,
      comment,
      ratedAt: new Date()
    };

    await order.save();

    // Update chef's rating
    const chef = await Chef.findById(order.chefId);
    if (chef) {
      const newCount = chef.rating.count + 1;
      const newAverage = ((chef.rating.average * chef.rating.count) + overall) / newCount;
      
      chef.rating.average = Number(newAverage.toFixed(2));
      chef.rating.count = newCount;
      await chef.save();
    }

    // Update product ratings
    for (const item of order.items) {
      const product = await Product.findById(item.productId);
      if (product) {
        const newCount = product.ratings.count + 1;
        const newAverage = ((product.ratings.average * product.ratings.count) + food) / newCount;
        
        product.ratings.average = Number(newAverage.toFixed(2));
        product.ratings.count = newCount;
        await product.save();
      }
    }

    return res.json({
      success: true,
      message: 'Rating submitted successfully',
      data: { order }
    });
  } catch (error) {
    console.error('Rate order error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error submitting rating'
    });
  }
});

export default router; 