import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useLocation } from '../../contexts/LocationContext';
import { useRide } from '../../contexts/RideContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import Button from '../../components/Button';
import Card from '../../components/Card';

const { width } = Dimensions.get('window');

const DashboardScreen = () => {
  const navigation = useNavigation();
  const { location } = useLocation();
  const { availableRides, acceptRide, addAvailableRide } = useRide();
  const { user } = useAuth();
  const [isOnline, setIsOnline] = useState(false);
  const [region, setRegion] = useState(null);

  useEffect(() => {
    if (location) {
      setRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  }, [location]);

  useEffect(() => {
    if (isOnline) {
      const interval = setInterval(() => {
        if (Math.random() > 0.7) {
          const mockRide = {
            id: Date.now().toString(),
            pickup: {
              latitude: (location?.latitude || 0) + (Math.random() - 0.5) * 0.01,
              longitude: (location?.longitude || 0) + (Math.random() - 0.5) * 0.01,
            },
            destination: {
              latitude: (location?.latitude || 0) + (Math.random() - 0.5) * 0.02,
              longitude: (location?.longitude || 0) + (Math.random() - 0.5) * 0.02,
            },
            fare: Math.round((Math.random() * 20 + 10) * 100) / 100,
            rideType: Math.random() > 0.5 ? 'standard' : 'premium',
            createdAt: new Date().toISOString(),
          };
          addAvailableRide(mockRide);
        }
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [isOnline, location]);

  const handleToggleOnline = () => {
    setIsOnline(!isOnline);
    if (!isOnline) {
      Alert.alert('Online', 'You are now online and ready to accept rides');
    } else {
      Alert.alert('Offline', 'You are now offline');
    }
  };

  const handleAcceptRide = (ride) => {
    const acceptedRide = acceptRide(ride.id);
    if (acceptedRide) {
      navigation.navigate('ActiveRide', { ride: acceptedRide });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mapContainer}>
        <MapView style={styles.map} region={region} showsUserLocation>
          {availableRides.map((ride) => (
            <Marker
              key={ride.id}
              coordinate={ride.pickup}
              title="Ride Request"
            >
              <View style={styles.rideRequestMarker}>
                <Ionicons name="location" size={24} color="#fff" />
              </View>
            </Marker>
          ))}
        </MapView>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.onlineButton}
          onPress={handleToggleOnline}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={isOnline ? ['#32CD32', '#28a745'] : ['#666', '#555']}
            style={styles.onlineButtonGradient}
          >
            <Ionicons
              name={isOnline ? 'radio-button-on' : 'radio-button-off'}
              size={24}
              color="#fff"
            />
            <Text style={styles.onlineButtonText}>
              {isOnline ? 'Go Offline' : 'Go Online'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {isOnline && (
          <View style={styles.statsContainer}>
            <Card style={styles.statCard}>
              <Text style={styles.statValue}>{availableRides.length}</Text>
              <Text style={styles.statLabel}>Available Rides</Text>
            </Card>
          </View>
        )}
      </View>

      {isOnline && availableRides.length > 0 && (
        <View style={styles.ridesContainer}>
          <Text style={styles.ridesTitle}>Available Rides</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {availableRides.map((ride) => (
              <Card key={ride.id} variant="elevated" style={styles.rideCard}>
                <View style={styles.rideCardHeader}>
                  <Ionicons name="location" size={20} color="#000" />
                  <Text style={styles.rideFare}>${ride.fare}</Text>
                </View>
                <Text style={styles.rideType}>
                  {ride.rideType.charAt(0).toUpperCase() + ride.rideType.slice(1)}
                </Text>
                <Button
                  title="Accept"
                  onPress={() => handleAcceptRide(ride)}
                  style={styles.acceptButton}
                />
              </Card>
            ))}
          </ScrollView>
        </View>
      )}

      {isOnline && availableRides.length === 0 && (
        <View style={styles.emptyState}>
          <Ionicons name="car-outline" size={60} color="#ccc" />
          <Text style={styles.emptyText}>Waiting for ride requests...</Text>
        </View>
      )}
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
  controls: {
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
  onlineButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  onlineButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    gap: 12,
  },
  onlineButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  statsContainer: {
    marginTop: 8,
  },
  statCard: {
    padding: 20,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: '800',
    color: '#000',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  ridesContainer: {
    backgroundColor: '#fff',
    padding: 16,
    maxHeight: 220,
  },
  ridesTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
    color: '#000',
    paddingHorizontal: 8,
  },
  rideCard: {
    width: 200,
    marginRight: 12,
    padding: 16,
  },
  rideCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  rideFare: {
    fontSize: 24,
    fontWeight: '800',
    color: '#000',
  },
  rideType: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    fontWeight: '500',
  },
  acceptButton: {
    marginTop: 4,
  },
  emptyState: {
    backgroundColor: '#fff',
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
    fontWeight: '500',
  },
  rideRequestMarker: {
    backgroundColor: '#FF6B35',
    borderRadius: 20,
    padding: 8,
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
});

export default DashboardScreen;

