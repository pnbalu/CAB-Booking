import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRide } from '../../contexts/RideContext';
import { useLocation } from '../../contexts/LocationContext';
import { useNavigation } from '@react-navigation/native';
import Button from '../../components/Button';
import Card from '../../components/Card';

const { width } = Dimensions.get('window');

const RideStatusScreen = () => {
  const navigation = useNavigation();
  const { activeRide, updateRideStatus, cancelRide } = useRide();
  const { location } = useLocation();
  const [driverLocation, setDriverLocation] = useState(null);

  useEffect(() => {
    if (!activeRide) return;

    const interval = setInterval(() => {
      if (
        activeRide.status === 'driver_assigned' ||
        activeRide.status === 'driver_arriving'
      ) {
        setDriverLocation({
          latitude: (location?.latitude || 0) + 0.005,
          longitude: (location?.longitude || 0) + 0.005,
        });
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [activeRide, location]);

  useEffect(() => {
    if (!activeRide) return;

    const timers = [];
    if (activeRide.status === 'searching') {
      const timer1 = setTimeout(() => {
        updateRideStatus(activeRide.id, 'driver_assigned');
      }, 3000);
      timers.push(timer1);
    }
    if (activeRide.status === 'driver_assigned') {
      const timer2 = setTimeout(() => {
        updateRideStatus(activeRide.id, 'driver_arriving');
      }, 5000);
      timers.push(timer2);
    }
    if (activeRide.status === 'driver_arriving') {
      const timer3 = setTimeout(() => {
        updateRideStatus(activeRide.id, 'in_progress');
      }, 10000);
      timers.push(timer3);
    }

    return () => timers.forEach((timer) => clearTimeout(timer));
  }, [activeRide?.status]);

  const handleCancel = () => {
    Alert.alert(
      'Cancel Ride',
      'Are you sure you want to cancel this ride?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: () => cancelRide(activeRide.id),
        },
      ]
    );
  };

  const getStatusConfig = () => {
    switch (activeRide?.status) {
      case 'searching':
        return { text: 'Searching for driver...', color: '#FFA500', icon: 'search' };
      case 'driver_assigned':
        return { text: 'Driver assigned', color: '#4169E1', icon: 'checkmark-circle' };
      case 'driver_arriving':
        return { text: 'Driver arriving', color: '#32CD32', icon: 'car' };
      case 'in_progress':
        return { text: 'Ride in progress', color: '#000', icon: 'navigate' };
      default:
        return { text: 'Unknown', color: '#666', icon: 'help-circle' };
    }
  };

  if (!activeRide) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text>No active ride</Text>
        </View>
      </SafeAreaView>
    );
  }

  const statusConfig = getStatusConfig();
  const mapRegion = {
    latitude: activeRide.pickup.latitude,
    longitude: activeRide.pickup.longitude,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Help Button */}
      <TouchableOpacity
        style={styles.helpButton}
        onPress={() => navigation.navigate('HelpSupport')}
        activeOpacity={0.7}
      >
        <View style={styles.helpButtonContent}>
          <Ionicons name="help-circle" size={24} color="#fff" />
        </View>
      </TouchableOpacity>

      <View style={styles.mapContainer}>
        <MapView style={styles.map} region={mapRegion}>
          <Marker coordinate={activeRide.pickup} title="Pickup" pinColor="green" />
          <Marker
            coordinate={activeRide.destination}
            title="Destination"
            pinColor="red"
          />
          {driverLocation && (
            <Marker coordinate={driverLocation} title="Driver">
              <View style={styles.carMarker}>
                <Ionicons name="car" size={32} color="#000" />
              </View>
            </Marker>
          )}
          {driverLocation && location && (
            <Polyline
              coordinates={[driverLocation, location]}
              strokeColor="#000"
              strokeWidth={3}
            />
          )}
        </MapView>
      </View>

      <View style={styles.bottomSheet}>
        <Card style={styles.statusCard}>
          <View style={styles.statusContainer}>
            <View
              style={[
                styles.statusIndicator,
                { backgroundColor: statusConfig.color },
              ]}
            />
            <Ionicons name={statusConfig.icon} size={24} color={statusConfig.color} />
            <Text style={styles.statusText}>{statusConfig.text}</Text>
          </View>
        </Card>

        {activeRide.driver && (
          <Card style={styles.driverCard}>
            <View style={styles.driverInfo}>
              <View style={styles.avatar}>
                <Ionicons name="person" size={40} color="#fff" />
              </View>
              <View style={styles.driverDetails}>
                <Text style={styles.driverName}>
                  {activeRide.driver.name || 'Driver Name'}
                </Text>
                <View style={styles.ratingContainer}>
                  <Ionicons name="star" size={16} color="#FFD700" />
                  <Text style={styles.driverRating}>
                    {activeRide.driver.rating || '4.8'}
                  </Text>
                </View>
              </View>
            </View>
          </Card>
        )}

        <Card style={styles.fareCard}>
          <View style={styles.fareRow}>
            <Text style={styles.fareLabel}>Estimated Fare</Text>
            <Text style={styles.fareValue}>${activeRide.fare}</Text>
          </View>
          <View style={styles.fareRow}>
            <Text style={styles.fareLabel}>Ride Type</Text>
            <Text style={styles.fareValue}>
              {activeRide.rideType.charAt(0).toUpperCase() +
                activeRide.rideType.slice(1)}
            </Text>
          </View>
        </Card>

        <Button
          title="Cancel Ride"
          onPress={handleCancel}
          variant="danger"
          style={styles.cancelButton}
        />
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
  },
  statusText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    flex: 1,
  },
  driverCard: {
    marginBottom: 16,
    padding: 20,
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  driverDetails: {
    flex: 1,
  },
  driverName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  driverRating: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  fareCard: {
    marginBottom: 16,
    padding: 20,
  },
  fareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  fareLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  fareValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  cancelButton: {
    marginTop: 8,
  },
  carMarker: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 6,
    borderWidth: 2,
    borderColor: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  helpButton: {
    position: 'absolute',
    top: 60,
    right: 16,
    zIndex: 1000,
    elevation: 10,
  },
  helpButtonContent: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
});

export default RideStatusScreen;

