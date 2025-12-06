import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { useAuth } from '../../contexts/AuthContext';

const ReportProblemScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [problemType, setProblemType] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [rideId, setRideId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const problemTypes = [
    { id: 'ride', label: 'Ride Issue', icon: 'car-outline' },
    { id: 'driver', label: 'Driver Issue', icon: 'person-outline' },
    { id: 'payment', label: 'Payment Issue', icon: 'card-outline' },
    { id: 'safety', label: 'Safety Concern', icon: 'shield-outline' },
    { id: 'app', label: 'App Bug', icon: 'bug-outline' },
    { id: 'other', label: 'Other', icon: 'ellipsis-horizontal-outline' },
  ];

  const handleSubmit = async () => {
    if (!problemType) {
      Alert.alert('Error', 'Please select a problem type');
      return;
    }
    if (!subject.trim()) {
      Alert.alert('Error', 'Please enter a subject');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Error', 'Please describe the problem');
      return;
    }
    if (description.trim().length < 10) {
      Alert.alert('Error', 'Please provide more details (at least 10 characters)');
      return;
    }

    setSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setSubmitting(false);
      Alert.alert(
        'Report Submitted',
        'Thank you for reporting this issue. Our support team will review it and get back to you within 24 hours.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Reset form
              setProblemType('');
              setSubject('');
              setDescription('');
              setRideId('');
              navigation.goBack();
            },
          },
        ]
      );
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Report a Problem" onBackPress={() => navigation.goBack()} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Card variant="elevated" style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <Ionicons name="information-circle" size={24} color="#667eea" />
              <Text style={styles.infoTitle}>Report an Issue</Text>
            </View>
            <Text style={styles.infoText}>
              Please provide as much detail as possible about the issue you encountered. This helps us resolve it quickly.
            </Text>
          </Card>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Problem Type *</Text>
            <View style={styles.problemTypesGrid}>
              {problemTypes.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.problemTypeCard,
                    problemType === type.id && styles.problemTypeCardActive,
                  ]}
                  onPress={() => setProblemType(type.id)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={type.icon}
                    size={24}
                    color={problemType === type.id ? '#667eea' : '#666'}
                  />
                  <Text
                    style={[
                      styles.problemTypeLabel,
                      problemType === type.id && styles.problemTypeLabelActive,
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Input
              label="Subject *"
              value={subject}
              onChangeText={setSubject}
              placeholder="Brief description of the issue"
              icon="document-text-outline"
              maxLength={100}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={styles.textArea}
              value={description}
              onChangeText={setDescription}
              placeholder="Please provide detailed information about the problem..."
              multiline
              numberOfLines={6}
              maxLength={1000}
              placeholderTextColor="#999"
              textAlignVertical="top"
            />
            <Text style={styles.charCount}>{description.length}/1000</Text>
          </View>

          <View style={styles.section}>
            <Input
              label="Ride ID (Optional)"
              value={rideId}
              onChangeText={setRideId}
              placeholder="If this is related to a specific ride"
              icon="receipt-outline"
            />
            <Text style={styles.hint}>
              You can find your Ride ID in the ride history or receipt
            </Text>
          </View>

          <View style={styles.section}>
            <Card variant="outlined" style={styles.userInfoCard}>
              <Text style={styles.userInfoTitle}>Your Information</Text>
              <View style={styles.userInfoRow}>
                <Text style={styles.userInfoLabel}>Name:</Text>
                <Text style={styles.userInfoValue}>{user?.name || 'N/A'}</Text>
              </View>
              <View style={styles.userInfoRow}>
                <Text style={styles.userInfoLabel}>Email:</Text>
                <Text style={styles.userInfoValue}>{user?.email || 'N/A'}</Text>
              </View>
            </Card>
          </View>

          <Button
            title={submitting ? 'Submitting...' : 'Submit Report'}
            onPress={handleSubmit}
            loading={submitting}
            disabled={submitting}
            style={styles.submitButton}
            icon="send"
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
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  infoCard: {
    padding: 16,
    marginBottom: 24,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginLeft: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginTop: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
  },
  problemTypesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  problemTypeCard: {
    width: '30%',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  problemTypeCardActive: {
    borderColor: '#667eea',
    backgroundColor: '#f0f4ff',
  },
  problemTypeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  problemTypeLabelActive: {
    color: '#667eea',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  textArea: {
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: '#000',
    backgroundColor: '#fff',
    minHeight: 120,
  },
  charCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 4,
  },
  hint: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    fontStyle: 'italic',
  },
  userInfoCard: {
    padding: 16,
  },
  userInfoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
  },
  userInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  userInfoLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  userInfoValue: {
    fontSize: 14,
    color: '#000',
    fontWeight: '600',
  },
  submitButton: {
    marginTop: 8,
  },
});

export default ReportProblemScreen;

