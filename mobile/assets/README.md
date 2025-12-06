# Assets Directory

Place your logo image file here.

## Logo Requirements:
- File name: `logo.png`
- Recommended size: 240x80 pixels (3:1 aspect ratio)
- Format: PNG with transparency preferred
- The logo will be displayed in the top left corner of headers

## Usage:
The logo is configured in `src/config/appConfig.js` and will be automatically displayed in:
- Header component (top left corner)
- Splash screen
- About screen
- Receipt screen
- Other screens that use the Header component

If the logo image is not found, the app will fall back to using the configured icon.

