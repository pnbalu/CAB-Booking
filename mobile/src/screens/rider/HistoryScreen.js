import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRide } from '../../contexts/RideContext';
import { useNavigation } from '@react-navigation/native';
import Card from '../../components/Card';
import Header from '../../components/Header';

const HistoryScreen = () => {
  const navigation = useNavigation();
  const { rideHistory } = useRide();
  const [filter, setFilter] = useState('all'); // all, completed, cancelled
  const [sortBy, setSortBy] = useState('date'); // date, fare

  const filteredAndSortedRides = useMemo(() => {
    let filtered = rideHistory;
    
    // Filter by status
    if (filter !== 'all') {
      filtered = filtered.filter((ride) => ride.status === filter);
    }
    
    // Sort
    filtered = [...filtered].sort((a, b) => {
      if (sortBy === 'fare') {
        return b.fare - a.fare;
      }
      // Sort by date (newest first)
      const dateA = new Date(a.completedAt || a.cancelledAt || a.createdAt);
      const dateB = new Date(b.completedAt || b.cancelledAt || b.createdAt);
      return dateB - dateA;
    });
    
    return filtered;
  }, [rideHistory, filter, sortBy]);


  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
      }) + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return '#4ade80';
      case 'cancelled':
        return '#ef4444';
      case 'in_progress':
        return '#f59e0b';
      default:
        return '#666';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return 'checkmark-circle';
      case 'cancelled':
        return 'close-circle';
      case 'in_progress':
        return 'time';
      default:
        return 'help-circle';
    }
  };

  const renderRideItem = ({ item }) => {
    const pickupAddress = item.pickupAddress || item.pickup?.address || 'Pickup Location';
    const destinationAddress = item.destinationAddress || item.destination?.address || 'Destination';
    const driverName = item.driver?.name || item.driverName || 'Driver';
    const driverRating = item.driver?.rating || item.driverRating || 0;
    const vehicleInfo = item.vehicle || item.vehicleInfo || 'Vehicle';
    
    return (
      <Card variant="elevated" style={styles.rideCard}>
        <View style={styles.rideHeader}>
          <View style={styles.rideInfo}>
            <View style={styles.locationContainer}>
              <View style={styles.locationRow}>
                <View style={[styles.locationDot, { backgroundColor: '#4ade80' }]} />
                <View style={styles.locationTextContainer}>
                  <Text style={styles.locationLabel}>From</Text>
                  <Text style={styles.locationText} numberOfLines={1}>{pickupAddress}</Text>
                </View>
              </View>
              <View style={styles.locationDivider} />
              <View style={styles.locationRow}>
                <View style={[styles.locationDot, { backgroundColor: '#667eea' }]} />
                <View style={styles.locationTextContainer}>
                  <Text style={styles.locationLabel}>To</Text>
                  <Text style={styles.locationText} numberOfLines={1}>{destinationAddress}</Text>
                </View>
              </View>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
            <Ionicons 
              name={getStatusIcon(item.status)} 
              size={16} 
              color={getStatusColor(item.status)} 
            />
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1).replace('_', ' ')}
            </Text>
          </View>
        </View>

        {item.status === 'completed' && item.driver && (
          <View style={styles.driverInfo}>
            <View style={styles.driverAvatar}>
              <Ionicons name="person" size={20} color="#667eea" />
            </View>
            <View style={styles.driverDetails}>
              <Text style={styles.driverName}>{driverName}</Text>
              <View style={styles.driverMeta}>
                {driverRating > 0 && (
                  <View style={styles.ratingContainer}>
                    <Ionicons name="star" size={12} color="#FFD700" />
                    <Text style={styles.ratingText}>{driverRating.toFixed(1)}</Text>
                  </View>
                )}
                {vehicleInfo && (
                  <Text style={styles.vehicleText}>• {vehicleInfo}</Text>
                )}
              </View>
            </View>
          </View>
        )}

        <View style={styles.rideFooter}>
          <View style={styles.fareContainer}>
            <Text style={styles.fareLabel}>Fare</Text>
            <Text style={styles.fareText}>${item.fare?.toFixed(2) || '0.00'}</Text>
          </View>
          <View style={styles.timeContainer}>
            <Ionicons name="time-outline" size={14} color="#666" />
            <Text style={styles.dateText}>
              {formatDate(item.completedAt || item.cancelledAt || item.createdAt)}
            </Text>
          </View>
        </View>

        {item.status === 'completed' && (
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('Receipt', { ride: item })}
            >
              <Ionicons name="receipt-outline" size={18} color="#667eea" />
              <Text style={styles.actionButtonText}>Receipt</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                // Navigate to rate ride or show rating
                navigation.navigate('Receipt', { ride: item });
              }}
            >
              <Ionicons name="star-outline" size={18} color="#f59e0b" />
              <Text style={styles.actionButtonText}>Rate</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                // Navigate to help or report issue
                navigation.navigate('HelpSupport');
              }}
            >
              <Ionicons name="help-circle-outline" size={18} color="#666" />
              <Text style={styles.actionButtonText}>Help</Text>
            </TouchableOpacity>
          </View>
        )}
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Ride History" />

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filterButtons}>
            <TouchableOpacity
              style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
              onPress={() => setFilter('all')}
            >
              <Text style={[styles.filterButtonText, filter === 'all' && styles.filterButtonTextActive]}>
                All
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, filter === 'completed' && styles.filterButtonActive]}
              onPress={() => setFilter('completed')}
            >
              <Text style={[styles.filterButtonText, filter === 'completed' && styles.filterButtonTextActive]}>
                Completed
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, filter === 'cancelled' && styles.filterButtonActive]}
              onPress={() => setFilter('cancelled')}
            >
              <Text style={[styles.filterButtonText, filter === 'cancelled' && styles.filterButtonTextActive]}>
                Cancelled
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <TouchableOpacity
          style={styles.sortButton}
          onPress={() => setSortBy(sortBy === 'date' ? 'fare' : 'date')}
        >
          <Ionicons 
            name={sortBy === 'date' ? 'calendar-outline' : 'cash-outline'} 
            size={18} 
            color="#667eea" 
          />
          <Text style={styles.sortButtonText}>
            Sort: {sortBy === 'date' ? 'Date' : 'Fare'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Ride List */}
      {filteredAndSortedRides.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="time-outline" size={80} color="#ccc" />
          <Text style={styles.emptyText}>
            {filter === 'all' ? 'No ride history yet' : `No ${filter} rides`}
          </Text>
          <Text style={styles.emptySubtext}>
            {filter === 'all' 
              ? 'Your completed and cancelled rides will appear here'
              : `You don't have any ${filter} rides yet`}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredAndSortedRides}
          renderItem={renderRideItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  statsScroll: {
    maxHeight: 160,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  statCard: {
    width: 120,
    padding: 0,
    overflow: 'hidden',
  },
  statGradient: {
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 130,
  },
  statContent: {
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 130,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#fff',
    opacity: 0.9,
    fontWeight: '600',
    textAlign: 'center',
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  filterButtonActive: {
    backgroundColor: '#667eea',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f4ff',
  },
  sortButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#667eea',
  },
  list: {
    padding: 16,
    paddingBottom: 32,
  },
  rideCard: {
    marginBottom: 16,
    padding: 16,
  },
  rideHeader: {
    marginBottom: 12,
  },
  rideInfo: {
    flex: 1,
  },
  locationContainer: {
    flex: 1,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  locationTextContainer: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 11,
    color: '#999',
    textTransform: 'uppercase',
    fontWeight: '600',
    marginBottom: 2,
  },
  locationText: {
    fontSize: 15,
    color: '#000',
    fontWeight: '600',
  },
  locationDivider: {
    width: 2,
    height: 16,
    backgroundColor: '#e0e0e0',
    marginLeft: 5,
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 12,
  },
  driverAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0e7ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  driverDetails: {
    flex: 1,
  },
  driverName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  driverMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  vehicleText: {
    fontSize: 12,
    color: '#666',
  },
  rideFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  fareContainer: {
    flex: 1,
  },
  fareLabel: {
    fontSize: 11,
    color: '#999',
    textTransform: 'uppercase',
    fontWeight: '600',
    marginBottom: 4,
  },
  fareText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#000',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  actionsContainer: {
    flexDirection: 'row',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    gap: 6,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#666',
    marginTop: 20,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 20,
  },
});

export default HistoryScreen;
