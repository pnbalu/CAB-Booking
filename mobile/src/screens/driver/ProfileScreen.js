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
    { label: 'Total Rides', value: '120', icon: 'car-outline', color: '#667eea' },
    { label: 'Rating', value: '4.8', icon: 'star-outline', color: '#f093fb' },
    { label: 'Earnings', value: '$2.4K', icon: 'cash-outline', color: '#4facfe' },
  ];

  const menuItems = [
    { icon: 'person-outline', label: 'Edit Profile', onPress: () => navigation.navigate('EditProfile'), color: '#667eea' },
    { icon: 'time-outline', label: 'Ride History', onPress: () => navigation.navigate('History'), color: '#f093fb' },
    { icon: 'car-outline', label: 'Vehicle Info', onPress: () => navigation.navigate('VehicleInfo'), color: '#4facfe' },
    { icon: 'card-outline', label: 'Earnings', onPress: () => navigation.navigate('Earnings'), color: '#43e97b' },
    { icon: 'document-text-outline', label: 'Documents', onPress: () => navigation.navigate('Documents'), color: '#fa709a' },
    { icon: 'gift-outline', label: 'Refer a Friend', onPress: () => navigation.navigate('Referral'), color: '#f59e0b' },
    { icon: 'help-circle-outline', label: 'Help & Support', onPress: () => navigation.navigate('HelpSupport'), color: '#fee140' },
    { icon: 'settings-outline', label: 'Settings', onPress: () => navigation.navigate('Settings'), color: '#667eea' },
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
          <TouchableOpacity
            style={[styles.avatarContainer, { top: insets.top + 35 }]}
            onPress={() => navigation.navigate('EditProfile')}
            activeOpacity={0.8}
          >
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
          </TouchableOpacity>
          <View style={styles.userInfoContainer}>
            <Text style={styles.name}>{user?.name || 'Driver'}</Text>
            <View style={styles.userInfoRow}>
              <Ionicons name="mail-outline" size={14} color="#666" style={styles.infoIcon} />
              <Text style={styles.email}>{user?.email || ''}</Text>
            </View>
            <View style={styles.userInfoRow}>
              <Ionicons name="call-outline" size={14} color="#666" style={styles.infoIcon} />
              <Text style={styles.phone}>{user?.phone || ''}</Text>
            </View>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={18} color="#FFD700" />
              <Text style={styles.rating}>4.8</Text>
              <Text style={styles.ratingText}>(120 rides)</Text>
            </View>
            {user?.verified ? (
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={16} color="#4ade80" />
                <Text style={styles.verifiedText}>Verified Driver</Text>
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
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
    gap: 6,
  },
  rating: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
  },
  ratingText: {
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
  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    backgroundColor: '#fffbeb',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  pendingText: {
    fontSize: 12,
    color: '#f59e0b',
    fontWeight: '600',
    marginLeft: 4,
  },
  unverifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  unverifiedText: {
    fontSize: 12,
    color: '#999',
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

