import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import Header from '../../components/Header';
import Card from '../../components/Card';

const TermsOfServiceScreen = ({ navigation }) => {
  const sections = [
    {
      key: 'section1',
      title: '1. Driver Agreement',
      content: 'By registering as a driver on our platform, you agree to comply with all applicable laws and regulations. You must maintain a valid driver\'s license, vehicle registration, and insurance at all times. You are responsible for ensuring your vehicle meets all safety and quality standards.',
    },
    {
      key: 'section2',
      title: '2. Driver Responsibilities',
      content: 'As a driver, you are responsible for providing safe, reliable, and professional transportation services. You must treat all passengers with respect, maintain vehicle cleanliness, follow traffic laws, and provide accurate information about your vehicle and driving history. You are also responsible for any violations or incidents that occur during rides.',
    },
    {
      key: 'section3',
      title: '3. Earnings and Payments',
      content: 'Earnings are calculated based on distance traveled, time spent, and ride type. Platform fees are deducted automatically. Payouts are processed weekly to your selected payment method. You are responsible for reporting your earnings for tax purposes. We reserve the right to adjust earnings in cases of fraud, violations, or disputes.',
    },
    {
      key: 'section4',
      title: '4. Vehicle Requirements',
      content: 'Your vehicle must be 10 years old or newer, have 4 doors, pass safety inspection, and meet local regulations. Commercial vehicles, taxis, and vehicles with commercial markings are not allowed. You must maintain your vehicle in good working condition and keep all documentation current.',
    },
    {
      key: 'section5',
      title: '5. Background Checks and Verification',
      content: 'All drivers must pass a background check and provide required documentation. We reserve the right to conduct periodic background checks and verify documents. Drivers with criminal records or violations may be disqualified. You must immediately report any changes to your driving record or license status.',
    },
    {
      key: 'section6',
      title: '6. Ratings and Reviews',
      content: 'Passengers rate drivers after each ride. Drivers with consistently low ratings may face warnings, temporary suspension, or permanent deactivation. You have the right to dispute unfair ratings. We encourage professional conduct to maintain high ratings.',
    },
    {
      key: 'section7',
      title: '7. Prohibited Activities',
      content: 'Drivers are prohibited from: accepting rides outside the platform, discriminating against passengers, using drugs or alcohol while driving, engaging in illegal activities, sharing passenger information, canceling rides without valid reason, or violating any platform policies. Violations may result in immediate deactivation.',
    },
    {
      key: 'section8',
      title: '8. Insurance and Liability',
      content: 'We provide commercial insurance coverage while you are actively providing rides through the platform. You must maintain your own personal auto insurance as required by law. You are responsible for any damages or incidents that occur outside of active rides or due to your negligence.',
    },
    {
      key: 'section9',
      title: '9. Termination',
      content: 'Either party may terminate this agreement at any time. We may suspend or deactivate your account for violations, safety concerns, or failure to meet quality standards. Upon termination, you will receive final earnings within 30 days, minus any outstanding fees or charges.',
    },
    {
      key: 'section10',
      title: '10. Changes to Terms',
      content: 'We reserve the right to modify these terms at any time. You will be notified of significant changes. Continued use of the platform after changes constitutes acceptance. If you do not agree with changes, you may terminate your account.',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Terms of Service" onBackPress={() => navigation.goBack()} />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Card variant="elevated" style={styles.headerCard}>
          <Text style={styles.lastUpdated}>Last Updated: December 2024</Text>
          <Text style={styles.intro}>
            Please read these Terms of Service carefully before using our platform as a driver. By registering and using our service, you agree to be bound by these terms and conditions.
          </Text>
        </Card>

        {sections.map((section, index) => (
          <Card key={section.key} variant="elevated" style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionContent}>{section.content}</Text>
          </Card>
        ))}

        <Card variant="outlined" style={styles.footerCard}>
          <Text style={styles.footerText}>
            If you have any questions about these Terms of Service, please contact driver support through the Help & Support section.
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
    backgroundColor: '#f0f4ff',
  },
  footerText: {
    fontSize: 14,
    color: '#667eea',
    lineHeight: 20,
    textAlign: 'center',
  },
});

export default TermsOfServiceScreen;

