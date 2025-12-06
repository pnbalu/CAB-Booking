import AsyncStorage from '@react-native-async-storage/async-storage';
import { defaultCountry, defaultState } from '../data/countriesStates';

// In a real app, this would fetch from the backend API
// For now, we'll sync with web app settings from localStorage structure

const SETTINGS_KEY = 'app_settings';

export const settingsApi = {
  // Get app settings (payment methods configuration)
  getSettings: async () => {
    try {
      // In a real app: const response = await fetch('/api/settings');
      // For now, we'll use a default structure that matches web app
      const stored = await AsyncStorage.getItem(SETTINGS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      
      // Default settings matching web app
      const defaultSettings = {
        paymentMethods: {
          card: { enabled: true }, // Always enabled
          cash: { enabled: true },
          googlepay: { enabled: true },
          internetbanking: { enabled: true },
        },
        location: {
          country: defaultCountry.code,
          state: defaultState.code,
        },
        support: {
          rider: {
            phone: '+1 (800) 123-4567',
            email: 'rider-support@cabbooking.com',
            emergencyPhone: '+1 (800) 911-HELP',
          },
          driver: {
            phone: '+1 (800) 123-4568',
            email: 'driver-support@cabbooking.com',
            emergencyPhone: '+1 (800) 911-HELP',
          },
        },
        referral: {
          enabled: true,
          rider: {
            referrerReward: '$10',
            refereeReward: '$5',
            description: 'Get $10 when your friend signs up and takes their first ride. Your friend gets $5 off their first ride!',
          },
          driver: {
            referrerReward: '$50',
            refereeReward: '$25',
            description: 'Earn $50 when your friend becomes a driver and completes their first 10 rides. Your friend gets $25 bonus!',
          },
        },
      };
      
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(defaultSettings));
      return defaultSettings;
    } catch (error) {
      console.error('Error fetching settings:', error);
      // Return default settings on error
      return {
        paymentMethods: {
          card: { enabled: true },
          cash: { enabled: true },
          googlepay: { enabled: true },
          internetbanking: { enabled: true },
        },
        location: {
          country: defaultCountry.code,
          state: defaultState.code,
        },
        support: {
          rider: {
            phone: '+1 (800) 123-4567',
            email: 'rider-support@cabbooking.com',
            emergencyPhone: '+1 (800) 911-HELP',
          },
          driver: {
            phone: '+1 (800) 123-4568',
            email: 'driver-support@cabbooking.com',
            emergencyPhone: '+1 (800) 911-HELP',
          },
        },
        referral: {
          enabled: true,
          rider: {
            referrerReward: '$10',
            refereeReward: '$5',
            description: 'Get $10 when your friend signs up and takes their first ride. Your friend gets $5 off their first ride!',
          },
          driver: {
            referrerReward: '$50',
            refereeReward: '$25',
            description: 'Earn $50 when your friend becomes a driver and completes their first 10 rides. Your friend gets $25 bonus!',
          },
        },
      };
    }
  },

  // Get enabled payment methods
  getEnabledPaymentMethods: async () => {
    const settings = await settingsApi.getSettings();
    const enabled = [];
    
    if (settings.paymentMethods?.card?.enabled) {
      enabled.push('card');
    }
    if (settings.paymentMethods?.cash?.enabled) {
      enabled.push('cash');
    }
    if (settings.paymentMethods?.googlepay?.enabled) {
      enabled.push('googlepay');
    }
    if (settings.paymentMethods?.internetbanking?.enabled) {
      enabled.push('internetbanking');
    }
    
    return enabled;
  },

  // Get location settings
  getLocation: async () => {
    const settings = await settingsApi.getSettings();
    return settings.location || {
      country: defaultCountry.code,
      state: defaultState.code,
    };
  },

  // Get support contact information based on user type
  getSupportInfo: async (userType = 'rider') => {
    const settings = await settingsApi.getSettings();
    const support = settings.support || {
      rider: {
        phone: '+1 (800) 123-4567',
        email: 'rider-support@cabbooking.com',
        emergencyPhone: '+1 (800) 911-HELP',
      },
      driver: {
        phone: '+1 (800) 123-4568',
        email: 'driver-support@cabbooking.com',
        emergencyPhone: '+1 (800) 911-HELP',
      },
    };
    
    return support[userType] || support.rider;
  },

  // Get referral program settings
  getReferralSettings: async (userType = 'rider') => {
    const settings = await settingsApi.getSettings();
    const referral = settings.referral || {
      enabled: true,
      rider: {
        referrerReward: '$10',
        refereeReward: '$5',
        description: 'Get $10 when your friend signs up and takes their first ride. Your friend gets $5 off their first ride!',
      },
      driver: {
        referrerReward: '$50',
        refereeReward: '$25',
        description: 'Earn $50 when your friend becomes a driver and completes their first 10 rides. Your friend gets $25 bonus!',
      },
    };

    const userSettings = referral[userType] || referral.rider;
    return {
      enabled: referral.enabled,
      referrerReward: userSettings.referrerReward,
      refereeReward: userSettings.refereeReward,
      description: userSettings.description,
    };
  },

  // Get preferred areas settings
  getPreferredAreasSettings: async () => {
    const settings = await settingsApi.getSettings();
    return settings.preferredAreas || {
      radiusOptions: [2, 5, 10, 15, 20, 25],
      defaultRadius: 5,
      unit: 'km',
      maxAreas: 10,
    };
  },
};

