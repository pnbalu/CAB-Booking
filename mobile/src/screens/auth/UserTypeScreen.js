import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  Animated,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import appConfig from '../../config/appConfig';

const { width } = Dimensions.get('window');

const UserTypeScreen = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim1 = useRef(new Animated.Value(100)).current;
  const slideAnim2 = useRef(new Animated.Value(100)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const headerAnim = useRef(new Animated.Value(-50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(headerAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim1, {
        toValue: 0,
        duration: 600,
        delay: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim2, {
        toValue: 0,
        duration: 600,
        delay: 400,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        delay: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const features = [
    { icon: 'shield-checkmark', text: 'Safe & Secure' },
    { icon: 'time', text: '24/7 Available' },
    { icon: 'star', text: 'Rated 4.8+ Stars' },
    { icon: 'flash', text: 'Fast Booking' },
  ];

  return (
    <LinearGradient
      colors={['#667eea', '#667eea']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Animated.View
            style={[
              styles.header,
              {
                opacity: fadeAnim,
                transform: [{ translateY: headerAnim }],
              },
            ]}
          >
            <View style={styles.logoContainer}>
              <LinearGradient
                colors={['#fff', '#f0f0f0']}
                style={styles.logoCircle}
              >
                <Ionicons name="car-sport" size={48} color="#000" />
              </LinearGradient>
            </View>
            <Text style={styles.title}>Welcome to</Text>
            <Text style={styles.brandName}>RideShare</Text>
            <Text style={styles.subtitle}>
              Your journey, simplified. Choose your experience.
            </Text>
          </Animated.View>

          {/* Features */}
          <Animated.View
            style={[
              styles.featuresContainer,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            {features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  <Ionicons name={feature.icon} size={20} color="#fff" />
                </View>
                <Text style={styles.featureText}>{feature.text}</Text>
              </View>
            ))}
          </Animated.View>

          {/* Cards */}
          <View style={styles.cardsContainer}>
            <Animated.View
              style={{
                opacity: fadeAnim,
                transform: [{ translateX: slideAnim1 }],
              }}
            >
              <TouchableOpacity
                style={styles.card}
                onPress={() => navigation.navigate('Login', { userType: 'rider' })}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={['#fff', '#f8f8f8']}
                  style={styles.cardGradient}
                >
                  <View style={styles.cardHeader}>
                    <View style={[styles.iconWrapper, styles.riderIconWrapper]}>
                      <LinearGradient
                        colors={['#000', '#333']}
                        style={styles.iconGradient}
                      >
                        <Ionicons name="person" size={56} color="#fff" />
                      </LinearGradient>
                    </View>
                    <View style={styles.badge}>
                      <Ionicons name="star" size={14} color="#FFD700" />
                      <Text style={styles.badgeText}>Popular</Text>
                    </View>
                  </View>
                  <Text style={styles.cardTitle}>Rider</Text>
                  <Text style={styles.cardDescription}>
                    Book a ride and get to your destination safely and comfortably
                  </Text>
                  <View style={styles.benefitsList}>
                    <View style={styles.benefitItem}>
                      <Ionicons name="checkmark-circle" size={18} color="#32CD32" />
                      <Text style={styles.benefitText}>Instant booking</Text>
                    </View>
                    <View style={styles.benefitItem}>
                      <Ionicons name="checkmark-circle" size={18} color="#32CD32" />
                      <Text style={styles.benefitText}>Real-time tracking</Text>
                    </View>
                    <View style={styles.benefitItem}>
                      <Ionicons name="checkmark-circle" size={18} color="#32CD32" />
                      <Text style={styles.benefitText}>Multiple payment options</Text>
                    </View>
                  </View>
                  <View style={styles.arrowContainer}>
                    <Text style={styles.arrowText}>Get Started</Text>
                    <Ionicons name="arrow-forward" size={24} color="#000" />
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

            <Animated.View
              style={{
                opacity: fadeAnim,
                transform: [{ translateX: slideAnim2 }],
              }}
            >
              <TouchableOpacity
                style={styles.card}
                onPress={() => navigation.navigate('Login', { userType: 'driver' })}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={['#fff', '#f8f8f8']}
                  style={styles.cardGradient}
                >
                  <View style={styles.cardHeader}>
                    <View style={[styles.iconWrapper, styles.driverIconWrapper]}>
                      <LinearGradient
                        colors={['#000', '#333']}
                        style={styles.iconGradient}
                      >
                        <Ionicons name="car-sport" size={56} color="#fff" />
                      </LinearGradient>
                    </View>
                    <View style={[styles.badge, styles.earnBadge]}>
                      <Ionicons name="cash" size={14} color="#32CD32" />
                      <Text style={styles.badgeText}>Earn</Text>
                    </View>
                  </View>
                  <Text style={styles.cardTitle}>Driver</Text>
                  <Text style={styles.cardDescription}>
                    Drive and earn money on your schedule with flexible hours
                  </Text>
                  <View style={styles.benefitsList}>
                    <View style={styles.benefitItem}>
                      <Ionicons name="checkmark-circle" size={18} color="#32CD32" />
                      <Text style={styles.benefitText}>Flexible schedule</Text>
                    </View>
                    <View style={styles.benefitItem}>
                      <Ionicons name="checkmark-circle" size={18} color="#32CD32" />
                      <Text style={styles.benefitText}>Competitive earnings</Text>
                    </View>
                    <View style={styles.benefitItem}>
                      <Ionicons name="checkmark-circle" size={18} color="#32CD32" />
                      <Text style={styles.benefitText}>Weekly payouts</Text>
                    </View>
                  </View>
                  <View style={styles.arrowContainer}>
                    <Text style={styles.arrowText}>Start Driving</Text>
                    <Ionicons name="arrow-forward" size={24} color="#000" />
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          </View>

          {/* Footer */}
          <Animated.View
            style={[
              styles.footer,
              {
                opacity: fadeAnim,
              },
            ]}
          >
            <Text style={styles.footerText}>
              By continuing, you agree to our Terms of Service and Privacy Policy
            </Text>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    marginBottom: 20,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  title: {
    fontSize: 24,
    color: '#fff',
    fontWeight: '300',
    marginBottom: 8,
    letterSpacing: 1,
  },
  brandName: {
    fontSize: 52,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 12,
    letterSpacing: 3,
  },
  subtitle: {
    fontSize: 16,
    color: '#ccc',
    fontWeight: '300',
    textAlign: 'center',
    lineHeight: 22,
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 40,
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
  },
  featureIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  cardsContainer: {
    gap: 24,
    marginBottom: 20,
  },
  card: {
    borderRadius: 28,
    overflow: 'hidden',
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
  },
  cardGradient: {
    padding: 28,
    minHeight: 320,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  iconWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  riderIconWrapper: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  driverIconWrapper: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  iconGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#667eea',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
    backdropFilter: 'blur(10px)',
  },
  earnBadge: {
    backgroundColor: '#32CD32',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  cardTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: '#000',
    marginBottom: 12,
  },
  cardDescription: {
    fontSize: 15,
    color: '#666',
    textAlign: 'left',
    marginBottom: 20,
    lineHeight: 22,
    fontWeight: '400',
  },
  benefitsList: {
    marginBottom: 24,
    gap: 12,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  benefitText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  arrowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#667eea',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 20,
    gap: 8,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  arrowText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
    paddingBottom: 20,
  },
  footerText: {
    fontSize: 11,
    color: '#999',
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default UserTypeScreen;
