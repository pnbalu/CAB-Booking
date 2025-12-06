const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Optimize watcher settings
config.watcher = {
  ...config.watcher,
  healthCheck: {
    enabled: true,
  },
};

// Ignore unnecessary directories
config.resolver.blockList = [
  /.*\/node_modules\/.*\/node_modules\/.*/,
  /.*\/\.git\/.*/,
  /.*\/\.expo\/.*/,
];

// Fix expo-asset resolution issue
const defaultResolver = require('metro-resolver');
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Handle expo-asset specifically
  if (moduleName === 'expo-asset') {
    try {
      const assetPath = path.resolve(__dirname, 'node_modules/expo-asset/build/index.js');
      const fs = require('fs');
      if (fs.existsSync(assetPath)) {
        return {
          filePath: assetPath,
          type: 'sourceFile',
        };
      }
    } catch (e) {
      // Fall through to default resolver
    }
  }
  
  // Use default Metro resolver
  return defaultResolver.resolve(context, moduleName, platform);
};

module.exports = config;
