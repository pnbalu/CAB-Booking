import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      const storedUserType = await AsyncStorage.getItem('userType');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
        setUserType(storedUserType);
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password, type) => {
    const mockUser = {
      id: `user_${Date.now()}`, // Unique user ID for API calls
      email,
      name: email.split('@')[0],
      phone: '+1234567890',
      verified: false, // Default to unverified
      verificationStatus: 'pending', // pending, verified, rejected
    };
    
    // Generate and save referral code if not exists
    const { generateReferralCode, saveReferralCode, getReferralCode } = await import('../services/referralApi');
    let referralCode = await getReferralCode(mockUser.id);
    if (!referralCode) {
      referralCode = generateReferralCode(mockUser.id, type);
      await saveReferralCode(mockUser.id, type, referralCode);
    }
    mockUser.referralCode = referralCode;
    
    setUser(mockUser);
    setUserType(type);
    
    await AsyncStorage.setItem('user', JSON.stringify(mockUser));
    await AsyncStorage.setItem('userType', type);
    
    return mockUser;
  };

  const signup = async (email, password, name, phone, type) => {
    const mockUser = {
      id: `user_${Date.now()}`, // Unique user ID for API calls
      email,
      name,
      phone,
      verified: false, // Default to unverified
      verificationStatus: 'pending', // pending, verified, rejected
    };
    
    // Generate and save referral code
    const { generateReferralCode, saveReferralCode } = await import('../services/referralApi');
    const referralCode = generateReferralCode(mockUser.id, type);
    await saveReferralCode(mockUser.id, type, referralCode);
    mockUser.referralCode = referralCode;
    
    setUser(mockUser);
    setUserType(type);
    
    await AsyncStorage.setItem('user', JSON.stringify(mockUser));
    await AsyncStorage.setItem('userType', type);
    
    return mockUser;
  };

  const logout = async () => {
    setUser(null);
    setUserType(null);
    await AsyncStorage.removeItem('user');
    await AsyncStorage.removeItem('userType');
  };

  const updateUser = async (updates) => {
    try {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  };

  const value = {
    user,
    userType,
    loading,
    login,
    signup,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

