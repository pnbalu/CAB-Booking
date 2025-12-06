import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useRide } from '../../contexts/RideContext';
import { useLocation } from '../../contexts/LocationContext';
import { useNavigation } from '@react-navigation/native';
import { useToast } from '../../contexts/ToastContext';
import Button from '../../components/Button';
import Card from '../../components/Card';

const ActiveRideScreen = ({ route }) => {
  const navigation = useNavigation();
  const { completeRide } = useRide();
  const { location } = useLocation();
  const { showConfirm, showSuccess, showError } = useToast();
  const ride = route?.params?.ride;
  const [rideStatus, setRideStatus] = useState('picked_up');
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [routeDistance, setRouteDistance] = useState(null);
  const [routeDuration, setRouteDuration] = useState(null);
  const [loadingRoute, setLoadingRoute] = useState(false);

  useEffect(() => {
    if (!ride) return;

    const timer1 = setTimeout(() => {
      setRideStatus('in_progress');
    }, 5000);

    return () => clearTimeout(timer1);
  }, [ride]);


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

  // Fetch route from OpenStreetMap using OSRM
  const calculateRoute = async () => {
    if (!ride || !ride.pickup || !ride.destination) {
      return;
    }

    setLoadingRoute(true);
    try {
      // Determine origin based on ride status
      // If ride is in progress, use current location; otherwise use pickup
      const origin = (rideStatus === 'in_progress' && location) 
        ? location 
        : ride.pickup;

      // OSRM Route API - Get route following actual streets/roads
      // Format: longitude,latitude (OSRM uses lon,lat order)
      const coordinates = `${origin.longitude},${origin.latitude};${ride.destination.longitude},${ride.destination.latitude}`;
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

        // Get distance and duration from route
        const distanceMeters = route.distance; // in meters
        const durationSeconds = route.duration; // in seconds

        // Convert distance to km and miles
        const distanceKm = (distanceMeters / 1000).toFixed(2);
        const distanceMiles = (distanceMeters / 1609.34).toFixed(2);
        setRouteDistance({ 
          km: parseFloat(distanceKm), 
          miles: parseFloat(distanceMiles) 
        });
        
        // Convert duration to minutes
        const durationMinutes = Math.round(durationSeconds / 60);
        setRouteDuration(durationMinutes);
        
        console.log(`Route loaded: ${routeCoords.length} coordinates, ${distanceKm} km, ${durationMinutes} min`);
      } else {
        // Fallback to straight line if OSRM fails
        console.warn('OSRM route error, using straight line');
        const routeCoords = [origin, ride.destination];
        setRouteCoordinates(routeCoords);
        
        // Calculate straight-line distance as fallback
        const distance = calculateDistance(
          origin.latitude,
          origin.longitude,
          ride.destination.latitude,
          ride.destination.longitude
        );
        setRouteDistance({ 
          km: parseFloat(distance.toFixed(2)), 
          miles: parseFloat((distance * 0.621371).toFixed(2)) 
        });
        
        // Estimate duration
        const estimatedMinutes = Math.round((distance / 60) * 60);
        setRouteDuration(estimatedMinutes);
      }
    } catch (error) {
      console.error('Error fetching route from OSRM:', error);
      // Fallback to straight line on error
      const origin = (rideStatus === 'in_progress' && location) ? location : ride.pickup;
      const routeCoords = [origin, ride.destination];
      setRouteCoordinates(routeCoords);
      
      const distance = calculateDistance(
        origin.latitude,
        origin.longitude,
        ride.destination.latitude,
        ride.destination.longitude
      );
      setRouteDistance({ 
        km: parseFloat(distance.toFixed(2)), 
        miles: parseFloat((distance * 0.621371).toFixed(2)) 
      });
      
      const estimatedMinutes = Math.round((distance / 60) * 60);
      setRouteDuration(estimatedMinutes);
    } finally {
      setLoadingRoute(false);
    }
  };

  // Calculate route when ride data is available
  useEffect(() => {
    if (ride && ride.pickup && ride.destination) {
      calculateRoute();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ride, rideStatus, location]);

  const handleCompleteRide = () => {
    showConfirm(
      'Complete Ride',
      'Have you completed this ride?',
      () => {
        if (ride) {
          completeRide(ride.id);
          showSuccess('Ride completed successfully!');
          navigation.goBack();
        }
      },
      null,
      {
        confirmText: 'Complete',
        cancelText: 'Cancel',
        type: 'info',
      }
    );
  };

  const handleUpdateStatus = (status) => {
    setRideStatus(status);
    showSuccess(`Ride status updated: ${status.replace('_', ' ')}`);
    // Recalculate route when status changes (origin might change)
    if (ride && ride.pickup && ride.destination) {
      calculateRoute();
    }
  };

  if (!ride) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text>No active ride</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Calculate map region to fit all markers
  const calculateMapRegion = () => {
    const coordinates = [
      ride.pickup,
      ride.destination,
      ...(location ? [location] : []),
      ...routeCoordinates,
    ].filter(Boolean);

    if (coordinates.length === 0) {
      return {
        latitude: ride.pickup.latitude,
        longitude: ride.pickup.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
    }

    const latitudes = coordinates.map(coord => coord.latitude);
    const longitudes = coordinates.map(coord => coord.longitude);

    const minLat = Math.min(...latitudes);
    const maxLat = Math.max(...latitudes);
    const minLng = Math.min(...longitudes);
    const maxLng = Math.max(...longitudes);

    const latDelta = (maxLat - minLat) * 1.5;
    const lngDelta = (maxLng - minLng) * 1.5;

    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: Math.max(latDelta, 0.01),
      longitudeDelta: Math.max(lngDelta, 0.01),
    };
  };

  const mapRegion = calculateMapRegion();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mapContainer}>
        <MapView 
          style={styles.map} 
          region={mapRegion}
          showsUserLocation
          showsMyLocationButton={false}
          onMapReady={() => {
            // Fit map to show all markers and route
            if (routeCoordinates.length > 0) {
              const coordinates = [
                ride.pickup,
                ride.destination,
                ...(location ? [location] : []),
              ].filter(Boolean);
              
              if (coordinates.length > 0) {
                // MapView will auto-fit based on region
              }
            }
          }}
        >
          <Marker coordinate={ride.pickup} title="Pickup" pinColor="#4ade80">
            <View style={styles.pickupMarker}>
              <Ionicons name="location" size={24} color="#4ade80" />
            </View>
          </Marker>
          <Marker coordinate={ride.destination} title="Destination" pinColor="#ef4444">
            <View style={styles.destinationMarker}>
              <Ionicons name="location" size={24} color="#ef4444" />
            </View>
          </Marker>
          {location && (
            <Marker coordinate={location} title="Your Location">
              <View style={styles.carMarker}>
                <Ionicons name="car" size={32} color="#667eea" />
              </View>
            </Marker>
          )}
          {/* Route Polyline - Shows straight-line route */}
          {routeCoordinates.length > 0 && (
            <Polyline
              coordinates={routeCoordinates}
              strokeColor="#667eea"
              strokeWidth={5}
              lineCap="round"
              lineJoin="round"
              geodesic={true}
            />
          )}
        </MapView>
        {loadingRoute && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#667eea" />
            <Text style={styles.loadingText}>Loading route...</Text>
          </View>
        )}
      </View>

      <View style={styles.bottomSheet}>
        <Card style={styles.statusCard}>
          <View style={styles.statusContainer}>
            <View style={styles.statusIndicator} />
            <Text style={styles.statusText}>
              {rideStatus === 'picked_up'
                ? 'Passenger Picked Up'
                : rideStatus === 'in_progress'
                ? 'Ride in Progress'
                : 'Arrived at Destination'}
            </Text>
          </View>
        </Card>

        <Card style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Ionicons name="location" size={20} color="#000" />
            <View style={styles.locationDetails}>
              <Text style={styles.locationLabel}>Pickup:</Text>
              <Text style={styles.locationText}>Selected Location</Text>
            </View>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="location" size={20} color="#ff4444" />
            <View style={styles.locationDetails}>
              <Text style={styles.locationLabel}>Destination:</Text>
              <Text style={styles.locationText}>Selected Location</Text>
            </View>
          </View>
        </Card>

        {/* Route Information Card */}
        {routeDistance && (
          <Card style={styles.routeCard}>
            <View style={styles.routeInfoRow}>
              <View style={styles.routeInfoItem}>
                <Ionicons name="navigate" size={20} color="#667eea" />
                <View style={styles.routeInfoDetails}>
                  <Text style={styles.routeInfoLabel}>Distance</Text>
                  <Text style={styles.routeInfoValue}>
                    {routeDistance.km} km ({routeDistance.miles} mi)
                  </Text>
                </View>
              </View>
              {routeDuration && (
                <View style={styles.routeInfoItem}>
                  <Ionicons name="time" size={20} color="#f59e0b" />
                  <View style={styles.routeInfoDetails}>
                    <Text style={styles.routeInfoLabel}>Estimated Time</Text>
                    <Text style={styles.routeInfoValue}>{routeDuration} min</Text>
                  </View>
                </View>
              )}
            </View>
          </Card>
        )}

        <Card style={styles.fareCard}>
          <View style={styles.fareRow}>
            <Text style={styles.fareLabel}>Fare:</Text>
            <Text style={styles.fareValue}>${ride.fare}</Text>
          </View>
        </Card>

        <View style={styles.buttonRow}>
          {rideStatus === 'picked_up' && (
            <Button
              title="Start Ride"
              onPress={() => handleUpdateStatus('in_progress')}
              variant="secondary"
              style={styles.secondaryButton}
            />
          )}
          {rideStatus === 'in_progress' && (
            <Button
              title="Arrived"
              onPress={() => handleUpdateStatus('arrived')}
              variant="secondary"
              style={styles.secondaryButton}
            />
          )}
          <Button
            title="Complete Ride"
            onPress={handleCompleteRide}
            style={styles.primaryButton}
          />
        </View>
      </View>
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
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  statusCard: {
    marginBottom: 16,
    padding: 20,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#32CD32',
  },
  statusText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    flex: 1,
  },
  detailsCard: {
    marginBottom: 16,
    padding: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  locationDetails: {
    marginLeft: 12,
    flex: 1,
  },
  locationLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    fontWeight: '500',
  },
  locationText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  fareCard: {
    marginBottom: 16,
    padding: 20,
  },
  fareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fareLabel: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  fareValue: {
    fontSize: 32,
    fontWeight: '800',
    color: '#000',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryButton: {
    flex: 2,
  },
  secondaryButton: {
    flex: 1,
  },
  carMarker: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 6,
    borderWidth: 2,
    borderColor: '#667eea',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  pickupMarker: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 4,
    borderWidth: 2,
    borderColor: '#4ade80',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  destinationMarker: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 4,
    borderWidth: 2,
    borderColor: '#ef4444',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: '600',
  },
  routeCard: {
    marginBottom: 16,
    padding: 20,
    backgroundColor: '#f0f4ff',
  },
  routeInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 16,
  },
  routeInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  routeInfoDetails: {
    flex: 1,
  },
  routeInfoLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    marginBottom: 2,
  },
  routeInfoValue: {
    fontSize: 16,
    color: '#000',
    fontWeight: '700',
  },
});

export default ActiveRideScreen;

