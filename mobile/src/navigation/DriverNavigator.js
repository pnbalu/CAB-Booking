import React from 'react';
import { Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getBottomTabBarOptions, getTabBarIcon } from '../components/BottomTabBar';
import DashboardScreen from '../screens/driver/DashboardScreen';
import ActiveRideScreen from '../screens/driver/ActiveRideScreen';
import HistoryScreen from '../screens/driver/HistoryScreen';
import ProfileScreen from '../screens/driver/ProfileScreen';
import EditProfileScreen from '../screens/driver/EditProfileScreen';
import SettingsScreen from '../screens/driver/SettingsScreen';
import ReferralScreen from '../screens/driver/ReferralScreen';
import HelpSupportScreen from '../screens/driver/HelpSupportScreen';
import EarningsScreen from '../screens/driver/EarningsScreen';
import PayoutHistoryScreen from '../screens/driver/PayoutHistoryScreen';
import DocumentsScreen from '../screens/driver/DocumentsScreen';
import TermsOfServiceScreen from '../screens/driver/TermsOfServiceScreen';
import PrivacyPolicyScreen from '../screens/driver/PrivacyPolicyScreen';
import SafetyTipsScreen from '../screens/driver/SafetyTipsScreen';
import LiveChatScreen from '../screens/rider/LiveChatScreen';
import ReportProblemScreen from '../screens/rider/ReportProblemScreen';
import ChangePasswordScreen from '../screens/rider/ChangePasswordScreen';
import AboutScreen from '../screens/rider/AboutScreen';
import LicensesScreen from '../screens/rider/LicensesScreen';
import PreferredAreasScreen from '../screens/driver/PreferredAreasScreen';
import VehicleInfoScreen from '../screens/driver/VehicleInfoScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const DriverTabs = () => {
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
          const iconName = getTabBarIcon(route.name, focused, 'driver');
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
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

const DriverNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DriverTabs" component={DriverTabs} />
      <Stack.Screen
        name="ActiveRide"
        component={ActiveRideScreen}
        options={{
          headerShown: true,
          title: 'Active Ride',
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
        name="Referral"
        component={ReferralScreen}
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
        name="Earnings"
        component={EarningsScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="PayoutHistory"
        component={PayoutHistoryScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Documents"
        component={DocumentsScreen}
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
        name="ChangePassword"
        component={ChangePasswordScreen}
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
        name="PreferredAreas"
        component={PreferredAreasScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="VehicleInfo"
        component={VehicleInfoScreen}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
};

export default DriverNavigator;

