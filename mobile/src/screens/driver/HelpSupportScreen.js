import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../components/Header';
import Card from '../../components/Card';
import { t } from '../../i18n';
import { settingsApi } from '../../services/settingsApi';

const HelpSupportScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState(null);
  const [supportInfo, setSupportInfo] = useState({
    phone: '+1 (800) 123-4567',
    email: 'support@cabbooking.com',
    emergencyPhone: '+1 (800) 911-HELP',
  });

  useEffect(() => {
    loadSupportInfo();
  }, []);

  const loadSupportInfo = async () => {
    try {
      const info = await settingsApi.getSupportInfo('driver');
      setSupportInfo(info);
    } catch (error) {
      console.error('Error loading support info:', error);
    }
  };

  const faqs = [
    {
      id: 1,
      category: 'Getting Started',
      question: 'How do I become a driver?',
      answer: 'To become a driver, complete your profile, upload required documents (driver\'s license, vehicle registration, insurance), and pass a background check. Once approved, you can start accepting rides.',
    },
    {
      id: 2,
      category: 'Getting Started',
      question: 'What documents do I need to drive?',
      answer: 'You need a valid driver\'s license, vehicle registration certificate, and insurance certificate. Optional documents include background check and vehicle inspection report. All documents must be approved before you can drive.',
    },
    {
      id: 3,
      category: 'Earnings & Payouts',
      question: 'How do I get paid?',
      answer: 'Earnings are automatically transferred to your selected payment method every Monday. You can also request an early payout if your balance exceeds $50. Go to Earnings > Payout Information to set up your payment method.',
    },
    {
      id: 4,
      category: 'Earnings & Payouts',
      question: 'What payment methods are available for payouts?',
      answer: 'We support bank transfers, PayPal, Venmo, Cash App, and Zelle. You can add and manage your payout methods in the Earnings screen. Each payout method has different processing times.',
    },
    {
      id: 5,
      category: 'Earnings & Payouts',
      question: 'How are my earnings calculated?',
      answer: 'You earn based on distance traveled, time spent, and ride type. Base fare, distance charges, and time charges are included. Platform fees are deducted automatically. You can view detailed breakdowns in your Earnings screen.',
    },
    {
      id: 6,
      category: 'Vehicle Requirements',
      question: 'What vehicles are eligible?',
      answer: 'Vehicles must be 10 years old or newer, have 4 doors, pass safety inspection, and meet local regulations. Commercial vehicles, taxis, and vehicles with commercial markings are not allowed.',
    },
    {
      id: 7,
      category: 'Vehicle Requirements',
      question: 'Can I drive multiple vehicles?',
      answer: 'Yes, you can register multiple vehicles in your profile. However, you can only use one vehicle at a time. Make sure all vehicles meet our requirements and have valid documentation.',
    },
    {
      id: 8,
      category: 'Ride Management',
      question: 'How do I accept or decline rides?',
      answer: 'When a ride request comes in, you\'ll see the pickup location, destination, and estimated fare. Tap "Accept" to take the ride or "Decline" to pass. Your acceptance rate affects your driver rating.',
    },
    {
      id: 9,
      category: 'Ride Management',
      question: 'What if I need to cancel a ride?',
      answer: 'You can cancel a ride before picking up the passenger without penalty. Frequent cancellations may affect your driver rating. If you cancel after pickup, it may result in a penalty fee.',
    },
    {
      id: 10,
      category: 'Ride Management',
      question: 'How do I navigate to the pickup location?',
      answer: 'Once you accept a ride, tap "Navigate" to open your preferred navigation app (Google Maps, Apple Maps, or Waze). The app will provide turn-by-turn directions to the pickup location.',
    },
    {
      id: 11,
      category: 'Ratings & Reviews',
      question: 'How do ratings work?',
      answer: 'Passengers rate you after each ride on a scale of 1-5 stars. Your overall rating is the average of your last 100 rides. Maintaining a high rating helps you get more ride requests.',
    },
    {
      id: 12,
      category: 'Ratings & Reviews',
      question: 'What happens if my rating drops too low?',
      answer: 'If your rating falls below 4.0, you may receive a warning. Continued low ratings may result in temporary suspension or deactivation. We provide resources to help improve your service.',
    },
    {
      id: 13,
      category: 'Documents',
      question: 'How long does document approval take?',
      answer: 'Document review typically takes 24-48 hours. You\'ll receive a notification once your documents are reviewed. If rejected, you\'ll see the reason and can upload corrected documents.',
    },
    {
      id: 14,
      category: 'Documents',
      question: 'What if my documents expire?',
      answer: 'You\'ll receive reminders before your documents expire. Upload updated documents before expiration to avoid account suspension. Expired documents must be renewed to continue driving.',
    },
    {
      id: 15,
      category: 'Account & Profile',
      question: 'How do I update my vehicle information?',
      answer: 'Go to Profile > Edit Profile > Vehicle Information. You can update your vehicle model, license plate, and upload a new car photo. Changes may require re-verification.',
    },
    {
      id: 16,
      category: 'Account & Profile',
      question: 'Can I change my payout method?',
      answer: 'Yes, you can change your payout method anytime in the Earnings screen. Go to Payout Information > Payment Method and select or add a new method. Changes take effect for the next payout cycle.',
    },
    {
      id: 17,
      category: 'Safety & Support',
      question: 'What safety features are available for drivers?',
      answer: 'We provide emergency assistance, incident reporting, 24/7 support, and insurance coverage. You can also share your trip status with trusted contacts and use the in-app emergency button.',
    },
    {
      id: 18,
      category: 'Safety & Support',
      question: 'How do I report a problem with a passenger?',
      answer: 'After completing a ride, you can rate the passenger and report issues. For urgent safety concerns, use the emergency button or contact support immediately. All reports are reviewed promptly.',
    },
    {
      id: 19,
      category: 'Safety & Support',
      question: 'What if I\'m involved in an accident?',
      answer: 'If you\'re involved in an accident, ensure everyone is safe, call emergency services if needed, and report the incident through the app immediately. Our insurance team will assist you with the claims process.',
    },
    {
      id: 20,
      category: 'Technical Issues',
      question: 'The app is not working properly. What should I do?',
      answer: 'Try restarting the app, checking your internet connection, and updating to the latest version. If issues persist, contact support or report the problem through Help & Support > Report a Problem.',
    },
  ];

  const quickActions = [
    {
      id: 1,
      icon: 'chatbubbles',
      title: t('help.liveChat'),
      description: t('help.liveChat'),
      color: '#667eea',
      onPress: () => {
        navigation.navigate('LiveChat');
      },
    },
    {
      id: 2,
      icon: 'call',
      title: t('help.callSupport'),
      description: supportInfo.phone,
      color: '#4ade80',
      onPress: () => {
        Linking.openURL(`tel:${supportInfo.phone.replace(/\s/g, '')}`);
      },
    },
    {
      id: 3,
      icon: 'mail',
      title: t('help.emailSupport'),
      description: supportInfo.email,
      color: '#f093fb',
      onPress: () => {
        Linking.openURL(`mailto:${supportInfo.email}?subject=Driver Support Request`);
      },
    },
    {
      id: 4,
      icon: 'bug',
      title: t('help.reportProblem'),
      description: t('help.reportProblem'),
      color: '#ef4444',
      onPress: () => {
        navigation.navigate('ReportProblem');
      },
    },
  ];

  const filteredFAQs = faqs.filter((faq) =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleFAQ = (id) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  const groupedFAQs = filteredFAQs.reduce((acc, faq) => {
    if (!acc[faq.category]) {
      acc[faq.category] = [];
    }
    acc[faq.category].push(faq);
    return acc;
  }, {});

  return (
    <SafeAreaView style={styles.container}>
      <Header title={t('help.title')} onBackPress={() => navigation.goBack()} />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('help.searchPlaceholder')}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>{t('help.quickActions')}</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={styles.quickActionCard}
                onPress={action.onPress}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={[`${action.color}15`, `${action.color}05`]}
                  style={styles.quickActionGradient}
                >
                  <View style={[styles.quickActionIcon, { backgroundColor: `${action.color}15` }]}>
                    <Ionicons name={action.icon} size={28} color={action.color} />
                  </View>
                  <Text style={styles.quickActionTitle}>
                    {action.id === 1 ? t('help.liveChat') :
                     action.id === 2 ? t('help.callSupport') :
                     action.id === 3 ? t('help.emailSupport') :
                     t('help.reportProblem')}
                  </Text>
                  <Text style={styles.quickActionDesc}>
                    {action.id === 1 ? t('help.liveChat') :
                     action.id === 2 ? supportInfo.phone :
                     action.id === 3 ? supportInfo.email :
                     t('help.reportProblem')}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Frequently Asked Questions */}
        <View style={styles.faqContainer}>
          <Text style={styles.sectionTitle}>
            {searchQuery ? `Search Results (${filteredFAQs.length})` : t('help.faq')}
          </Text>

          {Object.keys(groupedFAQs).length === 0 ? (
            <Card variant="outlined" style={styles.noResultsCard}>
              <Ionicons name="search-outline" size={48} color="#ccc" />
              <Text style={styles.noResultsText}>{t('help.noResults')}</Text>
              <Text style={styles.noResultsSubtext}>{t('help.tryDifferentKeywords')}</Text>
            </Card>
          ) : (
            Object.keys(groupedFAQs).map((category) => (
              <View key={category} style={styles.categorySection}>
                <Text style={styles.categoryTitle}>{category}</Text>
                {groupedFAQs[category].map((faq) => (
                  <Card key={faq.id} variant="elevated" style={styles.faqCard}>
                    <TouchableOpacity
                      style={styles.faqQuestion}
                      onPress={() => toggleFAQ(faq.id)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.faqQuestionText}>{faq.question}</Text>
                      <Ionicons
                        name={expandedFAQ === faq.id ? 'chevron-up' : 'chevron-down'}
                        size={20}
                        color="#667eea"
                      />
                    </TouchableOpacity>
                    {expandedFAQ === faq.id && (
                      <View style={styles.faqAnswer}>
                        <Text style={styles.faqAnswerText}>{faq.answer}</Text>
                      </View>
                    )}
                  </Card>
                ))}
              </View>
            ))
          )}
        </View>

        {/* Contact Information */}
        <Card variant="elevated" style={styles.contactCard}>
          <View style={styles.contactHeader}>
            <Ionicons name="information-circle" size={24} color="#667eea" />
            <Text style={styles.contactTitle}>{t('help.needMoreHelp')}</Text>
          </View>
          <Text style={styles.contactText}>
            {t('help.supportAvailable')}
          </Text>
          <View style={styles.contactDetails}>
            <TouchableOpacity
              style={styles.contactItem}
              onPress={() => Linking.openURL(`tel:${supportInfo.phone.replace(/\s/g, '')}`)}
            >
              <Ionicons name="call-outline" size={20} color="#667eea" />
              <Text style={styles.contactItemText}>{supportInfo.phone}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.contactItem}
              onPress={() => Linking.openURL(`mailto:${supportInfo.email}?subject=Driver Support Request`)}
            >
              <Ionicons name="mail-outline" size={20} color="#667eea" />
              <Text style={styles.contactItemText}>{supportInfo.email}</Text>
            </TouchableOpacity>
            <View style={styles.contactItem}>
              <Ionicons name="time-outline" size={20} color="#667eea" />
              <Text style={styles.contactItemText}>{t('help.supportHours')}</Text>
            </View>
          </View>
        </Card>

        {/* Additional Resources */}
        <View style={styles.resourcesSection}>
          <Text style={styles.sectionTitle}>Additional Resources</Text>
          <TouchableOpacity
            style={styles.resourceCard}
            onPress={() => navigation.navigate('TermsOfService')}
            activeOpacity={0.7}
          >
            <Ionicons name="document-text-outline" size={24} color="#667eea" />
            <View style={styles.resourceContent}>
              <Text style={styles.resourceTitle}>Terms of Service</Text>
              <Text style={styles.resourceDesc}>Read our terms and conditions</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.resourceCard}
            onPress={() => navigation.navigate('PrivacyPolicy')}
            activeOpacity={0.7}
          >
            <Ionicons name="shield-outline" size={24} color="#667eea" />
            <View style={styles.resourceContent}>
              <Text style={styles.resourceTitle}>Privacy Policy</Text>
              <Text style={styles.resourceDesc}>How we protect your data</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.resourceCard}
            onPress={() => navigation.navigate('SafetyTips')}
            activeOpacity={0.7}
          >
            <Ionicons name="shield-checkmark-outline" size={24} color="#667eea" />
            <View style={styles.resourceContent}>
              <Text style={styles.resourceTitle}>Safety Tips</Text>
              <Text style={styles.resourceDesc}>Best practices for drivers</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
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
    paddingBottom: 32,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  clearButton: {
    marginLeft: 8,
  },
  quickActionsContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionCard: {
    width: '48%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  quickActionGradient: {
    padding: 16,
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
    textAlign: 'center',
  },
  quickActionDesc: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  faqContainer: {
    marginBottom: 24,
  },
  categorySection: {
    marginBottom: 20,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#667eea',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  faqCard: {
    marginBottom: 12,
    padding: 0,
    overflow: 'hidden',
  },
  faqQuestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  faqQuestionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    marginRight: 12,
  },
  faqAnswer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  faqAnswerText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
    marginTop: 12,
  },
  noResultsCard: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noResultsText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#666',
    marginTop: 16,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
  },
  contactCard: {
    padding: 20,
    marginBottom: 24,
  },
  contactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  contactText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  contactDetails: {
    gap: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  contactItemText: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
  },
  resourcesSection: {
    marginBottom: 24,
  },
  resourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  resourceContent: {
    flex: 1,
    marginLeft: 12,
  },
  resourceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  resourceDesc: {
    fontSize: 13,
    color: '#666',
  },
});

export default HelpSupportScreen;

