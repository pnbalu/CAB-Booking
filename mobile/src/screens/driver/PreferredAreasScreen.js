import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { useToast } from '../../contexts/ToastContext';
import { settingsApi } from '../../services/settingsApi';

const { width, height } = Dimensions.get('window');

const PREFERRED_AREAS_KEY = 'driver_preferred_areas';

const PreferredAreasScreen = ({ navigation }) => {
  const { showSuccess, showError, showConfirm } = useToast();
  const mapRef = useRef(null);
  
  const [preferredAreas, setPreferredAreas] = useState([]);
  const [mapRegion, setMapRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [selectedArea, setSelectedArea] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAreaName, setNewAreaName] = useState('');
  const [newAreaRadius, setNewAreaRadius] = useState(5);
  const [newAreaLocation, setNewAreaLocation] = useState(null);
  const [isSelectingLocation, setIsSelectingLocation] = useState(false);
  const [locationAddress, setLocationAddress] = useState('');
  const [radiusOptions, setRadiusOptions] = useState([2, 5, 10, 15, 20, 25]);
  const [distanceUnit, setDistanceUnit] = useState('km');
  const [maxAreas, setMaxAreas] = useState(10);

  useEffect(() => {
    loadPreferredAreasSettings();
    loadPreferredAreas();
    getCurrentLocation();
  }, []);

  const loadPreferredAreasSettings = async () => {
    try {
      const settings = await settingsApi.getPreferredAreasSettings();
      setRadiusOptions(settings.radiusOptions || [2, 5, 10, 15, 20, 25]);
      setNewAreaRadius(settings.defaultRadius || 5);
      setDistanceUnit(settings.unit || 'km');
      setMaxAreas(settings.maxAreas || 10);
    } catch (error) {
      console.error('Error loading preferred areas settings:', error);
    }
  };

  useEffect(() => {
    if (newAreaLocation && isSelectingLocation) {
      reverseGeocode(newAreaLocation);
    }
  }, [newAreaLocation]);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        showError('Location permission denied. Please enable location services.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      
      const newRegion = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
      
      setMapRegion(newRegion);
      
      if (mapRef.current) {
        mapRef.current.animateToRegion(newRegion, 1000);
      }
    } catch (error) {
      console.error('Error getting location:', error);
      showError('Failed to get your current location');
    }
  };

  const reverseGeocode = async (location) => {
    try {
      const addresses = await Location.reverseGeocodeAsync({
        latitude: location.latitude,
        longitude: location.longitude,
      });
      
      if (addresses && addresses.length > 0) {
        const address = addresses[0];
        const addressParts = [
          address.street,
          address.city,
          address.region,
          address.postalCode,
        ].filter(Boolean);
        setLocationAddress(addressParts.join(', ') || 'Location selected');
      } else {
        setLocationAddress('Location selected');
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      setLocationAddress('Location selected');
    }
  };

  const loadPreferredAreas = async () => {
    try {
      const stored = await AsyncStorage.getItem(PREFERRED_AREAS_KEY);
      if (stored) {
        const areas = JSON.parse(stored);
        setPreferredAreas(areas);
        
        // Center map on first area if exists
        if (areas.length > 0 && mapRef.current) {
          const firstArea = areas[0];
          mapRef.current.animateToRegion({
            latitude: firstArea.latitude,
            longitude: firstArea.longitude,
            latitudeDelta: 0.1,
            longitudeDelta: 0.1,
          }, 1000);
        }
      }
    } catch (error) {
      console.error('Error loading preferred areas:', error);
      showError('Failed to load preferred areas');
    }
  };

  const savePreferredAreas = async (areas) => {
    try {
      await AsyncStorage.setItem(PREFERRED_AREAS_KEY, JSON.stringify(areas));
      setPreferredAreas(areas);
    } catch (error) {
      console.error('Error saving preferred areas:', error);
      showError('Failed to save preferred areas');
    }
  };

  const handleMapPress = (event) => {
    if (isSelectingLocation) {
      const { latitude, longitude } = event.nativeEvent.coordinate;
      const location = { latitude, longitude };
      setNewAreaLocation(location);
      setIsSelectingLocation(false);
      reverseGeocode(location);
      showSuccess('Location selected!');
      // Reopen modal after location is selected
      setTimeout(() => {
        setShowAddModal(true);
      }, 300);
    }
  };

  const handleAddArea = async () => {
    if (!newAreaLocation) {
      showError('Please select a location on the map');
      setIsSelectingLocation(true);
      return;
    }
    if (!newAreaName.trim()) {
      showError('Please enter a name for this area');
      return;
    }

    // Check maximum areas limit
    if (preferredAreas.length >= maxAreas) {
      showError(`Maximum ${maxAreas} preferred areas allowed. Please remove an existing area first.`);
      return;
    }

    // Check for duplicate names
    const duplicateName = preferredAreas.find(
      area => area.name.toLowerCase() === newAreaName.trim().toLowerCase()
    );
    if (duplicateName) {
      showError('An area with this name already exists');
      return;
    }

    const newArea = {
      id: Date.now().toString(),
      name: newAreaName.trim(),
      latitude: newAreaLocation.latitude,
      longitude: newAreaLocation.longitude,
      radius: newAreaRadius,
      address: locationAddress,
      createdAt: new Date().toISOString(),
    };

    const updatedAreas = [...preferredAreas, newArea];
    await savePreferredAreas(updatedAreas);
    showSuccess(`"${newAreaName.trim()}" added successfully`);
    
    // Reset form
    setNewAreaName('');
    const settings = await settingsApi.getPreferredAreasSettings();
    setNewAreaRadius(settings.defaultRadius || 5);
    setNewAreaLocation(null);
    setLocationAddress('');
    setShowAddModal(false);
    setIsSelectingLocation(false);

    // Center map on new area
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: newAreaLocation.latitude,
        longitude: newAreaLocation.longitude,
        latitudeDelta: Math.max(0.05, newAreaRadius / 100),
        longitudeDelta: Math.max(0.05, newAreaRadius / 100),
      }, 1000);
    }
  };

  const handleDeleteArea = async (areaId) => {
    const area = preferredAreas.find(a => a.id === areaId);
    const confirmed = await showConfirm(
      'Delete Preferred Area',
      `Are you sure you want to remove "${area?.name}"?`,
      () => {
        const updatedAreas = preferredAreas.filter(area => area.id !== areaId);
        savePreferredAreas(updatedAreas);
        showSuccess('Preferred area removed');
        if (selectedArea?.id === areaId) {
          setSelectedArea(null);
        }
      }
    );
  };

  const handleSelectArea = (area) => {
    setSelectedArea(area);
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: area.latitude,
        longitude: area.longitude,
        latitudeDelta: Math.max(0.05, area.radius / 100),
        longitudeDelta: Math.max(0.05, area.radius / 100),
      }, 1000);
    }
  };

  const handleStartSelecting = () => {
    // Close modal first to make map accessible
    setShowAddModal(false);
    // Small delay to ensure modal closes completely before enabling selection
    setTimeout(() => {
      setIsSelectingLocation(true);
      setNewAreaLocation(null);
      setLocationAddress('');
    }, 300);
  };

  const handleCloseModal = async () => {
    setIsSelectingLocation(false);
    setShowAddModal(false);
    setNewAreaLocation(null);
    setNewAreaName('');
    const settings = await settingsApi.getPreferredAreasSettings();
    setNewAreaRadius(settings.defaultRadius || 5);
    setLocationAddress('');
  };

  const handleCancelSelection = () => {
    setIsSelectingLocation(false);
    setNewAreaLocation(null);
    setLocationAddress('');
    // Reopen modal after canceling selection
    setTimeout(() => {
      setShowAddModal(true);
    }, 200);
  };

  const convertRadiusToMeters = (radiusKm) => {
    if (distanceUnit === 'miles') {
      return radiusKm * 1609.34; // Convert miles to meters
    }
    return radiusKm * 1000; // Convert km to meters
  };

  const getRadiusDisplay = (radius) => {
    if (distanceUnit === 'miles') {
      return `${radius} mi`;
    }
    return `${radius} km`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Preferred Areas" onBackPress={() => navigation.goBack()} />

      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          region={mapRegion}
          onRegionChangeComplete={setMapRegion}
          onPress={handleMapPress}
          showsUserLocation
          showsMyLocationButton={false}
          mapType="standard"
        >
          {preferredAreas.map((area) => (
            <React.Fragment key={area.id}>
              <Marker
                coordinate={{
                  latitude: area.latitude,
                  longitude: area.longitude,
                }}
                title={area.name}
                description={`${area.radius} km radius`}
                pinColor={selectedArea?.id === area.id ? '#667eea' : '#4ade80'}
                onPress={() => handleSelectArea(area)}
              />
              <Circle
                center={{
                  latitude: area.latitude,
                  longitude: area.longitude,
                }}
                radius={convertRadiusToMeters(area.radius)}
                strokeColor={selectedArea?.id === area.id ? '#667eea' : '#4ade80'}
                fillColor={selectedArea?.id === area.id ? '#667eea30' : '#4ade8030'}
                strokeWidth={selectedArea?.id === area.id ? 3 : 2}
              />
            </React.Fragment>
          ))}
          {newAreaLocation && (
            <>
              <Marker
                coordinate={newAreaLocation}
                pinColor="#f59e0b"
                title="New Area"
              />
              <Circle
                center={newAreaLocation}
                radius={convertRadiusToMeters(newAreaRadius)}
                strokeColor="#f59e0b"
                fillColor="#f59e0b30"
                strokeWidth={2}
                strokeStyle="dashed"
              />
            </>
          )}
        </MapView>


        <View style={styles.mapControls}>
          <TouchableOpacity
            style={styles.mapButton}
            onPress={getCurrentLocation}
            activeOpacity={0.7}
          >
            <Ionicons name="locate" size={24} color="#667eea" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.headerActions}>
          <Text style={styles.sectionTitle}>
            Preferred Areas ({preferredAreas.length})
          </Text>
          <TouchableOpacity
            style={[
              styles.addButton,
              preferredAreas.length >= maxAreas && styles.addButtonDisabled
            ]}
            onPress={() => {
              if (preferredAreas.length >= maxAreas) {
                showError(`Maximum ${maxAreas} preferred areas allowed`);
                return;
              }
              setShowAddModal(true);
            }}
            activeOpacity={0.7}
            disabled={preferredAreas.length >= maxAreas}
          >
            <Ionicons 
              name="add-circle" 
              size={24} 
              color={preferredAreas.length >= maxAreas ? '#ccc' : '#667eea'} 
            />
            <Text style={[
              styles.addButtonText,
              preferredAreas.length >= maxAreas && styles.addButtonTextDisabled
            ]}>
              Add Area {preferredAreas.length >= maxAreas ? `(${maxAreas} max)` : ''}
            </Text>
          </TouchableOpacity>
        </View>

        {preferredAreas.length === 0 ? (
          <Card variant="elevated" style={styles.emptyCard}>
            <Ionicons name="location-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No preferred areas set</Text>
            <Text style={styles.emptySubtext}>
              Add preferred areas to prioritize ride requests in those locations
            </Text>
            <Button
              title="Add Your First Area"
              onPress={() => setShowAddModal(true)}
              style={styles.emptyButton}
            />
          </Card>
        ) : (
          <ScrollView
            style={styles.listContainer}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          >
            {preferredAreas.map((area) => (
              <Card
                key={area.id}
                variant="elevated"
                style={[
                  styles.areaCard,
                  selectedArea?.id === area.id && styles.areaCardSelected,
                ]}
              >
                <TouchableOpacity
                  style={styles.areaContent}
                  onPress={() => handleSelectArea(area)}
                  activeOpacity={0.7}
                >
                  <View style={[
                    styles.areaIconContainer,
                    selectedArea?.id === area.id && styles.areaIconContainerSelected
                  ]}>
                    <Ionicons
                      name="location"
                      size={24}
                      color={selectedArea?.id === area.id ? '#667eea' : '#4ade80'}
                    />
                  </View>
                  <View style={styles.areaInfo}>
                    <Text style={styles.areaName}>{area.name}</Text>
                    <View style={styles.areaDetails}>
                      <View style={styles.radiusBadge}>
                        <Ionicons name="radio-button-on" size={10} color="#667eea" />
                        <Text style={styles.areaRadius}>{getRadiusDisplay(area.radius)}</Text>
                      </View>
                      {area.address && (
                        <Text style={styles.areaAddress} numberOfLines={1}>
                          {area.address}
                        </Text>
                      )}
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleDeleteArea(area.id);
                    }}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="trash-outline" size={20} color="#ef4444" />
                  </TouchableOpacity>
                </TouchableOpacity>
              </Card>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Location Selection Overlay - Shown when selecting location */}
      {isSelectingLocation && (
        <View style={styles.mapSelectionOverlay} pointerEvents="box-none">
          <Card variant="elevated" style={styles.selectingCard}>
            <Ionicons name="location" size={32} color="#667eea" />
            <Text style={styles.selectingText}>Tap on the map to select location</Text>
            <TouchableOpacity
              style={styles.cancelSelectButton}
              onPress={handleCancelSelection}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelSelectText}>Cancel</Text>
            </TouchableOpacity>
          </Card>
        </View>
      )}

      {/* Add Area Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showAddModal && !isSelectingLocation}
        onRequestClose={handleCloseModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Preferred Area</Text>
              <TouchableOpacity
                onPress={handleCloseModal}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Area Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Downtown, Airport, Business District"
                  value={newAreaName}
                  onChangeText={setNewAreaName}
                  placeholderTextColor="#999"
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Radius ({distanceUnit === 'miles' ? 'miles' : 'kilometers'}) *</Text>
                <View style={styles.radiusOptions}>
                  {radiusOptions.map((radius) => (
                    <TouchableOpacity
                      key={radius}
                      style={[
                        styles.radiusOption,
                        newAreaRadius === radius && styles.radiusOptionSelected,
                      ]}
                      onPress={() => setNewAreaRadius(radius)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.radiusOptionText,
                          newAreaRadius === radius && styles.radiusOptionTextSelected,
                        ]}
                      >
                        {getRadiusDisplay(radius)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {newAreaLocation && (
                  <Text style={styles.radiusHint}>
                    Preview circle shown on map ({getRadiusDisplay(newAreaRadius)} radius)
                  </Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Location *</Text>
                {newAreaLocation ? (
                  <Card variant="outlined" style={styles.locationCard}>
                    <View style={styles.locationInfo}>
                      <Ionicons name="checkmark-circle" size={20} color="#4ade80" />
                      <View style={styles.locationDetails}>
                        {locationAddress ? (
                          <Text style={styles.locationText} numberOfLines={2}>
                            {locationAddress}
                          </Text>
                        ) : (
                          <Text style={styles.locationText}>
                            {newAreaLocation.latitude.toFixed(4)}, {newAreaLocation.longitude.toFixed(4)}
                          </Text>
                        )}
                      </View>
                    </View>
                    <TouchableOpacity
                      onPress={handleStartSelecting}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.changeLocationText}>Change</Text>
                    </TouchableOpacity>
                  </Card>
                ) : (
                  <Button
                    title="Select Location on Map"
                    onPress={handleStartSelecting}
                    variant="secondary"
                    icon="location-outline"
                  />
                )}
                {isSelectingLocation && (
                  <Text style={styles.selectingHint}>
                    Tap anywhere on the map above to select location
                  </Text>
                )}
              </View>

              <View style={styles.modalActions}>
                <Button
                  title="Add Area"
                  onPress={handleAddArea}
                  disabled={!newAreaLocation || !newAreaName.trim()}
                />
                <Button
                  title="Cancel"
                  onPress={handleCloseModal}
                  variant="secondary"
                  style={styles.cancelButton}
                />
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  mapContainer: {
    height: height * 0.45,
    position: 'relative',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  mapSelectionOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 20,
    pointerEvents: 'box-none',
    zIndex: 1000,
  },
  selectingCard: {
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    minWidth: 250,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  selectingText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
  },
  cancelSelectButton: {
    marginTop: 12,
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  cancelSelectText: {
    fontSize: 14,
    color: '#ef4444',
    fontWeight: '600',
  },
  mapControls: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    gap: 12,
  },
  mapButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#e0e7ff',
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#667eea',
  },
  emptyCard: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  maxAreasHint: {
    fontSize: 12,
    color: '#667eea',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '500',
  },
  emptyButton: {
    marginTop: 8,
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 8,
  },
  areaCard: {
    marginBottom: 12,
    padding: 0,
    borderRadius: 12,
    overflow: 'hidden',
  },
  areaCardSelected: {
    borderWidth: 2,
    borderColor: '#667eea',
  },
  areaContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  areaIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  areaIconContainerSelected: {
    backgroundColor: '#e0e7ff',
  },
  areaInfo: {
    flex: 1,
  },
  areaName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 6,
  },
  areaDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  radiusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f0f4ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  areaRadius: {
    fontSize: 12,
    color: '#667eea',
    fontWeight: '600',
  },
  areaAddress: {
    fontSize: 12,
    color: '#999',
    flex: 1,
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: height * 0.75,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
  },
  modalBody: {
    flexGrow: 1,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#000',
    backgroundColor: '#fff',
  },
  radiusOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  radiusOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  radiusOptionSelected: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  radiusOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  radiusOptionTextSelected: {
    color: '#fff',
  },
  radiusHint: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
    fontStyle: 'italic',
  },
  locationCard: {
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  locationDetails: {
    flex: 1,
  },
  locationText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  changeLocationText: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: '600',
  },
  selectingHint: {
    fontSize: 12,
    color: '#667eea',
    marginTop: 8,
    fontStyle: 'italic',
  },
  modalActions: {
    marginTop: 10,
    marginBottom: 10,
    gap: 12,
  },
  cancelButton: {
    marginTop: 0,
  },
});

export default PreferredAreasScreen;
