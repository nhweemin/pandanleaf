import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  ListRenderItem,
  Alert,
  Modal,
  TextInput,
  Image,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import { Order, TimeSlot } from '@/types';
import { useCart, CartItem } from '@/contexts/CartContext';

// Enhanced interfaces for checkout

interface CheckoutInfo {
  deliveryAddress: string;
  phoneNumber: string;
  paymentMethod: 'card' | 'cash' | 'digital_wallet';
  pickupOption: 'pickup' | 'delivery';
  scheduledDate: Date;
  timeSlot: string;
  specialInstructions?: string;
}

// Mock data for scheduled orders
const mockOrders: Order[] = [
  {
    id: '1',
    productId: '1',
    productName: 'Homemade Pasta Bolognese',
    chefName: 'Maria Rodriguez',
    quantity: 2,
    price: 31.98,
    status: 'confirmed',
    orderDate: new Date('2024-01-15T10:30:00'),
    scheduledDate: new Date('2024-01-16T18:00:00'),
    timeSlot: '6:00 PM - 7:00 PM',
    pickupOption: 'delivery',
    specialInstructions: 'Please ring doorbell'
  },
  {
    id: '2',
    productId: '2',
    productName: 'Korean BBQ Bowls',
    chefName: 'Kim Park',
    quantity: 1,
    price: 18.50,
    status: 'preparing',
    orderDate: new Date('2024-01-14T14:20:00'),
    scheduledDate: new Date('2024-01-15T12:30:00'),
    timeSlot: '12:30 PM - 1:30 PM',
    pickupOption: 'pickup'
  },
  {
    id: '3',
    productId: '3',
    productName: 'Chocolate Lava Cake',
    chefName: 'Sarah Johnson',
    quantity: 3,
    price: 26.97,
    status: 'completed',
    orderDate: new Date('2024-01-13T16:15:00'),
    scheduledDate: new Date('2024-01-14T20:00:00'),
    timeSlot: '8:00 PM - 9:00 PM',
    pickupOption: 'pickup'
  },
  {
    id: '4',
    productId: '4',
    productName: 'Thai Green Curry',
    chefName: 'Arjun Patel',
    quantity: 1,
    price: 16.75,
    status: 'pending',
    orderDate: new Date('2024-01-15T12:00:00'),
    scheduledDate: new Date('2024-01-17T19:00:00'),
    timeSlot: '7:00 PM - 8:00 PM',
    pickupOption: 'delivery'
  }
];

// Available time slots for scheduling
const availableTimeSlots: TimeSlot[] = [
  { id: '1', label: '10:00 AM - 11:00 AM', startTime: '10:00', endTime: '11:00', available: true },
  { id: '2', label: '11:00 AM - 12:00 PM', startTime: '11:00', endTime: '12:00', available: true },
  { id: '3', label: '12:00 PM - 1:00 PM', startTime: '12:00', endTime: '13:00', available: false },
  { id: '4', label: '1:00 PM - 2:00 PM', startTime: '13:00', endTime: '14:00', available: true },
  { id: '5', label: '2:00 PM - 3:00 PM', startTime: '14:00', endTime: '15:00', available: true },
  { id: '6', label: '5:00 PM - 6:00 PM', startTime: '17:00', endTime: '18:00', available: true },
  { id: '7', label: '6:00 PM - 7:00 PM', startTime: '18:00', endTime: '19:00', available: true },
  { id: '8', label: '7:00 PM - 8:00 PM', startTime: '19:00', endTime: '20:00', available: true },
  { id: '9', label: '8:00 PM - 9:00 PM', startTime: '20:00', endTime: '21:00', available: false }
];

// Mock cart items for testing
const mockCartItems: CartItem[] = [
  {
    id: '1',
    productId: '1',
    productName: 'Spicy Thai Basil Stir Fry',
    chefName: 'Arjun Patel',
    price: 16.99,
    quantity: 2,
    image: 'https://images.unsplash.com/photo-1559847844-d724ce8a2e8e?w=300&h=200&fit=crop',
    specialInstructions: 'Extra spicy please'
  },
  {
    id: '2',
    productId: '5',
    productName: 'Homemade Tiramisu',
    chefName: 'Maria Rodriguez',
    price: 12.50,
    quantity: 1,
    image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=300&h=200&fit=crop'
  }
];

const getStatusColor = (status: Order['status']) => {
  switch (status) {
    case 'pending':
      return '#FF9500';
    case 'confirmed':
      return '#34C759';
    case 'preparing':
      return '#007AFF';
    case 'ready':
      return '#5AC8FA';
    case 'completed':
      return '#8E8E93';
    case 'cancelled':
      return '#FF3B30';
    default:
      return '#8E8E93';
  }
};

const getStatusIcon = (status: Order['status']) => {
  switch (status) {
    case 'pending':
      return 'time-outline';
    case 'confirmed':
      return 'checkmark-circle-outline';
    case 'preparing':
      return 'restaurant-outline';
    case 'ready':
      return 'bag-outline';
    case 'completed':
      return 'checkmark-done-circle-outline';
    case 'cancelled':
      return 'close-circle-outline';
    default:
      return 'help-circle-outline';
  }
};

const getNextAvailableDate = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow;
};

export default function OrdersScreen() {
  const [activeTab, setActiveTab] = useState<'active' | 'history' | 'cart'>('active');
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showOrderDetail, setShowOrderDetail] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  // Use cart context
  const { cartItems, updateCartItemQuantity, removeFromCart, getCartTotal, getCartItemCount, clearCart } = useCart();
  
  const [checkoutInfo, setCheckoutInfo] = useState<CheckoutInfo>({
    deliveryAddress: '',
    phoneNumber: '',
    paymentMethod: 'card',
    pickupOption: 'delivery',
    scheduledDate: getNextAvailableDate(),
    timeSlot: '',
    specialInstructions: ''
  });

  // Get date range for next 7 days
  const getAvailableDates = () => {
    const dates = [];
    for (let i = 1; i <= 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const availableDates = getAvailableDates();

  // Cart management functions are now provided by useCart context

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      Alert.alert('Empty Cart', 'Please add items to your cart before checking out.');
      return;
    }
    setShowCheckout(true);
  };

  const processOrder = () => {
    if (!checkoutInfo.timeSlot) {
      Alert.alert('Missing Information', 'Please select a time slot for your order.');
      return;
    }
    
    if (checkoutInfo.pickupOption === 'delivery' && !checkoutInfo.deliveryAddress) {
      Alert.alert('Missing Information', 'Please enter your delivery address.');
      return;
    }

    // Create new order
    const newOrder: Order = {
      id: Date.now().toString(),
      productId: cartItems[0].productId,
      productName: cartItems.map(item => `${item.quantity}x ${item.productName}`).join(', '),
      chefName: cartItems[0].chefName,
      quantity: getCartItemCount(),
      price: getCartTotal() + (checkoutInfo.pickupOption === 'delivery' ? 3.99 : 0),
      status: 'pending',
      orderDate: new Date(),
      scheduledDate: checkoutInfo.scheduledDate,
      timeSlot: checkoutInfo.timeSlot,
      pickupOption: checkoutInfo.pickupOption,
      specialInstructions: checkoutInfo.specialInstructions
    };

    setOrders(prev => [newOrder, ...prev]);
    clearCart();
    setShowCheckout(false);
    Alert.alert('Order Placed!', `Your order is scheduled for ${newOrder.scheduledDate.toLocaleDateString()} at ${newOrder.timeSlot}`);
    setActiveTab('active');
  };

  const handleCancelOrder = (orderId: string) => {
    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order?',
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Yes', 
          style: 'destructive',
          onPress: () => {
            setOrders(prev => 
              prev.map(order => 
                order.id === orderId ? { ...order, status: 'cancelled' } : order
              )
            );
          }
        }
      ]
    );
  };

  const viewOrderDetail = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderDetail(true);
  };

  const activeOrders = orders.filter(order => 
    order.status === 'pending' || order.status === 'confirmed' || order.status === 'preparing' || order.status === 'ready'
  );
  
  const historyOrders = orders.filter(order => 
    order.status === 'completed' || order.status === 'cancelled'
  );

  const renderOrderCard: ListRenderItem<Order> = ({ item }) => (
    <TouchableOpacity 
      style={styles.orderCard}
      onPress={() => viewOrderDetail(item)}
    >
      <View style={styles.orderHeader}>
        <View style={styles.orderInfo}>
          <Text style={styles.productName}>{item.productName}</Text>
          <Text style={styles.chefName}>by {item.chefName}</Text>
          <Text style={styles.orderPrice}>${item.price.toFixed(2)}</Text>
        </View>
        
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Ionicons name={getStatusIcon(item.status)} size={16} color="#fff" />
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.orderDetails}>
        <Text style={styles.scheduledTime}>
          📅 Scheduled: {item.scheduledDate.toLocaleDateString()} at {item.timeSlot}
        </Text>
        <Text style={styles.pickupType}>
          {item.pickupOption === 'delivery' ? '🚚 Delivery' : '📍 Pickup'}
        </Text>
        {item.specialInstructions && (
          <Text style={styles.specialInstructions}>
            💬 {item.specialInstructions}
          </Text>
        )}
      </View>

      <View style={styles.orderActions}>
        {(item.status === 'pending' || item.status === 'confirmed') && (
          <TouchableOpacity
            style={[styles.actionButton, styles.cancelButton]}
            onPress={() => handleCancelOrder(item.id)}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        )}
        {item.status === 'completed' && (
          <TouchableOpacity
            style={[styles.actionButton, styles.reorderButton]}
            onPress={() => Alert.alert('Reorder', 'Reorder functionality coming soon!')}
          >
            <Text style={styles.reorderButtonText}>Reorder</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderCartItem: ListRenderItem<CartItem> = ({ item }) => (
    <View style={styles.cartItem}>
      <Image source={{ uri: item.image }} style={styles.cartItemImage} />
      <View style={styles.cartItemInfo}>
        <Text style={styles.cartItemName}>{item.productName}</Text>
        <Text style={styles.cartItemChef}>by {item.chefName}</Text>
        <Text style={styles.cartItemPrice}>${item.price.toFixed(2)} each</Text>
        {item.specialInstructions && (
          <Text style={styles.specialInstructions}>Note: {item.specialInstructions}</Text>
        )}
      </View>
      <View style={styles.cartItemControls}>
        <View style={styles.quantityControls}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => updateCartItemQuantity(item.id, item.quantity - 1)}
          >
            <Ionicons name="remove" size={16} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.quantityText}>{item.quantity}</Text>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => updateCartItemQuantity(item.id, item.quantity + 1)}
          >
            <Ionicons name="add" size={16} color="#007AFF" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => removeFromCart(item.id)}
        >
          <Ionicons name="trash-outline" size={16} color="#FF3B30" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'active':
        return (
          <FlatList
            data={activeOrders}
            renderItem={renderOrderCard}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons name="calendar-outline" size={64} color="#ccc" />
                <Text style={styles.emptyStateText}>No scheduled orders</Text>
                <Text style={styles.emptyStateSubtext}>Schedule your next meal from local chefs!</Text>
              </View>
            }
          />
        );
      case 'history':
        return (
          <FlatList
            data={historyOrders}
            renderItem={renderOrderCard}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons name="time-outline" size={64} color="#ccc" />
                <Text style={styles.emptyStateText}>No order history</Text>
              </View>
            }
          />
        );
      case 'cart':
        return (
          <View style={styles.cartContent}>
            {cartItems.length > 0 ? (
              <>
                <FlatList
                  data={cartItems}
                  renderItem={renderCartItem}
                  keyExtractor={item => item.id}
                  showsVerticalScrollIndicator={false}
                />
                <View style={styles.cartSummary}>
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Subtotal:</Text>
                    <Text style={styles.totalAmount}>${getCartTotal().toFixed(2)}</Text>
                  </View>
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Service Fee:</Text>
                    <Text style={styles.totalAmount}>$2.99</Text>
                  </View>
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Delivery Fee:</Text>
                    <Text style={styles.totalAmount}>$3.99</Text>
                  </View>
                  <View style={styles.grandTotalRow}>
                    <Text style={styles.grandTotalLabel}>Total:</Text>
                    <Text style={styles.grandTotalAmount}>${(getCartTotal() + 6.98).toFixed(2)}</Text>
                  </View>
                  <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
                    <Text style={styles.checkoutButtonText}>Schedule Order</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="basket-outline" size={64} color="#ccc" />
                <Text style={styles.emptyStateText}>Your cart is empty</Text>
                <Text style={styles.emptyStateSubtext}>Add some delicious items to get started!</Text>
              </View>
            )}
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText style={styles.title}>Scheduled Orders</ThemedText>
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'active' && styles.activeTab]}
            onPress={() => setActiveTab('active')}
          >
            <Text style={[styles.tabText, activeTab === 'active' && styles.activeTabText]}>
              Active ({activeOrders.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'history' && styles.activeTab]}
            onPress={() => setActiveTab('history')}
          >
            <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>
              History
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'cart' && styles.activeTab]}
            onPress={() => setActiveTab('cart')}
          >
            <View style={styles.cartTabContent}>
              <Text style={[styles.tabText, activeTab === 'cart' && styles.activeTabText]}>
                Cart
              </Text>
              {cartItems.length > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{getCartItemCount()}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </View>
      </ThemedView>

      <View style={styles.content}>
        {renderTabContent()}
      </View>

      {/* Checkout Modal with Date/Time Selection */}
      <Modal visible={showCheckout} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <KeyboardAvoidingView 
            style={styles.modalContainer} 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <View style={styles.modalHeader}>
              <TouchableOpacity 
                onPress={() => setShowCheckout(false)}
                style={styles.modalCancelButton}
              >
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Schedule Your Order</Text>
              <TouchableOpacity 
                onPress={processOrder}
                style={styles.modalSaveButton}
              >
                <Text style={styles.modalSaveButtonText}>Place Order</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              {/* Order Summary */}
              <View style={styles.checkoutSection}>
                <Text style={styles.sectionTitle}>Order Summary</Text>
                {cartItems.map((item) => (
                  <View key={item.id} style={styles.orderSummaryItem}>
                    <Text style={styles.orderSummaryName}>{item.quantity}x {item.productName}</Text>
                    <Text style={styles.orderSummaryDetails}>by {item.chefName}</Text>
                  </View>
                ))}
                <View style={styles.orderSummaryTotal}>
                  <Text style={styles.orderSummaryTotalText}>Total: ${(getCartTotal() + 6.98).toFixed(2)}</Text>
                </View>
              </View>

              {/* Date Selection */}
              <View style={styles.checkoutSection}>
                <Text style={styles.sectionTitle}>Select Date</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.dateSelector}>
                    {availableDates.map((date, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.dateOption,
                          checkoutInfo.scheduledDate.toDateString() === date.toDateString() && styles.selectedDateOption
                        ]}
                        onPress={() => setCheckoutInfo(prev => ({ ...prev, scheduledDate: date, timeSlot: '' }))}
                      >
                        <Text style={[
                          styles.dateOptionText,
                          checkoutInfo.scheduledDate.toDateString() === date.toDateString() && styles.selectedDateText
                        ]}>
                          {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </Text>
                        <Text style={[
                          styles.dayText,
                          checkoutInfo.scheduledDate.toDateString() === date.toDateString() && styles.selectedDayText
                        ]}>
                          {date.toLocaleDateString('en-US', { weekday: 'short' })}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>

              {/* Time Slot Selection */}
              <View style={styles.checkoutSection}>
                <Text style={styles.sectionTitle}>Select Time Slot</Text>
                <View style={styles.timeSlotGrid}>
                  {availableTimeSlots.map((slot) => (
                    <TouchableOpacity
                      key={slot.id}
                      style={[
                        styles.timeSlotOption,
                        !slot.available && styles.unavailableSlot,
                        checkoutInfo.timeSlot === slot.label && styles.selectedTimeSlot
                      ]}
                      onPress={() => slot.available && setCheckoutInfo(prev => ({ ...prev, timeSlot: slot.label }))}
                      disabled={!slot.available}
                    >
                      <Text style={[
                        styles.timeSlotText,
                        !slot.available && styles.unavailableText,
                        checkoutInfo.timeSlot === slot.label && styles.selectedTimeSlotText
                      ]}>
                        {slot.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Pickup/Delivery Option */}
              <View style={styles.checkoutSection}>
                <Text style={styles.sectionTitle}>Pickup Option</Text>
                <View style={styles.pickupOptionContainer}>
                  <TouchableOpacity
                    style={[
                      styles.pickupOptionButton,
                      checkoutInfo.pickupOption === 'pickup' && styles.selectedPickupOption
                    ]}
                    onPress={() => setCheckoutInfo(prev => ({ ...prev, pickupOption: 'pickup' }))}
                  >
                    <Text style={[
                      styles.pickupOptionText,
                      checkoutInfo.pickupOption === 'pickup' && styles.selectedPickupText
                    ]}>
                      📍 Pickup
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.pickupOptionButton,
                      checkoutInfo.pickupOption === 'delivery' && styles.selectedPickupOption
                    ]}
                    onPress={() => setCheckoutInfo(prev => ({ ...prev, pickupOption: 'delivery' }))}
                  >
                    <Text style={[
                      styles.pickupOptionText,
                      checkoutInfo.pickupOption === 'delivery' && styles.selectedPickupText
                    ]}>
                      🚚 Delivery (+$3.99)
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Contact Information */}
              <View style={styles.checkoutSection}>
                <Text style={styles.sectionTitle}>Contact Information</Text>
                <View style={styles.fieldContainer}>
                  <Text style={styles.fieldLabel}>Phone Number</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Your phone number"
                    value={checkoutInfo.phoneNumber}
                    onChangeText={(text) => setCheckoutInfo(prev => ({ ...prev, phoneNumber: text }))}
                    keyboardType="phone-pad"
                  />
                </View>
                {checkoutInfo.pickupOption === 'delivery' && (
                  <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>Delivery Address</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="Your delivery address"
                      value={checkoutInfo.deliveryAddress}
                      onChangeText={(text) => setCheckoutInfo(prev => ({ ...prev, deliveryAddress: text }))}
                      multiline
                    />
                  </View>
                )}
              </View>

              {/* Payment Method */}
              <View style={styles.checkoutSection}>
                <Text style={styles.sectionTitle}>Payment Method</Text>
                <View style={styles.paymentMethodContainer}>
                  {(['card', 'digital_wallet', 'cash'] as const).map((method) => (
                    <TouchableOpacity
                      key={method}
                      style={[
                        styles.paymentMethodButton,
                        checkoutInfo.paymentMethod === method && styles.selectedPaymentMethod
                      ]}
                      onPress={() => setCheckoutInfo(prev => ({ ...prev, paymentMethod: method }))}
                    >
                      <Text style={[
                        styles.paymentMethodText,
                        checkoutInfo.paymentMethod === method && styles.selectedPaymentText
                      ]}>
                        {method === 'card' ? '💳 Credit/Debit Card' :
                         method === 'digital_wallet' ? '📱 Apple Pay / Google Pay' : 
                         '💵 Cash on Pickup/Delivery'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Special Instructions */}
              <View style={styles.checkoutSection}>
                <Text style={styles.sectionTitle}>Special Instructions (Optional)</Text>
                <TextInput
                  style={styles.textArea}
                  placeholder="Any special requests or dietary notes..."
                  value={checkoutInfo.specialInstructions}
                  onChangeText={(text) => setCheckoutInfo(prev => ({ ...prev, specialInstructions: text }))}
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.securityNotice}>
                <Ionicons name="shield-checkmark-outline" size={16} color="#34C759" />
                <Text style={styles.securityText}>
                  Your payment information is secure and encrypted
                </Text>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#007AFF',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: '#fff',
  },
  cartTabContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cartBadge: {
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  chefName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  orderPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  orderDetails: {
    marginBottom: 12,
  },
  scheduledTime: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  pickupType: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  specialInstructions: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
  },
  orderActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 8,
  },
  cancelButton: {
    backgroundColor: '#FF3B30',
  },
  reorderButton: {
    backgroundColor: '#007AFF',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  reorderButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#999',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#ccc',
    textAlign: 'center',
  },
  cartContent: {
    flex: 1,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cartItemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  cartItemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  cartItemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  cartItemChef: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  cartItemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  cartItemControls: {
    alignItems: 'center',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 12,
    minWidth: 20,
    textAlign: 'center',
  },
  removeButton: {
    padding: 4,
  },
  cartSummary: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 14,
    color: '#666',
  },
  totalAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  grandTotalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  grandTotalAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  checkoutButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalCancelButton: {
    color: '#007AFF',
    fontSize: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalSaveButton: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  checkoutSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  orderSummaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  orderSummaryName: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  orderSummaryDetails: {
    fontSize: 12,
    color: '#666',
  },
  orderSummaryTotal: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  orderSummaryTotalText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
    textAlign: 'right',
  },
  dateSelector: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  dateOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#fff',
    marginRight: 12,
    minWidth: 80,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedDateOption: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  dateOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  selectedDateText: {
    color: '#fff',
  },
  dayText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  selectedDayText: {
    color: '#fff',
  },
  timeSlotGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeSlotOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    minWidth: '30%',
    alignItems: 'center',
  },
  selectedTimeSlot: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  unavailableSlot: {
    backgroundColor: '#f5f5f5',
    borderColor: '#e0e0e0',
  },
  timeSlotText: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
  },
  selectedTimeSlotText: {
    color: '#fff',
  },
  unavailableText: {
    color: '#999',
  },
  pickupOptionContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  pickupOptionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  selectedPickupOption: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  pickupOptionText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  selectedPickupText: {
    color: '#fff',
  },
  fieldContainer: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#fff',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  paymentMethodContainer: {
    gap: 8,
  },
  paymentMethodButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedPaymentMethod: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  paymentMethodText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  selectedPaymentText: {
    color: '#fff',
  },
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8f0',
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  securityText: {
    fontSize: 12,
    color: '#34C759',
    marginLeft: 8,
    flex: 1,
  },
}); 