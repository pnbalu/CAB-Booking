import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../../components/Header';
import { useToast } from '../../contexts/ToastContext';
import Card from '../../components/Card';
import Button from '../../components/Button';

const DOCUMENT_TYPES = [
  {
    id: 'license',
    label: 'Driver\'s License',
    icon: 'card-outline',
    color: '#667eea',
    required: true,
    description: 'Valid driver\'s license',
  },
  {
    id: 'registration',
    label: 'Vehicle Registration',
    icon: 'document-text-outline',
    color: '#4facfe',
    required: true,
    description: 'Vehicle registration certificate',
  },
  {
    id: 'insurance',
    label: 'Insurance Certificate',
    icon: 'shield-outline',
    color: '#43e97b',
    required: true,
    description: 'Vehicle insurance certificate',
  },
  {
    id: 'background',
    label: 'Background Check',
    icon: 'checkmark-circle-outline',
    color: '#f59e0b',
    required: false,
    description: 'Criminal background check',
  },
  {
    id: 'inspection',
    label: 'Vehicle Inspection',
    icon: 'car-outline',
    color: '#fa709a',
    required: false,
    description: 'Vehicle inspection report',
  },
];

const DocumentsScreen = ({ navigation }) => {
  const [documents, setDocuments] = useState({});
  const [uploading, setUploading] = useState(null);
  const { showError, showConfirm, showSuccess, showInfo } = useToast();

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const saved = await AsyncStorage.getItem('driver_documents');
      if (saved) {
        setDocuments(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading documents:', error);
    }
  };

  const saveDocuments = async (updatedDocuments) => {
    try {
      await AsyncStorage.setItem('driver_documents', JSON.stringify(updatedDocuments));
      setDocuments(updatedDocuments);
    } catch (error) {
      console.error('Error saving documents:', error);
    }
  };

  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (cameraStatus !== 'granted' || libraryStatus !== 'granted') {
      showError('Sorry, we need camera and photo library permissions to upload documents!');
      return false;
    }
    return true;
  };

  const pickImage = async (documentId) => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    showConfirm(
      'Select Document Source',
      'Choose where to get your document from:',
      async () => {
        // Camera option
        try {
          setUploading(documentId);
          const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
          });
          if (!result.canceled && result.assets && result.assets.length > 0) {
            const updatedDocuments = {
              ...documents,
              [documentId]: {
                uri: result.assets[0].uri,
                uploadedAt: new Date().toISOString(),
                status: 'pending',
              },
            };
            await saveDocuments(updatedDocuments);
            showSuccess('Document uploaded successfully');
          }
        } catch (error) {
          showError('Failed to take photo. Please try again.');
          console.error('Camera error:', error);
        } finally {
          setUploading(null);
        }
      },
      async () => {
        // Photo Library option
        try {
          setUploading(documentId);
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
          });
          if (!result.canceled && result.assets && result.assets.length > 0) {
            const updatedDocuments = {
              ...documents,
              [documentId]: {
                uri: result.assets[0].uri,
                uploadedAt: new Date().toISOString(),
                status: 'pending',
              },
            };
            await saveDocuments(updatedDocuments);
            showSuccess('Document uploaded successfully');
          }
        } catch (error) {
          showError('Failed to select photo. Please try again.');
          console.error('Image picker error:', error);
        } finally {
          setUploading(null);
        }
      },
      {
        confirmText: 'Camera',
        cancelText: 'Photo Library',
        type: 'info',
      }
    );
  };

  const removeDocument = (documentId) => {
    showConfirm(
      'Remove Document',
      'Are you sure you want to remove this document?',
      async () => {
        const updatedDocuments = { ...documents };
        delete updatedDocuments[documentId];
        await saveDocuments(updatedDocuments);
        showSuccess('Document removed successfully');
      },
      null,
      {
        confirmText: 'Remove',
        cancelText: 'Cancel',
        type: 'warning',
      }
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return '#4ade80';
      case 'rejected':
        return '#ef4444';
      case 'pending':
        return '#f59e0b';
      default:
        return '#999';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return 'checkmark-circle';
      case 'rejected':
        return 'close-circle';
      case 'pending':
        return 'time-outline';
      default:
        return 'help-circle-outline';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      case 'pending':
        return 'Under Review';
      default:
        return 'Not Uploaded';
    }
  };

  const renderDocumentCard = (docType) => {
    const document = documents[docType.id];
    const isUploaded = !!document;
    const status = document?.status || 'not_uploaded';

    return (
      <Card key={docType.id} variant="elevated" style={styles.documentCard}>
        <View style={styles.documentHeader}>
          <View style={styles.documentHeaderLeft}>
            <View style={[styles.documentIconContainer, { backgroundColor: `${docType.color}15` }]}>
              <Ionicons name={docType.icon} size={24} color={docType.color} />
            </View>
            <View style={styles.documentInfo}>
              <View style={styles.documentTitleRow}>
                <Text style={styles.documentTitle}>{docType.label}</Text>
                {docType.required && (
                  <View style={styles.requiredBadge}>
                    <Text style={styles.requiredText}>Required</Text>
                  </View>
                )}
              </View>
              <Text style={styles.documentDescription}>{docType.description}</Text>
            </View>
          </View>
        </View>

        {isUploaded ? (
          <View style={styles.documentContent}>
            <View style={styles.documentPreview}>
              <Image source={{ uri: document.uri }} style={styles.documentImage} resizeMode="cover" />
              <View style={styles.documentOverlay}>
                <TouchableOpacity
                  style={styles.viewButton}
                  onPress={() => {
                    // View full image - navigate to full screen view
                    showInfo('Full document view would open here');
                  }}
                  activeOpacity={0.8}
                >
                  <Ionicons name="eye-outline" size={20} color="#fff" />
                  <Text style={styles.viewButtonText}>View</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.documentStatus}>
              <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(status)}15` }]}>
                <Ionicons name={getStatusIcon(status)} size={16} color={getStatusColor(status)} />
                <Text style={[styles.statusText, { color: getStatusColor(status) }]}>
                  {getStatusLabel(status)}
                </Text>
              </View>
              {document.uploadedAt && (
                <Text style={styles.uploadDate}>
                  Uploaded {new Date(document.uploadedAt).toLocaleDateString()}
                </Text>
              )}
            </View>

            <View style={styles.documentActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => pickImage(docType.id)}
                activeOpacity={0.7}
                disabled={uploading === docType.id}
              >
                <Ionicons name="refresh-outline" size={18} color="#667eea" />
                <Text style={styles.actionButtonText}>Replace</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.removeButton]}
                onPress={() => removeDocument(docType.id)}
                activeOpacity={0.7}
              >
                <Ionicons name="trash-outline" size={18} color="#ef4444" />
                <Text style={[styles.actionButtonText, styles.removeButtonText]}>Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.documentEmpty}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="cloud-upload-outline" size={48} color="#ccc" />
            </View>
            <Text style={styles.emptyText}>No document uploaded</Text>
            <Button
              title="Upload Document"
              onPress={() => pickImage(docType.id)}
              icon="cloud-upload-outline"
              variant="secondary"
              style={styles.uploadButton}
              loading={uploading === docType.id}
            />
          </View>
        )}
      </Card>
    );
  };

  const requiredDocuments = DOCUMENT_TYPES.filter((doc) => doc.required);
  const optionalDocuments = DOCUMENT_TYPES.filter((doc) => !doc.required);
  const uploadedCount = Object.keys(documents).length;
  const approvedCount = Object.values(documents).filter((doc) => doc.status === 'approved').length;
  const pendingCount = Object.values(documents).filter((doc) => doc.status === 'pending').length;

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Documents" />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Summary Stats */}
        <View style={styles.statsSection}>
          <Card variant="elevated" style={styles.statCard}>
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.statGradient}
            >
              <View style={styles.statHeader}>
                <Ionicons name="document-text" size={24} color="#fff" />
                <Text style={styles.statLabel}>Document Status</Text>
              </View>
              <Text style={styles.statValue}>{approvedCount} / {requiredDocuments.length}</Text>
              <Text style={styles.statSubtext}>Required documents approved</Text>
            </LinearGradient>
          </Card>

          <View style={styles.quickStats}>
            <Card variant="elevated" style={styles.quickStatCard}>
              <View style={styles.quickStatIconContainer}>
                <Ionicons name="checkmark-circle" size={20} color="#4ade80" />
              </View>
              <Text style={styles.quickStatValue}>{approvedCount}</Text>
              <Text style={styles.quickStatLabel}>Approved</Text>
            </Card>

            <Card variant="elevated" style={styles.quickStatCard}>
              <View style={styles.quickStatIconContainer}>
                <Ionicons name="time" size={20} color="#f59e0b" />
              </View>
              <Text style={styles.quickStatValue}>{pendingCount}</Text>
              <Text style={styles.quickStatLabel}>Pending</Text>
            </Card>

            <Card variant="elevated" style={styles.quickStatCard}>
              <View style={styles.quickStatIconContainer}>
                <Ionicons name="document-outline" size={20} color="#667eea" />
              </View>
              <Text style={styles.quickStatValue}>{uploadedCount}</Text>
              <Text style={styles.quickStatLabel}>Uploaded</Text>
            </Card>
          </View>
        </View>

        {/* Required Documents */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Required Documents</Text>
            <Text style={styles.sectionSubtitle}>
              {requiredDocuments.filter((doc) => documents[doc.id]?.status === 'approved').length} / {requiredDocuments.length} approved
            </Text>
          </View>
          {requiredDocuments.map((docType) => renderDocumentCard(docType))}
        </View>

        {/* Optional Documents */}
        {optionalDocuments.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Optional Documents</Text>
              <Text style={styles.sectionSubtitle}>Additional verification documents</Text>
            </View>
            {optionalDocuments.map((docType) => renderDocumentCard(docType))}
          </View>
        )}

        {/* Info Card */}
        <Card variant="outlined" style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Ionicons name="information-circle" size={24} color="#667eea" />
            <Text style={styles.infoTitle}>Document Guidelines</Text>
          </View>
          <View style={styles.infoContent}>
            <View style={styles.infoItem}>
              <Ionicons name="checkmark-circle" size={16} color="#4ade80" />
              <Text style={styles.infoText}>Ensure documents are clear and readable</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="checkmark-circle" size={16} color="#4ade80" />
              <Text style={styles.infoText}>All required documents must be approved to drive</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="checkmark-circle" size={16} color="#4ade80" />
              <Text style={styles.infoText}>Documents are reviewed within 24-48 hours</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="checkmark-circle" size={16} color="#4ade80" />
              <Text style={styles.infoText}>Keep documents updated and valid</Text>
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
  statsSection: {
    marginBottom: 24,
  },
  statCard: {
    marginBottom: 16,
    overflow: 'hidden',
  },
  statGradient: {
    padding: 20,
    borderRadius: 16,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  statLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  statValue: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
  },
  statSubtext: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  quickStats: {
    flexDirection: 'row',
    gap: 12,
  },
  quickStatCard: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
  },
  quickStatIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickStatValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  quickStatLabel: {
    fontSize: 11,
    color: '#666',
    fontWeight: '500',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#666',
  },
  documentCard: {
    padding: 16,
    marginBottom: 12,
  },
  documentHeader: {
    marginBottom: 16,
  },
  documentHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  documentIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  documentInfo: {
    flex: 1,
  },
  documentTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  documentTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  requiredBadge: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  requiredText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  documentDescription: {
    fontSize: 13,
    color: '#666',
  },
  documentContent: {
    gap: 12,
  },
  documentPreview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
    position: 'relative',
  },
  documentImage: {
    width: '100%',
    height: '100%',
  },
  documentOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 12,
    alignItems: 'center',
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  documentStatus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  uploadDate: {
    fontSize: 12,
    color: '#666',
  },
  documentActions: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#f0f4ff',
    gap: 6,
  },
  removeButton: {
    backgroundColor: '#fef2f2',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#667eea',
  },
  removeButtonText: {
    color: '#ef4444',
  },
  documentEmpty: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyIconContainer: {
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  uploadButton: {
    minWidth: 160,
  },
  infoCard: {
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  infoContent: {
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default DocumentsScreen;

