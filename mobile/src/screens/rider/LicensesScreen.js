import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Linking, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../components/Header';
import Card from '../../components/Card';
import { t } from '../../i18n';

const LicensesScreen = ({ navigation }) => {
  const licenses = [
    {
      name: 'React Native',
      version: '0.72.0',
      license: 'MIT',
      author: 'Meta',
      url: 'https://github.com/facebook/react-native',
      description: t('settings.licenses.reactNativeDesc'),
    },
    {
      name: 'Expo',
      version: '49.0.0',
      license: 'MIT',
      author: 'Expo',
      url: 'https://github.com/expo/expo',
      description: t('settings.licenses.expoDesc'),
    },
    {
      name: 'React Navigation',
      version: '6.0.0',
      license: 'MIT',
      author: 'React Navigation Contributors',
      url: 'https://github.com/react-navigation/react-navigation',
      description: t('settings.licenses.reactNavigationDesc'),
    },
    {
      name: 'Expo Linear Gradient',
      version: '12.0.0',
      license: 'MIT',
      author: 'Expo',
      url: 'https://github.com/expo/expo-linear-gradient',
      description: t('settings.licenses.linearGradientDesc'),
    },
    {
      name: 'React Native Maps',
      version: '1.7.0',
      license: 'MIT',
      author: 'Airbnb',
      url: 'https://github.com/react-native-maps/react-native-maps',
      description: t('settings.licenses.mapsDesc'),
    },
    {
      name: 'AsyncStorage',
      version: '1.19.0',
      license: 'MIT',
      author: 'React Native Community',
      url: 'https://github.com/react-native-async-storage/async-storage',
      description: t('settings.licenses.asyncStorageDesc'),
    },
  ];

  const handleLinkPress = (url) => {
    Linking.openURL(url).catch((err) => console.error('Error opening URL:', err));
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title={t('settings.licenses.title')} onBackPress={() => navigation.goBack()} />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Card variant="elevated" style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Ionicons name="document-text" size={24} color="#667eea" />
            <Text style={styles.infoTitle}>{t('settings.licenses.openSource')}</Text>
          </View>
          <Text style={styles.infoText}>
            {t('settings.licenses.openSourceText')}
          </Text>
        </Card>

        {licenses.map((license, index) => (
          <Card key={index} variant="elevated" style={styles.licenseCard}>
            <View style={styles.licenseHeader}>
              <View style={styles.licenseHeaderLeft}>
                <View style={styles.licenseIcon}>
                  <Ionicons name="code-working" size={24} color="#667eea" />
                </View>
                <View style={styles.licenseInfo}>
                  <Text style={styles.licenseName}>{license.name}</Text>
                  <Text style={styles.licenseVersion}>v{license.version}</Text>
                </View>
              </View>
              <View style={styles.licenseBadge}>
                <Text style={styles.licenseType}>{license.license}</Text>
              </View>
            </View>

            <Text style={styles.licenseDescription}>{license.description}</Text>

            <View style={styles.licenseDetails}>
              <View style={styles.detailRow}>
                <Ionicons name="person-outline" size={16} color="#666" />
                <Text style={styles.detailText}>{license.author}</Text>
              </View>
              <TouchableOpacity
                style={styles.linkRow}
                onPress={() => handleLinkPress(license.url)}
              >
                <Ionicons name="link-outline" size={16} color="#667eea" />
                <Text style={styles.linkText}>{t('settings.licenses.viewSource')}</Text>
                <Ionicons name="open-outline" size={16} color="#667eea" />
              </TouchableOpacity>
            </View>
          </Card>
        ))}

        <Card variant="outlined" style={styles.footerCard}>
          <Text style={styles.footerText}>
            {t('settings.licenses.footerText')}
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
  infoCard: {
    padding: 20,
    marginBottom: 16,
    backgroundColor: '#f0f4ff',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#667eea',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  licenseCard: {
    padding: 20,
    marginBottom: 16,
  },
  licenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  licenseHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  licenseIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f4ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  licenseInfo: {
    flex: 1,
  },
  licenseName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  licenseVersion: {
    fontSize: 12,
    color: '#666',
  },
  licenseBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#f0f4ff',
  },
  licenseType: {
    fontSize: 12,
    fontWeight: '600',
    color: '#667eea',
  },
  licenseDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  licenseDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  linkText: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: '500',
  },
  footerCard: {
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  footerText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
    textAlign: 'center',
  },
});

export default LicensesScreen;

