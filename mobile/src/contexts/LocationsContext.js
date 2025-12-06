import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LocationsContext = createContext();

export const useSavedLocations = () => {
  const context = useContext(LocationsContext);
  if (!context) {
    throw new Error('useSavedLocations must be used within a LocationsProvider');
  }
  return context;
};

export const LocationsProvider = ({ children }) => {
  const [savedLocations, setSavedLocations] = useState({
    home: null,
    work: null,
    airport: null,
    custom: [],
  });

  useEffect(() => {
    loadSavedLocations();
  }, []);

  const loadSavedLocations = async () => {
    try {
      const home = await AsyncStorage.getItem('location_home');
      const work = await AsyncStorage.getItem('location_work');
      const airport = await AsyncStorage.getItem('location_airport');
      const custom = await AsyncStorage.getItem('location_custom');

      setSavedLocations({
        home: home ? JSON.parse(home) : null,
        work: work ? JSON.parse(work) : null,
        airport: airport ? JSON.parse(airport) : null,
        custom: custom ? JSON.parse(custom) : [],
      });
    } catch (error) {
      console.error('Error loading saved locations:', error);
    }
  };

  const saveLocation = async (type, location, name = null) => {
    try {
      const locationData = {
        ...location,
        name: name || type,
        savedAt: new Date().toISOString(),
      };

      if (type === 'custom') {
        const updatedCustom = [...savedLocations.custom, locationData];
        setSavedLocations({
          ...savedLocations,
          custom: updatedCustom,
        });
        await AsyncStorage.setItem('location_custom', JSON.stringify(updatedCustom));
      } else {
        setSavedLocations({
          ...savedLocations,
          [type]: locationData,
        });
        await AsyncStorage.setItem(`location_${type}`, JSON.stringify(locationData));
      }
    } catch (error) {
      console.error('Error saving location:', error);
      throw error;
    }
  };

  const deleteLocation = async (type, index = null) => {
    try {
      if (type === 'custom' && index !== null) {
        const updatedCustom = savedLocations.custom.filter((_, i) => i !== index);
        setSavedLocations({
          ...savedLocations,
          custom: updatedCustom,
        });
        await AsyncStorage.setItem('location_custom', JSON.stringify(updatedCustom));
      } else {
        setSavedLocations({
          ...savedLocations,
          [type]: null,
        });
        await AsyncStorage.removeItem(`location_${type}`);
      }
    } catch (error) {
      console.error('Error deleting location:', error);
      throw error;
    }
  };

  const value = {
    savedLocations,
    saveLocation,
    deleteLocation,
    loadSavedLocations,
  };

  return <LocationsContext.Provider value={value}>{children}</LocationsContext.Provider>;
};

