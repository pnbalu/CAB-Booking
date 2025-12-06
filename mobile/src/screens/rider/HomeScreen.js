import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Dimensions,
  ScrollView,
  TextInput,
  Animated,
  Modal,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Easing,
} from 'react-native';
import MapView, { Marker, Polyline, Circle } from 'react-native-maps';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useLocation } from '../../contexts/LocationContext';
import { useSavedLocations } from '../../contexts/LocationsContext';
import { useRide } from '../../contexts/RideContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { useToast } from '../../contexts/ToastContext';
import Button from '../../components/Button';
import Card from '../../components/Card';
import { t } from '../../i18n';

const { width, height } = Dimensions.get('window');

const HomeScreen = () => {
  const navigation = useNavigation();
  const { location } = useLocation();
  const { savedLocations } = useSavedLocations();
  const { requestRide, activeRide } = useRide();
  const { user } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();
  const [pickup, setPickup] = useState(null);
  const [destination, setDestination] = useState(null);
  const [stops, setStops] = useState([]); // Multiple stops/waypoints
  const [region, setRegion] = useState(null);
  const [rideType, setRideType] = useState('standard');
  const [availableDrivers, setAvailableDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [showDriverSelection, setShowDriverSelection] = useState(false);
  const [pickupText, setPickupText] = useState(t('home.currentLocation'));
  const [destinationText, setDestinationText] = useState(t('home.destination'));
  const [estimatedFare, setEstimatedFare] = useState(null);
  const [estimatedTime, setEstimatedTime] = useState(null);
  const [showRideTypes, setShowRideTypes] = useState(false);
  const [showAddressSearch, setShowAddressSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [activeInput, setActiveInput] = useState(null); // 'pickup', 'destination', or stop index
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [showDirections, setShowDirections] = useState(false);
  const [loadingDirections, setLoadingDirections] = useState(false);
  const [trafficLevel, setTrafficLevel] = useState('moderate'); // light, moderate, heavy
  const [weather, setWeather] = useState({ temp: 22, condition: 'sunny' });
  const slideAnim = useRef(new Animated.Value(0)).current;
  const driverPulseAnim = useRef(new Animated.Value(1)).current;
  const fareBreakdownAnim = useRef(new Animated.Value(0)).current;
  const driverCountAnim = useRef(new Animated.Value(0)).current;

  // Search addresses using OpenStreetMap Nominatim
  const searchAddresses = async (query) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      // Nominatim geocoding API - search for addresses
      // Note: Please use a custom User-Agent header as per Nominatim usage policy
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`;
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'CAB-Booking-App/1.0', // Required by Nominatim usage policy
        },
      });
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        const results = data.map((item, index) => ({
          id: `${item.place_id || index}`,
          name: item.display_name,
          address: item.display_name,
          coordinate: {
            latitude: parseFloat(item.lat),
            longitude: parseFloat(item.lon),
          },
        }));
        setSearchResults(results);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error searching addresses with Nominatim:', error);
      setSearchResults([]);
    }
  };

  // Reverse geocoding - get address from coordinates using Nominatim
  const getAddressFromCoordinates = async (coordinate) => {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coordinate.latitude}&lon=${coordinate.longitude}&addressdetails=1`;
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'CAB-Booking-App/1.0',
        },
      });
      
      const data = await response.json();
      
      if (data && data.display_name) {
        return data.display_name;
      }
      return 'Selected Location';
    } catch (error) {
      console.error('Error reverse geocoding with Nominatim:', error);
      return 'Selected Location';
    }
  };

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  };

  useEffect(() => {
    if (location) {
      setPickup(location);
      setRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
      
      // Generate mock available drivers around user location with details
      const driverNames = ['John Smith', 'Sarah Johnson', 'Mike Davis', 'Emma Wilson', 'David Brown', 'Lisa Anderson', 'Chris Taylor', 'Maria Garcia'];
      const drivers = [];
      for (let i = 0; i < 8; i++) {
        const driverLat = location.latitude + (Math.random() - 0.5) * 0.02;
        const driverLon = location.longitude + (Math.random() - 0.5) * 0.02;
        
        // Calculate distance from pickup location
        const distance = calculateDistance(
          location.latitude,
          location.longitude,
          driverLat,
          driverLon
        );
        
        // Estimate ETA (adjusted for traffic)
        const baseSpeed = trafficLevel === 'heavy' ? 20 : trafficLevel === 'moderate' ? 30 : 40;
        const etaMinutes = Math.round((distance / baseSpeed) * 60);
        
        drivers.push({
          id: `driver-${i}`,
          name: driverNames[i] || `Driver ${i + 1}`,
          rating: (4 + Math.random()).toFixed(1), // Rating between 4.0 and 5.0
          latitude: driverLat,
          longitude: driverLon,
          distance: parseFloat(distance.toFixed(2)),
          eta: etaMinutes,
          vehicleType: i % 2 === 0 ? 'Sedan' : 'SUV',
          vehicleNumber: `ABC-${1000 + i}`,
          trips: Math.floor(Math.random() * 500) + 100,
          badge: i < 2 ? 'Top Rated' : null,
        });
      }
      // Sort by distance (closest first)
      drivers.sort((a, b) => a.distance - b.distance);
      setAvailableDrivers(drivers);
      
      // Animate driver count
      Animated.spring(driverCountAnim, {
        toValue: 1,
        useNativeDriver: false,
        tension: 50,
        friction: 7,
      }).start();
      
      // Animate fare breakdown when locations are set
      if (pickup && destination) {
        Animated.timing(fareBreakdownAnim, {
          toValue: 1,
          duration: 500,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }).start();
      }
      
      // Simulate traffic and weather
      const trafficLevels = ['light', 'moderate', 'heavy'];
      setTrafficLevel(trafficLevels[Math.floor(Math.random() * 3)]);
      
      const conditions = ['sunny', 'cloudy', 'rainy'];
      setWeather({
        temp: Math.floor(Math.random() * 15) + 18,
        condition: conditions[Math.floor(Math.random() * 3)],
      });
    }
  }, [location]);

  useEffect(() => {
    if (activeRide) {
      navigation.navigate('RideStatus');
    }
  }, [activeRide]);

  // Continuous pulse animation for selected driver
  useEffect(() => {
    if (selectedDriver) {
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(driverPulseAnim, {
            toValue: 1.2,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(driverPulseAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();
      return () => pulseAnimation.stop();
    } else {
      driverPulseAnim.setValue(1);
    }
  }, [selectedDriver]);

  useEffect(() => {
    const allLocations = [pickup, ...stops.map(s => s.coordinate), destination].filter(Boolean);
    if (allLocations.length >= 2) {
      // Calculate estimated fare with stops (will be updated with actual distance from API)
      const baseFare = rideType === 'premium' ? 15 : 10;
      const distance = Math.random() * 10 + 5 + (stops.length * 2); // Add extra for stops
      const fare = baseFare + distance * 2 + (stops.length * 3); // $3 per stop
      setEstimatedFare(Math.round(fare * 100) / 100);
      
      // Only auto-fetch directions if showDirections is true
      if (showDirections) {
        fetchRoute();
      }
    } else {
      setEstimatedFare(null);
      setEstimatedTime(null);
      setRouteCoordinates([]);
      setShowDirections(false);
    }
  }, [pickup, destination, stops, rideType, showDirections]);

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: showRideTypes ? 1 : 0,
      useNativeDriver: true,
      tension: 50,
      friction: 8,
    }).start();
  }, [showRideTypes]);

  useEffect(() => {
    if (searchQuery) {
      searchAddresses(searchQuery);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const handleMapPress = async (e) => {
    const coordinate = e.nativeEvent.coordinate;
    
    if (!pickup) {
      setPickup(coordinate);
      // Get address from coordinates using reverse geocoding
      const address = await getAddressFromCoordinates(coordinate);
      setPickupText(address);
    } else if (!destination) {
      setDestination(coordinate);
      // Get address from coordinates using reverse geocoding
      const address = await getAddressFromCoordinates(coordinate);
      setDestinationText(address);
    }
  };

  const handleAddressSelect = (result) => {
    const coordinate = result.coordinate;
    const address = result.name || result.address;

    if (activeInput === 'pickup') {
      setPickup(coordinate);
      setPickupText(address);
    } else if (activeInput === 'destination') {
      setDestination(coordinate);
      setDestinationText(address);
    } else if (typeof activeInput === 'number') {
      // Add new stop or update existing stop
      const updatedStops = [...stops];
      if (activeInput >= updatedStops.length) {
        // Adding new stop
        updatedStops.push({ coordinate, address });
      } else {
        // Updating existing stop
        updatedStops[activeInput] = { coordinate, address };
      }
      setStops(updatedStops);
    }

    setShowAddressSearch(false);
    setSearchQuery('');
    setActiveInput(null);
  };

  const handleInputFocus = (type) => {
    setActiveInput(type);
    setShowAddressSearch(true);
    setSearchQuery('');
    // Initialize search query with current value if editing existing stop
    if (typeof type === 'number' && stops[type]) {
      setSearchQuery(stops[type].address);
    }
  };

  const handleAddStop = () => {
    // Set activeInput to the next index (stops.length) to add a new stop
    setActiveInput(stops.length);
    setShowAddressSearch(true);
    setSearchQuery('');
  };

  const handleRemoveStop = (index) => {
    const updatedStops = stops.filter((_, i) => i !== index);
    setStops(updatedStops);
  };

  const handleMoveStop = (fromIndex, direction) => {
    if (direction === 'up' && fromIndex === 0) return;
    if (direction === 'down' && fromIndex === stops.length - 1) return;
    
    const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1;
    const updatedStops = [...stops];
    const [removed] = updatedStops.splice(fromIndex, 1);
    updatedStops.splice(toIndex, 0, removed);
    setStops(updatedStops);
  };

  const handleBookRide = () => {
    if (!pickup || !destination) {
      showError('Please select pickup and destination locations');
      return;
    }

    if (availableDrivers.length === 0) {
      showError('No drivers available at the moment. Please try again later.');
      return;
    }

    // Show driver selection modal with animation
    setShowDriverSelection(true);
    showInfo(`Found ${availableDrivers.length} drivers nearby!`);
  };

  const handleSelectDriver = (driver) => {
    setSelectedDriver(driver);
    // Animate pulse for selected driver
    Animated.sequence([
      Animated.timing(driverPulseAnim, {
        toValue: 1.3,
        duration: 200,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(driverPulseAnim, {
        toValue: 1,
        duration: 200,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
    
    showSuccess(`Selected ${driver.name} - ${driver.eta} min away`);
  };

  const handleStartTrip = () => {
    if (!selectedDriver) {
      showError('Please select a driver first');
      return;
    }
    
    if (!pickup || !destination) {
      showError('Please select pickup and destination locations');
      return;
    }

    // Close the modal
    setShowDriverSelection(false);
    
    // Start the trip with selected driver
    const ride = requestRide(pickup, destination, rideType, stops, selectedDriver);
    
    showSuccess(`Trip started! ${selectedDriver.name} is on the way! 🚗`);
    
    // Navigate to ride status screen with delay for better UX
    setTimeout(() => {
      navigation.navigate('RideStatus', { ride });
    }, 800);
  };

  const resetLocations = () => {
    setPickup(location);
    setDestination(null);
    setStops([]);
    setPickupText(t('home.currentLocation'));
    setDestinationText(t('home.destination'));
    setShowRideTypes(false);
  };

  const handleUseCurrentLocation = () => {
    if (location) {
      setPickup(location);
      setPickupText(t('home.currentLocation'));
    }
  };

  const quickLocations = [
    {
      name: t('home.home'),
      icon: 'home',
      address: savedLocations.home?.name || 'Not set',
      type: 'home',
      location: savedLocations.home?.location,
    },
    {
      name: t('home.work'),
      icon: 'briefcase',
      address: savedLocations.work?.name || 'Not set',
      type: 'work',
      location: savedLocations.work?.location,
    },
    {
      name: t('home.airport'),
      icon: 'airplane',
      address: savedLocations.airport?.name || 'Not set',
      type: 'airport',
      location: savedLocations.airport?.location,
    },
    ...savedLocations.custom.map((loc, index) => ({
      name: loc.name || t('home.custom'),
      icon: 'location',
      address: 'Custom location',
      type: 'custom',
      location: loc.location,
      index,
    })),
    {
      name: t('home.custom'),
      icon: 'add-circle',
      address: t('home.saveLocation'),
      type: 'add',
      location: null,
    },
  ];

  const rideTypes = [
    { id: 'standard', name: 'Standard', icon: 'car', price: '$10-25', description: 'Affordable everyday rides' },
    { id: 'premium', name: 'Premium', icon: 'car-sport', price: '$15-35', description: 'Comfortable luxury rides' },
  ];

  const rotateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['90deg', '0deg'],
  });

  // Fetch route from OpenStreetMap using OSRM
  const fetchRoute = async () => {
    if (!pickup || !destination) {
      setRouteCoordinates([]);
      setShowDirections(false);
      return;
    }

    setLoadingDirections(true);
    try {
      // Build coordinates array with pickup, stops, and destination
      const waypoints = [];
      if (pickup) waypoints.push(pickup);
      stops.forEach(stop => waypoints.push(stop.coordinate));
      if (destination) waypoints.push(destination);

      // OSRM Route API - Get route following actual streets/roads
      // Format: longitude,latitude (OSRM uses lon,lat order)
      const coordinates = waypoints
        .map(point => `${point.longitude},${point.latitude}`)
        .join(';');
      
      const url = `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson&alternatives=false`;

      console.log('Fetching route from OSRM (OpenStreetMap)...');

      const response = await fetch(url);
      const data = await response.json();

      if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        
        // Extract coordinates from GeoJSON geometry
        const routeCoords = route.geometry.coordinates.map(coord => ({
          longitude: coord[0],
          latitude: coord[1],
        }));
        
        setRouteCoordinates(routeCoords);
        setShowDirections(true);

        // Get distance and duration from route
        const distanceMeters = route.distance; // in meters
        const durationSeconds = route.duration; // in seconds

        // Calculate estimated time
        const estimatedMinutes = Math.round(durationSeconds / 60);
        setEstimatedTime(estimatedMinutes);
        
        console.log(`Route loaded: ${routeCoords.length} coordinates, ${(distanceMeters / 1000).toFixed(2)} km, ${estimatedMinutes} min`);
      } else {
        // Fallback to straight line if OSRM fails
        console.warn('OSRM route error, using straight line');
        setRouteCoordinates(waypoints);
        setShowDirections(true);

        // Calculate estimated time based on straight-line distance
        let totalDistance = 0;
        for (let i = 0; i < waypoints.length - 1; i++) {
          const distance = calculateDistance(
            waypoints[i].latitude,
            waypoints[i].longitude,
            waypoints[i + 1].latitude,
            waypoints[i + 1].longitude
          );
          totalDistance += distance;
        }
        const estimatedMinutes = Math.round((totalDistance / 60) * 60);
        setEstimatedTime(estimatedMinutes);
      }
    } catch (error) {
      console.error('Error fetching route from OSRM:', error);
      // Fallback to straight line on error
      const waypoints = [];
      if (pickup) waypoints.push(pickup);
      stops.forEach(stop => waypoints.push(stop.coordinate));
      if (destination) waypoints.push(destination);
      
      setRouteCoordinates(waypoints);
      setShowDirections(true);

      // Calculate estimated time based on straight-line distance
      let totalDistance = 0;
      for (let i = 0; i < waypoints.length - 1; i++) {
        const distance = calculateDistance(
          waypoints[i].latitude,
          waypoints[i].longitude,
          waypoints[i + 1].latitude,
          waypoints[i + 1].longitude
        );
        totalDistance += distance;
      }
      const estimatedMinutes = Math.round((totalDistance / 60) * 60);
      setEstimatedTime(estimatedMinutes);
    } finally {
      setLoadingDirections(false);
    }
  };

  const handleShowDirections = () => {
    if (!pickup || !destination) {
      Alert.alert('Missing Locations', 'Please select both pickup and destination locations first.');
      return;
    }
    fetchRoute();
  };

  const handleHideDirections = () => {
    setShowDirections(false);
    setRouteCoordinates([]);
  };

  // Decode Google polyline string to coordinates

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          region={region}
          onPress={handleMapPress}
          showsUserLocation
          showsMyLocationButton={false}
          mapType="standard"
        >
          {pickup && (
            <Marker coordinate={pickup} title="Pickup Location">
              <View style={styles.pickupMarker}>
                <Ionicons name="location" size={24} color="#32CD32" />
              </View>
            </Marker>
          )}
          {stops.map((stop, index) => (
            <Marker key={`stop-${index}`} coordinate={stop.coordinate} title={`Stop ${index + 1}`}>
              <View style={styles.stopMarker}>
                <Text style={styles.stopMarkerText}>{index + 1}</Text>
              </View>
            </Marker>
          ))}
          {destination && (
            <Marker coordinate={destination} title="Destination">
              <View style={styles.destinationMarker}>
                <Ionicons name="flag" size={24} color="#ff4444" />
              </View>
            </Marker>
          )}
          {showDirections && routeCoordinates.length >= 2 && (
            <Polyline
              coordinates={routeCoordinates}
              strokeColor="#667eea"
              strokeWidth={4}
            />
          )}
          {availableDrivers.map((driver, index) => {
            const isSelected = selectedDriver?.id === driver.id;
            return (
              <React.Fragment key={driver.id}>
                {/* Pulse circle for selected driver */}
                {isSelected && (
                  <Circle
                    center={{ latitude: driver.latitude, longitude: driver.longitude }}
                    radius={200}
                    strokeColor="#4ade80"
                    fillColor="rgba(74, 222, 128, 0.1)"
                    strokeWidth={2}
                  />
                )}
                <Marker
                  coordinate={{ latitude: driver.latitude, longitude: driver.longitude }}
                  title={driver.name}
                  description={`${driver.distance} km away • ${driver.eta} min ETA • ⭐ ${driver.rating}`}
                  onPress={() => {
                    setSelectedDriver(driver);
                    setShowDriverSelection(true);
                  }}
                  anchor={{ x: 0.5, y: 0.5 }}
                >
                  <Animated.View
                    style={[
                      styles.carMarker,
                      isSelected && styles.selectedCarMarker,
                      isSelected && {
                        transform: [{ scale: driverPulseAnim }],
                      },
                    ]}
                  >
                    <LinearGradient
                      colors={isSelected ? ['#4ade80', '#22c55e'] : ['#667eea', '#764ba2']}
                      style={styles.carMarkerGradient}
                    >
                      <Ionicons 
                        name="car" 
                        size={24} 
                        color="#fff" 
                      />
                      {driver.badge && (
                        <View style={styles.driverBadge}>
                          <Ionicons name="star" size={10} color="#fbbf24" />
                        </View>
                      )}
                    </LinearGradient>
                  </Animated.View>
                </Marker>
              </React.Fragment>
            );
          })}
        </MapView>

        {/* Top Bar */}
        <View style={styles.topBar}>
          <View style={styles.searchContainer}>
            <TouchableOpacity 
              style={styles.searchBox}
              onPress={() => handleInputFocus('pickup')}
              activeOpacity={0.7}
            >
              <View style={styles.searchIconContainer}>
                <Ionicons name="location" size={20} color="#32CD32" />
              </View>
              <TextInput
                style={styles.searchInput}
                placeholder={t('home.pickup')}
                value={pickupText}
                editable={false}
                placeholderTextColor="#999"
                pointerEvents="none"
              />
              {pickup && (
                <TouchableOpacity 
                  onPress={(e) => {
                    e.stopPropagation();
                    handleUseCurrentLocation();
                  }}
                >
                  <Ionicons name="refresh" size={20} color="#667eea" />
                </TouchableOpacity>
              )}
            </TouchableOpacity>
            
            {/* Stops */}
            {stops.map((stop, index) => (
              <View
                key={`stop-input-${index}`}
                style={styles.searchBox}
              >
                <View style={styles.dragControls}>
                  <TouchableOpacity
                    style={[styles.dragButton, index === 0 && styles.dragButtonDisabled]}
                    onPress={() => handleMoveStop(index, 'up')}
                    disabled={index === 0}
                  >
                    <Ionicons name="chevron-up" size={16} color={index === 0 ? "#ccc" : "#667eea"} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.dragButton, index === stops.length - 1 && styles.dragButtonDisabled]}
                    onPress={() => handleMoveStop(index, 'down')}
                    disabled={index === stops.length - 1}
                  >
                    <Ionicons name="chevron-down" size={16} color={index === stops.length - 1 ? "#ccc" : "#667eea"} />
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  style={styles.stopContent}
                  onPress={() => handleInputFocus(index)}
                  activeOpacity={0.7}
                >
                  <View style={styles.searchIconContainer}>
                    <Ionicons name="ellipse" size={16} color="#667eea" />
                  </View>
                  <TextInput
                    style={styles.searchInput}
                    placeholder={`Stop ${index + 1}`}
                    value={stop.address}
                    editable={false}
                    placeholderTextColor="#999"
                    pointerEvents="none"
                  />
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={(e) => {
                    e.stopPropagation();
                    handleRemoveStop(index);
                  }}
                >
                  <Ionicons name="close-circle" size={20} color="#ff4444" />
                </TouchableOpacity>
              </View>
            ))}

            <TouchableOpacity 
              style={styles.searchBox}
              onPress={() => handleInputFocus('destination')}
              activeOpacity={0.7}
            >
              <View style={styles.searchIconContainer}>
                <Ionicons name="flag" size={20} color="#ff4444" />
              </View>
              <TextInput
                style={styles.searchInput}
                placeholder={t('home.destination')}
                value={destinationText}
                editable={false}
                placeholderTextColor="#999"
                pointerEvents="none"
              />
            </TouchableOpacity>

            {/* Add Stop Button - Show when pickup is set */}
            {pickup && (
              <TouchableOpacity style={styles.addStopButton} onPress={handleAddStop}>
                <Ionicons name="add-circle-outline" size={20} color="#667eea" />
                <Text style={styles.addStopText}>Add Stop</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Enhanced Driver Count Badge with Animation */}
        <Animated.View 
          style={[
            styles.driverCountBadge,
            {
              opacity: driverCountAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 1],
              })
            }
          ]}
        >
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.driverCountGradient}
          >
            <Ionicons name="car" size={18} color="#fff" />
            <Text style={styles.driverCountText}>
              {availableDrivers.length} {t('home.driversNearby')}
            </Text>
          </LinearGradient>
        </Animated.View>

        {/* Weather & Traffic Widget */}
        {pickup && destination && (
          <Animated.View 
            style={[
              styles.weatherWidget,
              {
                opacity: fareBreakdownAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 1],
                }),
                transform: [{
                  translateY: fareBreakdownAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-20, 0],
                  })
                }]
              }
            ]}
          >
            <LinearGradient
              colors={['rgba(102, 126, 234, 0.95)', 'rgba(118, 75, 162, 0.95)']}
              style={styles.weatherGradient}
            >
              <View style={styles.weatherRow}>
                <View style={styles.weatherItem}>
                  <Ionicons 
                    name={weather.condition === 'sunny' ? 'sunny' : weather.condition === 'rainy' ? 'rainy' : 'cloudy'} 
                    size={20} 
                    color="#fff" 
                  />
                  <Text style={styles.weatherText}>{weather.temp}°C</Text>
                </View>
                <View style={styles.weatherDivider} />
                <View style={styles.weatherItem}>
                  <Ionicons 
                    name={trafficLevel === 'light' ? 'checkmark-circle' : trafficLevel === 'heavy' ? 'alert-circle' : 'time'} 
                    size={20} 
                    color={trafficLevel === 'light' ? '#4ade80' : trafficLevel === 'heavy' ? '#ef4444' : '#fbbf24'} 
                  />
                  <Text style={styles.weatherText}>
                    {trafficLevel === 'light' ? 'Light' : trafficLevel === 'heavy' ? 'Heavy' : 'Moderate'} Traffic
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>
        )}

        {/* Directions Button */}
        {pickup && destination && (
          <View style={styles.directionsButtonContainer}>
            {!showDirections ? (
              <TouchableOpacity
                style={styles.directionsButton}
                onPress={handleShowDirections}
                disabled={loadingDirections}
              >
                {loadingDirections ? (
                  <>
                    <Ionicons name="hourglass-outline" size={20} color="#fff" />
                    <Text style={styles.directionsButtonText}>Loading...</Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="navigate" size={20} color="#fff" />
                    <Text style={styles.directionsButtonText}>Show Directions</Text>
                  </>
                )}
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.directionsButton, styles.directionsButtonActive]}
                onPress={handleHideDirections}
              >
                <Ionicons name="close-circle" size={20} color="#fff" />
                <Text style={styles.directionsButtonText}>Hide Directions</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* Address Search Modal */}
      <Modal
        visible={showAddressSearch}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          setShowAddressSearch(false);
          setSearchQuery('');
          setActiveInput(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalKeyboardView}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
          >
            <TouchableOpacity
              style={styles.modalOverlayTouchable}
              activeOpacity={1}
              onPress={() => {
                setShowAddressSearch(false);
                setSearchQuery('');
                setActiveInput(null);
              }}
            >
              <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
                <View style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>
                      {activeInput === 'pickup' ? 'Pickup Location' : 
                       activeInput === 'destination' ? 'Destination' : 
                       typeof activeInput === 'number' ? `Stop ${activeInput + 1}` : 
                       'Search Address'}
                    </Text>
                    <TouchableOpacity
                      onPress={() => {
                        setShowAddressSearch(false);
                        setSearchQuery('');
                        setActiveInput(null);
                      }}
                    >
                      <Ionicons name="close" size={24} color="#000" />
                    </TouchableOpacity>
                  </View>
                  <TextInput
                    style={styles.modalSearchInput}
                    placeholder="Enter address..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    autoFocus
                    placeholderTextColor="#999"
                    returnKeyType="search"
                  />
                  <View style={styles.searchResultsContainer}>
                    <FlatList
                      data={searchResults}
                      keyExtractor={(item) => item.id}
                      keyboardShouldPersistTaps="handled"
                      style={[styles.searchResultsList, { maxHeight: height * 0.4 }]}
                      contentContainerStyle={styles.searchResultsContent}
                      nestedScrollEnabled={true}
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          style={styles.searchResultItem}
                          onPress={() => handleAddressSelect(item)}
                          activeOpacity={0.7}
                        >
                          <Ionicons name="location-outline" size={20} color="#667eea" />
                          <View style={styles.searchResultText}>
                            <Text style={styles.searchResultName}>{item.name}</Text>
                            <Text style={styles.searchResultAddress}>{item.address}</Text>
                          </View>
                          <Ionicons name="chevron-forward" size={20} color="#ccc" />
                        </TouchableOpacity>
                      )}
                      ListEmptyComponent={
                        searchQuery.length >= 2 ? (
                          <View style={styles.emptySearch}>
                            <Ionicons name="search-outline" size={48} color="#ccc" />
                            <Text style={styles.emptySearchText}>No results found</Text>
                            <Text style={styles.emptySearchSubtext}>Try a different address</Text>
                          </View>
                        ) : (
                          <View style={styles.emptySearch}>
                            <Ionicons name="location-outline" size={48} color="#ccc" />
                            <Text style={styles.emptySearchText}>Start typing to search</Text>
                            <Text style={styles.emptySearchSubtext}>Or select from saved locations</Text>
                          </View>
                        )
                      }
                    />
                  </View>
                </View>
              </TouchableOpacity>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* Bottom Sheet */}
      <View style={styles.bottomSheet}>
        <ScrollView
          style={styles.bottomSheetScrollView}
          contentContainerStyle={styles.bottomSheetContent}
          showsVerticalScrollIndicator={true}
          nestedScrollEnabled={true}
          keyboardShouldPersistTaps="handled"
        >
          {!pickup || !destination ? (
            <>
              {/* Quick Locations */}
              <View style={styles.quickLocationsContainer}>
                <Text style={styles.sectionTitle}>{t('home.quickAccess')}</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {quickLocations.map((loc, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.quickLocationCard}
                      onPress={() => {
                        if (loc.type === 'add') {
                          navigation.navigate('SaveLocation', { type: 'custom' });
                        } else if (!loc.location) {
                          navigation.navigate('SaveLocation', { type: loc.type });
                        } else {
                          // Use saved location
                          if (!pickup) {
                            setPickup(loc.location);
                            setPickupText(loc.name);
                          } else if (!destination) {
                            setDestination(loc.location);
                            setDestinationText(loc.name);
                          }
                        }
                      }}
                    >
                      <View style={styles.quickLocationIcon}>
                        <Ionicons name={loc.icon} size={24} color="#667eea" />
                      </View>
                      <Text style={styles.quickLocationName}>{loc.name}</Text>
                      <Text style={styles.quickLocationAddress}>
                        {loc.location ? loc.address : t('home.saveLocation')}
                      </Text>
                      {!loc.location && loc.type !== 'add' && (
                        <View style={styles.notSetBadge}>
                          <Text style={styles.notSetText}>Not set</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Instructions */}
              <Card variant="elevated" style={styles.instructionCard}>
                <View style={styles.instructionContent}>
                  <Ionicons name="map-outline" size={32} color="#667eea" />
                  <Text style={styles.instructionText}>
                    {!pickup
                      ? t('home.tapToSetPickup')
                      : t('home.tapToSetDestination')}
                  </Text>
                  <Text style={styles.instructionSubtext}>
                    Or tap on the address fields to search
                  </Text>
                </View>
              </Card>
            </>
          ) : (
            <>
              {/* Ride Type Selection */}
              <Card variant="elevated" style={styles.rideInfoCard}>
                <TouchableOpacity
                  style={styles.rideTypeHeader}
                  onPress={() => setShowRideTypes(!showRideTypes)}
                >
                  <View style={styles.rideTypeHeaderLeft}>
                    <Ionicons
                      name={rideType === 'standard' ? 'car' : 'car-sport'}
                      size={24}
                      color="#667eea"
                    />
                    <View style={styles.rideTypeHeaderText}>
                      <Text style={styles.selectedRideType}>
                        {rideType === 'standard' ? t('home.standard') : t('home.premium')}
                      </Text>
                      <Text style={styles.selectedRidePrice}>
                        {estimatedFare ? `$${estimatedFare}` : 'Calculating...'}
                      </Text>
                    </View>
                  </View>
                  <Ionicons
                    name={showRideTypes ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color="#667eea"
                  />
                </TouchableOpacity>

                <Animated.View
                  style={[
                    styles.rideTypesContainer,
                    {
                      opacity: slideAnim,
                      transform: [{ rotateY }],
                    },
                  ]}
                >
                  {rideTypes.map((type) => (
                    <TouchableOpacity
                      key={type.id}
                      style={[
                        styles.rideTypeOption,
                        rideType === type.id && styles.rideTypeOptionActive,
                      ]}
                      onPress={() => {
                        setRideType(type.id);
                        setShowRideTypes(false);
                      }}
                    >
                      <View style={styles.rideTypeOptionLeft}>
                        <Ionicons
                          name={type.icon}
                          size={24}
                          color={rideType === type.id ? '#fff' : '#667eea'}
                        />
                        <View>
                          <Text
                            style={[
                              styles.rideTypeOptionName,
                              rideType === type.id && styles.rideTypeOptionNameActive,
                            ]}
                          >
                            {type.name}
                          </Text>
                          <Text
                            style={[
                              styles.rideTypeOptionDesc,
                              rideType === type.id && styles.rideTypeOptionDescActive,
                            ]}
                          >
                            {type.description}
                          </Text>
                        </View>
                      </View>
                      <Text
                        style={[
                          styles.rideTypeOptionPrice,
                          rideType === type.id && styles.rideTypeOptionPriceActive,
                        ]}
                      >
                        {type.price}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </Animated.View>
              </Card>

              {/* Fare & Time Estimate */}
              <Card variant="elevated" style={styles.estimateCard}>
                <View style={styles.estimateRow}>
                  <View style={styles.estimateItem}>
                    <Ionicons name="time-outline" size={20} color="#667eea" />
                    <Text style={styles.estimateLabel}>{t('home.estimatedTime')}</Text>
                    <Text style={styles.estimateValue}>
                      {estimatedTime ? `${estimatedTime} min` : '--'}
                    </Text>
                  </View>
                  <View style={styles.estimateDivider} />
                  <View style={styles.estimateItem}>
                    <Ionicons name="cash-outline" size={20} color="#667eea" />
                    <Text style={styles.estimateLabel}>{t('home.estimatedFare')}</Text>
                    <Text style={styles.estimateValue}>
                      {estimatedFare ? `$${estimatedFare}` : '--'}
                    </Text>
                  </View>
                  <View style={styles.estimateDivider} />
                  <View style={styles.estimateItem}>
                    <Ionicons name="car-outline" size={20} color="#667eea" />
                    <Text style={styles.estimateLabel}>{t('home.drivers')}</Text>
                    <Text style={styles.estimateValue}>{availableDrivers.length}</Text>
                  </View>
                </View>
              </Card>

              {/* Action Buttons */}
              <View style={styles.buttonRow}>
                <Button
                  title={t('home.reset')}
                  onPress={resetLocations}
                  variant="secondary"
                  style={styles.resetButton}
                />
                <Button
                  title={t('home.bookRide')}
                  onPress={handleBookRide}
                  style={styles.bookButton}
                />
              </View>
            </>
          )}
        </ScrollView>
      </View>

      {/* Driver Selection Modal */}
      <Modal
        visible={showDriverSelection}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          setShowDriverSelection(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.driverModalContent}>
            <View style={styles.driverModalHeader}>
              <Text style={styles.driverModalTitle}>Select a Driver</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowDriverSelection(false);
                }}
              >
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.driverModalSubtitle}>
              {availableDrivers.length} drivers available nearby
            </Text>

            <FlatList
              data={availableDrivers}
              keyExtractor={(item) => item.id}
              style={styles.driverList}
              contentContainerStyle={styles.driverListContent}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.driverCard,
                    selectedDriver?.id === item.id && styles.driverCardSelected
                  ]}
                  onPress={() => handleSelectDriver(item)}
                  activeOpacity={0.7}
                >
                  <View style={styles.driverCardLeft}>
                    <View style={styles.driverAvatar}>
                      <Ionicons name="person" size={24} color="#667eea" />
                    </View>
                    <View style={styles.driverInfo}>
                      <View style={styles.driverNameRow}>
                        <Text style={styles.driverName}>{item.name}</Text>
                        {item.badge && (
                          <View style={styles.topRatedBadge}>
                            <Ionicons name="star" size={12} color="#fbbf24" />
                            <Text style={styles.topRatedText}>Top Rated</Text>
                          </View>
                        )}
                      </View>
                      <View style={styles.driverDetails}>
                        <View style={styles.driverRating}>
                          <Ionicons name="star" size={14} color="#fbbf24" />
                          <Text style={styles.driverRatingText}>{item.rating}</Text>
                          {item.trips && (
                            <Text style={styles.driverTrips}>({item.trips}+ trips)</Text>
                          )}
                        </View>
                        <Text style={styles.driverVehicle}>{item.vehicleType} • {item.vehicleNumber}</Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.driverCardRight}>
                    <View style={styles.driverDistance}>
                      <Ionicons name="location" size={16} color="#667eea" />
                      <Text style={styles.driverDistanceText}>{item.distance} km</Text>
                    </View>
                    <Text style={styles.driverEta}>{item.eta} min</Text>
                    {selectedDriver?.id === item.id && (
                      <View style={styles.selectedBadge}>
                        <Ionicons name="checkmark-circle" size={20} color="#4ade80" />
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={styles.emptyDrivers}>
                  <Ionicons name="car-outline" size={48} color="#ccc" />
                  <Text style={styles.emptyDriversText}>No drivers available</Text>
                </View>
              }
            />

            {selectedDriver && (
              <View style={styles.driverModalFooter}>
                <Button
                  title={`Start Trip with ${selectedDriver.name}`}
                  onPress={handleStartTrip}
                  style={styles.startTripButton}
                />
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingTop: 8,
    zIndex: 1,
  },
  searchContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    maxHeight: 300,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    position: 'relative',
  },
  dragControls: {
    flexDirection: 'column',
    marginRight: 8,
    justifyContent: 'center',
  },
  dragButton: {
    padding: 4,
    borderRadius: 4,
    backgroundColor: '#f0f0f0',
    marginVertical: 2,
  },
  dragButtonDisabled: {
    opacity: 0.3,
  },
  stopContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  addStopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 8,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    gap: 8,
  },
  addStopText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#667eea',
  },
  searchIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
  driverCountBadge: {
    position: 'absolute',
    top: 140,
    right: 16,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  driverCountGradient: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  driverCountText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  weatherWidget: {
    position: 'absolute',
    top: 140,
    left: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  weatherGradient: {
    padding: 12,
  },
  weatherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  weatherItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  weatherText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  weatherDivider: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  carMarkerGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  driverBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#fff',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fbbf24',
  },
  directionsButtonContainer: {
    position: 'absolute',
    bottom: 100,
    left: 16,
    right: 16,
    zIndex: 1,
  },
  directionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#667eea',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  directionsButtonActive: {
    backgroundColor: '#ff4444',
  },
  directionsButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  bottomSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    maxHeight: '50%',
  },
  bottomSheetScrollView: {
    flex: 1,
  },
  bottomSheetContent: {
    padding: 24,
    paddingBottom: 30,
  },
  quickLocationsContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
  },
  quickLocationCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    width: 120,
    alignItems: 'center',
  },
  quickLocationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickLocationName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  quickLocationAddress: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
  },
  instructionCard: {
    padding: 24,
    alignItems: 'center',
  },
  instructionContent: {
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  instructionSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  rideInfoCard: {
    marginBottom: 16,
    padding: 16,
  },
  rideTypeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rideTypeHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rideTypeHeaderText: {
    gap: 2,
  },
  selectedRideType: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  selectedRidePrice: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  rideTypesContainer: {
    marginTop: 12,
    overflow: 'hidden',
    maxHeight: 200,
  },
  rideTypeOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    marginBottom: 8,
  },
  rideTypeOptionActive: {
    backgroundColor: '#667eea',
  },
  rideTypeOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  rideTypeOptionName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 2,
  },
  rideTypeOptionNameActive: {
    color: '#fff',
  },
  rideTypeOptionDesc: {
    fontSize: 12,
    color: '#666',
  },
  rideTypeOptionDescActive: {
    color: '#ccc',
  },
  rideTypeOptionPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  rideTypeOptionPriceActive: {
    color: '#fff',
  },
  estimateCard: {
    marginBottom: 16,
    padding: 20,
  },
  estimateRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  estimateItem: {
    alignItems: 'center',
    flex: 1,
  },
  estimateLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    marginBottom: 4,
  },
  estimateValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  estimateDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#e0e0e0',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  resetButton: {
    flex: 1,
  },
  bookButton: {
    flex: 2,
  },
  pickupMarker: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 6,
    borderWidth: 3,
    borderColor: '#32CD32',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  stopMarker: {
    backgroundColor: '#667eea',
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  stopMarkerText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  destinationMarker: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 6,
    borderWidth: 3,
    borderColor: '#ff4444',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  carMarker: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 5,
    borderWidth: 2,
    borderColor: '#667eea',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
  },
  selectedCarMarker: {
    borderColor: '#4ade80',
    borderWidth: 3,
    shadowColor: '#4ade80',
  },
  driverModalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingBottom: 20,
    maxHeight: height * 0.8,
  },
  driverModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  driverModalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000',
  },
  driverModalSubtitle: {
    fontSize: 14,
    color: '#666',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
  },
  driverList: {
    flex: 1,
  },
  driverListContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  driverCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  driverCardSelected: {
    borderColor: '#4ade80',
    backgroundColor: '#f0fdf4',
  },
  driverCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  driverAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e0e7ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  driverInfo: {
    flex: 1,
  },
  driverNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  driverName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  topRatedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fef3c7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  topRatedText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#92400e',
  },
  driverDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  driverRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  driverRatingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  driverTrips: {
    fontSize: 11,
    color: '#999',
    marginLeft: 4,
  },
  driverVehicle: {
    fontSize: 12,
    color: '#666',
  },
  driverCardRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  driverDistance: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  driverDistanceText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#667eea',
  },
  driverEta: {
    fontSize: 12,
    color: '#666',
  },
  selectedBadge: {
    marginTop: 4,
  },
  driverModalFooter: {
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  startTripButton: {
    marginTop: 8,
  },
  emptyDrivers: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyDriversText: {
    fontSize: 16,
    color: '#999',
    marginTop: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalKeyboardView: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalOverlayTouchable: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  searchResultsContainer: {
    flexShrink: 1,
    minHeight: 0,
  },
  searchResultsList: {
    flexShrink: 1,
  },
  searchResultsContent: {
    flexGrow: 1,
    paddingBottom: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
  },
  modalSearchInput: {
    margin: 20,
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    fontSize: 16,
    color: '#000',
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    gap: 12,
  },
  searchResultText: {
    flex: 1,
  },
  searchResultName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  searchResultAddress: {
    fontSize: 14,
    color: '#666',
  },
  emptySearch: {
    padding: 40,
    alignItems: 'center',
  },
  emptySearchText: {
    fontSize: 16,
    color: '#999',
    marginTop: 12,
    fontWeight: '600',
  },
  emptySearchSubtext: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 4,
  },
});

export default HomeScreen;
