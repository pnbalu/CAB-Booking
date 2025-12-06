import React, { useState } from 'react';
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
import Header from '../../components/Header';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import ConfirmModal from '../../components/ConfirmModal';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { t, setLanguage, getAvailableLanguages } from '../../i18n';

const SettingsScreen = ({ navigation }) => {
  const { logout } = useAuth();
  const { showSuccess, showInfo, showConfirm } = useToast();
  
  // Notification settings
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [rideUpdates, setRideUpdates] = useState(true);
  const [promotions, setPromotions] = useState(false);

  // Privacy settings
  const [shareLocation, setShareLocation] = useState(true);
  const [shareProfile, setShareProfile] = useState(false);

  // App preferences
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguageState] = useState('en');
  const [availableLanguages] = useState(getAvailableLanguages());
  const [soundEffects, setSoundEffects] = useState(true);
  const [hapticFeedback, setHapticFeedback] = useState(true);

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
    // For now, show info - in production you'd use a custom language picker modal
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
      <Header title={t('settings.title')} />

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
            label="Ride Updates"
            value={rideUpdates}
            onValueChange={setRideUpdates}
          />
          
          <SettingSwitch
            icon="gift-outline"
            label="Promotions & Offers"
            value={promotions}
            onValueChange={setPromotions}
          />
        </Card>

        {/* Privacy & Security Section */}
        <Card variant="elevated" style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>{t('settings.privacy')}</Text>
          
          <SettingSwitch
            icon="location-outline"
            label="Share Location"
            value={shareLocation}
            onValueChange={setShareLocation}
          />
          
          <SettingSwitch
            icon="people-outline"
            label="Share Profile with Drivers"
            value={shareProfile}
            onValueChange={setShareProfile}
          />
          
          <SettingItem
            icon="lock-closed-outline"
            label={t('settings.password.title')}
            onPress={() => navigation.navigate('ChangePassword')}
          />
          
          <SettingItem
            icon="shield-checkmark-outline"
            label="Two-Factor Authentication"
            value="Disabled"
            onPress={() => Alert.alert('Coming Soon', '2FA feature coming soon')}
          />
        </Card>

        {/* App Preferences Section */}
        <Card variant="elevated" style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>{t('settings.preferences')}</Text>
          
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
            onPress={() => {
              handleLanguageChange();
            }}
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
          <Text style={styles.sectionTitle}>{t('settings.account')}</Text>
          
          <SettingItem
            icon="document-text-outline"
            label={t('settings.receipts.title')}
            onPress={() => navigation.navigate('RideReceipts')}
          />
          
          <SettingItem
            icon="information-circle-outline"
            label={t('settings.about.title')}
            value="v1.0.0"
            onPress={() => navigation.navigate('About')}
          />
        </Card>

        {/* Logout Button */}
        <Button
          title={t('profile.logout')}
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

