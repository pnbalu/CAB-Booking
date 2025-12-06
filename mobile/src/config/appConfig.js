// Application Configuration
// Centralized configuration for app name, logo, and branding

// Try to load logo image, fallback to null if not found
let logoImage = null;
try {
  // Uncomment this line and add your logo.png file to mobile/assets/logo.png
  // logoImage = require('../../assets/logo.png');
} catch (error) {
  // Logo image not found, will use icon fallback
  logoImage = null;
}

export const appConfig = {
  name: 'RideShare',
  displayName: 'RideShare',
  shortName: 'RS',
  logo: {
    // Image logo - can be local asset or URL
    // Add your logo.png file to mobile/assets/logo.png and uncomment the require above
    image: logoImage,
    // Fallback icon if image is not available
    icon: 'car', // Ionicons icon name
    color: '#667eea',
    backgroundColor: '#f0f4ff',
    // Logo dimensions (when using image)
    width: 100,
    height: 32,
  },
  version: '1.0.0',
  build: '2024.01.15',
  company: {
    name: 'RideShare Inc.',
    email: 'support@rideshare.com',
    website: 'https://www.rideshare.com',
    twitter: '@rideshare',
  },
};

export default appConfig;
