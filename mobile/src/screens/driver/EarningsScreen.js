import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRide } from '../../contexts/RideContext';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';

const PAYOUT_METHODS = [
  { id: 'bank', label: 'Bank Transfer', icon: 'business-outline', color: '#667eea' },
  { id: 'paypal', label: 'PayPal', icon: 'logo-paypal', color: '#0070ba' },
  { id: 'venmo', label: 'Venmo', icon: 'wallet-outline', color: '#3d95ce' },
  { id: 'cashapp', label: 'Cash App', icon: 'cash-outline', color: '#00d632' },
  { id: 'zelle', label: 'Zelle', icon: 'phone-portrait-outline', color: '#6d1ed4' },
];

const EarningsScreen = ({ navigation }) => {
  const { rideHistory } = useRide();
  const [filterPeriod, setFilterPeriod] = useState('all'); // today, week, month, year, all
  const [selectedPayoutMethod, setSelectedPayoutMethod] = useState(null);
  const [showPaymentMethodModal, setShowPaymentMethodModal] = useState(false);
  const [showAddMethodModal, setShowAddMethodModal] = useState(false);
  const [selectedMethodType, setSelectedMethodType] = useState(null);
  
  // Form states for different payment methods
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankRoutingNumber, setBankRoutingNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [paypalEmail, setPaypalEmail] = useState('');
  const [venmoUsername, setVenmoUsername] = useState('');
  const [cashAppTag, setCashAppTag] = useState('');
  const [zelleEmail, setZelleEmail] = useState('');
  const [zellePhone, setZellePhone] = useState('');

  const driverRides = rideHistory.filter((ride) => ride.status === 'completed');

  const filteredRides = useMemo(() => {
    const now = new Date();
    let filtered = driverRides;

    switch (filterPeriod) {
      case 'today':
        filtered = driverRides.filter((ride) => {
          const rideDate = new Date(ride.completedAt || ride.createdAt);
          return rideDate.toDateString() === now.toDateString();
        });
        break;
      case 'week':
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        filtered = driverRides.filter((ride) => {
          const rideDate = new Date(ride.completedAt || ride.createdAt);
          return rideDate >= weekAgo;
        });
        break;
      case 'month':
        filtered = driverRides.filter((ride) => {
          const rideDate = new Date(ride.completedAt || ride.createdAt);
          return rideDate.getMonth() === now.getMonth() && rideDate.getFullYear() === now.getFullYear();
        });
        break;
      case 'year':
        filtered = driverRides.filter((ride) => {
          const rideDate = new Date(ride.completedAt || ride.createdAt);
          return rideDate.getFullYear() === now.getFullYear();
        });
        break;
      default:
        filtered = driverRides;
    }

    return filtered.sort((a, b) => {
      const dateA = new Date(a.completedAt || a.createdAt);
      const dateB = new Date(b.completedAt || b.createdAt);
      return dateB - dateA;
    });
  }, [driverRides, filterPeriod]);

  // Calculate monthly earnings for the last 12 months
  const monthlyEarnings = useMemo(() => {
    const now = new Date();
    const months = [];
    
    // Generate last 12 months
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);
      
      const monthRides = driverRides.filter((ride) => {
        const rideDate = new Date(ride.completedAt || ride.createdAt);
        return rideDate >= monthStart && rideDate <= monthEnd;
      });
      
      const earnings = monthRides.reduce((sum, ride) => sum + ride.fare, 0);
      const rideCount = monthRides.length;
      
      months.push({
        month: date.getMonth(),
        year: date.getFullYear(),
        monthName: date.toLocaleDateString('en-US', { month: 'long' }),
        monthShort: date.toLocaleDateString('en-US', { month: 'short' }),
        earnings,
        rideCount,
        isCurrentMonth: i === 0,
      });
    }
    
    return months;
  }, [driverRides]);

  const stats = useMemo(() => {
    const now = new Date();
    
    const today = driverRides.filter((ride) => {
      const rideDate = new Date(ride.completedAt || ride.createdAt);
      return rideDate.toDateString() === now.toDateString();
    });
    
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const thisWeek = driverRides.filter((ride) => {
      const rideDate = new Date(ride.completedAt || ride.createdAt);
      return rideDate >= weekAgo;
    });
    
    const thisMonth = driverRides.filter((ride) => {
      const rideDate = new Date(ride.completedAt || ride.createdAt);
      return rideDate.getMonth() === now.getMonth() && rideDate.getFullYear() === now.getFullYear();
    });
    
    const thisYear = driverRides.filter((ride) => {
      const rideDate = new Date(ride.completedAt || ride.createdAt);
      return rideDate.getFullYear() === now.getFullYear();
    });

    const totalEarnings = driverRides.reduce((sum, ride) => sum + ride.fare, 0);
    const todayEarnings = today.reduce((sum, ride) => sum + ride.fare, 0);
    const weekEarnings = thisWeek.reduce((sum, ride) => sum + ride.fare, 0);
    const monthEarnings = thisMonth.reduce((sum, ride) => sum + ride.fare, 0);
    const yearEarnings = thisYear.reduce((sum, ride) => sum + ride.fare, 0);
    
    const filteredEarnings = filteredRides.reduce((sum, ride) => sum + ride.fare, 0);
    const avgEarning = filteredRides.length > 0 ? filteredEarnings / filteredRides.length : 0;
    
    return {
      total: totalEarnings,
      today: todayEarnings,
      week: weekEarnings,
      month: monthEarnings,
      year: yearEarnings,
      filtered: filteredEarnings,
      count: filteredRides.length,
      avg: avgEarning,
    };
  }, [driverRides, filteredRides]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const today = new Date();
    
    if (date.toDateString() === today.toDateString()) {
      return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
    }) + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatCurrency = (amount) => {
    return `$${amount.toFixed(2)}`;
  };

  const loadPayoutMethod = async () => {
    try {
      const saved = await AsyncStorage.getItem('driver_payout_method');
      if (saved) {
        setSelectedPayoutMethod(JSON.parse(saved));
      } else {
        // Default to bank transfer
        const defaultMethod = {
          type: 'bank',
          label: 'Bank Transfer',
          details: 'Not configured',
        };
        setSelectedPayoutMethod(defaultMethod);
      }
    } catch (error) {
      console.error('Error loading payout method:', error);
    }
  };

  const savePayoutMethod = async (method) => {
    try {
      await AsyncStorage.setItem('driver_payout_method', JSON.stringify(method));
      setSelectedPayoutMethod(method);
      setShowAddMethodModal(false);
      setShowPaymentMethodModal(false);
      // Reset form
      resetForm();
    } catch (error) {
      console.error('Error saving payout method:', error);
    }
  };

  const resetForm = () => {
    setBankAccountNumber('');
    setBankRoutingNumber('');
    setBankName('');
    setPaypalEmail('');
    setVenmoUsername('');
    setCashAppTag('');
    setZelleEmail('');
    setZellePhone('');
    setSelectedMethodType(null);
  };

  const handleSelectMethodType = (methodId) => {
    setSelectedMethodType(methodId);
  };

  const handleSavePaymentMethod = () => {
    let method = null;

    switch (selectedMethodType) {
      case 'bank':
        if (!bankAccountNumber || !bankRoutingNumber || !bankName) {
          return;
        }
        method = {
          type: 'bank',
          label: 'Bank Transfer',
          details: `${bankName} ••••${bankAccountNumber.slice(-4)}`,
          accountNumber: bankAccountNumber,
          routingNumber: bankRoutingNumber,
          bankName: bankName,
        };
        break;
      case 'paypal':
        if (!paypalEmail) {
          return;
        }
        method = {
          type: 'paypal',
          label: 'PayPal',
          details: paypalEmail,
          email: paypalEmail,
        };
        break;
      case 'venmo':
        if (!venmoUsername) {
          return;
        }
        method = {
          type: 'venmo',
          label: 'Venmo',
          details: `@${venmoUsername}`,
          username: venmoUsername,
        };
        break;
      case 'cashapp':
        if (!cashAppTag) {
          return;
        }
        method = {
          type: 'cashapp',
          label: 'Cash App',
          details: `$${cashAppTag}`,
          tag: cashAppTag,
        };
        break;
      case 'zelle':
        if (!zelleEmail && !zellePhone) {
          return;
        }
        method = {
          type: 'zelle',
          label: 'Zelle',
          details: zelleEmail || zellePhone,
          email: zelleEmail,
          phone: zellePhone,
        };
        break;
      default:
        return;
    }

    if (method) {
      savePayoutMethod(method);
    }
  };

  const getMethodIcon = (type) => {
    const method = PAYOUT_METHODS.find(m => m.id === type);
    return method ? method.icon : 'wallet-outline';
  };

  const getMethodColor = (type) => {
    const method = PAYOUT_METHODS.find(m => m.id === type);
    return method ? method.color : '#667eea';
  };

  // Load saved payout method on mount
  React.useEffect(() => {
    loadPayoutMethod();
  }, []);

  // Load form data when editing existing method
  React.useEffect(() => {
    if (showAddMethodModal && selectedPayoutMethod?.type === selectedMethodType) {
      // Load existing data into form
      if (selectedPayoutMethod.type === 'bank') {
        setBankName(selectedPayoutMethod.bankName || '');
        setBankAccountNumber(selectedPayoutMethod.accountNumber || '');
        setBankRoutingNumber(selectedPayoutMethod.routingNumber || '');
      } else if (selectedPayoutMethod.type === 'paypal') {
        setPaypalEmail(selectedPayoutMethod.email || '');
      } else if (selectedPayoutMethod.type === 'venmo') {
        setVenmoUsername(selectedPayoutMethod.username || '');
      } else if (selectedPayoutMethod.type === 'cashapp') {
        setCashAppTag(selectedPayoutMethod.tag || '');
      } else if (selectedPayoutMethod.type === 'zelle') {
        setZelleEmail(selectedPayoutMethod.email || '');
        setZellePhone(selectedPayoutMethod.phone || '');
      }
    } else if (!showAddMethodModal) {
      // Reset form when modal closes
      resetForm();
    }
  }, [showAddMethodModal, selectedMethodType]);

  const renderEarningItem = ({ item }) => {
    const pickupAddress = item.pickupAddress || item.pickup?.address || 'Pickup Location';
    const destinationAddress = item.destinationAddress || item.destination?.address || 'Destination';
    const riderName = item.rider?.name || item.riderName || 'Rider';
    
    return (
      <Card variant="elevated" style={styles.earningCard}>
        <View style={styles.earningHeader}>
          <View style={styles.earningInfo}>
            <View style={styles.locationRow}>
              <Ionicons name="location" size={14} color="#4ade80" style={styles.locationIcon} />
              <Text style={styles.locationText} numberOfLines={1}>{pickupAddress}</Text>
            </View>
            <View style={styles.locationRow}>
              <Ionicons name="location" size={14} color="#667eea" style={styles.locationIcon} />
              <Text style={styles.locationText} numberOfLines={1}>{destinationAddress}</Text>
            </View>
          </View>
          <View style={styles.earningAmountContainer}>
            <Text style={styles.earningAmount}>{formatCurrency(item.fare)}</Text>
          </View>
        </View>
        
        <View style={styles.earningFooter}>
          <View style={styles.riderInfo}>
            <Ionicons name="person-outline" size={14} color="#666" />
            <Text style={styles.riderName}>{riderName}</Text>
          </View>
          <View style={styles.dateInfo}>
            <Ionicons name="time-outline" size={14} color="#666" />
            <Text style={styles.dateText}>{formatDate(item.completedAt || item.createdAt)}</Text>
          </View>
        </View>
      </Card>
    );
  };

  const periodFilters = [
    { key: 'today', label: 'Today', icon: 'today-outline' },
    { key: 'week', label: 'This Week', icon: 'calendar-outline' },
    { key: 'month', label: 'This Month', icon: 'calendar' },
    { key: 'year', label: 'This Year', icon: 'calendar-number-outline' },
    { key: 'all', label: 'All Time', icon: 'time-outline' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Earnings" />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Monthly Earnings - Scrollable */}
        <View style={styles.monthlySection}>
          <View style={styles.monthlyHeader}>
            <Text style={styles.monthlyTitle}>Monthly Earnings</Text>
            <Text style={styles.monthlySubtitle}>Swipe to view months</Text>
          </View>
          <FlatList
            data={monthlyEarnings}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item, index) => `${item.year}-${item.month}-${index}`}
            contentContainerStyle={styles.monthlyList}
            renderItem={({ item }) => (
              <Card variant="elevated" style={styles.monthlyCard}>
                <LinearGradient
                  colors={item.isCurrentMonth ? ['#667eea', '#764ba2'] : ['#f8f9fa', '#e9ecef']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.monthlyGradient}
                >
                  <View style={styles.monthlyCardHeader}>
                    <Ionicons 
                      name="calendar" 
                      size={24} 
                      color={item.isCurrentMonth ? '#fff' : '#667eea'} 
                    />
                    {item.isCurrentMonth && (
                      <View style={styles.currentBadge}>
                        <Text style={styles.currentBadgeText}>Current</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[
                    styles.monthlyCardMonth,
                    { color: item.isCurrentMonth ? '#fff' : '#000' }
                  ]}>
                    {item.monthName}
                  </Text>
                  <Text style={[
                    styles.monthlyCardYear,
                    { color: item.isCurrentMonth ? 'rgba(255,255,255,0.8)' : '#666' }
                  ]}>
                    {item.year}
                  </Text>
                  <Text style={[
                    styles.monthlyCardAmount,
                    { color: item.isCurrentMonth ? '#fff' : '#000' }
                  ]}>
                    {formatCurrency(item.earnings)}
                  </Text>
                  <View style={styles.monthlyCardFooter}>
                    <Ionicons 
                      name="car-outline" 
                      size={14} 
                      color={item.isCurrentMonth ? 'rgba(255,255,255,0.8)' : '#666'} 
                    />
                    <Text style={[
                      styles.monthlyCardRides,
                      { color: item.isCurrentMonth ? 'rgba(255,255,255,0.8)' : '#666' }
                    ]}>
                      {item.rideCount} {item.rideCount === 1 ? 'ride' : 'rides'}
                    </Text>
                  </View>
                </LinearGradient>
              </Card>
            )}
          />
        </View>

        {/* Quick Stats */}
        <View style={styles.summarySection}>
          <View style={styles.quickStats}>
            <Card variant="elevated" style={styles.quickStatCard}>
              <View style={styles.quickStatIconContainer}>
                <Ionicons name="sunny-outline" size={24} color="#f59e0b" />
              </View>
              <Text style={styles.quickStatValue}>{formatCurrency(stats.today)}</Text>
              <Text style={styles.quickStatLabel}>Today</Text>
            </Card>

            <Card variant="elevated" style={styles.quickStatCard}>
              <View style={styles.quickStatIconContainer}>
                <Ionicons name="calendar-outline" size={24} color="#4facfe" />
              </View>
              <Text style={styles.quickStatValue}>{formatCurrency(stats.week)}</Text>
              <Text style={styles.quickStatLabel}>This Week</Text>
            </Card>

            <Card variant="elevated" style={styles.quickStatCard}>
              <View style={styles.quickStatIconContainer}>
                <Ionicons name="calendar" size={24} color="#43e97b" />
              </View>
              <Text style={styles.quickStatValue}>{formatCurrency(stats.month)}</Text>
              <Text style={styles.quickStatLabel}>This Month</Text>
            </Card>
          </View>
        </View>

        {/* Period Filter */}
        <View style={styles.filterSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filterButtons}>
              {periodFilters.map((filter) => (
                <TouchableOpacity
                  key={filter.key}
                  style={[
                    styles.filterButton,
                    filterPeriod === filter.key && styles.filterButtonActive,
                  ]}
                  onPress={() => setFilterPeriod(filter.key)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={filter.icon}
                    size={18}
                    color={filterPeriod === filter.key ? '#fff' : '#667eea'}
                  />
                  <Text
                    style={[
                      styles.filterButtonText,
                      filterPeriod === filter.key && styles.filterButtonTextActive,
                    ]}
                  >
                    {filter.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Filtered Stats */}
        <View style={styles.filteredStatsSection}>
          <Card variant="elevated" style={styles.filteredStatsCard}>
            <View style={styles.filteredStatsRow}>
              <View style={styles.filteredStatItem}>
                <Text style={styles.filteredStatValue}>{formatCurrency(stats.filtered)}</Text>
                <Text style={styles.filteredStatLabel}>Total Earnings</Text>
              </View>
              <View style={styles.filteredStatDivider} />
              <View style={styles.filteredStatItem}>
                <Text style={styles.filteredStatValue}>{stats.count}</Text>
                <Text style={styles.filteredStatLabel}>Rides</Text>
              </View>
              <View style={styles.filteredStatDivider} />
              <View style={styles.filteredStatItem}>
                <Text style={styles.filteredStatValue}>{formatCurrency(stats.avg)}</Text>
                <Text style={styles.filteredStatLabel}>Avg per Ride</Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Earnings List */}
        <View style={styles.listSection}>
          <View style={styles.listHeader}>
            <Text style={styles.listTitle}>Earnings History</Text>
            <Text style={styles.listSubtitle}>
              {filteredRides.length} {filteredRides.length === 1 ? 'ride' : 'rides'}
            </Text>
          </View>

          {filteredRides.length === 0 ? (
            <Card variant="elevated" style={styles.emptyCard}>
              <Ionicons name="cash-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>No earnings found</Text>
              <Text style={styles.emptySubtext}>
                Complete rides to start earning!
              </Text>
            </Card>
          ) : (
            <FlatList
              data={filteredRides}
              renderItem={renderEarningItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              contentContainerStyle={styles.list}
            />
          )}
        </View>

        {/* Payout Info */}
        <Card variant="elevated" style={styles.payoutCard}>
          <View style={styles.payoutHeader}>
            <View style={styles.payoutHeaderLeft}>
              <View style={styles.payoutIconContainer}>
                <Ionicons name="wallet" size={24} color="#667eea" />
              </View>
              <View>
                <Text style={styles.payoutTitle}>Payout Information</Text>
                <Text style={styles.payoutSubtitle}>Manage your earnings</Text>
              </View>
            </View>
          </View>

          {/* Available Balance - Highlighted */}
          <Card variant="elevated" style={styles.balanceCard}>
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.balanceGradient}
            >
              <View style={styles.balanceHeader}>
                <View style={styles.balanceIconContainer}>
                  <Ionicons name="cash" size={28} color="#fff" />
                </View>
                <View style={styles.balanceInfo}>
                  <Text style={styles.balanceLabel}>Available Balance</Text>
                  <Text style={styles.balanceAmount}>{formatCurrency(stats.total)}</Text>
                </View>
              </View>
              <View style={styles.balanceFooter}>
                <Ionicons name="shield-checkmark" size={14} color="rgba(255,255,255,0.8)" />
                <Text style={styles.balanceSecurity}>Secured & Protected</Text>
              </View>
            </LinearGradient>
          </Card>

          {/* Payout Details */}
          <View style={styles.payoutDetails}>
            <View style={styles.payoutDetailItem}>
              <View style={styles.payoutDetailLeft}>
                <View style={[styles.payoutDetailIcon, { backgroundColor: '#f0f4ff' }]}>
                  <Ionicons name="calendar-outline" size={20} color="#667eea" />
                </View>
                <View style={styles.payoutDetailContent}>
                  <Text style={styles.payoutDetailLabel}>Next Payout Date</Text>
                  <Text style={styles.payoutDetailValue}>Monday, Dec 23, 2024</Text>
                  <Text style={styles.payoutDetailSubtext}>Weekly payout schedule</Text>
                </View>
              </View>
            </View>

            <View style={styles.payoutDetailItem}>
              <View style={styles.payoutDetailLeft}>
                <View style={[styles.payoutDetailIcon, { backgroundColor: '#f0fdf4' }]}>
                  <Ionicons name="checkmark-circle-outline" size={20} color="#4ade80" />
                </View>
                <View style={styles.payoutDetailContent}>
                  <Text style={styles.payoutDetailLabel}>Last Payout</Text>
                  <Text style={styles.payoutDetailValue}>Monday, Dec 16, 2024</Text>
                  <Text style={styles.payoutDetailSubtext}>{formatCurrency(stats.month)} this month</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={styles.payoutDetailItem}
              onPress={() => setShowPaymentMethodModal(true)}
              activeOpacity={0.7}
            >
              <View style={styles.payoutDetailLeft}>
                <View style={[
                  styles.payoutDetailIcon,
                  { backgroundColor: selectedPayoutMethod ? `${getMethodColor(selectedPayoutMethod.type)}15` : '#f0f0f0' }
                ]}>
                  <Ionicons
                    name={selectedPayoutMethod ? getMethodIcon(selectedPayoutMethod.type) : 'wallet-outline'}
                    size={20}
                    color={selectedPayoutMethod ? getMethodColor(selectedPayoutMethod.type) : '#666'}
                  />
                </View>
                <View style={styles.payoutDetailContent}>
                  <Text style={styles.payoutDetailLabel}>Payment Method</Text>
                  {selectedPayoutMethod ? (
                    <>
                      <Text style={styles.payoutDetailValue}>{selectedPayoutMethod.label}</Text>
                      <Text style={styles.payoutDetailSubtext}>{selectedPayoutMethod.details}</Text>
                    </>
                  ) : (
                    <Text style={styles.payoutDetailValueNotSet}>Not configured</Text>
                  )}
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>

            <View style={styles.payoutDetailItem}>
              <View style={styles.payoutDetailLeft}>
                <View style={[styles.payoutDetailIcon, { backgroundColor: '#fff7ed' }]}>
                  <Ionicons name="information-circle-outline" size={20} color="#f59e0b" />
                </View>
                <View style={styles.payoutDetailContent}>
                  <Text style={styles.payoutDetailLabel}>Payout Schedule</Text>
                  <Text style={styles.payoutDetailValue}>Weekly (Every Monday)</Text>
                  <Text style={styles.payoutDetailSubtext}>Minimum $50 to request early payout</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.payoutActions}>
            <TouchableOpacity
              style={[styles.payoutButton, !selectedPayoutMethod && styles.payoutButtonDisabled]}
              activeOpacity={0.7}
              disabled={!selectedPayoutMethod}
            >
              <Ionicons name="send-outline" size={20} color="#fff" />
              <Text style={styles.payoutButtonText}>Request Payout</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.payoutButtonSecondary}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('PayoutHistory')}
            >
              <Ionicons name="time-outline" size={20} color="#667eea" />
              <Text style={styles.payoutButtonSecondaryText}>Payout History</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Payment Method Selection Modal */}
        <Modal
          visible={showPaymentMethodModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowPaymentMethodModal(false)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalOverlay}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Payout Method</Text>
                <TouchableOpacity
                  onPress={() => setShowPaymentMethodModal(false)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close" size={24} color="#000" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                {PAYOUT_METHODS.map((method) => (
                  <TouchableOpacity
                    key={method.id}
                    style={[
                      styles.methodOption,
                      selectedPayoutMethod?.type === method.id && styles.methodOptionSelected,
                    ]}
                    onPress={() => {
                      if (selectedPayoutMethod?.type === method.id) {
                        setShowAddMethodModal(true);
                        setSelectedMethodType(method.id);
                      } else {
                        setShowAddMethodModal(true);
                        setSelectedMethodType(method.id);
                      }
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.methodIconContainer, { backgroundColor: `${method.color}15` }]}>
                      <Ionicons name={method.icon} size={24} color={method.color} />
                    </View>
                    <View style={styles.methodInfo}>
                      <Text style={styles.methodLabel}>{method.label}</Text>
                      {selectedPayoutMethod?.type === method.id && selectedPayoutMethod.details && (
                        <Text style={styles.methodDetails}>{selectedPayoutMethod.details}</Text>
                      )}
                    </View>
                    {selectedPayoutMethod?.type === method.id ? (
                      <Ionicons name="checkmark-circle" size={24} color={method.color} />
                    ) : (
                      <Ionicons name="chevron-forward" size={20} color="#ccc" />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </Modal>

        {/* Add/Edit Payment Method Modal */}
        <Modal
          visible={showAddMethodModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => {
            setShowAddMethodModal(false);
            resetForm();
          }}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalOverlay}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {selectedPayoutMethod?.type === selectedMethodType ? 'Edit' : 'Add'} Payout Method
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setShowAddMethodModal(false);
                    resetForm();
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close" size={24} color="#000" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                {selectedMethodType === 'bank' && (
                  <>
                    <Input
                      label="Bank Name"
                      value={bankName}
                      onChangeText={setBankName}
                      placeholder="Enter bank name"
                      icon="business-outline"
                    />
                    <View style={styles.inputSpacer} />
                    <Input
                      label="Account Number"
                      value={bankAccountNumber}
                      onChangeText={setBankAccountNumber}
                      placeholder="Enter account number"
                      keyboardType="numeric"
                      icon="card-outline"
                    />
                    <View style={styles.inputSpacer} />
                    <Input
                      label="Routing Number"
                      value={bankRoutingNumber}
                      onChangeText={setBankRoutingNumber}
                      placeholder="Enter routing number"
                      keyboardType="numeric"
                      icon="keypad-outline"
                    />
                  </>
                )}

                {selectedMethodType === 'paypal' && (
                  <Input
                    label="PayPal Email"
                    value={paypalEmail}
                    onChangeText={setPaypalEmail}
                    placeholder="Enter PayPal email"
                    keyboardType="email-address"
                    icon="mail-outline"
                    autoCapitalize="none"
                  />
                )}

                {selectedMethodType === 'venmo' && (
                  <Input
                    label="Venmo Username"
                    value={venmoUsername}
                    onChangeText={setVenmoUsername}
                    placeholder="Enter Venmo username"
                    icon="person-outline"
                    autoCapitalize="none"
                  />
                )}

                {selectedMethodType === 'cashapp' && (
                  <Input
                    label="Cash App Tag"
                    value={cashAppTag}
                    onChangeText={setCashAppTag}
                    placeholder="Enter Cash App tag"
                    icon="cash-outline"
                    autoCapitalize="none"
                  />
                )}

                {selectedMethodType === 'zelle' && (
                  <>
                    <Input
                      label="Email or Phone"
                      value={zelleEmail || zellePhone}
                      onChangeText={(text) => {
                        if (text.includes('@')) {
                          setZelleEmail(text);
                          setZellePhone('');
                        } else {
                          setZellePhone(text);
                          setZelleEmail('');
                        }
                      }}
                      placeholder="Enter email or phone"
                      keyboardType="email-address"
                      icon="phone-portrait-outline"
                      autoCapitalize="none"
                    />
                  </>
                )}

                <View style={styles.modalButtonContainer}>
                  <Button
                    title="Save Payment Method"
                    onPress={handleSavePaymentMethod}
                    style={styles.saveMethodButton}
                  />
                </View>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </Modal>
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
  monthlySection: {
    marginBottom: 20,
  },
  monthlyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  monthlyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  monthlySubtitle: {
    fontSize: 12,
    color: '#666',
  },
  monthlyList: {
    paddingRight: 16,
  },
  monthlyCard: {
    width: Dimensions.get('window').width - 80,
    marginRight: 12,
    overflow: 'hidden',
  },
  monthlyGradient: {
    padding: 20,
    borderRadius: 16,
    minHeight: 180,
  },
  monthlyCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  currentBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  currentBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  monthlyCardMonth: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  monthlyCardYear: {
    fontSize: 14,
    marginBottom: 16,
  },
  monthlyCardAmount: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 12,
  },
  monthlyCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  monthlyCardRides: {
    fontSize: 12,
    fontWeight: '500',
  },
  summarySection: {
    marginBottom: 20,
  },
  summaryCard: {
    marginBottom: 16,
    overflow: 'hidden',
  },
  summaryGradient: {
    padding: 24,
    borderRadius: 16,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryTitleContainer: {
    marginLeft: 12,
    flex: 1,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  summarySubtitle: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.8,
    marginTop: 2,
  },
  summaryAmount: {
    fontSize: 36,
    fontWeight: '800',
    color: '#fff',
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
    width: 48,
    height: 48,
    borderRadius: 24,
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
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  filterSection: {
    marginBottom: 20,
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
  filteredStatsSection: {
    marginBottom: 20,
  },
  filteredStatsCard: {
    padding: 20,
  },
  filteredStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  filteredStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  filteredStatValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  filteredStatLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  filteredStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#e0e0e0',
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
  earningCard: {
    padding: 16,
    marginBottom: 0,
  },
  earningHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  earningInfo: {
    flex: 1,
    marginRight: 12,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  locationIcon: {
    marginRight: 8,
  },
  locationText: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
    flex: 1,
  },
  earningAmountContainer: {
    alignItems: 'flex-end',
  },
  earningAmount: {
    fontSize: 22,
    fontWeight: '700',
    color: '#4ade80',
  },
  earningFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  riderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  riderName: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  dateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    fontSize: 12,
    color: '#666',
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
  payoutCard: {
    padding: 20,
    borderRadius: 16,
  },
  payoutHeader: {
    marginBottom: 20,
  },
  payoutHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  payoutIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f4ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  payoutTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 2,
  },
  payoutSubtitle: {
    fontSize: 13,
    color: '#666',
  },
  balanceCard: {
    marginBottom: 20,
    overflow: 'hidden',
  },
  balanceGradient: {
    padding: 20,
    borderRadius: 16,
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 16,
  },
  balanceIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  balanceInfo: {
    flex: 1,
  },
  balanceLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
  },
  balanceFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  balanceSecurity: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  payoutDetails: {
    marginBottom: 20,
  },
  payoutDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  payoutDetailLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  payoutDetailIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  payoutDetailContent: {
    flex: 1,
  },
  payoutDetailLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  payoutDetailValue: {
    fontSize: 16,
    color: '#000',
    fontWeight: '600',
    marginBottom: 2,
  },
  payoutDetailValueNotSet: {
    fontSize: 16,
    color: '#999',
    fontStyle: 'italic',
  },
  payoutDetailSubtext: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  payoutActions: {
    gap: 12,
  },
  payoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#667eea',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    elevation: 2,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  payoutButtonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.6,
    elevation: 0,
    shadowOpacity: 0,
  },
  payoutButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  payoutButtonSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f4ff',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#e0e7ff',
  },
  payoutButtonSecondaryText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#667eea',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
  },
  modalBody: {
    padding: 20,
  },
  methodOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    marginBottom: 12,
  },
  methodOptionSelected: {
    backgroundColor: '#f0f4ff',
    borderWidth: 2,
    borderColor: '#667eea',
  },
  methodIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  methodInfo: {
    flex: 1,
  },
  methodLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  methodDetails: {
    fontSize: 13,
    color: '#666',
  },
  inputSpacer: {
    height: 16,
  },
  modalButtonContainer: {
    marginTop: 24,
    marginBottom: 16,
  },
  saveMethodButton: {
    borderRadius: 12,
  },
});

export default EarningsScreen;

