import React from 'react';
import { Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getBottomTabBarOptions, getTabBarIcon } from '../components/BottomTabBar';
import HomeScreen from '../screens/rider/HomeScreen';
import RideStatusScreen from '../screens/rider/RideStatusScreen';
import HistoryScreen from '../screens/rider/HistoryScreen';
import ProfileScreen from '../screens/rider/ProfileScreen';
import EditProfileScreen from '../screens/rider/EditProfileScreen';
import SettingsScreen from '../screens/rider/SettingsScreen';
import SaveLocationScreen from '../screens/rider/SaveLocationScreen';
import SavedLocationsScreen from '../screens/rider/SavedLocationsScreen';
import PaymentMethodsScreen from '../screens/rider/PaymentMethodsScreen';
import ReceiptScreen from '../screens/rider/ReceiptScreen';
import HelpSupportScreen from '../screens/rider/HelpSupportScreen';
import LiveChatScreen from '../screens/rider/LiveChatScreen';
import ReportProblemScreen from '../screens/rider/ReportProblemScreen';
import TermsOfServiceScreen from '../screens/rider/TermsOfServiceScreen';
import PrivacyPolicyScreen from '../screens/rider/PrivacyPolicyScreen';
import SafetyTipsScreen from '../screens/rider/SafetyTipsScreen';
import ChangePasswordScreen from '../screens/rider/ChangePasswordScreen';
import RideReceiptsScreen from '../screens/rider/RideReceiptsScreen';
import AboutScreen from '../screens/rider/AboutScreen';
import LicensesScreen from '../screens/rider/LicensesScreen';
import ReferralScreen from '../screens/rider/ReferralScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const RiderTabs = () => {
  const insets = useSafeAreaInsets();
  const baseOptions = getBottomTabBarOptions();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        ...baseOptions,
        tabBarStyle: {
          ...baseOptions.tabBarStyle({ insets }),
        },
        tabBarIcon: ({ focused, color, size }) => {
          const iconName = getTabBarIcon(route.name, focused, 'rider');
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{
          tabBarBadge: null,
        }}
      />
    </Tab.Navigator>
  );
};

const RiderNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="RiderTabs" component={RiderTabs} />
      <Stack.Screen
        name="RideStatus"
        component={RideStatusScreen}
        options={{
          headerShown: true,
          title: 'Ride Status',
          headerStyle: { backgroundColor: '#667eea' },
          headerTintColor: '#fff',
        }}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="SaveLocation"
        component={SaveLocationScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="SavedLocations"
        component={SavedLocationsScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="PaymentMethods"
        component={PaymentMethodsScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Receipt"
        component={ReceiptScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="HelpSupport"
        component={HelpSupportScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="LiveChat"
        component={LiveChatScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="ReportProblem"
        component={ReportProblemScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="TermsOfService"
        component={TermsOfServiceScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="PrivacyPolicy"
        component={PrivacyPolicyScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="SafetyTips"
        component={SafetyTipsScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="ChangePassword"
        component={ChangePasswordScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="RideReceipts"
        component={RideReceiptsScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="About"
        component={AboutScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Licenses"
        component={LicensesScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Referral"
        component={ReferralScreen}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
};

export default RiderNavigator;

