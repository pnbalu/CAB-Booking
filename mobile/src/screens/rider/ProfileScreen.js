import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import Card from '../../components/Card';
import Button from '../../components/Button';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const { showConfirm, showSuccess } = useToast();

  const handleLogout = () => {
    showConfirm(
      'Logout',
      'Are you sure you want to logout?',
      () => {
        logout();
        showSuccess('Logged out successfully');
      },
      null,
      {
        confirmText: 'Logout',
        cancelText: 'Cancel',
        type: 'warning',
      }
    );
  };

  const stats = [
    { label: 'Total Rides', value: '24', icon: 'car-outline', color: '#667eea' },
    { label: 'Saved Places', value: '5', icon: 'location-outline', color: '#f093fb' },
    { label: 'Member Since', value: '2024', icon: 'calendar-outline', color: '#4facfe' },
  ];

  const menuItems = [
    { icon: 'person-outline', label: 'Edit Profile', onPress: () => navigation.navigate('EditProfile'), color: '#667eea' },
    { icon: 'time-outline', label: 'Ride History', onPress: () => navigation.navigate('History'), color: '#f093fb' },
    { icon: 'location-outline', label: 'Saved Locations', onPress: () => navigation.navigate('SavedLocations'), color: '#4facfe' },
    { icon: 'card-outline', label: 'Payment Methods', onPress: () => navigation.navigate('PaymentMethods'), color: '#43e97b' },
    { icon: 'gift-outline', label: 'Refer a Friend', onPress: () => navigation.navigate('Referral'), color: '#f59e0b' },
    { icon: 'help-circle-outline', label: 'Help & Support', onPress: () => navigation.navigate('HelpSupport'), color: '#fa709a' },
    { icon: 'settings-outline', label: 'Settings', onPress: () => navigation.navigate('Settings'), color: '#fee140' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerWrapper}>
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.header, { paddingTop: insets.top + 35 }]}
          >
            <View style={styles.avatarSpacer} />
          </LinearGradient>
          <View style={[styles.avatarContainer, { top: insets.top + 35 }]}>
            {user?.photo ? (
              <Image 
                source={{ uri: user.photo }} 
                style={styles.avatarImage}
                resizeMode="cover"
              />
            ) : (
              <LinearGradient
                colors={['#fff', '#f0f0f0']}
                style={styles.avatar}
              >
                <Ionicons name="person" size={60} color="#667eea" />
              </LinearGradient>
            )}
          </View>
          <View style={styles.userInfoContainer}>
            <Text style={styles.name}>{user?.name || 'User'}</Text>
            <View style={styles.userInfoRow}>
              <Ionicons name="mail-outline" size={14} color="#666" style={styles.infoIcon} />
              <Text style={styles.email}>{user?.email || ''}</Text>
            </View>
            <View style={styles.userInfoRow}>
              <Ionicons name="call-outline" size={14} color="#666" style={styles.infoIcon} />
              <Text style={styles.phone}>{user?.phone || ''}</Text>
            </View>
            {user?.verified ? (
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={16} color="#4ade80" />
                <Text style={styles.verifiedText}>Verified Rider</Text>
              </View>
            ) : user?.verificationStatus === 'pending' ? (
              <View style={styles.pendingBadge}>
                <Ionicons name="time-outline" size={16} color="#f59e0b" />
                <Text style={styles.pendingText}>Verification Pending</Text>
              </View>
            ) : (
              <View style={styles.unverifiedBadge}>
                <Ionicons name="alert-circle-outline" size={16} color="#999" />
                <Text style={styles.unverifiedText}>Not Verified</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.statsContainer}>
            {stats.map((stat, index) => (
              <Card key={index} variant="elevated" style={styles.statCard}>
                <View style={[styles.statIconContainer, { backgroundColor: `${stat.color}15` }]}>
                  <Ionicons name={stat.icon} size={24} color={stat.color} />
                </View>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </Card>
            ))}
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Account</Text>
          </View>
        {menuItems.map((item, index) => (
          <Card key={index} variant="elevated" style={styles.menuCard}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconContainer, { backgroundColor: `${item.color}15` }]}>
                <Ionicons name={item.icon} size={22} color={item.color} />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>
          </Card>
        ))}

        <Button
          title="Logout"
          onPress={handleLogout}
          variant="danger"
          style={styles.logoutButton}
        />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  headerWrapper: {
    position: 'relative',
  },
  header: {
    padding: 32,
    alignItems: 'center',
    paddingBottom: 32,
    paddingTop: 115,
  },
  avatarSpacer: {
    height: 60,
  },
  avatarContainer: {
    position: 'absolute',
    left: '50%',
    marginLeft: -60,
    zIndex: 10,
    elevation: 15,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    borderWidth: 4,
    borderColor: '#fff',
  },
  avatarImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    elevation: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    backgroundColor: '#fff',
    overflow: 'hidden',
    borderWidth: 4,
    borderColor: '#fff',
  },
  userInfoContainer: {
    alignItems: 'center',
    paddingTop: 80,
    paddingBottom: 20,
    backgroundColor: '#fff',
    marginTop: -20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  name: {
    fontSize: 28,
    fontWeight: '800',
    color: '#000',
    marginBottom: 12,
    textAlign: 'center',
  },
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    justifyContent: 'center',
  },
  infoIcon: {
    marginRight: 6,
  },
  email: {
    fontSize: 14,
    color: '#666',
  },
  phone: {
    fontSize: 14,
    color: '#666',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  verifiedText: {
    fontSize: 12,
    color: '#4ade80',
    fontWeight: '600',
    marginLeft: 4,
  },
  content: {
    flex: 1,
    padding: 16,
    paddingTop: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    minHeight: 100,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    textAlign: 'center',
  },
  sectionHeader: {
    marginBottom: 12,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  menuCard: {
    marginBottom: 10,
    padding: 0,
    borderRadius: 12,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  logoutButton: {
    marginTop: 20,
    marginBottom: 32,
  },
});

export default ProfileScreen;

