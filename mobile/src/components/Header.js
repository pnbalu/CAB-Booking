import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { appConfig } from '../config/appConfig';

const Header = ({
  title,
  showBackButton = true,
  onBackPress,
  rightComponent,
  gradientColors = ['#667eea', '#764ba2'],
  titleStyle,
  headerStyle,
}) => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      navigation.goBack();
    }
  };

  return (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.header,
        { paddingTop: insets.top },
        headerStyle,
      ]}
    >
      {/* Logo in top left */}
      <View style={styles.logoContainer}>
        {appConfig.logo.image ? (
          <Image
            source={appConfig.logo.image}
            style={styles.logoImage}
            resizeMode="contain"
          />
        ) : (
          <View style={styles.logoFallback}>
            <Ionicons name={appConfig.logo.icon} size={20} color="#fff" />
          </View>
        )}
      </View>

      {showBackButton ? (
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBackPress}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
      ) : (
        <View style={styles.placeholder} />
      )}
      
      <Text 
        style={[
          styles.headerTitle, 
          { marginLeft: showBackButton ? 12 : 60 },
          titleStyle
        ]} 
        numberOfLines={1}
      >
        {title || ''}
      </Text>
      
      {rightComponent || <View style={styles.placeholder} />}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingTop: 0,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 56,
  },
  logoContainer: {
    position: 'absolute',
    left: 16,
    top: 8,
    zIndex: 10,
  },
  logoImage: {
    width: appConfig.logo.width || 100,
    height: appConfig.logo.height || 32,
  },
  logoFallback: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginLeft: 60, // Add margin to account for logo
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.3,
    textAlign: 'center',
    marginHorizontal: 12,
  },
  placeholder: {
    width: 36,
  },
});

export default Header;
