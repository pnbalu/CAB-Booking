import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../components/Header';
import Card from '../../components/Card';
import { t } from '../../i18n';

const SafetyTipsScreen = ({ navigation }) => {
  const sections = [
    {
      key: 'section1',
      title: t('safety.section1.title'),
      items: t('safety.section1.content'),
      icon: 'checkmark-circle',
      color: '#4ade80',
    },
    {
      key: 'section2',
      title: t('safety.section2.title'),
      items: t('safety.section2.content'),
      icon: 'car',
      color: '#667eea',
    },
    {
      key: 'section3',
      title: t('safety.section3.title'),
      items: t('safety.section3.content'),
      icon: 'checkmark-done-circle',
      color: '#f093fb',
    },
    {
      key: 'section4',
      title: t('safety.section4.title'),
      items: t('safety.section4.content'),
      icon: 'alert-circle',
      color: '#ef4444',
    },
    {
      key: 'section5',
      title: t('safety.section5.title'),
      items: t('safety.section5.content'),
      icon: 'shield-checkmark',
      color: '#4ade80',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Header title={t('safety.title')} onBackPress={() => navigation.goBack()} />

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
            Your safety is our top priority. Follow these tips to ensure a safe and secure ride experience.
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
              {Array.isArray(section.items) ? (
                section.items.map((item, index) => (
                  <View key={index} style={styles.tipItem}>
                    <View style={[styles.tipBullet, { backgroundColor: `${section.color}15` }]}>
                      <Ionicons name="checkmark" size={16} color={section.color} />
                    </View>
                    <Text style={styles.tipText}>{item}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.tipText}>{section.items}</Text>
              )}
            </View>
          </Card>
        ))}

        <Card variant="outlined" style={styles.emergencyCard}>
          <View style={styles.emergencyHeader}>
            <Ionicons name="alert-circle" size={32} color="#ef4444" />
            <Text style={styles.emergencyTitle}>Emergency Assistance</Text>
          </View>
          <Text style={styles.emergencyText}>
            In case of emergency, use the emergency button in the app or call local emergency services immediately.
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
    padding: 24,
    marginBottom: 16,
    alignItems: 'center',
  },
  headerIcon: {
    marginBottom: 16,
  },
  intro: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
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
  },
  sectionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
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
    borderColor: '#fee2e2',
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
    color: '#991b1b',
    lineHeight: 20,
  },
});

export default SafetyTipsScreen;

