import AsyncStorage from '@react-native-async-storage/async-storage';

// In a real app, this would be actual API calls
// For now, we'll use AsyncStorage with a structure that can sync with web app

const STORAGE_KEY = 'payment_methods_api';
const USER_PAYMENT_METHODS_KEY = 'user_payment_methods';

// Simulate API calls - Replace with actual API endpoints when backend is ready
export const paymentMethodsApi = {
  // Get payment methods for a user
  getUserPaymentMethods: async (userId) => {
    try {
      // In a real app: const response = await fetch(`/api/users/${userId}/payment-methods`);
      const stored = await AsyncStorage.getItem(`${USER_PAYMENT_METHODS_KEY}_${userId}`);
      if (stored) {
        return JSON.parse(stored);
      }
      return [];
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      throw error;
    }
  },

  // Add a payment method
  addPaymentMethod: async (userId, paymentMethod) => {
    try {
      // In a real app: const response = await fetch(`/api/users/${userId}/payment-methods`, { method: 'POST', body: JSON.stringify(paymentMethod) });
      const methods = await paymentMethodsApi.getUserPaymentMethods(userId);
      const newMethod = {
        ...paymentMethod,
        id: Date.now().toString(),
        userId,
        createdAt: new Date().toISOString(),
        status: 'active',
      };
      const updated = [...methods, newMethod];
      await AsyncStorage.setItem(`${USER_PAYMENT_METHODS_KEY}_${userId}`, JSON.stringify(updated));
      return newMethod;
    } catch (error) {
      console.error('Error adding payment method:', error);
      throw error;
    }
  },

  // Update a payment method
  updatePaymentMethod: async (userId, methodId, updates) => {
    try {
      // In a real app: const response = await fetch(`/api/users/${userId}/payment-methods/${methodId}`, { method: 'PUT', body: JSON.stringify(updates) });
      const methods = await paymentMethodsApi.getUserPaymentMethods(userId);
      const updated = methods.map((method) =>
        method.id === methodId ? { ...method, ...updates } : method
      );
      await AsyncStorage.setItem(`${USER_PAYMENT_METHODS_KEY}_${userId}`, JSON.stringify(updated));
      return updated.find((m) => m.id === methodId);
    } catch (error) {
      console.error('Error updating payment method:', error);
      throw error;
    }
  },

  // Delete a payment method
  deletePaymentMethod: async (userId, methodId) => {
    try {
      // In a real app: const response = await fetch(`/api/users/${userId}/payment-methods/${methodId}`, { method: 'DELETE' });
      const methods = await paymentMethodsApi.getUserPaymentMethods(userId);
      const updated = methods.filter((method) => method.id !== methodId);
      await AsyncStorage.setItem(`${USER_PAYMENT_METHODS_KEY}_${userId}`, JSON.stringify(updated));
      return true;
    } catch (error) {
      console.error('Error deleting payment method:', error);
      throw error;
    }
  },

  // Set default payment method
  setDefaultPaymentMethod: async (userId, methodId) => {
    try {
      const methods = await paymentMethodsApi.getUserPaymentMethods(userId);
      const updated = methods.map((method) => ({
        ...method,
        isDefault: method.id === methodId,
      }));
      await AsyncStorage.setItem(`${USER_PAYMENT_METHODS_KEY}_${userId}`, JSON.stringify(updated));
      return updated.find((m) => m.id === methodId);
    } catch (error) {
      console.error('Error setting default payment method:', error);
      throw error;
    }
  },
};

