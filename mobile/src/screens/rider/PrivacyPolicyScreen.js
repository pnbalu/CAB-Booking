import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import Header from '../../components/Header';
import Card from '../../components/Card';
import { t } from '../../i18n';

const PrivacyPolicyScreen = ({ navigation }) => {
  const sections = [
    { key: 'section1', title: t('privacy.section1.title'), content: t('privacy.section1.content') },
    { key: 'section2', title: t('privacy.section2.title'), content: t('privacy.section2.content') },
    { key: 'section3', title: t('privacy.section3.title'), content: t('privacy.section3.content') },
    { key: 'section4', title: t('privacy.section4.title'), content: t('privacy.section4.content') },
    { key: 'section5', title: t('privacy.section5.title'), content: t('privacy.section5.content') },
    { key: 'section6', title: t('privacy.section6.title'), content: t('privacy.section6.content') },
    { key: 'section7', title: t('privacy.section7.title'), content: t('privacy.section7.content') },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Header title={t('privacy.title')} onBackPress={() => navigation.goBack()} />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Card variant="elevated" style={styles.headerCard}>
          <Text style={styles.lastUpdated}>{t('privacy.lastUpdated')}</Text>
          <Text style={styles.intro}>
            Your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your personal information when you use our application.
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
            For questions about our Privacy Policy or to exercise your rights, please contact us through the Help & Support section.
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

