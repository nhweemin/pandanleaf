import React, { useState, useEffect } from 'react';
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
  ActivityIndicator,
  Modal,
  TextInput
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import { Chef, Order } from '@/types';
import { useAuth } from '../../contexts/AuthContext';

// Types for API responses
interface ChefData {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  businessName: string;
  description?: string;
  specialties: string[];
  serviceArea: {
    cities: string[];
  };
  rating: {
    average: number;
    count: number;
  };
  verification: {
    status: string;
    submittedAt: string;
  };
  isApproved: boolean;
}

interface PlatformStats {
  users: {
    total: number;
    customers: number;
    chefs: number;
    admins: number;
  };
  chefs: {
    total: number;
    approved: number;
    pending: number;
    active: number;
  };
  products: {
    total: number;
    active: number;
    available: number;
  };
  orders: {
    total: number;
    pending: number;
    completed: number;
    cancelled: number;
    recent: number;
  };
  revenue: {
    total: number;
    averageOrderValue: number;
  };
}

interface CreateChefForm {
  name: string;
  email: string;
  password: string;
  phone: string;
  businessName: string;
  description: string;
  specialties: string;
  cities: string;
}

const API_BASE_URL = 'https://pandanleaf-production.up.railway.app';

export default function AdminScreen() {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'chefs' | 'applications' | 'orders'>('dashboard');
  const [pendingChefs, setPendingChefs] = useState<ChefData[]>([]);
  const [approvedChefs, setApprovedChefs] = useState<ChefData[]>([]);
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createChefForm, setCreateChefForm] = useState<CreateChefForm>({
    name: '',
    email: '',
    password: '',
    phone: '',
    businessName: '',
    description: '',
    specialties: '',
    cities: '',
  });
  const [createLoading, setCreateLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch platform statistics
      const statsResponse = await fetch(`${API_BASE_URL}/api/admin/stats`);
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setPlatformStats(statsData.data);
      }

      // Fetch pending chefs
      const pendingResponse = await fetch(`${API_BASE_URL}/api/admin/chefs/pending`);
      if (pendingResponse.ok) {
        const pendingData = await pendingResponse.json();
        setPendingChefs(pendingData.data.chefs || []);
      }

      // Fetch approved chefs
      const chefsResponse = await fetch(`${API_BASE_URL}/api/chefs`);
      if (chefsResponse.ok) {
        const chefsData = await chefsResponse.json();
        setApprovedChefs(chefsData.data.chefs || []);
      }

      // Fetch recent orders
      const ordersResponse = await fetch(`${API_BASE_URL}/api/admin/orders?limit=10`);
      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json();
        // Transform the API order data to match our Order interface
        const transformedOrders = ordersData.data.orders.map((order: any) => ({
          id: order._id,
          productId: order.items[0]?.productId._id || '',
          productName: order.items[0]?.productId.name || 'Unknown Product',
          chefName: order.chefId?.businessName || 'Unknown Chef',
          quantity: order.items.reduce((sum: number, item: any) => sum + item.quantity, 0),
          price: order.pricing.total,
          status: order.status,
          orderDate: new Date(order.timeline.placedAt),
          deliveryDate: new Date(order.delivery.estimatedDelivery)
        }));
        setRecentOrders(transformedOrders);
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
      Alert.alert('Error', 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveChef = async (chefId: string) => {
    Alert.alert(
      'Approve Chef',
      'Are you sure you want to approve this chef application?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          onPress: async () => {
            try {
              const response = await fetch(`${API_BASE_URL}/api/admin/chefs/${chefId}/approve`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                  status: 'approved',
                  reviewNotes: 'Approved via mobile admin panel',
                  reviewedBy: user?.name || 'Admin'
                }),
              });

              if (response.ok) {
                Alert.alert('Success', 'Chef approved successfully');
                fetchData(); // Refresh data
              } else {
                const errorData = await response.json();
                Alert.alert('Error', errorData.message || 'Failed to approve chef');
              }
            } catch (error) {
              console.error('Chef approval error:', error);
              Alert.alert('Error', 'Network error: Failed to approve chef');
            }
          }
        }
      ]
    );
  };

  const handleRejectChef = async (chefId: string) => {
    Alert.alert(
      'Reject Chef',
      'Are you sure you want to reject this chef application?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reject', 
          style: 'destructive', 
          onPress: async () => {
            try {
              const response = await fetch(`${API_BASE_URL}/api/admin/chefs/${chefId}/approve`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                  status: 'rejected',
                  reviewNotes: 'Rejected via mobile admin panel',
                  reviewedBy: user?.name || 'Admin'
                }),
              });

              if (response.ok) {
                Alert.alert('Success', 'Chef application rejected');
                fetchData(); // Refresh data
              } else {
                const errorData = await response.json();
                Alert.alert('Error', errorData.message || 'Failed to reject chef');
              }
            } catch (error) {
              console.error('Chef rejection error:', error);
              Alert.alert('Error', 'Network error: Failed to reject chef');
            }
          }
        }
      ]
    );
  };

  const handleDeleteChef = async (chef: ChefData) => {
    Alert.alert(
      'Delete Chef',
      `Are you sure you want to permanently delete ${chef.businessName}? This action cannot be undone and will also delete their user account.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              let chefDeleted = false;
              let userDeleted = false;
              let errorMessage = '';

              // First delete the chef profile
              const chefResponse = await fetch(`${API_BASE_URL}/api/chefs/${chef._id}`, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${token}`,
                },
              });

              if (chefResponse.ok) {
                chefDeleted = true;
              } else {
                const chefError = await chefResponse.json();
                errorMessage += `Chef profile deletion failed: ${chefError.message || 'Unknown error'}. `;
              }

              // Then delete the user account
              const userResponse = await fetch(`${API_BASE_URL}/api/users/${chef.userId._id}`, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${token}`,
                },
              });

              if (userResponse.ok) {
                userDeleted = true;
              } else {
                const userError = await userResponse.json();
                errorMessage += `User account deletion failed: ${userError.message || 'Unknown error'}.`;
              }

              if (chefDeleted && userDeleted) {
                Alert.alert('Success', `${chef.businessName} has been completely deleted successfully`);
                fetchData(); // Refresh data
              } else if (chefDeleted || userDeleted) {
                Alert.alert(
                  'Partial Success', 
                  `${chef.businessName} was partially deleted. ${errorMessage} Please check manually.`
                );
                fetchData(); // Still refresh to see changes
              } else {
                Alert.alert('Error', `Failed to delete ${chef.businessName}. ${errorMessage}`);
              }
            } catch (error) {
              console.error('Delete chef error:', error);
              Alert.alert('Error', `Network error while deleting ${chef.businessName}. Please check your connection and try again.`);
            }
          }
        }
      ]
    );
  };

  const handleCreateChef = async () => {
    // Validate form
    if (!createChefForm.name || !createChefForm.email || !createChefForm.password || 
        !createChefForm.businessName || !createChefForm.specialties || !createChefForm.cities) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      setCreateLoading(true);

      // Step 1: Create user account
      const userResponse = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: createChefForm.name,
          email: createChefForm.email,
          password: createChefForm.password,
          phone: createChefForm.phone || '',
          role: 'chef'
        }),
      });

      if (!userResponse.ok) {
        const errorData = await userResponse.json();
        Alert.alert('Error', errorData.message || 'Failed to create user account');
        return;
      }

      const userData = await userResponse.json();
      const userId = userData.data.user.id;

      // Step 2: Create chef profile
      const chefResponse = await fetch(`${API_BASE_URL}/api/chefs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          businessName: createChefForm.businessName,
          description: createChefForm.description,
          specialties: createChefForm.specialties.split(',').map(s => s.trim()),
          serviceArea: {
            cities: createChefForm.cities.split(',').map(c => c.trim())
          },
          experience: 'Created by admin',
          availability: {
            schedule: {
              monday: { isAvailable: true, timeSlots: [] },
              tuesday: { isAvailable: true, timeSlots: [] },
              wednesday: { isAvailable: true, timeSlots: [] },
              thursday: { isAvailable: true, timeSlots: [] },
              friday: { isAvailable: true, timeSlots: [] },
              saturday: { isAvailable: true, timeSlots: [] },
              sunday: { isAvailable: true, timeSlots: [] }
            }
          },
          pricing: {
            deliveryFee: 5.00,
            minimumOrder: 20.00
          }
        }),
      });

      if (!chefResponse.ok) {
        Alert.alert('Error', 'Failed to create chef profile');
        return;
      }

      const chefData = await chefResponse.json();
      const chefId = chefData.data.chef._id;

      // Step 3: Auto-approve the chef
      const approveResponse = await fetch(`${API_BASE_URL}/api/admin/chefs/${chefId}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'approved',
          reviewNotes: 'Auto-approved - Created by admin',
          reviewedBy: 'Admin'
        }),
      });

      if (approveResponse.ok) {
        Alert.alert('Success', `Chef ${createChefForm.businessName} has been created and approved successfully!`);
        setShowCreateModal(false);
        setCreateChefForm({
          name: '',
          email: '',
          password: '',
          phone: '',
          businessName: '',
          description: '',
          specialties: '',
          cities: '',
        });
        fetchData(); // Refresh data
      } else {
        Alert.alert('Warning', 'Chef created but approval failed. Please approve manually.');
        setShowCreateModal(false);
        fetchData();
      }

    } catch (error) {
      console.error('Create chef error:', error);
      Alert.alert('Error', 'Failed to create chef');
    } finally {
      setCreateLoading(false);
    }
  };

  const renderPendingChef: ListRenderItem<ChefData> = ({ item }) => (
    <View style={styles.chefCard}>
      <View style={styles.chefInfo}>
        <Text style={styles.chefName}>{item.businessName}</Text>
        <Text style={styles.chefLocation}>{item.serviceArea.cities.join(', ')}</Text>
        <Text style={styles.chefSpecialties}>Specialties: {item.specialties.join(', ')}</Text>
        <Text style={styles.chefBio} numberOfLines={2}>{item.description || 'No description available'}</Text>
        <Text style={styles.submissionDate}>
          Submitted: {new Date(item.verification.submittedAt).toLocaleDateString()}
        </Text>
      </View>
      <View style={styles.chefActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.approveButton]}
          onPress={() => handleApproveChef(item._id)}
        >
          <Ionicons name="checkmark" size={16} color="#fff" />
          <Text style={styles.approveButtonText}>Approve</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.rejectButton]}
          onPress={() => handleRejectChef(item._id)}
        >
          <Ionicons name="close" size={16} color="#fff" />
          <Text style={styles.rejectButtonText}>Reject</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderApprovedChef: ListRenderItem<ChefData> = ({ item }) => (
    <View style={styles.chefCard}>
      <View style={styles.chefInfo}>
        <View style={styles.chefHeader}>
          <Text style={styles.chefName}>{item.businessName}</Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={16} color="#FFD700" />
            <Text style={styles.rating}>{item.rating.average.toFixed(1)}</Text>
          </View>
        </View>
        <Text style={styles.chefLocation}>{item.serviceArea.cities.join(', ')}</Text>
        <Text style={styles.chefSpecialties}>Specialties: {item.specialties.join(', ')}</Text>
        <Text style={styles.ratingCount}>({item.rating.count} reviews)</Text>
        <Text style={styles.chefEmail}>Email: {item.userId.email}</Text>
      </View>
      <View style={styles.chefActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.viewButton]}
          onPress={() => Alert.alert('View Details', `View ${item.businessName}'s profile and analytics`)}
        >
          <Ionicons name="eye" size={14} color="#fff" />
          <Text style={styles.viewButtonText}>View</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteChef(item)}
        >
          <Ionicons name="trash" size={14} color="#fff" />
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderRecentOrder: ListRenderItem<Order> = ({ item }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderInfo}>
        <Text style={styles.orderProduct}>{item.productName}</Text>
        <Text style={styles.orderChef}>by {item.chefName}</Text>
        <Text style={styles.orderPrice}>${item.price.toFixed(2)}</Text>
      </View>
      <View style={styles.orderStatus}>
        <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
          {item.status.toUpperCase()}
        </Text>
        <Text style={styles.orderDate}>{item.orderDate.toLocaleDateString()}</Text>
      </View>
    </View>
  );

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return '#FF9500';
      case 'confirmed': return '#007AFF';
      case 'preparing': return '#007AFF';
      case 'ready': return '#34C759';
      case 'completed': return '#8E8E93';
      case 'cancelled': return '#FF3B30';
      default: return '#8E8E93';
    }
  };

  const renderDashboard = () => (
    <ScrollView style={styles.dashboardContent}>
      <Text style={styles.sectionTitle}>Platform Overview</Text>
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, styles.primaryStatCard]}>
          <Ionicons name="trending-up" size={32} color="#007AFF" />
          <Text style={styles.statValue}>${platformStats?.revenue.total.toLocaleString() || 'N/A'}</Text>
          <Text style={styles.statLabel}>Monthly Revenue</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="people" size={32} color="#34C759" />
          <Text style={styles.statValue}>{platformStats?.chefs.total || 0}</Text>
          <Text style={styles.statLabel}>Total Chefs</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="bag" size={32} color="#FF9500" />
          <Text style={styles.statValue}>{platformStats?.orders.total || 0}</Text>
          <Text style={styles.statLabel}>Total Orders</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="star" size={32} color="#FFD700" />
          <Text style={styles.statValue}>{platformStats?.revenue.averageOrderValue.toFixed(2) || 'N/A'}</Text>
          <Text style={styles.statLabel}>Avg Order Value</Text>
        </View>
      </View>

      <View style={styles.financialSummary}>
        <Text style={styles.sectionTitle}>Financial Summary</Text>
        <View style={styles.financialCard}>
          <View style={styles.financialRow}>
            <Text style={styles.financialLabel}>Commission Earned</Text>
            <Text style={styles.financialValue}>${platformStats?.revenue.total.toLocaleString() || 'N/A'}</Text>
          </View>
          <View style={styles.financialRow}>
            <Text style={styles.financialLabel}>Active Chefs</Text>
            <Text style={styles.financialValue}>{platformStats?.chefs.active || 0}</Text>
          </View>
          <View style={styles.financialRow}>
            <Text style={styles.financialLabel}>Customer Satisfaction</Text>
            <Text style={styles.financialValue}>{platformStats?.revenue.averageOrderValue.toFixed(2) || 'N/A'}</Text>
          </View>
        </View>
      </View>

      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionButtonsGrid}>
          <TouchableOpacity style={styles.quickActionButton}>
            <Ionicons name="notifications" size={24} color="#007AFF" />
            <Text style={styles.quickActionText}>Send Announcement</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionButton}>
            <Ionicons name="analytics" size={24} color="#007AFF" />
            <Text style={styles.quickActionText}>View Analytics</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionButton}>
            <Ionicons name="document-text" size={24} color="#007AFF" />
            <Text style={styles.quickActionText}>Generate Report</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionButton}>
            <Ionicons name="settings" size={24} color="#007AFF" />
            <Text style={styles.quickActionText}>Platform Settings</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ThemedView style={styles.header}>
          <ThemedText style={styles.title}>Platform Admin</ThemedText>
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'dashboard' && styles.activeTab]}
              onPress={() => setActiveTab('dashboard')}
            >
              <Text style={[styles.tabText, activeTab === 'dashboard' && styles.activeTabText]}>
                Dashboard
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'applications' && styles.activeTab]}
              onPress={() => setActiveTab('applications')}
            >
              <Text style={[styles.tabText, activeTab === 'applications' && styles.activeTabText]}>
                Applications ({pendingChefs.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'chefs' && styles.activeTab]}
              onPress={() => setActiveTab('chefs')}
            >
              <Text style={[styles.tabText, activeTab === 'chefs' && styles.activeTabText]}>
                Chefs
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'orders' && styles.activeTab]}
              onPress={() => setActiveTab('orders')}
            >
              <Text style={[styles.tabText, activeTab === 'orders' && styles.activeTabText]}>
                Orders
              </Text>
            </TouchableOpacity>
          </View>
        </ThemedView>
        <View style={styles.content}>
          <ActivityIndicator size="large" color="#007AFF" style={{ flex: 1 }} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText style={styles.title}>Platform Admin</ThemedText>
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'dashboard' && styles.activeTab]}
            onPress={() => setActiveTab('dashboard')}
          >
            <Text style={[styles.tabText, activeTab === 'dashboard' && styles.activeTabText]}>
              Dashboard
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'applications' && styles.activeTab]}
            onPress={() => setActiveTab('applications')}
          >
            <Text style={[styles.tabText, activeTab === 'applications' && styles.activeTabText]}>
              Applications ({loading ? '...' : pendingChefs.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'chefs' && styles.activeTab]}
            onPress={() => setActiveTab('chefs')}
          >
            <Text style={[styles.tabText, activeTab === 'chefs' && styles.activeTabText]}>
              Chefs
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'orders' && styles.activeTab]}
            onPress={() => setActiveTab('orders')}
          >
            <Text style={[styles.tabText, activeTab === 'orders' && styles.activeTabText]}>
              Orders
            </Text>
          </TouchableOpacity>
        </View>
      </ThemedView>

      <View style={styles.content}>
        {activeTab === 'dashboard' && renderDashboard()}
        
        {activeTab === 'applications' && (
          <View style={styles.tabContent}>
            <Text style={styles.contentTitle}>Pending Chef Applications</Text>
            <FlatList
              data={pendingChefs}
              renderItem={renderPendingChef}
              keyExtractor={item => item._id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContainer}
            />
          </View>
        )}
        
        {activeTab === 'chefs' && (
          <View style={styles.tabContent}>
            <View style={styles.chefsHeader}>
              <Text style={styles.contentTitle}>Approved Chefs</Text>
              <TouchableOpacity
                style={styles.createButton}
                onPress={() => setShowCreateModal(true)}
              >
                <Ionicons name="add" size={20} color="#fff" />
                <Text style={styles.createButtonText}>Create Chef</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={approvedChefs}
              renderItem={renderApprovedChef}
              keyExtractor={item => item._id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContainer}
            />
          </View>
        )}
        
        {activeTab === 'orders' && (
          <View style={styles.tabContent}>
            <Text style={styles.contentTitle}>Recent Orders</Text>
            <FlatList
              data={recentOrders}
              renderItem={renderRecentOrder}
              keyExtractor={item => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContainer}
            />
          </View>
        )}
      </View>

      {/* Create Chef Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowCreateModal(false)}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Create New Chef</Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Personal Information</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name *</Text>
                <TextInput
                  style={styles.textInput}
                  value={createChefForm.name}
                  onChangeText={(text) => setCreateChefForm({...createChefForm, name: text})}
                  placeholder="Enter chef's full name"
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email *</Text>
                <TextInput
                  style={styles.textInput}
                  value={createChefForm.email}
                  onChangeText={(text) => setCreateChefForm({...createChefForm, email: text})}
                  placeholder="Enter email address"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Password *</Text>
                <TextInput
                  style={styles.textInput}
                  value={createChefForm.password}
                  onChangeText={(text) => setCreateChefForm({...createChefForm, password: text})}
                  placeholder="Enter password"
                  secureTextEntry
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Phone</Text>
                <TextInput
                  style={styles.textInput}
                  value={createChefForm.phone}
                  onChangeText={(text) => setCreateChefForm({...createChefForm, phone: text})}
                  placeholder="Enter phone number"
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Business Information</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Business Name *</Text>
                <TextInput
                  style={styles.textInput}
                  value={createChefForm.businessName}
                  onChangeText={(text) => setCreateChefForm({...createChefForm, businessName: text})}
                  placeholder="Enter business/kitchen name"
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={createChefForm.description}
                  onChangeText={(text) => setCreateChefForm({...createChefForm, description: text})}
                  placeholder="Brief description of the chef's cooking style"
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Specialties *</Text>
                <TextInput
                  style={styles.textInput}
                  value={createChefForm.specialties}
                  onChangeText={(text) => setCreateChefForm({...createChefForm, specialties: text})}
                  placeholder="e.g., Italian, Asian, Desserts (comma separated)"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Service Cities *</Text>
                <TextInput
                  style={styles.textInput}
                  value={createChefForm.cities}
                  onChangeText={(text) => setCreateChefForm({...createChefForm, cities: text})}
                  placeholder="e.g., Singapore, Kuala Lumpur (comma separated)"
                />
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowCreateModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={handleCreateChef}
                disabled={createLoading}
              >
                {createLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="person-add" size={16} color="#fff" />
                    <Text style={styles.submitButtonText}>Create Chef</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 4,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#007AFF',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
  },
  activeTabText: {
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
    padding: 20,
  },
  contentTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  dashboardContent: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    width: '48%',
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryStatCard: {
    backgroundColor: '#f0f8ff',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  financialSummary: {
    marginBottom: 24,
  },
  financialCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  financialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  financialLabel: {
    fontSize: 16,
    color: '#333',
  },
  financialValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  quickActions: {
    marginBottom: 24,
  },
  actionButtonsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    width: '48%',
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginTop: 8,
    textAlign: 'center',
  },
  listContainer: {
    paddingBottom: 20,
  },
  chefCard: {
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
  chefInfo: {
    marginBottom: 16,
  },
  chefHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  chefName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  chefLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  chefSpecialties: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 8,
  },
  chefBio: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 16,
    color: '#333',
    marginLeft: 4,
    fontWeight: 'bold',
  },
  chefEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  chefActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 80,
    justifyContent: 'center',
  },
  approveButton: {
    backgroundColor: '#34C759',
    marginRight: 8,
  },
  approveButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  rejectButton: {
    backgroundColor: '#FF3B30',
  },
  rejectButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  viewButton: {
    backgroundColor: '#007AFF',
    marginRight: 8,
  },
  viewButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderInfo: {
    flex: 1,
  },
  orderProduct: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  orderChef: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  orderPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  orderStatus: {
    alignItems: 'flex-end',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 12,
    color: '#999',
  },
  submissionDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
  },
  ratingCount: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  chefsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#34C759',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  formSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 20,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 8,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#007AFF',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 6,
  },
}); 