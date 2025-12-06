import React, { createContext, useState, useContext, useEffect } from 'react';

const PaymentMethodsContext = createContext();

export const usePaymentMethods = () => {
  const context = useContext(PaymentMethodsContext);
  if (!context) {
    throw new Error('usePaymentMethods must be used within a PaymentMethodsProvider');
  }
  return context;
};

export const PaymentMethodsProvider = ({ children }) => {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      // Load from localStorage (in a real app, this would be an API call)
      const stored = localStorage.getItem('payment_methods_all');
      if (stored) {
        setPaymentMethods(JSON.parse(stored));
      } else {
        // Initialize with default data
        const defaultMethods = [
          {
            id: '1',
            userId: 'user1',
            userName: 'John Doe',
            userEmail: 'john@example.com',
            type: 'card',
            cardType: 'credit',
            brand: 'Visa',
            last4: '4242',
            cardholderName: 'John Doe',
            expiryMonth: '12',
            expiryYear: '2025',
            isDefault: true,
            status: 'active',
            createdAt: '2024-01-01',
          },
          {
            id: '2',
            userId: 'user2',
            userName: 'Jane Smith',
            userEmail: 'jane@example.com',
            type: 'googlepay',
            name: 'Google Pay',
            phone: '+1234567890',
            isDefault: true,
            status: 'active',
            createdAt: '2024-01-02',
          },
        ];
        setPaymentMethods(defaultMethods);
        localStorage.setItem('payment_methods_all', JSON.stringify(defaultMethods));
      }
    } catch (error) {
      console.error('Error loading payment methods:', error);
    } finally {
      setLoading(false);
    }
  };

  const savePaymentMethods = async (methods) => {
    try {
      setPaymentMethods(methods);
      localStorage.setItem('payment_methods_all', JSON.stringify(methods));
      return true;
    } catch (error) {
      console.error('Error saving payment methods:', error);
      return false;
    }
  };

  const addPaymentMethod = async (method) => {
    const newMethod = {
      ...method,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0],
      status: 'active',
    };
    const updated = [...paymentMethods, newMethod];
    await savePaymentMethods(updated);
    return newMethod;
  };

  const updatePaymentMethod = async (id, updates) => {
    const updated = paymentMethods.map((method) =>
      method.id === id ? { ...method, ...updates } : method
    );
    await savePaymentMethods(updated);
    return updated.find((m) => m.id === id);
  };

  const deletePaymentMethod = async (id) => {
    const updated = paymentMethods.filter((method) => method.id !== id);
    await savePaymentMethods(updated);
    return true;
  };

  const togglePaymentMethodStatus = async (id) => {
    const method = paymentMethods.find((m) => m.id === id);
    if (method) {
      await updatePaymentMethod(id, {
        status: method.status === 'active' ? 'inactive' : 'active',
      });
    }
  };

  const getPaymentMethodsByUser = (userId) => {
    return paymentMethods.filter((method) => method.userId === userId);
  };

  const value = {
    paymentMethods,
    loading,
    addPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,
    togglePaymentMethodStatus,
    getPaymentMethodsByUser,
    refreshPaymentMethods: loadPaymentMethods,
  };

  return (
    <PaymentMethodsContext.Provider value={value}>
      {children}
    </PaymentMethodsContext.Provider>
  );
};

