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
import { LinearGradient } from 'expo-linear-gradient';
import { useRide } from '../../contexts/RideContext';
import Card from '../../components/Card';
import Header from '../../components/Header';

const HistoryScreen = () => {
  const { rideHistory } = useRide();
  const [filter, setFilter] = useState('all'); // all, completed, cancelled
  const [sortBy, setSortBy] = useState('date'); // date, fare

  const driverRides = rideHistory.filter((ride) => ride.status === 'completed');

  const filteredAndSortedRides = useMemo(() => {
    let filtered = driverRides;
    
    // Sort
    filtered = [...filtered].sort((a, b) => {
      if (sortBy === 'fare') {
        return b.fare - a.fare;
      }
      // Sort by date (newest first)
      const dateA = new Date(a.completedAt || a.createdAt);
      const dateB = new Date(b.completedAt || b.createdAt);
      return dateB - dateA;
    });
    
    return filtered;
  }, [driverRides, sortBy]);

  const stats = useMemo(() => {
    const totalEarnings = driverRides.reduce((sum, ride) => sum + ride.fare, 0);
    const avgFare = driverRides.length > 0 ? totalEarnings / driverRides.length : 0;
    const thisMonth = driverRides.filter((ride) => {
      const rideDate = new Date(ride.completedAt || ride.createdAt);
      const now = new Date();
      return rideDate.getMonth() === now.getMonth() && rideDate.getFullYear() === now.getFullYear();
    });
    const thisMonthEarnings = thisMonth.reduce((sum, ride) => sum + ride.fare, 0);
    
    return {
      total: driverRides.length,
      totalEarnings,
      avgFare,
      thisMonth: thisMonth.length,
      thisMonthEarnings,
    };
  }, [driverRides]);

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

  const renderRideItem = ({ item }) => {
    const pickupAddress = item.pickupAddress || item.pickup?.address || 'Pickup Location';
    const destinationAddress = item.destinationAddress || item.destination?.address || 'Destination';
    const riderName = item.rider?.name || item.riderName || 'Rider';
    const riderRating = item.rider?.rating || item.riderRating || 0;
    
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
          <View style={styles.statusBadge}>
            <Ionicons name="checkmark-circle" size={16} color="#4ade80" />
            <Text style={styles.statusText}>Completed</Text>
          </View>
        </View>

        {item.rider && (
          <View style={styles.riderInfo}>
            <View style={styles.riderAvatar}>
              <Ionicons name="person" size={20} color="#667eea" />
            </View>
            <View style={styles.riderDetails}>
              <Text style={styles.riderName}>{riderName}</Text>
              {riderRating > 0 && (
                <View style={styles.ratingContainer}>
                  <Ionicons name="star" size={12} color="#FFD700" />
                  <Text style={styles.ratingText}>{riderRating.toFixed(1)}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        <View style={styles.rideFooter}>
          <View style={styles.fareContainer}>
            <Text style={styles.fareLabel}>Earnings</Text>
            <Text style={styles.fareText}>${item.fare?.toFixed(2) || '0.00'}</Text>
          </View>
          <View style={styles.timeContainer}>
            <Ionicons name="time-outline" size={14} color="#666" />
            <Text style={styles.dateText}>
              {formatDate(item.completedAt || item.createdAt)}
            </Text>
          </View>
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              // Navigate to receipt or details
            }}
          >
            <Ionicons name="receipt-outline" size={18} color="#667eea" />
            <Text style={styles.actionButtonText}>Details</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              // Navigate to help or report issue
            }}
          >
            <Ionicons name="help-circle-outline" size={18} color="#666" />
            <Text style={styles.actionButtonText}>Help</Text>
          </TouchableOpacity>
        </View>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Ride History" />

      {/* Stats Section */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsScroll}>
        <View style={styles.statsContainer}>
          <Card variant="elevated" style={styles.statCard}>
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.statGradient}
            >
              <Ionicons name="car" size={24} color="#fff" />
              <Text style={styles.statValue}>{stats.total}</Text>
              <Text style={styles.statLabel}>Total Rides</Text>
            </LinearGradient>
          </Card>

          <Card variant="elevated" style={styles.statCard}>
            <View style={styles.statContent}>
              <Ionicons name="cash" size={24} color="#4ade80" />
              <Text style={[styles.statValue, { color: '#000' }]}>${stats.totalEarnings.toFixed(2)}</Text>
              <Text style={[styles.statLabel, { color: '#666' }]}>Total Earnings</Text>
            </View>
          </Card>

          <Card variant="elevated" style={styles.statCard}>
            <View style={styles.statContent}>
              <Ionicons name="trending-up" size={24} color="#f59e0b" />
              <Text style={[styles.statValue, { color: '#000' }]}>${stats.avgFare.toFixed(2)}</Text>
              <Text style={[styles.statLabel, { color: '#666' }]}>Avg Fare</Text>
            </View>
          </Card>

          <Card variant="elevated" style={styles.statCard}>
            <View style={styles.statContent}>
              <Ionicons name="calendar" size={24} color="#667eea" />
              <Text style={[styles.statValue, { color: '#000' }]}>{stats.thisMonth}</Text>
              <Text style={[styles.statLabel, { color: '#666' }]}>This Month</Text>
            </View>
          </Card>

          <Card variant="elevated" style={styles.statCard}>
            <View style={styles.statContent}>
              <Ionicons name="wallet" size={24} color="#ef4444" />
              <Text style={[styles.statValue, { color: '#000' }]}>${stats.thisMonthEarnings.toFixed(2)}</Text>
              <Text style={[styles.statLabel, { color: '#666' }]}>Month Earnings</Text>
            </View>
          </Card>
        </View>
      </ScrollView>

      {/* Sort Button */}
      <View style={styles.filtersContainer}>
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
            Sort: {sortBy === 'date' ? 'Date' : 'Earnings'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Ride List */}
      {filteredAndSortedRides.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="time-outline" size={80} color="#ccc" />
          <Text style={styles.emptyText}>No completed rides yet</Text>
          <Text style={styles.emptySubtext}>
            Your completed rides will appear here
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
    justifyContent: 'flex-end',
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
    padding: 24,
    minHeight: 280,
  },
  rideHeader: {
    marginBottom: 16,
    minHeight: 80,
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
    fontSize: 16,
    color: '#000',
    fontWeight: '600',
    lineHeight: 22,
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
    backgroundColor: '#f0fdf4',
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4ade80',
  },
  riderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 18,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 18,
    minHeight: 80,
  },
  riderAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e0e7ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  riderDetails: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  riderName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
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
  rideFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingTop: 18,
    paddingBottom: 4,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    minHeight: 80,
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
    fontSize: 26,
    fontWeight: '800',
    color: '#4ade80',
    marginTop: 2,
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
    marginTop: 18,
    paddingTop: 18,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: 10,
    minHeight: 70,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    gap: 6,
    minHeight: 48,
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
