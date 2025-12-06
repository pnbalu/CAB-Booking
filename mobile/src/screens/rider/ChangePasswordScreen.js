import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { t } from '../../i18n';
import { useAuth } from '../../contexts/AuthContext';

const ChangePasswordScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validatePassword = (password) => {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return passwordRegex.test(password);
  };

  const handleChangePassword = async () => {
    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert(t('common.error'), t('settings.password.allFieldsRequired'));
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert(t('common.error'), t('settings.password.passwordsDoNotMatch'));
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert(t('common.error'), t('settings.password.passwordTooShort'));
      return;
    }

    if (!validatePassword(newPassword)) {
      Alert.alert(
        t('common.error'),
        t('settings.password.passwordRequirements')
      );
      return;
    }

    if (currentPassword === newPassword) {
      Alert.alert(t('common.error'), t('settings.password.samePassword'));
      return;
    }

    setLoading(true);

    try {
      // In a real app, this would be an API call
      // For now, we'll simulate a successful password change
      await new Promise((resolve) => setTimeout(resolve, 1500));

      Alert.alert(
        t('common.success'),
        t('settings.password.passwordChangedSuccessfully'),
        [
          {
            text: t('common.done'),
            onPress: () => {
              setCurrentPassword('');
              setNewPassword('');
              setConfirmPassword('');
              navigation.goBack();
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert(t('common.error'), t('settings.password.changePasswordFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title={t('settings.password.title')} onBackPress={() => navigation.goBack()} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Card variant="elevated" style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <Ionicons name="lock-closed" size={24} color="#667eea" />
              <Text style={styles.infoTitle}>{t('settings.password.securityInfo')}</Text>
            </View>
            <Text style={styles.infoText}>
              {t('settings.password.securityInfoText')}
            </Text>
          </Card>

          <Card variant="elevated" style={styles.formCard}>
            <Input
              label={t('settings.password.currentPassword')}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry={!showCurrentPassword}
              placeholder={t('settings.password.enterCurrentPassword')}
              rightIcon={
                <TouchableOpacity
                  onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={showCurrentPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color="#666"
                  />
                </TouchableOpacity>
              }
            />

            <View style={styles.spacer} />

            <Input
              label={t('settings.password.newPassword')}
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry={!showNewPassword}
              placeholder={t('settings.password.enterNewPassword')}
              rightIcon={
                <TouchableOpacity
                  onPress={() => setShowNewPassword(!showNewPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={showNewPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color="#666"
                  />
                </TouchableOpacity>
              }
            />

            <View style={styles.passwordRequirements}>
              <Text style={styles.requirementsTitle}>
                {t('settings.password.passwordMustContain')}
              </Text>
              <View style={styles.requirementItem}>
                <Ionicons
                  name={newPassword.length >= 8 ? 'checkmark-circle' : 'ellipse-outline'}
                  size={16}
                  color={newPassword.length >= 8 ? '#4ade80' : '#ccc'}
                />
                <Text
                  style={[
                    styles.requirementText,
                    newPassword.length >= 8 && styles.requirementMet,
                  ]}
                >
                  {t('settings.password.minimum8Characters')}
                </Text>
              </View>
              <View style={styles.requirementItem}>
                <Ionicons
                  name={/[A-Z]/.test(newPassword) ? 'checkmark-circle' : 'ellipse-outline'}
                  size={16}
                  color={/[A-Z]/.test(newPassword) ? '#4ade80' : '#ccc'}
                />
                <Text
                  style={[
                    styles.requirementText,
                    /[A-Z]/.test(newPassword) && styles.requirementMet,
                  ]}
                >
                  {t('settings.password.oneUppercase')}
                </Text>
              </View>
              <View style={styles.requirementItem}>
                <Ionicons
                  name={/[a-z]/.test(newPassword) ? 'checkmark-circle' : 'ellipse-outline'}
                  size={16}
                  color={/[a-z]/.test(newPassword) ? '#4ade80' : '#ccc'}
                />
                <Text
                  style={[
                    styles.requirementText,
                    /[a-z]/.test(newPassword) && styles.requirementMet,
                  ]}
                >
                  {t('settings.password.oneLowercase')}
                </Text>
              </View>
              <View style={styles.requirementItem}>
                <Ionicons
                  name={/\d/.test(newPassword) ? 'checkmark-circle' : 'ellipse-outline'}
                  size={16}
                  color={/\d/.test(newPassword) ? '#4ade80' : '#ccc'}
                />
                <Text
                  style={[
                    styles.requirementText,
                    /\d/.test(newPassword) && styles.requirementMet,
                  ]}
                >
                  {t('settings.password.oneNumber')}
                </Text>
              </View>
            </View>

            <View style={styles.spacer} />

            <Input
              label={t('settings.password.confirmPassword')}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              placeholder={t('settings.password.confirmNewPassword')}
              rightIcon={
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color="#666"
                  />
                </TouchableOpacity>
              }
            />

            {confirmPassword && newPassword !== confirmPassword && (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={16} color="#ef4444" />
                <Text style={styles.errorText}>
                  {t('settings.password.passwordsDoNotMatch')}
                </Text>
              </View>
            )}
          </Card>

          <Button
            title={t('settings.password.changePassword')}
            onPress={handleChangePassword}
            loading={loading}
            disabled={!currentPassword || !newPassword || !confirmPassword}
            style={styles.submitButton}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  keyboardView: {
    flex: 1,
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
  formCard: {
    padding: 20,
    marginBottom: 16,
  },
  spacer: {
    height: 20,
  },
  passwordRequirements: {
    marginTop: 12,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  requirementText: {
    fontSize: 13,
    color: '#666',
  },
  requirementMet: {
    color: '#4ade80',
    fontWeight: '600',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  errorText: {
    fontSize: 13,
    color: '#ef4444',
  },
  submitButton: {
    marginTop: 8,
  },
  eyeIcon: {
    padding: 4,
  },
});

export default ChangePasswordScreen;

