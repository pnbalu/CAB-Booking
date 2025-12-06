import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../components/Header';
import { useLocation } from '../../contexts/LocationContext';
import { useSavedLocations } from '../../contexts/LocationsContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Card from '../../components/Card';
import { t } from '../../i18n';

const SaveLocationScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { location } = useLocation();
  const { saveLocation } = useSavedLocations();
  const locationType = route?.params?.type || 'custom';
  const [selectedLocation, setSelectedLocation] = useState(location);
  const [locationName, setLocationName] = useState('');
  const [region, setRegion] = useState(
    location
      ? {
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }
      : null
  );

  const handleMapPress = (e) => {
    setSelectedLocation(e.nativeEvent.coordinate);
  };

  const handleSave = async () => {
    if (!selectedLocation) {
      Alert.alert(t('common.error'), 'Please select a location on the map');
      return;
    }

    if (locationType === 'custom' && !locationName.trim()) {
      Alert.alert(t('common.error'), t('home.locationName') + ' is required');
      return;
    }

    try {
      await saveLocation(
        locationType,
        selectedLocation,
        locationType === 'custom' ? locationName : null
      );
      Alert.alert(t('common.success'), 'Location saved successfully!', [
        {
          text: t('common.done'),
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      Alert.alert(t('common.error'), 'Failed to save location');
    }
  };

  const getLocationTypeName = () => {
    switch (locationType) {
      case 'home':
        return t('home.home');
      case 'work':
        return t('home.work');
      case 'airport':
        return t('home.airport');
      default:
        return t('home.custom');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title={`${t('home.saveLocation')} - ${getLocationTypeName()}`} />

      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          region={region}
          onPress={handleMapPress}
          showsUserLocation
        >
          {selectedLocation && (
            <Marker coordinate={selectedLocation} title={getLocationTypeName()}>
              <View style={styles.marker}>
                <Ionicons
                  name={
                    locationType === 'home'
                      ? 'home'
                      : locationType === 'work'
                      ? 'briefcase'
                      : locationType === 'airport'
                      ? 'airplane'
                      : 'location'
                  }
                  size={32}
                  color="#667eea"
                />
              </View>
            </Marker>
          )}
        </MapView>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.bottomSheet}
      >
        <Card variant="elevated" style={styles.formCard}>
          <Text style={styles.instruction}>
            {t('home.selectLocation')} on the map
          </Text>
          {locationType === 'custom' && (
            <Input
              label={t('home.locationName')}
              value={locationName}
              onChangeText={setLocationName}
              placeholder="e.g., Gym, Restaurant"
              icon="pencil-outline"
            />
          )}
          <View style={styles.buttonRow}>
            <Button
              title={t('common.cancel')}
              onPress={() => navigation.goBack()}
              variant="secondary"
              style={styles.cancelButton}
            />
            <Button
              title={t('common.save')}
              onPress={handleSave}
              style={styles.saveButton}
            />
          </View>
        </Card>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  bottomSheet: {
    backgroundColor: '#fff',
    padding: 24,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  formCard: {
    padding: 20,
  },
  instruction: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: '500',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 2,
  },
  marker: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 8,
    borderWidth: 3,
    borderColor: '#667eea',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
});

export default SaveLocationScreen;

