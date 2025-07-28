import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  TextInput,
  Modal,
  SafeAreaView,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../../config/api';
import { uploadImageToCloud, processImageForBackend } from '../../utils/imageUpload';

interface Product {
  _id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  images: string[];
  availability: {
    isAvailable: boolean;
    quantity?: number;
  };
  ratings: {
    average: number;
    count: number;
  };
}

interface Vendor {
  _id: string;
  businessName: string;
  businessType: string;
  description: string;
  location: {
    city: string;
    state: string;
  };
  ratings: {
    average: number;
    count: number;
  };
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function VendorScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Other',
    price: '',
    image: '',
    isAvailable: true,
    inventory: '10'
  });

  const [originalImageUri, setOriginalImageUri] = useState<string>('');

  const categories = [
    'Food & Beverages', 'Handmade Crafts', 'Baked Goods', 'Personal Services',
    'Digital Services', 'Home Decor', 'Beauty & Wellness', 'Clothing & Accessories',
    'Pet Services', 'Tutoring & Education', 'Other'
  ];

  // Load user data on component mount
  useEffect(() => {
    loadUserData();
  }, []);

  // Auto-refresh when tab comes into focus
  useFocusEffect(
    React.useCallback(() => {
      if (user) {
        fetchVendorProducts();
      }
    }, [user])
  );

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      const tokenData = await AsyncStorage.getItem('token');
      
      if (userData && tokenData) {
        setUser(JSON.parse(userData));
        setToken(tokenData);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const fetchVendorProducts = async () => {
    if (!user || !token) return;
    
    try {
      setRefreshing(true);
      console.log('🔍 Fetching products for user:', user.email);

      // Get current vendor profile
      const vendorsResponse = await fetch(`${API_BASE_URL}/api/vendors`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
      });

      if (!vendorsResponse.ok) {
        throw new Error(`Failed to fetch vendors: ${vendorsResponse.status}`);
      }

      const vendorsData = await vendorsResponse.json();
      console.log('📋 Vendors data:', vendorsData);

      const currentVendor = vendorsData.data.vendors.find((vendor: any) => vendor.userId._id === user.id);
      
      if (!currentVendor) {
        console.log('⚠️ No vendor profile found for user');
        setProducts([]);
        return;
      }

      console.log('✅ Found vendor profile:', currentVendor.businessName);

      // Fetch products for this vendor
      const productsResponse = await fetch(`${API_BASE_URL}/api/vendors/${currentVendor._id}/products`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
      });

      if (!productsResponse.ok) {
        throw new Error(`Failed to fetch products: ${productsResponse.status}`);
      }

      const productsData = await productsResponse.json();
      console.log('📦 Products for vendor:', productsData.data.products);
      
      setProducts(productsData.data.products || []);
    } catch (error) {
      console.error('Error fetching vendor products:', error);
      Alert.alert('Error', 'Failed to load products. Please try again.');
    } finally {
      setRefreshing(false);
    }
  };

  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (cameraStatus !== 'granted' || mediaStatus !== 'granted') {
      Alert.alert(
        'Permissions Required',
        'Please grant camera and photo library permissions to upload product images.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const pickImageFromCamera = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        setFormData(prev => ({ ...prev, image: imageUri }));
        setOriginalImageUri(imageUri);
        setShowImagePicker(false);
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const pickImageFromGallery = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        setFormData(prev => ({ ...prev, image: imageUri }));
        setOriginalImageUri(imageUri);
        setShowImagePicker(false);
      }
    } catch (error) {
      console.error('Gallery error:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert('Validation Error', 'Product name is required');
      return false;
    }
    if (!formData.description.trim()) {
      Alert.alert('Validation Error', 'Product description is required');
      return false;
    }
    if (!formData.price || isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid price');
      return false;
    }
    if (!formData.image) {
      Alert.alert('Validation Error', 'Product image is required');
      return false;
    }
    return true;
  };

  const handleSaveProduct = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      // Step 1: Get vendor profile
      Alert.alert('Debug', 'Step 1: Getting vendor profile...', [{ text: 'Continue' }]);
      
      const vendorsResponse = await fetch(`${API_BASE_URL}/api/vendors`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!vendorsResponse.ok) {
        throw new Error(`Failed to fetch vendors: ${vendorsResponse.status} ${vendorsResponse.statusText}`);
      }

      const vendorsData = await vendorsResponse.json();
      const currentVendor = vendorsData.data.vendors.find((vendor: any) => vendor.userId._id === user?.id);

      if (!currentVendor) {
        throw new Error('Vendor profile not found. Please create a business profile first.');
      }

      Alert.alert('Debug', `Step 2: Found vendor: ${currentVendor.businessName}`, [{ text: 'Continue' }]);

      // Handle image upload to cloud storage (Data URI)
      let imageUrl = formData.image;
      let uploadedToCloud = false;
      if (formData.image.startsWith('file://') || formData.image.startsWith('content://')) {
        try {
          Alert.alert('Debug', 'Step 3: Uploading image...', [{ text: 'Continue' }]);
          const uploadResult = await uploadImageToCloud(formData.image);
          if (uploadResult.success && uploadResult.url) {
            imageUrl = uploadResult.url;
            uploadedToCloud = true;
            Alert.alert('Debug', `Image uploaded successfully! Size: ${Math.round(uploadResult.url.length / 1024)} KB`, [{ text: 'Continue' }]);
          } else {
            throw new Error(`Image Upload Failed: ${uploadResult.error || 'Unknown error'}`);
          }
        } catch (uploadError) {
          imageUrl = processImageForBackend(formData.image, formData.category);
          console.warn('Image upload failed, using placeholder:', uploadError);
          Alert.alert('Debug', `Image upload failed, using fallback: ${uploadError}`, [{ text: 'Continue' }]);
        }
      }

      // Prepare product data
      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        category: formData.category,
        images: [imageUrl],
        price: Number(formData.price),
        currency: 'USD',
        availability: { 
          isAvailable: formData.isAvailable, 
          maxOrdersPerDay: Number(formData.inventory) || 10, 
          advanceOrderDays: 0 
        },
        tags: [],
        specifications: {},
        ratings: { average: 0, count: 0 }
      };

      Alert.alert('Debug', `Step 4: Calling API with data: ${JSON.stringify({
        ...productData,
        images: [`${uploadedToCloud ? 'Data URI' : 'URL'} (${imageUrl.substring(0, 50)}...)`]
      }, null, 2)}`, [{ text: 'Continue' }]);

      // Create/Update product via API
      let response;
      if (editingProduct) {
        response = await fetch(`${API_BASE_URL}/api/products/${editingProduct._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(productData)
        });
      } else {
        response = await fetch(`${API_BASE_URL}/api/products`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            ...productData,
            vendorId: currentVendor._id
          })
        });
      }

      if (response.ok) {
        Alert.alert('Success', editingProduct ? 'Product updated successfully' : 'Product added successfully');
        setShowProductModal(false);
        resetForm();
        fetchVendorProducts(); // Refresh the products list
      } else {
        const errorData = await response.json();
        throw new Error(`API Error (${response.status}): ${errorData.message || response.statusText}`);
      }
    } catch (error) {
      const err = error as any;
      Alert.alert('Product Save Failed', 
        `Details: ${err.message || 'Unknown error'}\n\nUser: ${user?.email}\nRole: ${user?.role}\n\nTechnical Info:\n${err.stack ? err.stack.substring(0, 100) + '...' : 'No stack'}\n\nPlease screenshot this and let me know what you were doing when this happened.`,
        [{ text: 'Copy Error', onPress: () => console.log('Error details:', err) }, { text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        Alert.alert('Success', 'Product deleted successfully');
        fetchVendorProducts(); // Refresh the list
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete product');
      }
    } catch (error) {
      console.error('Delete product error:', error);
      Alert.alert('Error', 'Failed to delete product. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: 'Other',
      price: '',
      image: '',
      isAvailable: true,
      inventory: '10'
    });
    setOriginalImageUri('');
    setEditingProduct(null);
  };

  const openProductModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description,
        category: product.category,
        price: product.price.toString(),
        image: product.images[0] || '',
        isAvailable: product.availability.isAvailable,
        inventory: (product.availability.quantity || 10).toString()
      });
      setOriginalImageUri(product.images[0] || '');
    } else {
      resetForm();
    }
    setShowProductModal(true);
  };

  const getProductImage = (product: Product) => {
    const imageUri = originalImageUri || product.images[0];
    
    if (!imageUri) {
      return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&h=200&fit=crop&crop=center';
    }
    
    // For local images, show the original URI to the vendor
    if (imageUri.startsWith('file://') || imageUri.startsWith('content://')) {
      return imageUri;
    }
    
    // For Unsplash images, add auto-format and quality params
    if (imageUri.includes('unsplash.com')) {
      return `${imageUri}&auto=format&q=80`;
    }
    
    return imageUri;
  };

  if (!user || user.role !== 'chef') { // Using chef role for business owners
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.notAuthorized}>
          <Ionicons name="briefcase-outline" size={80} color="#ccc" />
          <Text style={styles.notAuthorizedText}>Business Owner Access Required</Text>
          <Text style={styles.notAuthorizedSubtext}>
            Please contact support to enable business features for your account.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Business</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => openProductModal()}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchVendorProducts} />
        }
      >
        {/* Products Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Products ({products.length})</Text>
          
          {products.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="cube-outline" size={60} color="#ccc" />
              <Text style={styles.emptyStateText}>No products yet</Text>
              <Text style={styles.emptyStateSubtext}>
                Add your first product to start selling
              </Text>
            </View>
          ) : (
            products.map((product) => (
              <View key={product._id} style={styles.productCard}>
                <Image 
                  source={{ uri: getProductImage(product) }} 
                  style={styles.productImage}
                  onError={(error) => {
                    console.log('Product image error:', error.nativeEvent.error);
                  }}
                />
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{product.name}</Text>
                  <Text style={styles.productDescription} numberOfLines={2}>
                    {product.description}
                  </Text>
                  <Text style={styles.productPrice}>${product.price}</Text>
                  <View style={styles.productMeta}>
                    <Text style={styles.productCategory}>{product.category}</Text>
                    <Text style={[
                      styles.productStatus,
                      { color: product.availability.isAvailable ? '#4CAF50' : '#F44336' }
                    ]}>
                      {product.availability.isAvailable ? 'Available' : 'Unavailable'}
                    </Text>
                  </View>
                </View>
                <View style={styles.productActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => openProductModal(product)}
                  >
                    <Ionicons name="pencil" size={20} color="#007AFF" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => {
                      Alert.alert(
                        'Delete Product',
                        `Are you sure you want to delete "${product.name}"?`,
                        [
                          { text: 'Cancel', style: 'cancel' },
                          { 
                            text: 'Delete', 
                            style: 'destructive',
                            onPress: () => handleDeleteProduct(product._id)
                          }
                        ]
                      );
                    }}
                  >
                    <Ionicons name="trash" size={20} color="#F44336" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Product Modal */}
      <Modal
        visible={showProductModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowProductModal(false)}>
              <Ionicons name="close" size={24} color="#007AFF" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingProduct ? 'Edit Product' : 'Add Product'}
            </Text>
            <TouchableOpacity 
              onPress={handleSaveProduct}
              disabled={loading}
              style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            >
              <Text style={styles.saveButtonText}>
                {loading ? 'Saving...' : 'Save'}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Product Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Product Name *</Text>
              <TextInput
                style={styles.textInput}
                value={formData.name}
                onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                placeholder="Enter product name"
                maxLength={100}
              />
            </View>

            {/* Product Description */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description *</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={formData.description}
                onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                placeholder="Describe your product"
                multiline
                numberOfLines={4}
                maxLength={500}
              />
            </View>

            {/* Category */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Category *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categoryButton,
                      formData.category === category && styles.categoryButtonSelected
                    ]}
                    onPress={() => setFormData(prev => ({ ...prev, category }))}
                  >
                    <Text
                      style={[
                        styles.categoryButtonText,
                        formData.category === category && styles.categoryButtonTextSelected
                      ]}
                    >
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Price */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Price ($) *</Text>
              <TextInput
                style={styles.textInput}
                value={formData.price}
                onChangeText={(text) => setFormData(prev => ({ ...prev, price: text }))}
                placeholder="0.00"
                keyboardType="decimal-pad"
              />
            </View>

            {/* Image */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Product Image *</Text>
              <TouchableOpacity
                style={styles.imageContainer}
                onPress={() => setShowImagePicker(true)}
              >
                {formData.image ? (
                  <Image 
                    source={{ uri: originalImageUri || formData.image }} 
                    style={styles.selectedImage} 
                  />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <Ionicons name="camera" size={40} color="#ccc" />
                    <Text style={styles.imagePlaceholderText}>Add Photo</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Inventory */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Daily Capacity</Text>
              <TextInput
                style={styles.textInput}
                value={formData.inventory}
                onChangeText={(text) => setFormData(prev => ({ ...prev, inventory: text }))}
                placeholder="10"
                keyboardType="number-pad"
              />
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Image Picker Modal */}
      <Modal
        visible={showImagePicker}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.imagePickerModal}>
          <View style={styles.imagePickerContent}>
            <Text style={styles.imagePickerTitle}>Select Image</Text>
            
            <TouchableOpacity
              style={styles.imagePickerOption}
              onPress={pickImageFromCamera}
            >
              <Ionicons name="camera" size={24} color="#007AFF" />
              <Text style={styles.imagePickerOptionText}>Take Photo</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.imagePickerOption}
              onPress={pickImageFromGallery}
            >
              <Ionicons name="images" size={24} color="#007AFF" />
              <Text style={styles.imagePickerOptionText}>Choose from Gallery</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.imagePickerOption}
              onPress={() => {
                setFormData(prev => ({ 
                  ...prev, 
                  image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&h=200&fit=crop&crop=center' 
                }));
                setOriginalImageUri('');
                setShowImagePicker(false);
              }}
            >
              <Ionicons name="image" size={24} color="#007AFF" />
              <Text style={styles.imagePickerOptionText}>Use Sample Image</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.imagePickerOption, styles.imagePickerCancel]}
              onPress={() => setShowImagePicker(false)}
            >
              <Text style={styles.imagePickerCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#007AFF',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 15,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 5,
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  productInfo: {
    flex: 1,
    marginLeft: 15,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  productDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 5,
  },
  productMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productCategory: {
    fontSize: 12,
    color: '#999',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  productStatus: {
    fontSize: 12,
    fontWeight: '600',
  },
  productActions: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  actionButton: {
    padding: 8,
    marginVertical: 2,
  },
  notAuthorized: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  notAuthorizedText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 20,
    textAlign: 'center',
  },
  notAuthorizedSubtext: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 24,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  inputGroup: {
    marginVertical: 15,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  categoryScroll: {
    marginTop: 5,
  },
  categoryButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 10,
  },
  categoryButtonSelected: {
    backgroundColor: '#007AFF',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#666',
  },
  categoryButtonTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  imageContainer: {
    marginTop: 5,
  },
  selectedImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  imagePlaceholder: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
  },
  imagePlaceholderText: {
    fontSize: 16,
    color: '#999',
    marginTop: 10,
  },
  imagePickerModal: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  imagePickerContent: {
    backgroundColor: '#fff',
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  imagePickerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  imagePickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  imagePickerOptionText: {
    fontSize: 16,
    color: '#007AFF',
    marginLeft: 15,
  },
  imagePickerCancel: {
    justifyContent: 'center',
    borderBottomWidth: 0,
    marginTop: 10,
  },
  imagePickerCancelText: {
    fontSize: 16,
    color: '#F44336',
    textAlign: 'center',
  },
}); 