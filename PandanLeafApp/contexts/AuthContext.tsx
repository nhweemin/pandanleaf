import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type UserRole = 'admin' | 'business_owner' | 'customer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  address?: string;
  profileImage?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (userData: any) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const API_BASE_URL = 'https://pandanleaf-backend-production.up.railway.app';

  useEffect(() => {
    // Check for stored auth data on app launch
    checkStoredAuth();
  }, []);

  const checkStoredAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('authToken');
      const storedUser = await AsyncStorage.getItem('userData');
      
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.log('Error checking stored auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // 🧪 TEST MODE: Check for hardcoded test users first (bypass backend while database issues are resolved)
      const testUsers: Record<string, any> = {
        'admin@pandanleaf.com': { id: 'test-admin', name: 'Admin User', role: 'admin', email: 'admin@pandanleaf.com' },
        'indah@pandanleaf.com': { id: 'test-business-owner', name: 'Indah Sari', role: 'business_owner', email: 'indah@pandanleaf.com' },
        'customer@pandanleaf.com': { id: 'test-customer', name: 'Customer User', role: 'customer', email: 'customer@pandanleaf.com' },
        // Legacy support
        'admin@homechef.com': { id: 'test-admin-legacy', name: 'Admin User', role: 'admin', email: 'admin@homechef.com' },
        'indah@homechef.com': { id: 'test-business-owner-legacy', name: 'Indah Sari', role: 'business_owner', email: 'indah@homechef.com' },
        'customer@homechef.com': { id: 'test-customer-legacy', name: 'Customer User', role: 'customer', email: 'customer@homechef.com' }
      };

      // Check if it's a test user with password 'test123'
      if (testUsers[email] && password === 'test123') {
        const userData = testUsers[email];
        const authToken = `test-token-${userData.id}-${Date.now()}`; // Generate test token

        console.log('🧪 TEST MODE LOGIN SUCCESS:', email);

        // Store auth data
        await AsyncStorage.setItem('authToken', authToken);
        await AsyncStorage.setItem('userData', JSON.stringify(userData));

        setUser(userData);
        setToken(authToken);
        return true;
      }

      // Try backend authentication (will work once Railway cache clears)
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        const userData = data.data.user;
        const authToken = data.data.token;

        console.log('🔗 BACKEND LOGIN SUCCESS:', email);

        // Store auth data
        await AsyncStorage.setItem('authToken', authToken);
        await AsyncStorage.setItem('userData', JSON.stringify(userData));

        setUser(userData);
        setToken(authToken);
        return true;
      } else {
        console.log('Login failed:', data.message);
        return false;
      }
    } catch (error) {
      console.log('Login error:', error);
      return false;
    }
  };

  const register = async (userData: any): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (data.success) {
        const newUser = data.data.user;
        const authToken = data.data.token;

        // Store auth data
        await AsyncStorage.setItem('authToken', authToken);
        await AsyncStorage.setItem('userData', JSON.stringify(newUser));

        setUser(newUser);
        setToken(authToken);
        return true;
      } else {
        console.log('Registration failed:', data.message);
        return false;
      }
    } catch (error) {
      console.log('Registration error:', error);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userData');
      setUser(null);
      setToken(null);
    } catch (error) {
      console.log('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isLoading,
      login,
      logout,
      register,
    }}>
      {children}
    </AuthContext.Provider>
  );
}; 