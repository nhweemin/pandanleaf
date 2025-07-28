import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Alert,
  Switch
} from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';

// Mock user data
const mockUser = {
  id: '1',
  name: 'John Doe',
  email: 'john.doe@example.com',
  phone: '+1 234-567-8900',
  address: '123 Main St, New York, NY 10001',
  isChef: false,
  profileImage: 'https://via.placeholder.com/150x150?text=Profile',
  joinDate: new Date('2023-06-15')
};

const menuItems = [
  {
    id: 'orders',
    title: 'My Orders',
    icon: 'bag-outline',
    description: 'View order history and track current orders',
    showChevron: true
  },
  {
    id: 'favorites',
    title: 'Favorites',
    icon: 'heart-outline',
    description: 'Your favorite dishes and chefs',
    showChevron: true
  },
  {
    id: 'addresses',
    title: 'Delivery Addresses',
    icon: 'location-outline',
    description: 'Manage your delivery locations',
    showChevron: true
  },
  {
    id: 'payment',
    title: 'Payment Methods',
    icon: 'card-outline',
    description: 'Add and manage payment methods',
    showChevron: true
  },
  {
    id: 'notifications',
    title: 'Notifications',
    icon: 'notifications-outline',
    description: 'Notification preferences',
    showChevron: false,
    showSwitch: true
  },
  {
    id: 'privacy',
    title: 'Privacy Settings',
    icon: 'shield-outline',
    description: 'Control your privacy and data',
    showChevron: true
  },
  {
    id: 'help',
    title: 'Help & Support',
    icon: 'help-circle-outline',
    description: 'Get help and contact support',
    showChevron: true
  },
  {
    id: 'about',
    title: 'About',
    icon: 'information-circle-outline',
    description: 'App version and information',
    showChevron: true
  }
];

export default function ProfileScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleMenuItemPress = (itemId: string) => {
    switch (itemId) {
      case 'orders':
        Alert.alert('Orders', 'Navigate to orders screen');
        break;
      case 'favorites':
        Alert.alert('Favorites', 'Navigate to favorites screen');
        break;
      case 'addresses':
        Alert.alert('Addresses', 'Navigate to addresses screen');
        break;
      case 'payment':
        Alert.alert('Payment', 'Navigate to payment methods screen');
        break;
      case 'privacy':
        Alert.alert('Privacy', 'Navigate to privacy settings');
        break;
      case 'help':
        Alert.alert('Help', 'Navigate to help and support');
        break;
      case 'about':
        Alert.alert('About', 'HomeChef App v1.0.0');
        break;
      default:
        break;
    }
  };

  const handleEditProfile = () => {
    Alert.alert('Edit Profile', 'Profile editing form would open here');
  };

  const handleBecomeChef = () => {
    Alert.alert(
      'Become a Chef',
      'Are you interested in becoming a home chef and selling your delicious creations?',
      [
        { text: 'Not Now', style: 'cancel' },
        { text: 'Yes, Tell Me More', onPress: () => console.log('Navigate to chef onboarding') }
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive', 
          onPress: () => {
            console.log('User logged out');
            // Navigate back to welcome screen
            router.replace('/');
          }
        }
      ]
    );
  };

  const handleLogin = () => {
    router.push('/(auth)/login');
  };

  const renderMenuItem = (item: typeof menuItems[0]) => (
    <TouchableOpacity
      key={item.id}
      style={styles.menuItem}
      onPress={() => handleMenuItemPress(item.id)}
      disabled={item.showSwitch}
    >
      <View style={styles.menuItemLeft}>
        <View style={styles.menuItemIcon}>
          <Ionicons name={item.icon as any} size={24} color="#007AFF" />
        </View>
        <View style={styles.menuItemContent}>
          <Text style={styles.menuItemTitle}>{item.title}</Text>
          <Text style={styles.menuItemDescription}>{item.description}</Text>
        </View>
      </View>
      <View style={styles.menuItemRight}>
        {item.showSwitch && (
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: '#767577', true: '#007AFF' }}
            thumbColor={notificationsEnabled ? '#ffffff' : '#f4f3f4'}
          />
        )}
        {item.showChevron && (
          <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText style={styles.title}>Profile</ThemedText>
      </ThemedView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileImageContainer}>
            <Image source={{ uri: mockUser.profileImage }} style={styles.profileImage} />
            <TouchableOpacity style={styles.editImageButton}>
              <Ionicons name="camera" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{mockUser.name}</Text>
            <Text style={styles.profileEmail}>{mockUser.email}</Text>
            <Text style={styles.profileJoinDate}>
              Member since {mockUser.joinDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </Text>
          </View>
          <TouchableOpacity style={styles.editProfileButton} onPress={handleEditProfile}>
            <Ionicons name="create-outline" size={20} color="#007AFF" />
            <Text style={styles.editProfileButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* Chef CTA */}
        {!mockUser.isChef && (
          <TouchableOpacity style={styles.chefCTACard} onPress={handleBecomeChef}>
            <View style={styles.chefCTAContent}>
              <Ionicons name="restaurant" size={32} color="#007AFF" />
              <View style={styles.chefCTAText}>
                <Text style={styles.chefCTATitle}>Become a Chef</Text>
                <Text style={styles.chefCTADescription}>
                  Start selling your delicious home-cooked meals
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#007AFF" />
          </TouchableOpacity>
        )}

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {menuItems.map(renderMenuItem)}
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>HomeChef App v1.0.0</Text>
        </View>
      </ScrollView>
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
    color: '#333',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f0f0',
  },
  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#007AFF',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  profileInfo: {
    alignItems: 'center',
    marginBottom: 16,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  profileJoinDate: {
    fontSize: 14,
    color: '#999',
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  editProfileButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 4,
  },
  chefCTACard: {
    backgroundColor: '#f0f8ff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#e0f0ff',
  },
  chefCTAContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  chefCTAText: {
    marginLeft: 12,
    flex: 1,
  },
  chefCTATitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  chefCTADescription: {
    fontSize: 14,
    color: '#666',
  },
  menuSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  menuItemDescription: {
    fontSize: 14,
    color: '#666',
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutButtonText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  versionContainer: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  versionText: {
    fontSize: 14,
    color: '#999',
  },
}); 