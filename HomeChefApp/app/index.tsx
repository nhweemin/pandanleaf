import { Image, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';

export default function WelcomeScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logoText}>Pandan Leaf</Text>
        <Text style={styles.subtitle}>Your Home Business Marketplace</Text>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.welcome}>Welcome to Pandan Leaf! 🌿</Text>
        <Text style={styles.description}>
          Connect with local home businesses in your area. From home-cooked meals and handmade crafts to personal services and unique products - discover amazing offerings from your neighbors.
        </Text>
        
        <View style={styles.features}>
          <Text style={styles.featureItem}>🏠 Support Local Home Businesses</Text>
          <Text style={styles.featureItem}>🛒 Browse Unique Products & Services</Text>
          <Text style={styles.featureItem}>📱 Easy Ordering & Communication</Text>
          <Text style={styles.featureItem}>⭐ Community Reviews & Ratings</Text>
        </View>
      </View>

      <View style={styles.buttons}>
        <Link href="/(auth)/login" asChild>
          <TouchableOpacity style={styles.loginButton}>
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>
        </Link>
        
        <Link href="/(auth)/signup" asChild>
          <TouchableOpacity style={styles.signupButton}>
            <Text style={styles.signupButtonText}>Sign Up</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#2d7d32',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#66bb6a',
    fontStyle: 'italic',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    maxWidth: 350,
  },
  welcome: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#2d7d32',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    color: '#424242',
    lineHeight: 24,
    marginBottom: 30,
  },
  features: {
    alignItems: 'flex-start',
    marginBottom: 40,
  },
  featureItem: {
    fontSize: 16,
    color: '#424242',
    marginBottom: 10,
    textAlign: 'left',
  },
  buttons: {
    width: '100%',
    gap: 15,
  },
  loginButton: {
    backgroundColor: '#2d7d32',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: 'center',
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  signupButton: {
    backgroundColor: 'transparent',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#2d7d32',
    alignItems: 'center',
  },
  signupButtonText: {
    color: '#2d7d32',
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 