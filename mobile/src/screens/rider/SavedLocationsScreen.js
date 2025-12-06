import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSavedLocations } from '../../contexts/LocationsContext';
import Card from '../../components/Card';
import Header from '../../components/Header';

const SavedLocationsScreen = () => {
  const navigation = useNavigation();
  const { savedLocations, deleteLocation } = useSavedLocations();

  const locationTypes = [
    {
      type: 'home',
      label: 'Home',
      icon: 'home',
      color: '#667eea',
      location: savedLocations.home,
    },
    {
      type: 'work',
      label: 'Work',
      icon: 'briefcase',
      color: '#f093fb',
      location: savedLocations.work,
    },
    {
      type: 'airport',
      label: 'Airport',
      icon: 'airplane',
      color: '#4facfe',
      location: savedLocations.airport,
    },
  ];

  const handleEdit = (type) => {
    navigation.navigate('SaveLocation', { type });
  };

  const handleDelete = (type, index = null) => {
    Alert.alert(
      'Delete Location',
      `Are you sure you want to delete this ${type === 'custom' ? 'location' : type}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteLocation(type, index);
              Alert.alert('Success', 'Location deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete location');
            }
          },
        },
      ]
    );
  };

  const handleAddCustom = () => {
    navigation.navigate('SaveLocation', { type: 'custom' });
  };

  const getLocationAddress = (location) => {
    if (!location) return 'Not set';
    // In a real app, you'd reverse geocode the coordinates
    return `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Saved Locations" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {locationTypes.map((item) => (
          <Card key={item.type} variant="elevated" style={styles.locationCard}>
            <View style={styles.locationHeader}>
              <View style={[styles.iconContainer, { backgroundColor: `${item.color}15` }]}>
                <Ionicons name={item.icon} size={24} color={item.color} />
              </View>
              <View style={styles.locationInfo}>
                <Text style={styles.locationLabel}>{item.label}</Text>
                <Text style={styles.locationAddress}>
                  {getLocationAddress(item.location)}
                </Text>
              </View>
              <View style={styles.actionButtons}>
                {item.location ? (
                  <>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleEdit(item.type)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="create-outline" size={20} color="#667eea" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleDelete(item.type)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="trash-outline" size={20} color="#ef4444" />
                    </TouchableOpacity>
                  </>
                ) : (
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => handleEdit(item.type)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="add-circle-outline" size={24} color="#667eea" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </Card>
        ))}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Custom Locations</Text>
          <TouchableOpacity
            style={styles.addCustomButton}
            onPress={handleAddCustom}
            activeOpacity={0.7}
          >
            <Ionicons name="add" size={20} color="#667eea" />
            <Text style={styles.addCustomText}>Add</Text>
          </TouchableOpacity>
        </View>

        {savedLocations.custom && savedLocations.custom.length > 0 ? (
          savedLocations.custom.map((location, index) => (
            <Card key={index} variant="elevated" style={styles.locationCard}>
              <View style={styles.locationHeader}>
                <View style={[styles.iconContainer, { backgroundColor: '#4facfe15' }]}>
                  <Ionicons name="location" size={24} color="#4facfe" />
                </View>
                <View style={styles.locationInfo}>
                  <Text style={styles.locationLabel}>{location.name || 'Custom Location'}</Text>
                  <Text style={styles.locationAddress}>
                    {getLocationAddress(location)}
                  </Text>
                </View>
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleDelete('custom', index)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="trash-outline" size={20} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </View>
            </Card>
          ))
        ) : (
          <Card variant="outlined" style={styles.emptyCard}>
            <Ionicons name="location-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No custom locations saved</Text>
            <Text style={styles.emptySubtext}>Tap "Add" to create a custom location</Text>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 20,
  },
  locationCard: {
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  locationInfo: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  locationAddress: {
    fontSize: 14,
    color: '#666',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 18,
    backgroundColor: '#f5f5f5',
  },
  addButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  addCustomButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  addCustomText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#667eea',
  },
  emptyCard: {
    alignItems: 'center',
    padding: 32,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999',
    marginTop: 16,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#ccc',
    textAlign: 'center',
  },
});

export default SavedLocationsScreen;

