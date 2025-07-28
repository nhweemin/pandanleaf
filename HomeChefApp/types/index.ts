export interface Product {
  id: string;
  name: string;
  chef: string;
  price: number;
  image: string;
  rating: number;
  cookTime: string;
  category: string;
}

export interface Chef {
  id: string;
  name: string;
  bio: string;
  rating: number;
  image: string;
  location: string;
  specialties: string[];
}

export interface Order {
  id: string;
  productId: string;
  productName: string;
  chefName: string;
  quantity: number;
  price: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  orderDate: Date;
  scheduledDate: Date;
  timeSlot: string;
  pickupOption: 'pickup' | 'delivery';
  specialInstructions?: string;
}

export interface TimeSlot {
  id: string;
  label: string;
  startTime: string;
  endTime: string;
  available: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  isChef: boolean;
  profileImage?: string;
}

export interface CartItem {
  productId: string;
  quantity: number;
  price: number;
}

export type Category = 'All' | 'Main Course' | 'Desserts' | 'Snacks' | 'Soups' | 'Salads' | 'Beverages' | 'Breakfast' | 'Lunch' | 'Dinner' | 'Italian' | 'Korean' | 'Thai' | 'Indian' | 'Malay' | 'Dessert' | 'Mexican' | 'Breads' | 'Cakes' | 'Pastries' | 'Cookies'; 