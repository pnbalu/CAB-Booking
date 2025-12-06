import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../components/Header';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { t } from '../../i18n';
import appConfig from '../../config/appConfig';

const ReceiptScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();
  const ride = route?.params?.ride;
  const [sending, setSending] = useState(false);

  if (!ride) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text>No ride data available</Text>
        </View>
      </SafeAreaView>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const generateReceiptText = () => {
    return `
${appConfig.name.toUpperCase()} - RIDE RECEIPT
===========================

Receipt ID: ${ride.id}
Date: ${formatDate(ride.completedAt || ride.createdAt)}

PASSENGER INFORMATION
---------------------
Name: ${user?.name || 'N/A'}
Email: ${user?.email || 'N/A'}
Phone: ${user?.phone || 'N/A'}

RIDE DETAILS
------------
Pickup Location: ${ride.pickup?.latitude?.toFixed(6)}, ${ride.pickup?.longitude?.toFixed(6)}
Destination: ${ride.destination?.latitude?.toFixed(6)}, ${ride.destination?.longitude?.toFixed(6)}
Ride Type: ${ride.rideType?.charAt(0).toUpperCase() + ride.rideType?.slice(1) || 'Standard'}

${ride.driver ? `
DRIVER INFORMATION
------------------
Name: ${ride.driver.name || 'N/A'}
Rating: ${ride.driver.rating || 'N/A'}
` : ''}

PAYMENT INFORMATION
-------------------
Fare: $${ride.fare?.toFixed(2)}
Status: ${ride.status?.charAt(0).toUpperCase() + ride.status?.slice(1)}

Thank you for using ${appConfig.name}!
    `.trim();
  };

  const handleSendEmail = async () => {
    if (!user?.email) {
      Alert.alert(
        'Error',
        'Email address not found. Please update your profile with an email address.',
        [{ text: 'OK' }]
      );
      return;
    }

    setSending(true);

    // Simulate email sending
    setTimeout(() => {
      setSending(false);
      Alert.alert(
        'Receipt Sent!',
        `Receipt has been sent to ${user.email}`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    }, 2000);
  };

  const handleShare = async () => {
    try {
      const receiptText = generateReceiptText();
      await Share.share({
        message: receiptText,
        title: 'Ride Receipt',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share receipt');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Ride Receipt" />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Receipt Card */}
        <Card variant="elevated" style={styles.receiptCard}>
          <View style={styles.receiptHeader}>
            <View style={styles.logoContainer}>
              <Ionicons name="car-sport" size={40} color="#667eea" />
            </View>
            <Text style={styles.companyName}>{appConfig.name}</Text>
            <Text style={styles.receiptLabel}>RIDE RECEIPT</Text>
          </View>

          <View style={styles.divider} />

          {/* Receipt ID */}
          <View style={styles.receiptRow}>
            <Text style={styles.receiptLabelSmall}>Receipt ID</Text>
            <Text style={styles.receiptValue}>{ride.id}</Text>
          </View>

          <View style={styles.divider} />

          {/* Date */}
          <View style={styles.receiptRow}>
            <Text style={styles.receiptLabelSmall}>Date</Text>
            <Text style={styles.receiptValue}>
              {formatDate(ride.completedAt || ride.createdAt)}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Passenger Information</Text>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabelSmall}>Name</Text>
              <Text style={styles.receiptValue}>{user?.name || 'N/A'}</Text>
            </View>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabelSmall}>Email</Text>
              <Text style={styles.receiptValue}>{user?.email || 'N/A'}</Text>
            </View>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabelSmall}>Phone</Text>
              <Text style={styles.receiptValue}>{user?.phone || 'N/A'}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ride Details</Text>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabelSmall}>Ride Type</Text>
              <Text style={styles.receiptValue}>
                {ride.rideType?.charAt(0).toUpperCase() + ride.rideType?.slice(1) || 'Standard'}
              </Text>
            </View>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabelSmall}>Status</Text>
              <Text style={styles.receiptValue}>
                {ride.status?.charAt(0).toUpperCase() + ride.status?.slice(1)}
              </Text>
            </View>
          </View>

          {ride.driver && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Driver Information</Text>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabelSmall}>Driver Name</Text>
                <Text style={styles.receiptValue}>{ride.driver.name || 'N/A'}</Text>
              </View>
              {ride.driver.rating && (
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabelSmall}>Rating</Text>
                  <View style={styles.ratingContainer}>
                    <Ionicons name="star" size={16} color="#FFD700" />
                    <Text style={styles.receiptValue}>{ride.driver.rating}</Text>
                  </View>
                </View>
              )}
            </View>
          )}

          <View style={styles.divider} />

          {/* Fare */}
          <View style={styles.fareSection}>
            <View style={styles.receiptRow}>
              <Text style={styles.fareLabel}>Total Fare</Text>
              <Text style={styles.fareValue}>${ride.fare?.toFixed(2)}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Thank you for using ${appConfig.name}!</Text>
            <Text style={styles.footerSubtext}>
              This is an electronic receipt. No signature required.
            </Text>
          </View>
        </Card>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <Button
            title={sending ? 'Sending...' : 'Send to Email'}
            onPress={handleSendEmail}
            loading={sending}
            style={styles.emailButton}
            icon="mail-outline"
          />
          <Button
            title="Share Receipt"
            onPress={handleShare}
            variant="secondary"
            style={styles.shareButton}
            icon="share-outline"
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
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  receiptCard: {
    padding: 24,
    marginBottom: 20,
  },
  receiptHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  companyName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#000',
    marginBottom: 4,
  },
  receiptLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
    letterSpacing: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 16,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  receiptLabelSmall: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  receiptValue: {
    fontSize: 14,
    color: '#000',
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },
  section: {
    marginTop: 20,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  fareSection: {
    marginTop: 8,
  },
  fareLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  fareValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#667eea',
  },
  footer: {
    marginTop: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  footerSubtext: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
  actions: {
    gap: 12,
    marginBottom: 32,
  },
  emailButton: {
    marginBottom: 0,
  },
  shareButton: {
    marginBottom: 0,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ReceiptScreen;

