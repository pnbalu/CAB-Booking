import React from 'react';
import { Platform } from 'react-native';

/**
 * Reusable Bottom Tab Bar Configuration
 * Provides consistent styling and height for bottom tab navigation
 * 
 * Note: tabBarStyle should be a function to access insets from React Navigation
 * 
 * @returns {object} Tab bar options configuration
 */
export const getBottomTabBarOptions = () => {
  return {
    tabBarActiveTintColor: '#667eea',
    tabBarInactiveTintColor: '#999',
    headerShown: false,
    tabBarShowLabel: true,
    tabBarLabelStyle: {
      fontSize: 12,
      fontWeight: '600',
      marginTop: 4,
    },
    tabBarIconStyle: {
      marginTop: 4,
    },
    // tabBarStyle as a function to access insets
    tabBarStyle: ({ insets }) => ({
      backgroundColor: '#fff',
      borderTopWidth: 1,
      borderTopColor: '#f0f0f0',
      height: 75 + (Platform.OS === 'android' ? insets.bottom : 0), // Increased height from 60 to 75
      paddingBottom: Platform.OS === 'android' ? insets.bottom + 10 : 10, // Increased padding from 8 to 10
      paddingTop: 10, // Increased padding from 8 to 10
      elevation: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    }),
  };
};

/**
 * Get icon name for a route
 * @param {string} routeName - Name of the route
 * @param {boolean} focused - Whether the tab is focused
 * @param {string} userType - 'rider' or 'driver'
 * @returns {string} Icon name
 */
export const getTabBarIcon = (routeName, focused, userType = 'rider') => {
  const iconMap = {
    rider: {
      Home: focused ? 'home' : 'home-outline',
      History: focused ? 'time' : 'time-outline',
      Profile: focused ? 'person' : 'person-outline',
      Settings: focused ? 'settings' : 'settings-outline',
    },
    driver: {
      Dashboard: focused ? 'car' : 'car-outline',
      History: focused ? 'time' : 'time-outline',
      Profile: focused ? 'person' : 'person-outline',
      Settings: focused ? 'settings' : 'settings-outline',
    },
  };

  return iconMap[userType]?.[routeName] || 'help-outline';
};
