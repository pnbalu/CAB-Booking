import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../components/Header';
import Card from '../../components/Card';

const SafetyTipsScreen = ({ navigation }) => {
  const sections = [
    {
      key: 'section1',
      title: 'Before You Drive',
      items: [
        'Ensure your vehicle is in good working condition before going online',
        'Check tire pressure, brakes, lights, and fluid levels regularly',
        'Keep your vehicle clean and well-maintained',
        'Verify all required documents are current and valid',
        'Get adequate rest before driving shifts',
        'Have your phone fully charged and a car charger available',
      ],
      icon: 'car-outline',
      color: '#667eea',
    },
    {
      key: 'section2',
      title: 'During Rides',
      items: [
        'Always confirm passenger identity before starting the ride',
        'Follow GPS navigation and traffic laws at all times',
        'Keep doors locked until you confirm the passenger',
        'Maintain professional behavior and communication',
        'Do not use your phone while driving',
        'Keep emergency contacts easily accessible',
      ],
      icon: 'shield-checkmark-outline',
      color: '#4ade80',
    },
    {
      key: 'section3',
      title: 'Vehicle Safety',
      items: [
        'Regularly inspect your vehicle for safety issues',
        'Keep emergency supplies: first aid kit, flashlight, jumper cables',
        'Ensure child safety seats are properly installed if needed',
        'Maintain proper insurance coverage at all times',
        'Report vehicle issues immediately and do not drive unsafe vehicles',
        'Keep vehicle registration and insurance documents in the vehicle',
      ],
      icon: 'car-sport-outline',
      color: '#f59e0b',
    },
    {
      key: 'section4',
      title: 'Personal Safety',
      items: [
        'Trust your instincts - if something feels wrong, cancel the ride',
        'Share your trip status with trusted contacts',
        'Use the in-app emergency button if needed',
        'Do not share personal information with passengers',
        'Keep valuables out of sight',
        'Park in well-lit areas when waiting for passengers',
      ],
      icon: 'person-shield-outline',
      color: '#ef4444',
    },
    {
      key: 'section5',
      title: 'Handling Difficult Situations',
      items: [
        'Stay calm and professional in all situations',
        'If a passenger is intoxicated or disruptive, end the ride safely',
        'Report safety concerns immediately through the app',
        'Do not engage in arguments or confrontations',
        'Contact support or emergency services if needed',
        'Document incidents with photos or notes when safe to do so',
      ],
      icon: 'alert-circle-outline',
      color: '#f093fb',
    },
    {
      key: 'section6',
      title: 'Health and Wellness',
      items: [
        'Take regular breaks during long driving shifts',
        'Stay hydrated and have healthy snacks available',
        'Practice good posture and ergonomics while driving',
        'Get regular medical check-ups',
        'Do not drive if you feel unwell or tired',
        'Maintain work-life balance to avoid burnout',
      ],
      icon: 'heart-outline',
      color: '#43e97b',
    },
    {
      key: 'section7',
      title: 'Earnings and Security',
      items: [
        'Never accept cash payments outside the app',
        'Verify payment method before starting rides',
        'Keep track of your earnings and report discrepancies',
        'Protect your account credentials and enable two-factor authentication',
        'Be cautious of phishing attempts or suspicious communications',
        'Report any suspicious activity immediately',
      ],
      icon: 'lock-closed-outline',
      color: '#667eea',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Safety Tips" onBackPress={() => navigation.goBack()} />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Card variant="elevated" style={styles.headerCard}>
          <View style={styles.headerIcon}>
            <Ionicons name="shield-checkmark" size={48} color="#4ade80" />
          </View>
          <Text style={styles.intro}>
            Your safety and the safety of your passengers is our top priority. Follow these tips to ensure a safe and professional driving experience.
          </Text>
        </Card>

        {sections.map((section) => (
          <Card key={section.key} variant="elevated" style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIcon, { backgroundColor: `${section.color}15` }]}>
                <Ionicons name={section.icon} size={24} color={section.color} />
              </View>
              <Text style={styles.sectionTitle}>{section.title}</Text>
            </View>
            <View style={styles.tipsList}>
              {section.items.map((item, index) => (
                <View key={index} style={styles.tipItem}>
                  <View style={[styles.tipBullet, { backgroundColor: `${section.color}15` }]}>
                    <Ionicons name="checkmark" size={16} color={section.color} />
                  </View>
                  <Text style={styles.tipText}>{item}</Text>
                </View>
              ))}
            </View>
          </Card>
        ))}

        <Card variant="outlined" style={styles.emergencyCard}>
          <View style={styles.emergencyHeader}>
            <Ionicons name="alert-circle" size={32} color="#ef4444" />
            <Text style={styles.emergencyTitle}>Emergency Assistance</Text>
          </View>
          <Text style={styles.emergencyText}>
            In case of emergency, use the emergency button in the app, contact driver support immediately, or call local emergency services (911). Your safety is our priority.
          </Text>
          <View style={styles.emergencyActions}>
            <View style={styles.emergencyAction}>
              <Ionicons name="call-outline" size={20} color="#ef4444" />
              <Text style={styles.emergencyActionText}>Driver Support: Available 24/7</Text>
            </View>
            <View style={styles.emergencyAction}>
              <Ionicons name="shield-outline" size={20} color="#ef4444" />
              <Text style={styles.emergencyActionText}>Emergency Services: 911</Text>
            </View>
          </View>
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
    padding: 24,
    marginBottom: 16,
    alignItems: 'center',
  },
  headerIcon: {
    marginBottom: 16,
  },
  intro: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
    textAlign: 'center',
  },
  sectionCard: {
    padding: 20,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  sectionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    flex: 1,
  },
  tipsList: {
    gap: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  tipBullet: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  tipText: {
    flex: 1,
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
  },
  emergencyCard: {
    padding: 20,
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
  },
  emergencyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  emergencyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ef4444',
  },
  emergencyText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  emergencyActions: {
    gap: 12,
  },
  emergencyAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  emergencyActionText: {
    fontSize: 14,
    color: '#ef4444',
    fontWeight: '600',
  },
});

export default SafetyTipsScreen;

