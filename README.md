# CAB Booking Application

A complete ride-sharing application with separate mobile app and web admin panel.

---

## 📹 Demo Videos

> **🎬 Watch the demos to see the app in action!** All demo videos are available in the [`demo/`](demo/) folder.

### 🚗 Rider App Demo

<video width="600" controls>
  <source src="demo/rider.mp4" type="video/mp4">
  Your browser does not support the video tag. [Download Rider Demo](demo/rider.mp4)
</video>

### 🚕 Driver App Demo

<video width="600" controls>
  <source src="demo/driver.mp4" type="video/mp4">
  Your browser does not support the video tag. [Download Driver Demo](demo/driver.mp4)
</video>

### 💻 Web Admin Panel Demo

<video width="600" controls>
  <source src="demo/webapp.mp4" type="video/mp4">
  Your browser does not support the video tag. [Download Web App Demo](demo/webapp.mp4)
</video>

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

---

## 📧 Support & Contact

If you are looking for help or have any questions, please feel free to reach out:

📧 **Email**: [pnbalu@yahoo.com](mailto:pnbalu@yahoo.com)

We're happy to assist with any issues, feature requests, or questions about the project!
