import React, { createContext, useState, useContext, useEffect } from 'react';
import { defaultCountry, defaultState } from '../../../shared/data/countriesStates';

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    defaultLanguage: 'en',
    availableLanguages: ['en', 'es', 'fr'],
    currency: 'USD',
    ratePerMile: 2.5,
    currencies: ['USD', 'EUR', 'GBP', 'INR', 'AED'],
    paymentMethods: {
      card: { enabled: true, required: true }, // Credit/Debit Card - always enabled
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
    preferredAreas: {
      radiusOptions: [2, 5, 10, 15, 20, 25], // in kilometers
      defaultRadius: 5,
      unit: 'km', // 'km' or 'miles'
      maxAreas: 10,
    },
  });

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('app_settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const updateSettings = (newSettings) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    localStorage.setItem('app_settings', JSON.stringify(updated));
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

