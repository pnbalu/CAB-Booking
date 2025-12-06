import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';

const VEHICLE_INFO_KEY = 'driver_vehicle_info';

const VehicleInfoScreen = ({ navigation }) => {
  const { user, updateUser } = useAuth();
  const { showError, showSuccess, showConfirm, showInfo } = useToast();
  
  const [vehicleModel, setVehicleModel] = useState(user?.vehicleModel || '');
  const [vehiclePlate, setVehiclePlate] = useState(user?.vehiclePlate || '');
  const [licenseNumber, setLicenseNumber] = useState(user?.licenseNumber || '');
  const [vehicleYear, setVehicleYear] = useState(user?.vehicleYear || '');
  const [vehicleColor, setVehicleColor] = useState(user?.vehicleColor || '');
  const [vehicleMake, setVehicleMake] = useState(user?.vehicleMake || '');
  const [vinNumber, setVinNumber] = useState(user?.vinNumber || '');
  const [carPhotoUri, setCarPhotoUri] = useState(user?.carPhoto || null);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadVehicleInfo();
  }, []);

  const loadVehicleInfo = async () => {
    try {
      const saved = await AsyncStorage.getItem(VEHICLE_INFO_KEY);
      if (saved) {
        const info = JSON.parse(saved);
        setVehicleModel(info.vehicleModel || user?.vehicleModel || '');
        setVehiclePlate(info.vehiclePlate || user?.vehiclePlate || '');
        setLicenseNumber(info.licenseNumber || user?.licenseNumber || '');
        setVehicleYear(info.vehicleYear || user?.vehicleYear || '');
        setVehicleColor(info.vehicleColor || user?.vehicleColor || '');
        setVehicleMake(info.vehicleMake || user?.vehicleMake || '');
        setVinNumber(info.vinNumber || user?.vinNumber || '');
        setCarPhotoUri(info.carPhoto || user?.carPhoto || null);
      }
    } catch (error) {
      console.error('Error loading vehicle info:', error);
    }
  };

  const saveVehicleInfo = async (updatedInfo) => {
    try {
      await AsyncStorage.setItem(VEHICLE_INFO_KEY, JSON.stringify(updatedInfo));
    } catch (error) {
      console.error('Error saving vehicle info:', error);
    }
  };

  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (cameraStatus !== 'granted' || libraryStatus !== 'granted') {
      showError('Sorry, we need camera and photo library permissions to upload your car photo!');
      return false;
    }
    return true;
  };

  const pickCarPhotoFromCamera = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setCarPhotoUri(result.assets[0].uri);
        showSuccess('Car photo captured successfully');
      }
    } catch (error) {
      showError('Failed to take photo. Please try again.');
      console.error('Camera error:', error);
    }
  };

  const pickCarPhotoFromLibrary = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setCarPhotoUri(result.assets[0].uri);
        showSuccess('Car photo selected successfully');
      }
    } catch (error) {
      showError('Failed to select photo. Please try again.');
      console.error('Image picker error:', error);
    }
  };

  const handleChangeCarPhoto = () => {
    showConfirm(
      'Upload Car Photo',
      'Please take or select a photo of your car with the license plate clearly visible',
      pickCarPhotoFromCamera,
      pickCarPhotoFromLibrary,
      {
        confirmText: '📷 Camera',
        cancelText: '🖼️ Photo Library',
        type: 'info',
      }
    );
  };

  const handleRemoveCarPhoto = () => {
    showConfirm(
      'Remove Car Photo',
      'Car photo is mandatory. Are you sure you want to remove it?',
      () => setCarPhotoUri(null),
      null,
      {
        confirmText: 'Remove',
        cancelText: 'Cancel',
        type: 'warning',
      }
    );
  };

  const handleSave = async () => {
    // Validate required fields
    if (!vehicleModel || !vehiclePlate || !licenseNumber) {
      showError('Please fill in all required vehicle information fields');
      return;
    }

    // Car photo is mandatory
    if (!carPhotoUri) {
      showError('Please upload a photo of your car with the license plate clearly visible. This is mandatory for driver verification.');
      return;
    }

    setLoading(true);
    try {
      const vehicleInfo = {
        vehicleModel,
        vehiclePlate,
        licenseNumber,
        vehicleYear,
        vehicleColor,
        vehicleMake,
        vinNumber,
        carPhoto: carPhotoUri,
      };

      // Save to AsyncStorage
      await saveVehicleInfo(vehicleInfo);

      // Update user profile
      await updateUser(vehicleInfo);
      
      showSuccess('Vehicle information updated successfully!');
      setIsEditing(false);
      setTimeout(() => {
        navigation.goBack();
      }, 1500);
    } catch (error) {
      showError('Failed to update vehicle information. Please try again.');
      console.error('Vehicle info update error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    loadVehicleInfo();
    setIsEditing(false);
  };

  const getCompletionPercentage = () => {
    let completed = 0;
    const total = 7;
    
    if (vehicleModel) completed++;
    if (vehiclePlate) completed++;
    if (licenseNumber) completed++;
    if (vehicleYear) completed++;
    if (vehicleColor) completed++;
    if (vinNumber) completed++;
    if (carPhotoUri) completed++;
    
    return Math.round((completed / total) * 100);
  };

  const completionPercentage = getCompletionPercentage();

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Vehicle Information" onBackPress={() => navigation.goBack()} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Completion Status Card */}
          <Card variant="elevated" style={styles.statusCard}>
            <View style={styles.statusHeader}>
              <View style={styles.statusIconContainer}>
                <Ionicons name="car" size={24} color="#667eea" />
              </View>
              <View style={styles.statusInfo}>
                <Text style={styles.statusTitle}>Profile Completion</Text>
                <Text style={styles.statusPercentage}>{completionPercentage}% Complete</Text>
              </View>
            </View>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${completionPercentage}%` }
                ]} 
              />
            </View>
            <Text style={styles.statusHint}>
              {completionPercentage === 100 
                ? 'All vehicle information is complete!' 
                : 'Complete all fields to verify your vehicle'}
            </Text>
          </Card>

          {/* Car Photo Section */}
          <Card variant="elevated" style={styles.formCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="camera-outline" size={20} color="#667eea" style={styles.sectionIcon} />
              <Text style={styles.sectionTitle}>Car Photo</Text>
              <View style={styles.mandatoryBadge}>
                <Text style={styles.mandatoryText}>Required</Text>
              </View>
            </View>
            
            <Text style={styles.sectionDescription}>
              Upload a clear photo of your car showing the license plate clearly visible
            </Text>
            
            <TouchableOpacity
              style={[
                styles.carPhotoContainer,
                carPhotoUri && styles.carPhotoContainerFilled
              ]}
              onPress={isEditing ? handleChangeCarPhoto : undefined}
              activeOpacity={isEditing ? 0.8 : 1}
              disabled={!isEditing}
            >
              {carPhotoUri ? (
                <View style={styles.carPhotoWrapper}>
                  <Image 
                    source={{ uri: carPhotoUri }} 
                    style={styles.carPhotoImage} 
                    resizeMode="cover" 
                  />
                  {isEditing && (
                    <View style={styles.carPhotoOverlay}>
                      <TouchableOpacity
                        style={styles.editPhotoButton}
                        onPress={handleChangeCarPhoto}
                        activeOpacity={0.8}
                      >
                        <Ionicons name="camera" size={20} color="#fff" />
                        <Text style={styles.editPhotoText}>Change Photo</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.removePhotoButton}
                        onPress={handleRemoveCarPhoto}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="trash-outline" size={18} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              ) : (
                <View style={styles.carPhotoPlaceholder}>
                  <Ionicons name="car" size={48} color="#ccc" />
                  <Text style={styles.carPhotoPlaceholderText}>
                    {isEditing ? 'Tap to upload car photo' : 'No photo uploaded'}
                  </Text>
                  {isEditing && (
                    <Text style={styles.carPhotoPlaceholderHint}>
                      License plate must be clearly visible
                    </Text>
                  )}
                </View>
              )}
            </TouchableOpacity>
          </Card>

          {/* Vehicle Details Section */}
          <Card variant="elevated" style={styles.formCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="information-circle-outline" size={20} color="#667eea" style={styles.sectionIcon} />
              <Text style={styles.sectionTitle}>Vehicle Details</Text>
            </View>

            <Input
              label="Vehicle Make"
              value={vehicleMake}
              onChangeText={setVehicleMake}
              placeholder="e.g., Toyota, Honda, Ford"
              icon="car-outline"
              editable={isEditing}
              autoCapitalize="words"
            />

            <View style={styles.inputSpacer} />

            <Input
              label="Vehicle Model *"
              value={vehicleModel}
              onChangeText={setVehicleModel}
              placeholder="e.g., Camry, Accord, Focus"
              icon="car-sport-outline"
              editable={isEditing}
              autoCapitalize="words"
            />

            <View style={styles.inputSpacer} />

            <View style={styles.rowInputs}>
              <View style={styles.halfInput}>
                <Input
                  label="Year"
                  value={vehicleYear}
                  onChangeText={setVehicleYear}
                  placeholder="e.g., 2020"
                  icon="calendar-outline"
                  keyboardType="numeric"
                  editable={isEditing}
                  maxLength={4}
                />
              </View>
              <View style={styles.halfInput}>
                <Input
                  label="Color"
                  value={vehicleColor}
                  onChangeText={setVehicleColor}
                  placeholder="e.g., Black, White"
                  icon="color-palette-outline"
                  editable={isEditing}
                  autoCapitalize="words"
                />
              </View>
            </View>

            <View style={styles.inputSpacer} />

            <Input
              label="License Plate Number *"
              value={vehiclePlate}
              onChangeText={setVehiclePlate}
              placeholder="Enter license plate number"
              icon="document-text-outline"
              editable={isEditing}
              autoCapitalize="characters"
            />

            <View style={styles.inputSpacer} />

            <Input
              label="Driver's License Number *"
              value={licenseNumber}
              onChangeText={setLicenseNumber}
              placeholder="Enter your driver's license number"
              icon="card-outline"
              editable={isEditing}
              autoCapitalize="characters"
            />

            <View style={styles.inputSpacer} />

            <Input
              label="VIN Number"
              value={vinNumber}
              onChangeText={setVinNumber}
              placeholder="Enter 17-character VIN"
              icon="barcode-outline"
              editable={isEditing}
              autoCapitalize="characters"
              maxLength={17}
            />
          </Card>

          {/* Verification Status */}
          {!isEditing && (
            <Card variant="elevated" style={styles.verificationCard}>
              <View style={styles.verificationHeader}>
                <Ionicons name="shield-checkmark" size={24} color="#4ade80" />
                <Text style={styles.verificationTitle}>Verification Status</Text>
              </View>
              <View style={styles.verificationBadge}>
                <Ionicons name="checkmark-circle" size={16} color="#4ade80" />
                <Text style={styles.verificationText}>
                  {completionPercentage === 100 
                    ? 'Vehicle information verified' 
                    : 'Pending verification'}
                </Text>
              </View>
              {completionPercentage < 100 && (
                <Text style={styles.verificationHint}>
                  Complete all required fields to verify your vehicle
                </Text>
              )}
            </Card>
          )}

          {/* Action Buttons */}
          {isEditing ? (
            <View style={styles.actionButtons}>
              <Button
                title="Cancel"
                onPress={handleCancel}
                variant="secondary"
                style={styles.cancelButton}
              />
              <Button
                title="Save Changes"
                onPress={handleSave}
                loading={loading}
                style={styles.saveButton}
              />
            </View>
          ) : (
            <Button
              title="Edit Vehicle Information"
              onPress={() => setIsEditing(true)}
              icon="create-outline"
            />
          )}
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
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  statusCard: {
    marginBottom: 20,
    padding: 20,
    backgroundColor: '#f0f4ff',
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#667eea15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statusInfo: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  statusPercentage: {
    fontSize: 24,
    fontWeight: '800',
    color: '#667eea',
    marginTop: 4,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#667eea',
    borderRadius: 4,
  },
  statusHint: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  formCard: {
    marginBottom: 20,
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionIcon: {
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    flex: 1,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  mandatoryBadge: {
    backgroundColor: '#ef444415',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  mandatoryText: {
    fontSize: 11,
    color: '#ef4444',
    fontWeight: '600',
  },
  carPhotoContainer: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  carPhotoContainerFilled: {
    borderStyle: 'solid',
    borderColor: '#667eea',
  },
  carPhotoWrapper: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  carPhotoImage: {
    width: '100%',
    height: '100%',
  },
  carPhotoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  editPhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#667eea',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  editPhotoText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  removePhotoButton: {
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  carPhotoPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  carPhotoPlaceholderText: {
    fontSize: 16,
    color: '#999',
    fontWeight: '600',
    marginTop: 12,
  },
  carPhotoPlaceholderHint: {
    fontSize: 12,
    color: '#ccc',
    marginTop: 4,
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  inputSpacer: {
    height: 16,
  },
  verificationCard: {
    marginBottom: 20,
    padding: 20,
    backgroundColor: '#f0fdf4',
  },
  verificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  verificationTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginLeft: 8,
  },
  verificationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4ade8015',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
    gap: 6,
  },
  verificationText: {
    fontSize: 14,
    color: '#4ade80',
    fontWeight: '600',
  },
  verificationHint: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    fontStyle: 'italic',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 1,
  },
});

export default VehicleInfoScreen;

