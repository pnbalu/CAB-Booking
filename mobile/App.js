import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/contexts/AuthContext';
import { LocationProvider } from './src/contexts/LocationContext';
import { LocationsProvider } from './src/contexts/LocationsContext';
import { RideProvider } from './src/contexts/RideContext';
import { ChatProvider } from './src/contexts/ChatContext';
import { ToastProvider } from './src/contexts/ToastContext';
import AppNavigator from './src/navigation/AppNavigator';
import SplashScreen from './src/screens/SplashScreen';

export default function App() {
  const [isSplashVisible, setIsSplashVisible] = useState(true);

  const handleSplashFinish = () => {
    setIsSplashVisible(false);
  };

  if (isSplashVisible) {
    return (
      <View style={{ flex: 1 }}>
        <StatusBar style="light" />
        <SplashScreen onFinish={handleSplashFinish} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <LocationProvider>
          <LocationsProvider>
            <RideProvider>
              <ChatProvider>
                <ToastProvider>
                  <NavigationContainer>
                    <StatusBar style="auto" />
                    <AppNavigator />
                  </NavigationContainer>
                </ToastProvider>
              </ChatProvider>
            </RideProvider>
          </LocationsProvider>
        </LocationProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

