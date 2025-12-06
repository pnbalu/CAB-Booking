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
  Alert,
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
      const info = await settingsApi.getSupportInfo('rider');
      setSupportInfo(info);
    } catch (error) {
      console.error('Error loading support info:', error);
    }
  };

  const faqs = [
    {
      id: 1,
      category: 'Booking',
      question: 'How do I book a ride?',
      answer: 'To book a ride, open the app and enter your destination. Select your preferred ride type, confirm the pickup location, and tap "Book Ride". You\'ll be matched with a nearby driver.',
    },
    {
      id: 2,
      category: 'Booking',
      question: 'Can I schedule a ride in advance?',
      answer: 'Yes! You can schedule rides up to 7 days in advance. Tap the calendar icon when booking and select your preferred date and time.',
    },
    {
      id: 3,
      category: 'Payment',
      question: 'What payment methods are accepted?',
      answer: 'We accept credit cards, debit cards, cash, Google Pay, and internet banking. You can add multiple payment methods in your profile settings.',
    },
    {
      id: 4,
      category: 'Payment',
      question: 'How do I change my payment method?',
      answer: 'Go to Profile > Payment Methods. You can add, edit, or set a default payment method. Your selected payment method will be used for all rides.',
    },
    {
      id: 5,
      category: 'Ride Issues',
      question: 'What if my driver cancels?',
      answer: 'If your driver cancels, we\'ll automatically find you another driver. You won\'t be charged any cancellation fee. If no driver is available, you\'ll receive a full refund.',
    },
    {
      id: 6,
      category: 'Ride Issues',
      question: 'How do I cancel a ride?',
      answer: 'You can cancel a ride from the ride status screen. Free cancellation is available within 2 minutes of booking. After that, a cancellation fee may apply.',
    },
    {
      id: 7,
      category: 'Account',
      question: 'How do I update my profile?',
      answer: 'Go to Profile > Edit Profile. You can update your name, email, phone number, and profile photo. Changes are saved automatically.',
    },
    {
      id: 8,
      category: 'Account',
      question: 'How do I delete my account?',
      answer: 'To delete your account, go to Settings > Account > Delete Account. This action is permanent and cannot be undone. All your ride history and data will be deleted.',
    },
    {
      id: 9,
      category: 'Safety',
      question: 'What safety features are available?',
      answer: 'We provide real-time ride tracking, driver information, emergency contact button, and 24/7 support. All drivers are verified and background-checked.',
    },
    {
      id: 10,
      category: 'Safety',
      question: 'How do I report a safety concern?',
      answer: 'You can report safety concerns through the app by going to Help & Support > Report a Problem, or contact our safety team directly at safety@cabbooking.com or call our emergency line.',
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
        Linking.openURL(`mailto:${supportInfo.email}?subject=Support Request`);
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
                       action.id === 2 ? t('help.callSupport') :
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
              onPress={() => Linking.openURL(`mailto:${supportInfo.email}`)}
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

        {/* Helpful Links */}
        <Card variant="elevated" style={styles.linksCard}>
          <Text style={styles.sectionTitle}>{t('help.helpfulLinks')}</Text>
          <TouchableOpacity
            style={styles.linkItem}
            onPress={() => navigation.navigate('TermsOfService')}
          >
            <Ionicons name="document-text-outline" size={20} color="#667eea" />
            <Text style={styles.linkText}>{t('help.termsOfService')}</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.linkItem}
            onPress={() => navigation.navigate('PrivacyPolicy')}
          >
            <Ionicons name="shield-outline" size={20} color="#667eea" />
            <Text style={styles.linkText}>{t('help.privacyPolicy')}</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.linkItem}
            onPress={() => navigation.navigate('SafetyTips')}
          >
            <Ionicons name="shield-checkmark-outline" size={20} color="#667eea" />
            <Text style={styles.linkText}>{t('help.safetyTips')}</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const filtered = (obj) => {
  return Object.keys(obj).filter((key) => obj[key].length > 0);
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
    padding: 4,
  },
  quickActionsContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 16,
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
    minHeight: 120,
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
    fontSize: 18,
    fontWeight: '700',
    color: '#667eea',
    marginBottom: 12,
    marginTop: 8,
  },
  faqCard: {
    marginBottom: 12,
    padding: 16,
  },
  faqQuestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginRight: 12,
  },
  faqAnswer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  faqAnswerText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  noResultsCard: {
    padding: 48,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  contactCard: {
    padding: 20,
    marginBottom: 20,
  },
  contactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginLeft: 12,
  },
  contactText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
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
    color: '#667eea',
    fontWeight: '600',
  },
  linksCard: {
    padding: 20,
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  linkText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginLeft: 12,
  },
});

export default HelpSupportScreen;

