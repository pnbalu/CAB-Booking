import React, { useState } from 'react';
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
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Card from '../../components/Card';
import Header from '../../components/Header';

const EditProfileScreen = ({ navigation }) => {
  const { user, updateUser } = useAuth();
  const { showError, showSuccess, showConfirm } = useToast();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [imageUri, setImageUri] = useState(user?.photo || null);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name || !email || !phone) {
      showError('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      // Update user profile including photo
      await updateUser({
        name,
        email,
        phone,
        photo: imageUri,
      });
      
      showSuccess('Profile updated successfully!');
      setTimeout(() => {
        navigation.goBack();
      }, 1500);
    } catch (error) {
      showError('Failed to update profile. Please try again.');
      console.error('Profile update error:', error);
    } finally {
      setLoading(false);
    }
  };

  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (cameraStatus !== 'granted' || libraryStatus !== 'granted') {
      showError('Sorry, we need camera and photo library permissions to change your profile photo!');
      return false;
    }
    return true;
  };

  const pickImageFromCamera = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      showError('Failed to take photo. Please try again.');
      console.error('Camera error:', error);
    }
  };

  const pickImageFromLibrary = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      showError('Failed to select photo. Please try again.');
      console.error('Image picker error:', error);
    }
  };

  const handleChangePhoto = () => {
    showConfirm(
      'Change Profile Photo',
      'Select a photo source',
      pickImageFromCamera,
      pickImageFromLibrary,
      {
        confirmText: '📷 Camera',
        cancelText: '🖼️ Photo Library',
        type: 'info',
      }
    );
  };

  const handleRemovePhoto = () => {
    showConfirm(
      'Remove Photo',
      'Are you sure you want to remove your profile photo?',
      () => setImageUri(null),
      null,
      {
        confirmText: 'Remove',
        cancelText: 'Cancel',
        type: 'warning',
      }
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Edit Profile" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.avatarSection}>
            <View style={styles.avatarWrapper}>
              <TouchableOpacity
                style={styles.avatarContainer}
                onPress={handleChangePhoto}
                activeOpacity={0.8}
              >
                {imageUri ? (
                  <Image source={{ uri: imageUri }} style={styles.avatarImage} resizeMode="cover" />
                ) : (
                  <LinearGradient
                    colors={['#fff', '#f0f0f0']}
                    style={styles.avatar}
                  >
                    <Ionicons name="person" size={60} color="#667eea" />
                  </LinearGradient>
                )}
                <View style={styles.editIconContainer}>
                  <Ionicons name="camera" size={18} color="#fff" />
                </View>
              </TouchableOpacity>
              {imageUri && (
                <TouchableOpacity
                  style={styles.removePhotoButton}
                  onPress={handleRemovePhoto}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close-circle" size={24} color="#ef4444" />
                </TouchableOpacity>
              )}
            </View>
            <Text style={styles.avatarHint}>Tap to change photo</Text>
            <Text style={styles.avatarSubtext}>Recommended: Square image, max 5MB</Text>
          </View>

          <Card variant="elevated" style={styles.formCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="person-outline" size={20} color="#667eea" style={styles.sectionIcon} />
              <Text style={styles.sectionTitle}>Personal Information</Text>
            </View>
            <Input
              label="Full Name"
              value={name}
              onChangeText={setName}
              placeholder="Enter your full name"
              icon="person-outline"
              autoCapitalize="words"
            />

            <View style={styles.inputSpacer} />

            <Input
              label="Email Address"
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              keyboardType="email-address"
              icon="mail-outline"
              autoCapitalize="none"
            />

            <View style={styles.inputSpacer} />

            <Input
              label="Phone Number"
              value={phone}
              onChangeText={setPhone}
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
              icon="call-outline"
            />
          </Card>

          <View style={styles.buttonContainer}>
            <Button
              title="Save Changes"
              onPress={handleSave}
              loading={loading}
              style={styles.saveButton}
            />
          </View>
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
    padding: 20,
    paddingTop: 20,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 12,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    borderWidth: 4,
    borderColor: '#fff',
  },
  avatarImage: {
    width: 140,
    height: 140,
    borderRadius: 70,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    borderWidth: 4,
    borderColor: '#fff',
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  removePhotoButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#fff',
    borderRadius: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  avatarHint: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 4,
  },
  avatarSubtext: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
  formCard: {
    marginBottom: 20,
    padding: 24,
    borderRadius: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#f0f0f0',
  },
  sectionIcon: {
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  inputSpacer: {
    height: 16,
  },
  buttonContainer: {
    marginTop: 8,
    marginBottom: 32,
  },
  saveButton: {
    borderRadius: 12,
    elevation: 3,
  },
});

export default EditProfileScreen;

