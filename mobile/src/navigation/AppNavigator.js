import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';
import AuthNavigator from './AuthNavigator';
import RiderNavigator from './RiderNavigator';
import DriverNavigator from './DriverNavigator';
import LoadingScreen from '../screens/LoadingScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { user, userType, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : userType === 'rider' ? (
        <Stack.Screen name="Rider" component={RiderNavigator} />
      ) : (
        <Stack.Screen name="Driver" component={DriverNavigator} />
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;

