import AsyncStorage from '@react-native-async-storage/async-storage';
import en from './locales/en';
import es from './locales/es';
import fr from './locales/fr';

const translations = {
  en,
  es,
  fr,
};

let currentLanguage = 'en';

export const setLanguage = async (lang) => {
  if (translations[lang]) {
    currentLanguage = lang;
    await AsyncStorage.setItem('app_language', lang);
  }
};

export const getLanguage = async () => {
  try {
    const savedLang = await AsyncStorage.getItem('app_language');
    if (savedLang && translations[savedLang]) {
      currentLanguage = savedLang;
    }
  } catch (error) {
    console.error('Error loading language:', error);
  }
  return currentLanguage;
};

export const t = (key) => {
  const keys = key.split('.');
  let value = translations[currentLanguage];
  
  for (const k of keys) {
    value = value?.[k];
  }
  
  return value || key;
};

export const getAvailableLanguages = () => {
  return [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
  ];
};

// Initialize language on load
getLanguage();

export default {
  t,
  setLanguage,
  getLanguage,
  getAvailableLanguages,
};

