import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../components/Header';
import Card from '../../components/Card';

// Mock payout history data
const generateMockPayouts = () => {
  const payouts = [];
  const now = new Date();
  
  for (let i = 0; i < 12; i++) {
    const payoutDate = new Date(now);
    payoutDate.setDate(payoutDate.getDate() - (i * 7)); // Weekly payouts
    
    const amount = Math.random() * 2000 + 500; // Random amount between $500-$2500
    const statuses = ['completed', 'pending', 'processing'];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    payouts.push({
      id: `payout_${i + 1}`,
      date: payoutDate.toISOString(),
      amount: Math.round(amount * 100) / 100,
      status,
      method: i % 3 === 0 ? 'bank' : i % 3 === 1 ? 'paypal' : 'venmo',
      transactionId: `TXN${Date.now()}-${i}`,
      rides: Math.floor(Math.random() * 50) + 10,
      fees: Math.round(amount * 0.02 * 100) / 100, // 2% fee
      netAmount: Math.round((amount - amount * 0.02) * 100) / 100,
    });
  }
  
  return payouts.sort((a, b) => new Date(b.date) - new Date(a.date));
};

const PayoutHistoryScreen = ({ navigation }) => {
  const [payouts] = useState(generateMockPayouts());
  const [filterStatus, setFilterStatus] = useState('all'); // all, completed, pending, processing
  const [sortBy, setSortBy] = useState('date'); // date, amount

  const filteredAndSortedPayouts = useMemo(() => {
    let filtered = payouts;

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter((payout) => payout.status === filterStatus);
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      if (sortBy === 'amount') {
        return b.amount - a.amount;
      }
      // Sort by date (newest first)
      return new Date(b.date) - new Date(a.date);
    });

    return filtered;
  }, [payouts, filterStatus, sortBy]);

  const stats = useMemo(() => {
    const totalPayouts = payouts.reduce((sum, p) => sum + p.amount, 0);
    const completedPayouts = payouts.filter((p) => p.status === 'completed');
    const pendingPayouts = payouts.filter((p) => p.status === 'pending' || p.status === 'processing');
    const totalCompleted = completedPayouts.reduce((sum, p) => sum + p.amount, 0);
    const totalPending = pendingPayouts.reduce((sum, p) => sum + p.amount, 0);

    return {
      total: totalPayouts,
      completed: totalCompleted,
      pending: totalPending,
      count: payouts.length,
      completedCount: completedPayouts.length,
      pendingCount: pendingPayouts.length,
    };
  }, [payouts]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
      });
    }
  };

  const formatCurrency = (amount) => {
    return `$${amount.toFixed(2)}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return '#4ade80';
      case 'pending':
        return '#f59e0b';
      case 'processing':
        return '#667eea';
      default:
        return '#666';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return 'checkmark-circle';
      case 'pending':
        return 'time-outline';
      case 'processing':
        return 'sync-outline';
      default:
        return 'help-circle-outline';
    }
  };

  const getMethodIcon = (method) => {
    switch (method) {
      case 'bank':
        return 'business-outline';
      case 'paypal':
        return 'logo-paypal';
      case 'venmo':
        return 'wallet-outline';
      default:
        return 'card-outline';
    }
  };

  const renderPayoutItem = ({ item }) => {
    return (
      <Card variant="elevated" style={styles.payoutCard}>
        <View style={styles.payoutCardHeader}>
          <View style={styles.payoutCardLeft}>
            <View style={[styles.payoutStatusIcon, { backgroundColor: `${getStatusColor(item.status)}15` }]}>
              <Ionicons name={getStatusIcon(item.status)} size={24} color={getStatusColor(item.status)} />
            </View>
            <View style={styles.payoutCardInfo}>
              <View style={styles.payoutCardTop}>
                <Text style={styles.payoutAmount}>{formatCurrency(item.amount)}</Text>
                <View style={[styles.payoutStatusBadge, { backgroundColor: `${getStatusColor(item.status)}15` }]}>
                  <Ionicons name={getStatusIcon(item.status)} size={12} color={getStatusColor(item.status)} />
                  <Text style={[styles.payoutStatusText, { color: getStatusColor(item.status) }]}>
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </Text>
                </View>
              </View>
              <View style={styles.payoutCardMeta}>
                <View style={styles.payoutMetaItem}>
                  <Ionicons name="calendar-outline" size={14} color="#666" />
                  <Text style={styles.payoutMetaText}>{formatDate(item.date)}</Text>
                </View>
                <View style={styles.payoutMetaItem}>
                  <Ionicons name={getMethodIcon(item.method)} size={14} color="#666" />
                  <Text style={styles.payoutMetaText}>{item.method.toUpperCase()}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.payoutCardDetails}>
          <View style={styles.payoutDetailRow}>
            <Text style={styles.payoutDetailLabel}>Net Amount</Text>
            <Text style={styles.payoutDetailValue}>{formatCurrency(item.netAmount)}</Text>
          </View>
          <View style={styles.payoutDetailRow}>
            <Text style={styles.payoutDetailLabel}>Fees</Text>
            <Text style={styles.payoutDetailValue}>{formatCurrency(item.fees)}</Text>
          </View>
          <View style={styles.payoutDetailRow}>
            <Text style={styles.payoutDetailLabel}>Rides</Text>
            <Text style={styles.payoutDetailValue}>{item.rides}</Text>
          </View>
          <View style={styles.payoutDetailRow}>
            <Text style={styles.payoutDetailLabel}>Transaction ID</Text>
            <TouchableOpacity
              onPress={() => {
                // Copy to clipboard
              }}
              activeOpacity={0.7}
            >
              <View style={styles.transactionIdContainer}>
                <Text style={styles.transactionId}>{item.transactionId}</Text>
                <Ionicons name="copy-outline" size={14} color="#667eea" />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </Card>
    );
  };

  const statusFilters = [
    { key: 'all', label: 'All', icon: 'list-outline' },
    { key: 'completed', label: 'Completed', icon: 'checkmark-circle-outline' },
    { key: 'pending', label: 'Pending', icon: 'time-outline' },
    { key: 'processing', label: 'Processing', icon: 'sync-outline' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Payout History" />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Summary Stats */}
        <View style={styles.statsSection}>
          <Card variant="elevated" style={styles.statCard}>
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.statGradient}
            >
              <View style={styles.statHeader}>
                <Ionicons name="cash" size={24} color="#fff" />
                <Text style={styles.statLabel}>Total Paid</Text>
              </View>
              <Text style={styles.statValue}>{formatCurrency(stats.completed)}</Text>
              <Text style={styles.statSubtext}>{stats.completedCount} completed payouts</Text>
            </LinearGradient>
          </Card>

          <View style={styles.quickStats}>
            <Card variant="elevated" style={styles.quickStatCard}>
              <View style={styles.quickStatIconContainer}>
                <Ionicons name="checkmark-circle" size={20} color="#4ade80" />
              </View>
              <Text style={styles.quickStatValue}>{stats.completedCount}</Text>
              <Text style={styles.quickStatLabel}>Completed</Text>
            </Card>

            <Card variant="elevated" style={styles.quickStatCard}>
              <View style={styles.quickStatIconContainer}>
                <Ionicons name="time" size={20} color="#f59e0b" />
              </View>
              <Text style={styles.quickStatValue}>{stats.pendingCount}</Text>
              <Text style={styles.quickStatLabel}>Pending</Text>
            </Card>

            <Card variant="elevated" style={styles.quickStatCard}>
              <View style={styles.quickStatIconContainer}>
                <Ionicons name="wallet" size={20} color="#667eea" />
              </View>
              <Text style={styles.quickStatValue}>{formatCurrency(stats.pending)}</Text>
              <Text style={styles.quickStatLabel}>Pending Amount</Text>
            </Card>
          </View>
        </View>

        {/* Filters */}
        <View style={styles.filtersSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filterButtons}>
              {statusFilters.map((filter) => (
                <TouchableOpacity
                  key={filter.key}
                  style={[
                    styles.filterButton,
                    filterStatus === filter.key && styles.filterButtonActive,
                  ]}
                  onPress={() => setFilterStatus(filter.key)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={filter.icon}
                    size={18}
                    color={filterStatus === filter.key ? '#fff' : '#667eea'}
                  />
                  <Text
                    style={[
                      styles.filterButtonText,
                      filterStatus === filter.key && styles.filterButtonTextActive,
                    ]}
                  >
                    {filter.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <TouchableOpacity
            style={styles.sortButton}
            onPress={() => setSortBy(sortBy === 'date' ? 'amount' : 'date')}
            activeOpacity={0.7}
          >
            <Ionicons
              name={sortBy === 'date' ? 'calendar-outline' : 'cash-outline'}
              size={18}
              color="#667eea"
            />
            <Text style={styles.sortButtonText}>
              Sort: {sortBy === 'date' ? 'Date' : 'Amount'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Payout List */}
        <View style={styles.listSection}>
          <View style={styles.listHeader}>
            <Text style={styles.listTitle}>Payout History</Text>
            <Text style={styles.listSubtitle}>
              {filteredAndSortedPayouts.length} {filteredAndSortedPayouts.length === 1 ? 'payout' : 'payouts'}
            </Text>
          </View>

          {filteredAndSortedPayouts.length === 0 ? (
            <Card variant="elevated" style={styles.emptyCard}>
              <Ionicons name="receipt-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>No payouts found</Text>
              <Text style={styles.emptySubtext}>
                Your payout history will appear here
              </Text>
            </Card>
          ) : (
            <FlatList
              data={filteredAndSortedPayouts}
              renderItem={renderPayoutItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              contentContainerStyle={styles.list}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  statsSection: {
    marginBottom: 20,
  },
  statCard: {
    marginBottom: 16,
    overflow: 'hidden',
  },
  statGradient: {
    padding: 20,
    borderRadius: 16,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  statLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  statValue: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
  },
  statSubtext: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  quickStats: {
    flexDirection: 'row',
    gap: 12,
  },
  quickStatCard: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
  },
  quickStatIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickStatValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  quickStatLabel: {
    fontSize: 11,
    color: '#666',
    fontWeight: '500',
    textAlign: 'center',
  },
  filtersSection: {
    marginBottom: 20,
    gap: 12,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    gap: 6,
  },
  filterButtonActive: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#667eea',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
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
  listSection: {
    marginBottom: 20,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  listSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  list: {
    gap: 12,
  },
  payoutCard: {
    padding: 16,
    marginBottom: 0,
  },
  payoutCardHeader: {
    marginBottom: 12,
  },
  payoutCardLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  payoutStatusIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  payoutCardInfo: {
    flex: 1,
  },
  payoutCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  payoutAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
  },
  payoutStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  payoutStatusText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  payoutCardMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  payoutMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  payoutMetaText: {
    fontSize: 12,
    color: '#666',
  },
  payoutCardDetails: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 8,
  },
  payoutDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  payoutDetailLabel: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  payoutDetailValue: {
    fontSize: 14,
    color: '#000',
    fontWeight: '600',
  },
  transactionIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  transactionId: {
    fontSize: 12,
    color: '#667eea',
    fontWeight: '500',
    fontFamily: 'monospace',
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
  },
});

export default PayoutHistoryScreen;

