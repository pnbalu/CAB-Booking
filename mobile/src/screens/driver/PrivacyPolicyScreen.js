import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import Header from '../../components/Header';
import Card from '../../components/Card';

const PrivacyPolicyScreen = ({ navigation }) => {
  const sections = [
    {
      key: 'section1',
      title: '1. Information We Collect',
      content: 'We collect information you provide during registration, including name, email, phone number, driver\'s license details, vehicle information, insurance details, and payment information. We also collect location data during active rides, trip history, ratings, and communications with support.',
    },
    {
      key: 'section2',
      title: '2. How We Use Your Information',
      content: 'We use your information to: verify your identity and qualifications, process payments and earnings, match you with passengers, provide customer support, ensure safety and security, comply with legal obligations, send important updates and notifications, and improve our services.',
    },
    {
      key: 'section3',
      title: '3. Information Sharing',
      content: 'We share your name, vehicle information, and ratings with passengers for ride matching. We may share information with payment processors, insurance providers, and background check services. We do not sell your personal information. We may share anonymized data for analytics and service improvement.',
    },
    {
      key: 'section4',
      title: '4. Location Data',
      content: 'We collect your location data when you are online and available for rides, during active rides, and for navigation purposes. Location data is essential for matching you with nearby passengers and providing accurate ETAs. You can control location sharing through your device settings.',
    },
    {
      key: 'section5',
      title: '5. Earnings and Tax Information',
      content: 'We maintain records of your earnings and may share this information with tax authorities as required by law. You will receive annual tax documents (1099 forms) if applicable. We recommend consulting with a tax professional regarding your tax obligations as an independent contractor.',
    },
    {
      key: 'section6',
      title: '6. Background Checks',
      content: 'We conduct background checks using third-party services. These checks may include criminal history, driving records, and verification of provided documents. You consent to these checks by registering as a driver. Results may be shared with relevant parties as necessary for safety and compliance.',
    },
    {
      key: 'section7',
      title: '7. Data Security',
      content: 'We implement industry-standard security measures to protect your information, including encryption, secure servers, and access controls. However, no system is completely secure. You are responsible for maintaining the security of your account credentials.',
    },
    {
      key: 'section8',
      title: '8. Your Rights',
      content: 'You have the right to: access your personal information, correct inaccurate data, request deletion of your account and data, opt-out of marketing communications, and file complaints about data handling. Contact driver support to exercise these rights.',
    },
    {
      key: 'section9',
      title: '9. Data Retention',
      content: 'We retain your information for as long as your account is active and for a reasonable period after deactivation to comply with legal obligations, resolve disputes, and enforce agreements. Trip history and earnings records are retained for tax and legal compliance purposes.',
    },
    {
      key: 'section10',
      title: '10. Changes to Privacy Policy',
      content: 'We may update this Privacy Policy from time to time. Significant changes will be communicated through the app or email. Continued use of the platform after changes constitutes acceptance. Review this policy periodically to stay informed.',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Privacy Policy" onBackPress={() => navigation.goBack()} />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Card variant="elevated" style={styles.headerCard}>
          <Text style={styles.lastUpdated}>Last Updated: December 2024</Text>
          <Text style={styles.intro}>
            Your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your personal information as a driver on our platform.
          </Text>
        </Card>

        {sections.map((section) => (
          <Card key={section.key} variant="elevated" style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionContent}>{section.content}</Text>
          </Card>
        ))}

        <Card variant="outlined" style={styles.footerCard}>
          <Text style={styles.footerText}>
            For questions about our Privacy Policy or to exercise your privacy rights, please contact driver support through the Help & Support section.
          </Text>
        </Card>
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
  headerCard: {
    padding: 20,
    marginBottom: 16,
  },
  lastUpdated: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
    fontWeight: '500',
  },
  intro: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  sectionCard: {
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
  },
  sectionContent: {
    fontSize: 15,
    color: '#666',
    lineHeight: 24,
  },
  footerCard: {
    padding: 20,
    backgroundColor: '#f0fdf4',
  },
  footerText: {
    fontSize: 14,
    color: '#4ade80',
    lineHeight: 20,
    textAlign: 'center',
  },
});

export default PrivacyPolicyScreen;

