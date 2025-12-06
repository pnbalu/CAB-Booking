# CAB Booking Project Structure

## Overview

This project contains two separate applications:
1. **Mobile App** - React Native/Expo application for riders and drivers
2. **Web Admin Panel** - React web application for administration

## Directory Structure

```
CAB-Booking/
├── mobile/                 # Mobile Application
│   ├── src/               # Source code
│   │   ├── components/    # Reusable UI components
│   │   ├── contexts/      # State management (Auth, Location, Ride, etc.)
│   │   ├── navigation/    # Navigation configuration
│   │   ├── screens/       # Screen components
│   │   └── i18n/          # Internationalization
│   ├── App.js             # Entry point
│   ├── app.json           # Expo configuration
│   ├── package.json       # Mobile app dependencies
│   └── README.md          # Mobile app documentation
│
├── frontend/               # Web Admin Panel
│   ├── src/               # Source code
│   │   ├── components/    # Reusable components
│   │   ├── contexts/      # State management (Auth, Settings)
│   │   ├── pages/         # Page components
│   │   └── main.jsx       # Entry point
│   ├── index.html         # HTML template
│   ├── package.json       # Admin panel dependencies
│   ├── vite.config.js     # Vite configuration
│   └── README.md          # Admin panel documentation
│
├── README.md              # Main project documentation
├── .gitignore            # Git ignore rules
└── PROJECT_STRUCTURE.md   # This file
```

## Development Workflow

### Mobile App Development

```bash
# Navigate to mobile directory
cd mobile

# Install dependencies
npm install

# Start development server
npm start

# Run on specific platform
npm run ios      # iOS
npm run android  # Android
npm run web      # Web
```

### Web Admin Development

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Key Features

### Mobile App
- Rider and Driver authentication
- Real-time location tracking
- Map-based ride booking
- Saved locations (Home, Work, Airport, Custom)
- Multi-language support (English, Spanish, French)
- Ride history and management
- Profile and settings

### Web Admin Panel
- Dashboard with statistics
- Settings management (i18n, currency, pricing)
- Driver management
- Payment tracking and management

## Notes

- Both applications are completely independent
- Each has its own `package.json` and dependencies
- No shared code between mobile and web
- Can be developed and deployed separately

