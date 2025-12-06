import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { paymentMethodsApi } from '../../services/paymentMethodsApi';
import { settingsApi } from '../../services/settingsApi';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';

const getSimplePaymentColor = (type) => {
  switch (type) {
    case 'cash':
      return '#4ade80';
    case 'googlepay':
      return '#4285f4';
    case 'internetbanking':
      return '#f093fb';
    default:
      return '#667eea';
  }
};

const PaymentMethodsScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [defaultMethod, setDefaultMethod] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPaymentType, setSelectedPaymentType] = useState(null);
  const [editingCard, setEditingCard] = useState(null);
  const [enabledPaymentMethods, setEnabledPaymentMethods] = useState(['card', 'cash', 'googlepay', 'internetbanking']);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const cardScrollViewRef = useRef(null);
  const screenWidth = Dimensions.get('window').width;
  const cardItemWidth = screenWidth - 32; // Account for padding
  
  // Form states
  const [cardNumber, setCardNumber] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('');
  const [expiryYear, setExpiryYear] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardType, setCardType] = useState('credit'); // credit or debit
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [googlePayPhone, setGooglePayPhone] = useState('');

  useEffect(() => {
    if (user?.id) {
      initializePaymentMethods();
    }
  }, [user]);

  const initializePaymentMethods = async () => {
    try {
      // Load settings first
      const enabled = await settingsApi.getEnabledPaymentMethods();
      setEnabledPaymentMethods(enabled);
      
      // Then load payment methods
      await loadPaymentMethods(enabled);
    } catch (error) {
      console.error('Error initializing payment methods:', error);
    }
  };

  const addDefaultCard = async () => {
    try {
      const defaultCard = {
        type: 'card',
        cardType: 'credit',
        brand: 'Visa',
        last4: '0000',
        cardholderName: user?.name || 'User',
        expiryMonth: '12',
        expiryYear: '2025',
        isDefault: true,
      };
      await paymentMethodsApi.addPaymentMethod(user.id, defaultCard);
      await loadPaymentMethods();
    } catch (error) {
      console.error('Error adding default card:', error);
    }
  };

  const loadPaymentMethods = async (enabledMethods = enabledPaymentMethods) => {
    try {
      setLoading(true);
      const methods = await paymentMethodsApi.getUserPaymentMethods(user.id);
      
      // If user has no payment methods and card is enabled, add a default card
      if (methods.length === 0 && enabledMethods.includes('card')) {
        await addDefaultCard();
        return; // addDefaultCard will call loadPaymentMethods again
      }
      
      setPaymentMethods(methods);
      const defaultMethodObj = methods.find((m) => m.isDefault);
      if (defaultMethodObj) {
        setDefaultMethod(defaultMethodObj.id);
      }
    } catch (error) {
      console.error('Error loading payment methods:', error);
      Alert.alert('Error', 'Failed to load payment methods');
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await paymentMethodsApi.setDefaultPaymentMethod(user.id, id);
      await loadPaymentMethods();
      Alert.alert('Success', 'Default payment method updated');
    } catch (error) {
      Alert.alert('Error', 'Failed to update default payment method');
    }
  };

  const handleDelete = (id) => {
    if (paymentMethods.length === 1) {
      Alert.alert('Error', 'You must have at least one payment method');
      return;
    }

    Alert.alert(
      'Delete Payment Method',
      'Are you sure you want to delete this payment method?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await paymentMethodsApi.deletePaymentMethod(user.id, id);
              await loadPaymentMethods();
              Alert.alert('Success', 'Payment method deleted');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete payment method');
            }
          },
        },
      ]
    );
  };

  const handleAddPayment = () => {
    setShowAddModal(true);
  };

  const handleEditCard = (card) => {
    setEditingCard(card);
    setCardType(card.cardType || 'credit');
    setCardholderName(card.cardholderName || '');
    setExpiryMonth(card.expiryMonth || '');
    setExpiryYear(card.expiryYear || '');
    setCardNumber(''); // Don't show full card number for security
    setCvv(''); // Don't show CVV for security
    setShowEditModal(true);
  };

  const handleUpdateCard = async () => {
    if (!cardholderName || !expiryMonth || !expiryYear) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const updates = {
        cardType: cardType,
        cardholderName: cardholderName,
        expiryMonth: expiryMonth,
        expiryYear: expiryYear,
        name: `${cardType === 'credit' ? 'Credit' : 'Debit'} Card •••• ${editingCard.last4}`,
      };

      // If card number is provided and changed, update it
      if (cardNumber && cardNumber.replace(/\D/g, '').length >= 13) {
        const cleaned = cardNumber.replace(/\D/g, '');
        const last4 = cleaned.slice(-4);
        const brand = getCardBrand(cleaned);
        updates.last4 = last4;
        updates.brand = brand;
      }

      await paymentMethodsApi.updatePaymentMethod(user.id, editingCard.id, updates);
      await loadPaymentMethods();
      setShowEditModal(false);
      setEditingCard(null);
      resetForm();
      Alert.alert('Success', 'Card updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update card');
    }
  };

  const resetForm = () => {
    setCardNumber('');
    setCardholderName('');
    setExpiryMonth('');
    setExpiryYear('');
    setCvv('');
    setCardType('credit');
    setBankName('');
    setAccountNumber('');
    setIfscCode('');
    setGooglePayPhone('');
  };

  const handleSelectPaymentType = (type) => {
    setSelectedPaymentType(type);
    resetForm();
  };

  const handleSavePayment = async () => {
    let newPaymentMethod = {
      id: Date.now().toString(),
      isDefault: paymentMethods.length === 0,
    };

    switch (selectedPaymentType) {
      case 'cash':
        newPaymentMethod = {
          ...newPaymentMethod,
          type: 'cash',
          name: 'Cash',
        };
        break;

      case 'googlepay':
        if (!googlePayPhone) {
          Alert.alert('Error', 'Please enter your phone number');
          return;
        }
        newPaymentMethod = {
          ...newPaymentMethod,
          type: 'googlepay',
          name: 'Google Pay',
          phone: googlePayPhone,
        };
        break;

      case 'card':
        if (!cardNumber || !cardholderName || !expiryMonth || !expiryYear || !cvv) {
          Alert.alert('Error', 'Please fill in all card details');
          return;
        }
        const last4 = cardNumber.slice(-4);
        const brand = getCardBrand(cardNumber);
        newPaymentMethod = {
          ...newPaymentMethod,
          type: 'card',
          cardType: cardType,
          brand: brand,
          last4: last4,
          cardholderName: cardholderName,
          expiryMonth: expiryMonth,
          expiryYear: expiryYear,
          name: `${cardType === 'credit' ? 'Credit' : 'Debit'} Card •••• ${last4}`,
        };
        break;

      case 'internetbanking':
        if (!bankName || !accountNumber || !ifscCode) {
          Alert.alert('Error', 'Please fill in all banking details');
          return;
        }
        newPaymentMethod = {
          ...newPaymentMethod,
          type: 'internetbanking',
          name: bankName,
          accountNumber: accountNumber,
          ifscCode: ifscCode,
        };
        break;

      default:
        return;
    }

    try {
      await paymentMethodsApi.addPaymentMethod(user.id, newPaymentMethod);
      await loadPaymentMethods();
      setShowAddModal(false);
      setSelectedPaymentType(null);
      Alert.alert('Success', 'Payment method added successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to add payment method');
    }
  };

  const getCardBrand = (number) => {
    const num = number.replace(/\D/g, '');
    if (/^4/.test(num)) return 'Visa';
    if (/^5[1-5]/.test(num)) return 'Mastercard';
    if (/^3[47]/.test(num)) return 'Amex';
    if (/^6(?:011|5)/.test(num)) return 'Discover';
    return 'Card';
  };

  const formatCardNumber = (text) => {
    const cleaned = text.replace(/\D/g, '');
    const match = cleaned.match(/.{1,4}/g);
    return match ? match.join(' ') : cleaned;
  };

  const getSimplePaymentColor = (type) => {
    switch (type) {
      case 'cash':
        return '#4ade80';
      case 'googlepay':
        return '#4285f4';
      case 'internetbanking':
        return '#f093fb';
      default:
        return '#667eea';
    }
  };

  const getPaymentIcon = (method) => {
    switch (method?.type) {
      case 'cash':
        return 'cash';
      case 'googlepay':
        return 'logo-google';
      case 'card':
        return 'card';
      case 'internetbanking':
        return 'business';
      default:
        return 'card-outline';
    }
  };

  const getCardIcon = (brand) => {
    switch (brand?.toLowerCase()) {
      case 'visa':
        return 'card';
      case 'mastercard':
        return 'card';
      case 'amex':
        return 'card';
      case 'discover':
        return 'card';
      default:
        return 'card-outline';
    }
  };

  const getCardColor = (brand) => {
    switch (brand?.toLowerCase()) {
      case 'visa':
        return ['#1a1f71', '#1434a4'];
      case 'mastercard':
        return ['#eb001b', '#f79e1b'];
      case 'amex':
        return ['#006fcf', '#006fcf'];
      case 'discover':
        return ['#ff6000', '#ff8c00'];
      default:
        return ['#667eea', '#764ba2'];
    }
  };

  const getCardPattern = (brand) => {
    // Return pattern style for different card brands
    return null;
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Payment Methods" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {paymentMethods.length > 0 && (
          <Card variant="elevated" style={styles.statsCard}>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Ionicons name="card-outline" size={24} color="#667eea" />
                <Text style={styles.statValue}>{paymentMethods.length}</Text>
                <Text style={styles.statLabel}>Cards</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Ionicons name="shield-checkmark-outline" size={24} color="#4ade80" />
                <Text style={styles.statValue}>Secure</Text>
                <Text style={styles.statLabel}>Payment</Text>
              </View>
            </View>
          </Card>
        )}

        {paymentMethods.length > 0 ? (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Your Payment Methods</Text>
            </View>
            
            {/* Separate cards from other payment methods */}
            {(() => {
              const cards = paymentMethods.filter((m) => m.type === 'card');
              const otherMethods = paymentMethods.filter((m) => m.type !== 'card');
              
              return (
                <>
                  {/* Horizontal Scrollable Cards */}
                  {cards.length > 0 && (
                    <View style={styles.cardsContainer}>
                      <FlatList
                        ref={cardScrollViewRef}
                        data={cards}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={(item) => item.id}
                        onMomentumScrollEnd={(event) => {
                          const index = Math.round(event.nativeEvent.contentOffset.x / cardItemWidth);
                          setCurrentCardIndex(index);
                        }}
                        getItemLayout={(data, index) => ({
                          length: cardItemWidth,
                          offset: cardItemWidth * index,
                          index,
                        })}
                        renderItem={({ item: method, index }) => (
                          <View style={[styles.cardWrapper, { width: cardItemWidth }]}>
                            <View style={styles.paymentCard}>
                              <LinearGradient
                                colors={getCardColor(method.brand)}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.cardGradient}
                              >
                                <View style={styles.cardTop}>
                                  <View style={styles.chipContainer}>
                                    <View style={styles.chip} />
                                    <View style={styles.chipLine} />
                                  </View>
                                  <View style={styles.cardBrandLogo}>
                                    <Text style={styles.brandLogoText}>{method.brand}</Text>
                                  </View>
                                </View>
                                
                                <View style={styles.cardMiddle}>
                                  <Text style={styles.cardNumber}>
                                    •••• •••• •••• {method.last4}
                                  </Text>
                                </View>

                                <View style={styles.cardBottom}>
                                  <View style={styles.cardInfo}>
                                    <View>
                                      <Text style={styles.cardLabel}>CARDHOLDER</Text>
                                      <Text style={styles.cardholderName}>{method.cardholderName}</Text>
                                    </View>
                                    <View style={styles.expiryContainer}>
                                      <Text style={styles.cardLabel}>EXPIRES</Text>
                                      <Text style={styles.cardExpiry}>
                                        {method.expiryMonth}/{method.expiryYear}
                                      </Text>
                                    </View>
                                  </View>
                                  {method.isDefault && (
                                    <View style={styles.defaultBadge}>
                                      <Ionicons name="checkmark-circle" size={14} color="#4ade80" />
                                      <Text style={styles.defaultText}>Default</Text>
                                    </View>
                                  )}
                                </View>
                              </LinearGradient>
                              
                              <View style={styles.cardActions}>
                                {!method.isDefault && (
                                  <TouchableOpacity
                                    style={styles.actionButton}
                                    onPress={() => handleSetDefault(method.id)}
                                    activeOpacity={0.7}
                                  >
                                    <View style={styles.actionIconContainer}>
                                      <Ionicons name="star-outline" size={18} color="#667eea" />
                                    </View>
                                    <Text style={styles.actionText}>Set as Default</Text>
                                  </TouchableOpacity>
                                )}
                                <TouchableOpacity
                                  style={styles.actionButton}
                                  onPress={() => handleEditCard(method)}
                                  activeOpacity={0.7}
                                >
                                  <View style={styles.actionIconContainer}>
                                    <Ionicons name="create-outline" size={18} color="#667eea" />
                                  </View>
                                  <Text style={styles.actionText}>Edit</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                  style={[styles.actionButton, styles.deleteButton]}
                                  onPress={() => handleDelete(method.id)}
                                  activeOpacity={0.7}
                                >
                                  <View style={[styles.actionIconContainer, styles.deleteIconContainer]}>
                                    <Ionicons name="trash-outline" size={18} color="#ef4444" />
                                  </View>
                                  <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
                                </TouchableOpacity>
                              </View>
                            </View>
                          </View>
                        )}
                      />
                      
                      {/* Pagination Indicators */}
                      {cards.length > 1 && (
                        <View style={styles.paginationContainer}>
                          {cards.map((_, index) => (
                            <View
                              key={index}
                              style={[
                                styles.paginationDot,
                                index === currentCardIndex && styles.paginationDotActive,
                              ]}
                            />
                          ))}
                        </View>
                      )}
                      
                      {/* Card Counter */}
                      {cards.length > 1 && (
                        <View style={styles.cardCounter}>
                          <Text style={styles.cardCounterText}>
                            {currentCardIndex + 1} of {cards.length}
                          </Text>
                        </View>
                      )}
                    </View>
                  )}

                  {/* Other Payment Methods (Cash, Google Pay, Internet Banking) */}
                  {otherMethods.map((method) => (
                    <Card key={method.id} variant="elevated" style={styles.simplePaymentCard}>
                      <View style={styles.simplePaymentHeader}>
                        <View style={[styles.simplePaymentIcon, { backgroundColor: `${getSimplePaymentColor(method.type)}15` }]}>
                          <Ionicons name={getPaymentIcon(method)} size={28} color={getSimplePaymentColor(method.type)} />
                        </View>
                        <View style={styles.simplePaymentInfo}>
                          <Text style={styles.simplePaymentName}>{method.name}</Text>
                          {method.type === 'googlepay' && method.phone && (
                            <Text style={styles.simplePaymentDetail}>{method.phone}</Text>
                          )}
                          {method.type === 'internetbanking' && method.accountNumber && (
                            <Text style={styles.simplePaymentDetail}>Account ••••{method.accountNumber?.slice(-4)}</Text>
                          )}
                        </View>
                        {method.isDefault && (
                          <View style={styles.defaultBadgeSimple}>
                            <Ionicons name="checkmark-circle" size={16} color="#4ade80" />
                            <Text style={styles.defaultTextSimple}>Default</Text>
                          </View>
                        )}
                      </View>
                      <View style={styles.cardActions}>
                        {!method.isDefault && (
                          <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => handleSetDefault(method.id)}
                            activeOpacity={0.7}
                          >
                            <View style={styles.actionIconContainer}>
                              <Ionicons name="star-outline" size={18} color="#667eea" />
                            </View>
                            <Text style={styles.actionText}>Set as Default</Text>
                          </TouchableOpacity>
                        )}
                        <TouchableOpacity
                          style={[styles.actionButton, styles.deleteButton]}
                          onPress={() => handleDelete(method.id)}
                          activeOpacity={0.7}
                        >
                          <View style={[styles.actionIconContainer, styles.deleteIconContainer]}>
                            <Ionicons name="trash-outline" size={18} color="#ef4444" />
                          </View>
                          <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
                        </TouchableOpacity>
                      </View>
                    </Card>
                  ))}
                </>
              );
            })()}
          </>
        ) : (
          <Card variant="outlined" style={styles.emptyCard}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="card-outline" size={80} color="#e0e0e0" />
            </View>
            <Text style={styles.emptyText}>No Payment Methods</Text>
            <Text style={styles.emptySubtext}>
              Add a payment method to make quick and secure payments
            </Text>
          </Card>
        )}

        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddPayment}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.addButtonGradient}
          >
            <View style={styles.addButtonIconContainer}>
              <Ionicons name="add-circle" size={28} color="#fff" />
            </View>
            <Text style={styles.addButtonText}>Add Payment Method</Text>
            <Ionicons name="chevron-forward" size={20} color="#fff" style={styles.addButtonChevron} />
          </LinearGradient>
        </TouchableOpacity>

        <Card variant="outlined" style={styles.securityCard}>
          <View style={styles.securityRow}>
            <Ionicons name="shield-checkmark" size={24} color="#4ade80" />
            <View style={styles.securityInfo}>
              <Text style={styles.securityTitle}>Secure Payment</Text>
              <Text style={styles.securityText}>
                Your payment information is encrypted and secure
              </Text>
            </View>
          </View>
        </Card>
      </ScrollView>

      {/* Add Payment Method Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowAddModal(false);
          setSelectedPaymentType(null);
        }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedPaymentType ? 'Add Payment Method' : 'Select Payment Type'}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setShowAddModal(false);
                  setSelectedPaymentType(null);
                }}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            {!selectedPaymentType ? (
              <ScrollView style={styles.paymentTypeList}>
                {enabledPaymentMethods.includes('card') && (
                  <TouchableOpacity
                    style={styles.paymentTypeOption}
                    onPress={() => handleSelectPaymentType('card')}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.paymentTypeIcon, { backgroundColor: '#667eea15' }]}>
                      <Ionicons name="card" size={32} color="#667eea" />
                    </View>
                    <View style={styles.paymentTypeInfo}>
                      <Text style={styles.paymentTypeName}>Credit/Debit Card</Text>
                      <Text style={styles.paymentTypeDesc}>Add a credit or debit card</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#ccc" />
                  </TouchableOpacity>
                )}

                {enabledPaymentMethods.includes('cash') && (
                  <TouchableOpacity
                    style={styles.paymentTypeOption}
                    onPress={() => handleSelectPaymentType('cash')}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.paymentTypeIcon, { backgroundColor: '#4ade8015' }]}>
                      <Ionicons name="cash" size={32} color="#4ade80" />
                    </View>
                    <View style={styles.paymentTypeInfo}>
                      <Text style={styles.paymentTypeName}>Cash</Text>
                      <Text style={styles.paymentTypeDesc}>Pay with cash on delivery</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#ccc" />
                  </TouchableOpacity>
                )}

                {enabledPaymentMethods.includes('googlepay') && (
                  <TouchableOpacity
                    style={styles.paymentTypeOption}
                    onPress={() => handleSelectPaymentType('googlepay')}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.paymentTypeIcon, { backgroundColor: '#4285f415' }]}>
                      <Ionicons name="logo-google" size={32} color="#4285f4" />
                    </View>
                    <View style={styles.paymentTypeInfo}>
                      <Text style={styles.paymentTypeName}>Google Pay</Text>
                      <Text style={styles.paymentTypeDesc}>Link your Google Pay account</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#ccc" />
                  </TouchableOpacity>
                )}

                {enabledPaymentMethods.includes('internetbanking') && (
                  <TouchableOpacity
                    style={styles.paymentTypeOption}
                    onPress={() => handleSelectPaymentType('internetbanking')}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.paymentTypeIcon, { backgroundColor: '#f093fb15' }]}>
                      <Ionicons name="business" size={32} color="#f093fb" />
                    </View>
                    <View style={styles.paymentTypeInfo}>
                      <Text style={styles.paymentTypeName}>Internet Banking</Text>
                      <Text style={styles.paymentTypeDesc}>Link your bank account</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#ccc" />
                  </TouchableOpacity>
                )}

                {enabledPaymentMethods.length === 0 && (
                  <View style={styles.noPaymentTypes}>
                    <Ionicons name="card-outline" size={48} color="#ccc" />
                    <Text style={styles.noPaymentTypesText}>No payment methods available</Text>
                    <Text style={styles.noPaymentTypesSubtext}>
                      Please contact administrator to enable payment methods
                    </Text>
                  </View>
                )}
              </ScrollView>
            ) : (
              <ScrollView style={styles.formContainer}>
                {selectedPaymentType === 'cash' && (
                  <View>
                    <View style={styles.infoCard}>
                      <Ionicons name="information-circle" size={24} color="#667eea" />
                      <Text style={styles.infoText}>
                        Cash payments are available for all rides. No additional setup required.
                      </Text>
                    </View>
                    <Button
                      title="Add Cash Payment"
                      onPress={handleSavePayment}
                      style={styles.saveButton}
                    />
                  </View>
                )}

                {selectedPaymentType === 'googlepay' && (
                  <View>
                    <Input
                      label="Phone Number"
                      value={googlePayPhone}
                      onChangeText={setGooglePayPhone}
                      placeholder="Enter your Google Pay phone number"
                      keyboardType="phone-pad"
                      icon="call-outline"
                    />
                    <Button
                      title="Add Google Pay"
                      onPress={handleSavePayment}
                      style={styles.saveButton}
                    />
                  </View>
                )}

                {selectedPaymentType === 'card' && (
                  <View>
                    <View style={styles.cardTypeSelector}>
                      <TouchableOpacity
                        style={[styles.cardTypeButton, cardType === 'credit' && styles.cardTypeButtonActive]}
                        onPress={() => setCardType('credit')}
                      >
                        <Text style={[styles.cardTypeText, cardType === 'credit' && styles.cardTypeTextActive]}>
                          Credit Card
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.cardTypeButton, cardType === 'debit' && styles.cardTypeButtonActive]}
                        onPress={() => setCardType('debit')}
                      >
                        <Text style={[styles.cardTypeText, cardType === 'debit' && styles.cardTypeTextActive]}>
                          Debit Card
                        </Text>
                      </TouchableOpacity>
                    </View>
                    <Input
                      label="Card Number"
                      value={cardNumber}
                      onChangeText={(text) => setCardNumber(formatCardNumber(text))}
                      placeholder="1234 5678 9012 3456"
                      keyboardType="numeric"
                      icon="card-outline"
                      maxLength={19}
                    />
                    <Input
                      label="Cardholder Name"
                      value={cardholderName}
                      onChangeText={setCardholderName}
                      placeholder="John Doe"
                      icon="person-outline"
                      autoCapitalize="words"
                    />
                    <View style={styles.row}>
                      <View style={styles.halfWidth}>
                        <Input
                          label="Expiry Month"
                          value={expiryMonth}
                          onChangeText={setExpiryMonth}
                          placeholder="MM"
                          keyboardType="numeric"
                          icon="calendar-outline"
                          maxLength={2}
                        />
                      </View>
                      <View style={styles.halfWidth}>
                        <Input
                          label="Expiry Year"
                          value={expiryYear}
                          onChangeText={setExpiryYear}
                          placeholder="YYYY"
                          keyboardType="numeric"
                          icon="calendar-outline"
                          maxLength={4}
                        />
                      </View>
                    </View>
                    <Input
                      label="CVV"
                      value={cvv}
                      onChangeText={setCvv}
                      placeholder="123"
                      keyboardType="numeric"
                      icon="lock-closed-outline"
                      secureTextEntry
                      maxLength={4}
                    />
                    <Button
                      title={`Add ${cardType === 'credit' ? 'Credit' : 'Debit'} Card`}
                      onPress={handleSavePayment}
                      style={styles.saveButton}
                    />
                  </View>
                )}

                {selectedPaymentType === 'internetbanking' && (
                  <View>
                    <Input
                      label="Bank Name"
                      value={bankName}
                      onChangeText={setBankName}
                      placeholder="Enter bank name"
                      icon="business-outline"
                      autoCapitalize="words"
                    />
                    <Input
                      label="Account Number"
                      value={accountNumber}
                      onChangeText={setAccountNumber}
                      placeholder="Enter account number"
                      keyboardType="numeric"
                      icon="card-outline"
                    />
                    <Input
                      label="IFSC Code"
                      value={ifscCode}
                      onChangeText={(text) => setIfscCode(text.toUpperCase())}
                      placeholder="ABCD0123456"
                      icon="document-text-outline"
                      autoCapitalize="characters"
                      maxLength={11}
                    />
                    <Button
                      title="Add Internet Banking"
                      onPress={handleSavePayment}
                      style={styles.saveButton}
                    />
                  </View>
                )}

                <Button
                  title="Back"
                  onPress={() => setSelectedPaymentType(null)}
                  variant="secondary"
                  style={styles.backButton}
                />
              </ScrollView>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Edit Card Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowEditModal(false);
          setEditingCard(null);
          resetForm();
        }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Card</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowEditModal(false);
                  setEditingCard(null);
                  resetForm();
                }}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formContainer}>
              {editingCard && (
                <>
                  <View style={styles.editCardPreview}>
                    <LinearGradient
                      colors={getCardColor(editingCard.brand)}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.previewCardGradient}
                    >
                      <View style={styles.cardTop}>
                        <View style={styles.chipContainer}>
                          <View style={styles.chip} />
                          <View style={styles.chipLine} />
                        </View>
                        <View style={styles.cardBrandLogo}>
                          <Text style={styles.brandLogoText}>{editingCard.brand || 'Card'}</Text>
                        </View>
                      </View>
                      <View style={styles.cardMiddle}>
                        <Text style={styles.cardNumber}>
                          {cardNumber ? formatCardNumber(cardNumber) : `•••• •••• •••• ${editingCard.last4 || '0000'}`}
                        </Text>
                      </View>
                      <View style={styles.cardBottom}>
                        <View style={styles.cardInfo}>
                          <View>
                            <Text style={styles.cardLabel}>CARDHOLDER</Text>
                            <Text style={styles.cardholderName}>{cardholderName || editingCard.cardholderName}</Text>
                          </View>
                          <View style={styles.expiryContainer}>
                            <Text style={styles.cardLabel}>EXPIRES</Text>
                            <Text style={styles.cardExpiry}>
                              {expiryMonth || editingCard.expiryMonth || 'MM'}/{expiryYear || editingCard.expiryYear || 'YYYY'}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </LinearGradient>
                  </View>

                  <View style={styles.cardTypeSelector}>
                    <TouchableOpacity
                      style={[styles.cardTypeButton, cardType === 'credit' && styles.cardTypeButtonActive]}
                      onPress={() => setCardType('credit')}
                    >
                      <Text style={[styles.cardTypeText, cardType === 'credit' && styles.cardTypeTextActive]}>
                        Credit Card
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.cardTypeButton, cardType === 'debit' && styles.cardTypeButtonActive]}
                      onPress={() => setCardType('debit')}
                    >
                      <Text style={[styles.cardTypeText, cardType === 'debit' && styles.cardTypeTextActive]}>
                        Debit Card
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <Input
                    label="Card Number (Optional - leave blank to keep current)"
                    value={cardNumber}
                    onChangeText={(text) => setCardNumber(formatCardNumber(text))}
                    placeholder={`Current: •••• ${editingCard.last4 || '0000'}`}
                    keyboardType="numeric"
                    icon="card-outline"
                    maxLength={19}
                  />
                  <Input
                    label="Cardholder Name"
                    value={cardholderName}
                    onChangeText={setCardholderName}
                    placeholder="John Doe"
                    icon="person-outline"
                    autoCapitalize="words"
                  />
                  <View style={styles.row}>
                    <View style={styles.halfWidth}>
                      <Input
                        label="Expiry Month"
                        value={expiryMonth}
                        onChangeText={setExpiryMonth}
                        placeholder="MM"
                        keyboardType="numeric"
                        icon="calendar-outline"
                        maxLength={2}
                      />
                    </View>
                    <View style={styles.halfWidth}>
                      <Input
                        label="Expiry Year"
                        value={expiryYear}
                        onChangeText={setExpiryYear}
                        placeholder="YYYY"
                        keyboardType="numeric"
                        icon="calendar-outline"
                        maxLength={4}
                      />
                    </View>
                  </View>
                  <View style={styles.infoCard}>
                    <Ionicons name="information-circle" size={20} color="#667eea" />
                    <Text style={styles.infoText}>
                      For security reasons, CVV cannot be changed. Card number is optional - leave blank to keep current card number.
                    </Text>
                  </View>
                  <Button
                    title="Update Card"
                    onPress={handleUpdateCard}
                    style={styles.saveButton}
                    icon="checkmark-circle"
                  />
                  <Button
                    title="Cancel"
                    onPress={() => {
                      setShowEditModal(false);
                      setEditingCard(null);
                      resetForm();
                    }}
                    variant="secondary"
                    style={styles.backButton}
                  />
                </>
              )}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  statsCard: {
    marginBottom: 20,
    padding: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#e0e0e0',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  sectionHeader: {
    marginBottom: 12,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  paymentCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  cardGradient: {
    padding: 24,
    borderRadius: 16,
    minHeight: 200,
    justifyContent: 'space-between',
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  chipContainer: {
    width: 50,
    height: 35,
    backgroundColor: '#ffd700',
    borderRadius: 6,
    position: 'relative',
    overflow: 'hidden',
  },
  chip: {
    width: 40,
    height: 30,
    backgroundColor: '#ffed4e',
    borderRadius: 4,
    margin: 2.5,
  },
  chipLine: {
    position: 'absolute',
    top: 12,
    left: 8,
    width: 30,
    height: 2,
    backgroundColor: '#ffd700',
    borderRadius: 1,
  },
  cardBrandLogo: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  brandLogoText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 1,
  },
  cardMiddle: {
    marginBottom: 24,
  },
  cardNumber: {
    fontSize: 24,
    color: '#fff',
    letterSpacing: 4,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  cardInfo: {
    flexDirection: 'row',
    gap: 24,
    flex: 1,
  },
  cardLabel: {
    fontSize: 10,
    color: '#fff',
    opacity: 0.7,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 4,
  },
  cardholderName: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  expiryContainer: {
    alignItems: 'flex-start',
  },
  cardExpiry: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  defaultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  defaultText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  cardActions: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 12,
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#f5f5f5',
    gap: 6,
  },
  actionIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#fef2f2',
  },
  deleteIconContainer: {
    backgroundColor: '#fee2e2',
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#667eea',
  },
  deleteText: {
    color: '#ef4444',
  },
  emptyCard: {
    alignItems: 'center',
    padding: 48,
    marginBottom: 16,
    borderStyle: 'dashed',
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f9f9f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
  addButton: {
    marginTop: 8,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  addButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 10,
  },
  addButtonIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  addButtonChevron: {
    opacity: 0.8,
  },
  securityCard: {
    marginBottom: 32,
    padding: 16,
  },
  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  securityInfo: {
    flex: 1,
  },
  securityTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  securityText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },
  simplePaymentCard: {
    marginBottom: 16,
    padding: 16,
  },
  simplePaymentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  simplePaymentIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  simplePaymentInfo: {
    flex: 1,
  },
  simplePaymentName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  simplePaymentDetail: {
    fontSize: 14,
    color: '#666',
  },
  defaultBadgeSimple: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  defaultTextSimple: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4ade80',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: 20,
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
  closeButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 18,
    backgroundColor: '#f5f5f5',
  },
  paymentTypeList: {
    padding: 16,
  },
  paymentTypeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  paymentTypeIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  paymentTypeInfo: {
    flex: 1,
  },
  paymentTypeName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  paymentTypeDesc: {
    fontSize: 14,
    color: '#666',
  },
  formContainer: {
    padding: 20,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#f0f4ff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#667eea',
    lineHeight: 20,
  },
  cardTypeSelector: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  cardTypeButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cardTypeButtonActive: {
    backgroundColor: '#f0f4ff',
    borderColor: '#667eea',
  },
  cardTypeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  cardTypeTextActive: {
    color: '#667eea',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  saveButton: {
    marginTop: 8,
    marginBottom: 12,
  },
  backButton: {
    marginTop: 8,
  },
  noPaymentTypes: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
  },
  noPaymentTypesText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  noPaymentTypesSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  editCardPreview: {
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  previewCardGradient: {
    padding: 20,
    minHeight: 200,
    borderRadius: 16,
  },
  cardsContainer: {
    marginBottom: 24,
  },
  cardWrapper: {
    paddingHorizontal: 16,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    gap: 8,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ddd',
  },
  paginationDotActive: {
    width: 24,
    backgroundColor: '#667eea',
  },
  cardCounter: {
    alignItems: 'center',
    marginTop: 8,
  },
  cardCounterText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
});

export default PaymentMethodsScreen;

