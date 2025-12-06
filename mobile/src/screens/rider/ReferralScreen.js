import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Share,
  Linking,
  Platform,
  Clipboard,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { useAuth } from '../../contexts/AuthContext';
import { settingsApi } from '../../services/settingsApi';
import { referralApi } from '../../services/referralApi';
import { useToast } from '../../contexts/ToastContext';
import { appConfig } from '../../config/appConfig';

const ReferralScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [referralSettings, setReferralSettings] = useState(null);
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReferralData();
  }, []);

  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const loadReferralData = async () => {
    try {
      setLoading(true);
      const settings = await settingsApi.getReferralSettings('rider');
      setReferralSettings(settings);
      
      // Get or generate unique referral code
      let code = user?.referralCode;
      if (!code && user?.id) {
        code = await referralApi.getReferralCode(user.id);
        if (!code) {
          code = referralApi.generateReferralCode(user.id, 'rider');
          await referralApi.saveReferralCode(user.id, 'rider', code);
        }
      }
      setReferralCode(code || 'RIDE123456');
      
      // Load notifications
      const stats = await referralApi.getReferralStats(user?.id);
      if (stats && stats.totalReferrals > 0) {
        setNotifications([
          {
            id: '1',
            title: 'New Referral!',
            message: `You have ${stats.totalReferrals} referral${stats.totalReferrals > 1 ? 's' : ''}`,
            time: new Date().toISOString(),
            read: false,
          },
        ]);
      }
    } catch (error) {
      console.error('Error loading referral data:', error);
      showError('Failed to load referral information');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      const message = `Join ${appConfig.name} using my referral code ${referralCode} and get ${referralSettings?.benefits?.refereeReward || '$5'} off your first ride! ${referralSettings?.benefits?.description || ''}`;
      
      const result = await Share.share({
        message,
        title: `Join ${appConfig.name}`,
      });

      if (result.action === Share.sharedAction) {
        showSuccess('Referral code shared successfully!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      showError('Failed to share referral code');
    }
  };

  const handleCopyCode = () => {
    try {
      Clipboard.setString(referralCode);
      showSuccess('Referral code copied to clipboard!');
    } catch (error) {
      console.error('Error copying code:', error);
      showError('Failed to copy referral code');
    }
  };

  const handleShareApp = async () => {
    try {
      const appStoreUrl = Platform.OS === 'ios' 
        ? 'https://apps.apple.com/app/rideshare' 
        : 'https://play.google.com/store/apps/details?id=com.rideshare';
      
      const message = `Check out ${appConfig.name}! Download the app and use my referral code ${referralCode} to get ${referralSettings?.refereeReward || '50% Off First Ride'}! ${appStoreUrl}`;
      
      const result = await Share.share({
        message,
        url: appStoreUrl,
        title: `Download ${appConfig.name}`,
      });

      if (result.action === Share.sharedAction) {
        showSuccess('App shared successfully!');
      }
    } catch (error) {
      console.error('Error sharing app:', error);
      showError('Failed to share app');
    }
  };

  const handleOpenAppStore = () => {
    const appStoreUrl = Platform.OS === 'ios' 
      ? 'https://apps.apple.com/app/rideshare' 
      : 'https://play.google.com/store/apps/details?id=com.rideshare';
    Linking.openURL(appStoreUrl).catch(err => {
      console.error('Error opening app store:', err);
      showError('Failed to open app store');
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Refer a Friend" onBackPress={() => navigation.goBack()} />
        <View style={styles.loadingContainer}>
          <Text>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!referralSettings?.enabled) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Refer a Friend" onBackPress={() => navigation.goBack()} />
        <View style={styles.disabledContainer}>
          <Ionicons name="gift-outline" size={64} color="#ccc" />
          <Text style={styles.disabledText}>Referral program is currently disabled</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Refer a Friend" onBackPress={() => navigation.goBack()} />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <Card variant="elevated" style={styles.heroCard}>
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroGradient}
          >
            <View style={styles.heroIcon}>
              <Ionicons name="gift" size={48} color="#fff" />
            </View>
            <Text style={styles.heroTitle}>Refer & Earn</Text>
            <Text style={styles.heroSubtitle}>
              Share {appConfig.name} with friends and earn rewards!
            </Text>
          </LinearGradient>
        </Card>

        {/* Benefits Card */}
        <Card variant="elevated" style={styles.benefitsCard}>
          <View style={styles.benefitsHeader}>
            <Ionicons name="star" size={24} color="#f59e0b" />
            <Text style={styles.benefitsTitle}>Your Benefits</Text>
          </View>
          <View style={styles.benefitItem}>
            <View style={styles.benefitIcon}>
              <Ionicons name="person-add" size={24} color="#4ade80" />
            </View>
            <View style={styles.benefitContent}>
              <Text style={styles.benefitLabel}>You Get</Text>
              <Text style={styles.benefitValue}>
                {referralSettings?.referrerReward || '$10'}
              </Text>
              <Text style={styles.benefitDescription}>
                When your friend signs up and takes their first ride
              </Text>
            </View>
          </View>
          <View style={styles.benefitItem}>
            <View style={styles.benefitIcon}>
              <Ionicons name="heart" size={24} color="#f093fb" />
            </View>
            <View style={styles.benefitContent}>
              <Text style={styles.benefitLabel}>Your Friend Gets</Text>
              <Text style={styles.benefitValue}>
                {referralSettings?.refereeReward || '$5'}
              </Text>
              <Text style={styles.benefitDescription}>
                Off their first ride when they use your code
              </Text>
            </View>
          </View>
        </Card>

        {/* Description */}
        {referralSettings?.description && (
          <Card variant="outlined" style={styles.descriptionCard}>
            <Text style={styles.descriptionText}>
              {referralSettings.description}
            </Text>
          </Card>
        )}

        {/* Referral Code Card */}
        <Card variant="elevated" style={styles.codeCard}>
          <Text style={styles.codeLabel}>Your Referral Code</Text>
          <TouchableOpacity
            style={styles.codeContainer}
            onPress={handleCopyCode}
            activeOpacity={0.7}
          >
            <Text style={styles.codeText}>{referralCode}</Text>
            <Ionicons name="copy-outline" size={24} color="#667eea" />
          </TouchableOpacity>
          <Text style={styles.codeHint}>Tap to copy</Text>
        </Card>

        {/* Share Buttons */}
        <View style={styles.shareSection}>
          <Button
            title="Share Referral Code"
            onPress={handleShare}
            icon="share-social"
            style={styles.shareButton}
          />
          <Button
            title="Share App"
            onPress={handleShareApp}
            icon="download-outline"
            variant="secondary"
            style={styles.shareButton}
          />
          <TouchableOpacity
            style={styles.appStoreButton}
            onPress={handleOpenAppStore}
            activeOpacity={0.7}
          >
            <Ionicons name="storefront-outline" size={20} color="#667eea" />
            <Text style={styles.appStoreButtonText}>
              {Platform.OS === 'ios' ? 'Download on App Store' : 'Get it on Google Play'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* How It Works */}
        <Card variant="elevated" style={styles.howItWorksCard}>
          <Text style={styles.howItWorksTitle}>How It Works</Text>
          <View style={styles.stepItem}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <Text style={styles.stepText}>
              Share your referral code with friends via message, email, or social media
            </Text>
          </View>
          <View style={styles.stepItem}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <Text style={styles.stepText}>
              Your friend signs up using your referral code
            </Text>
          </View>
          <View style={styles.stepItem}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <Text style={styles.stepText}>
              Your friend takes their first ride and you both get rewarded!
            </Text>
          </View>
        </Card>
      </ScrollView>

      {/* Notification Bell Icon */}
      <TouchableOpacity
        style={styles.notificationBell}
        onPress={() => setShowNotifications(!showNotifications)}
        activeOpacity={0.7}
      >
        <Ionicons name="notifications" size={24} color="#fff" />
        {notifications.filter(n => !n.read).length > 0 && (
          <View style={styles.notificationBadge}>
            <Text style={styles.notificationBadgeText}>
              {notifications.filter(n => !n.read).length}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Notifications Modal */}
      {showNotifications && (
        <View style={styles.notificationsModal}>
          <View style={styles.notificationsHeader}>
            <Text style={styles.notificationsTitle}>Notifications</Text>
            <TouchableOpacity onPress={() => setShowNotifications(false)}>
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.notificationsList}>
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <TouchableOpacity
                  key={notification.id}
                  style={styles.notificationItem}
                  onPress={() => {
                    setNotifications(prev =>
                      prev.map(n =>
                        n.id === notification.id ? { ...n, read: true } : n
                      )
                    );
                  }}
                >
                  <View style={styles.notificationContent}>
                    <Text style={styles.notificationItemTitle}>{notification.title}</Text>
                    <Text style={styles.notificationItemMessage}>{notification.message}</Text>
                    <Text style={styles.notificationItemTime}>
                      {new Date(notification.time).toLocaleDateString()}
                    </Text>
                  </View>
                  {!notification.read && <View style={styles.unreadDot} />}
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.noNotifications}>
                <Ionicons name="notifications-off-outline" size={48} color="#ccc" />
                <Text style={styles.noNotificationsText}>No notifications</Text>
              </View>
            )}
          </ScrollView>
        </View>
      )}
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
    paddingBottom: 120, // Increased padding to accommodate bell icon
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  disabledText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
  heroCard: {
    marginBottom: 16,
    overflow: 'hidden',
  },
  heroGradient: {
    padding: 32,
    alignItems: 'center',
  },
  heroIcon: {
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
    textAlign: 'center',
  },
  benefitsCard: {
    padding: 20,
    marginBottom: 16,
  },
  benefitsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 8,
  },
  benefitsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
  },
  benefitItem: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 16,
  },
  benefitIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  benefitContent: {
    flex: 1,
  },
  benefitLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  benefitValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  benefitDescription: {
    fontSize: 13,
    color: '#999',
  },
  descriptionCard: {
    padding: 20,
    marginBottom: 16,
    backgroundColor: '#f8f9fa',
  },
  descriptionText: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
    textAlign: 'center',
  },
  codeCard: {
    padding: 20,
    marginBottom: 16,
  },
  codeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
    textAlign: 'center',
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f0f4ff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#667eea',
    marginBottom: 8,
  },
  codeText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#667eea',
    letterSpacing: 2,
  },
  codeHint: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
  shareSection: {
    marginBottom: 16,
  },
  shareButton: {
    marginBottom: 0,
  },
  howItWorksCard: {
    padding: 20,
  },
  howItWorksTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 20,
  },
  stepItem: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 16,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  stepText: {
    flex: 1,
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
    paddingTop: 4,
  },
  notificationBell: {
    position: 'absolute',
    bottom: 100, // Increased to be above bottom tab bar
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    zIndex: 1000,
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  notificationBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  notificationsModal: {
    position: 'absolute',
    bottom: 170, // Positioned above the bell icon
    right: 24,
    width: 320,
    maxHeight: 400,
    backgroundColor: '#fff',
    borderRadius: 16,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    zIndex: 999,
  },
  notificationsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  notificationsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  notificationsList: {
    maxHeight: 320,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  notificationContent: {
    flex: 1,
  },
  notificationItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  notificationItemMessage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  notificationItemTime: {
    fontSize: 12,
    color: '#999',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#667eea',
    marginLeft: 8,
    marginTop: 4,
  },
  noNotifications: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noNotificationsText: {
    fontSize: 16,
    color: '#999',
    marginTop: 12,
  },
  appStoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
    padding: 14,
    borderRadius: 12,
    marginTop: 8,
    gap: 8,
  },
  appStoreButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#667eea',
  },
});

export default ReferralScreen;

