# CAB Booking Application

A complete ride-sharing application with separate mobile app and web admin panel.

## Project Structure

```
CAB-Booking/
├── mobile/              # Mobile application (React Native/Expo)
│   ├── src/            # Mobile app source code
│   ├── App.js          # Mobile app entry point
│   ├── package.json    # Mobile app dependencies
│   └── ...
├── frontend/           # Web admin panel (React)
│   ├── src/           # Admin panel source code
│   ├── package.json  # Admin panel dependencies
│   └── ...
└── README.md          # This file
```

## Mobile Application

### Location
`/mobile` directory

### Features
- Rider and Driver modes
- Real-time location tracking
- Ride booking and management
- Saved locations (Home, Work, Airport, Custom)
- Multi-language support (English, Spanish, French)
- Modern UI with gradient colors

### Getting Started

```bash
# Navigate to mobile directory
cd mobile

# Install dependencies
npm install

# Start Expo development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

## Web Admin Panel

### Location
`/frontend` directory

### Features
- **Dashboard**: Overview statistics
- **Settings**: 
  - Configure internationalization (languages)
  - Set currency
  - Set rate per mile
- **Drivers**: View and manage driver details
- **Payments**: Track and manage payments

### Getting Started

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The admin panel will be available at `http://localhost:3001`

### Default Login
- **Username**: `admin`
- **Password**: `admin123`

## Technologies

### Mobile App
- React Native
- Expo SDK 54
- React Navigation
- Expo Location
- React Native Maps

### Web Admin
- React 18
- Vite
- React Router
- CSS3

## Development

Both applications are completely separate and can be developed independently:

1. **Mobile App**: Navigate to `mobile/` directory
2. **Web Admin**: Navigate to `frontend/` directory

Each has its own `package.json` and dependencies.
