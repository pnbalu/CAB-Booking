import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../../components/Header';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { t, setLanguage, getAvailableLanguages } from '../../i18n';

const PREFERRED_AREAS_KEY = 'driver_preferred_areas';

const SettingsScreen = ({ navigation }) => {
  const { logout } = useAuth();
  const { showSuccess, showInfo, showConfirm } = useToast();
  
  // Notification settings
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [rideRequests, setRideRequests] = useState(true);
  const [earningsUpdates, setEarningsUpdates] = useState(true);
  const [promotions, setPromotions] = useState(false);

  // Privacy settings
  const [shareLocation, setShareLocation] = useState(true);
  const [showOnlineStatus, setShowOnlineStatus] = useState(true);

  // App preferences
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguageState] = useState('en');
  const [availableLanguages] = useState(getAvailableLanguages());
  const [soundEffects, setSoundEffects] = useState(true);
  const [hapticFeedback, setHapticFeedback] = useState(true);
  const [autoAccept, setAutoAccept] = useState(false);
  const [preferredAreasCount, setPreferredAreasCount] = useState(0);

  useEffect(() => {
    loadPreferredAreasCount();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadPreferredAreasCount();
    });
    return unsubscribe;
  }, [navigation]);

  const loadPreferredAreasCount = async () => {
    try {
      const stored = await AsyncStorage.getItem(PREFERRED_AREAS_KEY);
      if (stored) {
        const areas = JSON.parse(stored);
        setPreferredAreasCount(areas.length);
      }
    } catch (error) {
      console.error('Error loading preferred areas count:', error);
    }
  };

  const handleLogout = () => {
    showConfirm(
      'Logout',
      'Are you sure you want to logout?',
      () => {
        logout();
        showSuccess('Logged out successfully');
      },
      () => {
        // Cancel - do nothing
      },
      {
        confirmText: 'Logout',
        cancelText: 'Cancel',
        type: 'warning',
      }
    );
  };

  const handleLanguageChange = () => {
    showConfirm(
      t('settings.language'),
      'Choose your preferred language',
      null,
      null,
      {
        confirmText: 'Select',
        cancelText: t('common.cancel'),
        type: 'info',
      }
    );
    
    // Show language options - for now using a simple approach
    // In a real app, you might want a custom modal for this
    const languageOptions = availableLanguages.map((lang) => ({
      label: `${lang.flag} ${lang.name}`,
      code: lang.code,
    }));
    
    // For now, just show info - in production you'd show a custom picker modal
    showInfo('Language selection - custom modal would show here');
  };

  const SettingItem = ({ icon, label, value, onPress, rightComponent, showArrow = true }) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.7}
    >
      <View style={styles.settingLeft}>
        <Ionicons name={icon} size={24} color="#000" />
        <Text style={styles.settingLabel}>{label}</Text>
      </View>
      <View style={styles.settingRight}>
        {value && <Text style={styles.settingValue}>{value}</Text>}
        {rightComponent}
        {showArrow && onPress && (
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        )}
      </View>
    </TouchableOpacity>
  );

  const SettingSwitch = ({ icon, label, value, onValueChange }) => (
    <View style={styles.settingItem}>
      <View style={styles.settingLeft}>
        <Ionicons name={icon} size={24} color="#000" />
        <Text style={styles.settingLabel}>{label}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#e0e0e0', true: '#000' }}
        thumbColor="#fff"
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Settings" />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Notifications Section */}
        <Card variant="elevated" style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          
          <SettingSwitch
            icon="notifications-outline"
            label="Push Notifications"
            value={pushNotifications}
            onValueChange={setPushNotifications}
          />
          
          <SettingSwitch
            icon="mail-outline"
            label="Email Notifications"
            value={emailNotifications}
            onValueChange={setEmailNotifications}
          />
          
          <SettingSwitch
            icon="chatbubble-outline"
            label="SMS Notifications"
            value={smsNotifications}
            onValueChange={setSmsNotifications}
          />
          
          <SettingSwitch
            icon="car-outline"
            label="Ride Requests"
            value={rideRequests}
            onValueChange={setRideRequests}
          />
          
          <SettingSwitch
            icon="wallet-outline"
            label="Earnings Updates"
            value={earningsUpdates}
            onValueChange={setEarningsUpdates}
          />
          
          <SettingSwitch
            icon="gift-outline"
            label="Promotions & Offers"
            value={promotions}
            onValueChange={setPromotions}
          />
        </Card>

        {/* Driver Preferences Section */}
        <Card variant="elevated" style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Driver Preferences</Text>
          
          <SettingSwitch
            icon="flash-outline"
            label="Auto-Accept Rides"
            value={autoAccept}
            onValueChange={setAutoAccept}
          />
          
          <SettingItem
            icon="time-outline"
            label="Working Hours"
            value="24/7"
            onPress={() => showInfo('Working hours feature coming soon')}
          />
          
          <SettingItem
            icon="location-outline"
            label="Preferred Areas"
            value={preferredAreasCount > 0 ? `${preferredAreasCount} areas` : undefined}
            onPress={() => navigation.navigate('PreferredAreas')}
          />
        </Card>

        {/* Privacy & Security Section */}
        <Card variant="elevated" style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Privacy & Security</Text>
          
          <SettingSwitch
            icon="location-outline"
            label="Share Location"
            value={shareLocation}
            onValueChange={setShareLocation}
          />
          
          <SettingSwitch
            icon="eye-outline"
            label="Show Online Status"
            value={showOnlineStatus}
            onValueChange={setShowOnlineStatus}
          />
          
          <SettingItem
            icon="lock-closed-outline"
            label="Change Password"
            onPress={() => navigation.navigate('ChangePassword')}
          />
          
          <SettingItem
            icon="shield-checkmark-outline"
            label="Two-Factor Authentication"
            value="Disabled"
            onPress={() => showInfo('Two-factor authentication coming soon')}
          />
        </Card>

        {/* App Preferences Section */}
        <Card variant="elevated" style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>App Preferences</Text>
          
          <SettingSwitch
            icon="moon-outline"
            label="Dark Mode"
            value={darkMode}
            onValueChange={setDarkMode}
          />
          
          <SettingItem
            icon="language-outline"
            label={t('settings.language')}
            value={availableLanguages.find(l => l.code === language)?.name || 'English'}
            onPress={handleLanguageChange}
          />
          
          <SettingSwitch
            icon="volume-high-outline"
            label="Sound Effects"
            value={soundEffects}
            onValueChange={setSoundEffects}
          />
          
          <SettingSwitch
            icon="phone-portrait-outline"
            label="Haptic Feedback"
            value={hapticFeedback}
            onValueChange={setHapticFeedback}
          />
        </Card>

        {/* Account Section */}
        <Card variant="elevated" style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <SettingItem
            icon="help-circle-outline"
            label="Help & Support"
            onPress={() => navigation.navigate('HelpSupport')}
          />
          
          <SettingItem
            icon="information-circle-outline"
            label="About"
            value="v1.0.0"
            onPress={() => navigation.navigate('About')}
          />
        </Card>

        {/* Logout Button */}
        <Button
          title="Logout"
          onPress={handleLogout}
          variant="danger"
          style={styles.logoutButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  sectionCard: {
    marginBottom: 20,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginLeft: 12,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingValue: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  logoutButton: {
    marginTop: 8,
    marginBottom: 32,
  },
});

export default SettingsScreen;

