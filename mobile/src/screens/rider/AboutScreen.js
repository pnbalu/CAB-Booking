import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Linking, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../components/Header';
import Card from '../../components/Card';
import { t } from '../../i18n';
import { useAuth } from '../../contexts/AuthContext';
import appConfig from '../../config/appConfig';

const AboutScreen = ({ navigation }) => {
  const { user } = useAuth();

  const appInfo = {
    name: appConfig.name,
    version: appConfig.version,
    build: appConfig.build,
    description: t('settings.about.description'),
    features: [
      t('settings.about.feature1'),
      t('settings.about.feature2'),
      t('settings.about.feature3'),
      t('settings.about.feature4'),
    ],
  };

  const handleLinkPress = (url) => {
    Linking.openURL(url).catch((err) => console.error('Error opening URL:', err));
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title={t('settings.about.title')} onBackPress={() => navigation.goBack()} />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* App Logo/Icon */}
        <View style={styles.logoContainer}>
          <View style={[styles.logo, { backgroundColor: appConfig.logo.backgroundColor }]}>
            <Ionicons name={appConfig.logo.icon} size={64} color={appConfig.logo.color} />
          </View>
          <Text style={styles.appName}>{appInfo.name}</Text>
          <Text style={styles.appVersion}>Version {appInfo.version}</Text>
          <Text style={styles.appBuild}>Build {appInfo.build}</Text>
        </View>

        {/* Description */}
        <Card variant="elevated" style={styles.card}>
          <Text style={styles.cardTitle}>{t('settings.about.aboutApp')}</Text>
          <Text style={styles.description}>{appInfo.description}</Text>
        </Card>

        {/* Features */}
        <Card variant="elevated" style={styles.card}>
          <Text style={styles.cardTitle}>{t('settings.about.features')}</Text>
          {appInfo.features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color="#4ade80" />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </Card>

        {/* Contact & Links */}
        <Card variant="elevated" style={styles.card}>
          <Text style={styles.cardTitle}>{t('settings.about.contact')}</Text>
          
          <TouchableOpacity
            style={styles.linkItem}
            onPress={() => handleLinkPress(`mailto:${appConfig.company.email}`)}
          >
            <Ionicons name="mail-outline" size={20} color="#667eea" />
            <Text style={styles.linkText}>{appConfig.company.email}</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkItem}
            onPress={() => handleLinkPress(appConfig.company.website)}
          >
            <Ionicons name="globe-outline" size={20} color="#667eea" />
            <Text style={styles.linkText}>{appConfig.company.website.replace('https://', '')}</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkItem}
            onPress={() => handleLinkPress(`https://twitter.com/${appConfig.company.twitter.replace('@', '')}`)}
          >
            <Ionicons name="logo-twitter" size={20} color="#667eea" />
            <Text style={styles.linkText}>{appConfig.company.twitter}</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
        </Card>

        {/* Copyright */}
        <View style={styles.copyright}>
          <Text style={styles.copyrightText}>
            © {new Date().getFullYear()} {appConfig.company.name}. {t('settings.about.allRightsReserved')}
          </Text>
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
  logoContainer: {
    alignItems: 'center',
    marginVertical: 32,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 24,
    backgroundColor: '#f0f4ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  appName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#667eea',
    marginBottom: 4,
  },
  appBuild: {
    fontSize: 12,
    color: '#999',
  },
  card: {
    padding: 20,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 16,
  },
  description: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  featureText: {
    flex: 1,
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    gap: 12,
  },
  linkText: {
    flex: 1,
    fontSize: 15,
    color: '#667eea',
    fontWeight: '500',
  },
  copyright: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 32,
  },
  copyrightText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
});

export default AboutScreen;

