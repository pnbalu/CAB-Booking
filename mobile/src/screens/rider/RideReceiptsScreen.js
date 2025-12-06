import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../components/Header';
import Card from '../../components/Card';
import { t } from '../../i18n';
import { useRide } from '../../contexts/RideContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RideReceiptsScreen = ({ navigation }) => {
  const [receipts, setReceipts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all'); // all, week, month, year

  useEffect(() => {
    loadReceipts();
  }, []);

  const loadReceipts = async () => {
    try {
      const stored = await AsyncStorage.getItem('ride_receipts');
      if (stored) {
        const receiptsData = JSON.parse(stored);
        setReceipts(receiptsData.sort((a, b) => new Date(b.date) - new Date(a.date)));
      } else {
        // Generate sample receipts for demo
        const sampleReceipts = generateSampleReceipts();
        setReceipts(sampleReceipts);
        await AsyncStorage.setItem('ride_receipts', JSON.stringify(sampleReceipts));
      }
    } catch (error) {
      console.error('Error loading receipts:', error);
    }
  };

  const generateSampleReceipts = () => {
    const now = new Date();
    return [
      {
        id: '1',
        rideId: 'RIDE001',
        date: new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString(),
        pickup: '123 Main St, Downtown',
        destination: '456 Park Ave, Uptown',
        driver: 'John Smith',
        vehicle: 'Toyota Camry',
        distance: '5.2 miles',
        duration: '18 min',
        fare: 12.50,
        paymentMethod: 'Credit Card',
        status: 'completed',
      },
      {
        id: '2',
        rideId: 'RIDE002',
        date: new Date(now - 5 * 24 * 60 * 60 * 1000).toISOString(),
        pickup: '789 Oak St, Midtown',
        destination: '321 Elm St, Suburb',
        driver: 'Sarah Johnson',
        vehicle: 'Honda Accord',
        distance: '8.7 miles',
        duration: '25 min',
        fare: 18.75,
        paymentMethod: 'Google Pay',
        status: 'completed',
      },
      {
        id: '3',
        rideId: 'RIDE003',
        date: new Date(now - 10 * 24 * 60 * 60 * 1000).toISOString(),
        pickup: '555 Broadway, City Center',
        destination: '999 Market St, Downtown',
        driver: 'Mike Chen',
        vehicle: 'Tesla Model 3',
        distance: '3.1 miles',
        duration: '12 min',
        fare: 9.25,
        paymentMethod: 'Debit Card',
        status: 'completed',
      },
    ];
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadReceipts();
    setRefreshing(false);
  };

  const filteredReceipts = receipts.filter((receipt) => {
    if (filter === 'all') return true;
    const receiptDate = new Date(receipt.date);
    const now = new Date();
    const daysDiff = (now - receiptDate) / (1000 * 60 * 60 * 24);
    
    if (filter === 'week') return daysDiff <= 7;
    if (filter === 'month') return daysDiff <= 30;
    if (filter === 'year') return daysDiff <= 365;
    return true;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleReceiptPress = (receipt) => {
    // Convert receipt to ride format for ReceiptScreen
    const ride = {
      id: receipt.rideId,
      pickup: receipt.pickup,
      destination: receipt.destination,
      driver: {
        name: receipt.driver,
        vehicle: receipt.vehicle,
      },
      fare: receipt.fare,
      distance: receipt.distance,
      duration: receipt.duration,
      paymentMethod: receipt.paymentMethod,
      date: receipt.date,
      status: receipt.status,
    };
    navigation.navigate('Receipt', { ride });
  };

  const renderReceipt = ({ item }) => (
    <TouchableOpacity
      onPress={() => handleReceiptPress(item)}
      activeOpacity={0.7}
    >
      <Card variant="elevated" style={styles.receiptCard}>
        <View style={styles.receiptHeader}>
          <View style={styles.receiptHeaderLeft}>
            <View style={styles.receiptIcon}>
              <Ionicons name="receipt" size={24} color="#667eea" />
            </View>
            <View>
              <Text style={styles.receiptId}>{item.rideId}</Text>
              <Text style={styles.receiptDate}>{formatDate(item.date)}</Text>
            </View>
          </View>
          <View style={styles.receiptAmount}>
            <Text style={styles.amountText}>${item.fare.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.receiptDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="location" size={16} color="#666" />
            <Text style={styles.detailText} numberOfLines={1}>
              {item.pickup}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={16} color="#666" />
            <Text style={styles.detailText} numberOfLines={1}>
              {item.destination}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="car" size={16} color="#666" />
            <Text style={styles.detailText}>
              {item.driver} • {item.vehicle}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="card" size={16} color="#666" />
            <Text style={styles.detailText}>{item.paymentMethod}</Text>
          </View>
        </View>

        <View style={styles.receiptFooter}>
          <View style={styles.footerInfo}>
            <Text style={styles.footerText}>
              {item.distance} • {item.duration}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </View>
      </Card>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="receipt-outline" size={64} color="#ccc" />
      <Text style={styles.emptyTitle}>{t('settings.receipts.noReceipts')}</Text>
      <Text style={styles.emptyText}>{t('settings.receipts.noReceiptsText')}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header title={t('settings.receipts.title')} onBackPress={() => navigation.goBack()} />

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
          onPress={() => setFilter('all')}
        >
          <Text
            style={[styles.filterText, filter === 'all' && styles.filterTextActive]}
          >
            {t('settings.receipts.all')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'week' && styles.filterButtonActive]}
          onPress={() => setFilter('week')}
        >
          <Text
            style={[styles.filterText, filter === 'week' && styles.filterTextActive]}
          >
            {t('settings.receipts.week')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'month' && styles.filterButtonActive]}
          onPress={() => setFilter('month')}
        >
          <Text
            style={[styles.filterText, filter === 'month' && styles.filterTextActive]}
          >
            {t('settings.receipts.month')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'year' && styles.filterButtonActive]}
          onPress={() => setFilter('year')}
        >
          <Text
            style={[styles.filterText, filter === 'year' && styles.filterTextActive]}
          >
            {t('settings.receipts.year')}
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredReceipts}
        renderItem={renderReceipt}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={renderEmptyState}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
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
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  filterTextActive: {
    color: '#fff',
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  receiptCard: {
    padding: 16,
    marginBottom: 12,
  },
  receiptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  receiptHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  receiptIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f4ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  receiptId: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  receiptDate: {
    fontSize: 12,
    color: '#666',
  },
  receiptAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#667eea',
  },
  receiptDetails: {
    gap: 8,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  receiptFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  footerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  footerText: {
    fontSize: 12,
    color: '#999',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default RideReceiptsScreen;

