import AsyncStorage from '@react-native-async-storage/async-storage';

const REFERRALS_KEY = 'referrals_data';
const REFERRAL_CODES_KEY = 'referral_codes';

// Generate unique referral code
export const generateReferralCode = (userId, userType) => {
  // Create a unique code based on user ID and type
  const prefix = userType === 'driver' ? 'DRIVE' : 'RIDE';
  const timestamp = Date.now().toString(36).toUpperCase();
  const userIdPart = userId ? userId.slice(-4).toUpperCase() : 'XXXX';
  return `${prefix}${userIdPart}${timestamp.slice(-4)}`;
};

// Save referral code for user
export const saveReferralCode = async (userId, userType, code) => {
  try {
    const codes = await getReferralCodes();
    codes[userId] = {
      code,
      userType,
      createdAt: new Date().toISOString(),
    };
    await AsyncStorage.setItem(REFERRAL_CODES_KEY, JSON.stringify(codes));
    return code;
  } catch (error) {
    console.error('Error saving referral code:', error);
    throw error;
  }
};

// Get referral code for user
export const getReferralCode = async (userId) => {
  try {
    const codes = await getReferralCodes();
    return codes[userId]?.code || null;
  } catch (error) {
    console.error('Error getting referral code:', error);
    return null;
  }
};

// Get all referral codes
export const getReferralCodes = async () => {
  try {
    const stored = await AsyncStorage.getItem(REFERRAL_CODES_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Error getting referral codes:', error);
    return {};
  }
};

// Track referral usage
export const trackReferral = async (referralCode, newUserId, newUserType) => {
  try {
    const referrals = await getReferrals();
    const referralId = `ref_${Date.now()}`;
    
    referrals.push({
      id: referralId,
      referralCode,
      newUserId,
      newUserType,
      status: 'pending', // pending, completed, rewarded
      createdAt: new Date().toISOString(),
      completedAt: null,
    });
    
    await AsyncStorage.setItem(REFERRALS_KEY, JSON.stringify(referrals));
    return referralId;
  } catch (error) {
    console.error('Error tracking referral:', error);
    throw error;
  }
};

// Get all referrals
export const getReferrals = async () => {
  try {
    const stored = await AsyncStorage.getItem(REFERRALS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error getting referrals:', error);
    return [];
  }
};

// Get referrals by code
export const getReferralsByCode = async (referralCode) => {
  try {
    const referrals = await getReferrals();
    return referrals.filter(ref => ref.referralCode === referralCode);
  } catch (error) {
    console.error('Error getting referrals by code:', error);
    return [];
  }
};

// Get referral stats for a user
export const getReferralStats = async (userId) => {
  try {
    const code = await getReferralCode(userId);
    if (!code) return null;
    
    const referrals = await getReferralsByCode(code);
    return {
      totalReferrals: referrals.length,
      pendingReferrals: referrals.filter(r => r.status === 'pending').length,
      completedReferrals: referrals.filter(r => r.status === 'completed').length,
      rewardedReferrals: referrals.filter(r => r.status === 'rewarded').length,
    };
  } catch (error) {
    console.error('Error getting referral stats:', error);
    return null;
  }
};

export const referralApi = {
  generateReferralCode,
  saveReferralCode,
  getReferralCode,
  trackReferral,
  getReferrals,
  getReferralsByCode,
  getReferralStats,
};

