# Quick Start Guide

## Starting the Web Admin Panel

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies (if not already installed):**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Access the admin panel:**
   - Open your browser and go to: `http://localhost:3001/`
   - The app will automatically open in your default browser

## Default Login Credentials

- **Username:** `admin`
- **Password:** `admin123`

## Features Available

### Dashboard (`/`)
- Overview statistics
- Total drivers, rides, revenue

### Settings (`/settings`)
- Configure internationalization (languages)
- Set default currency
- Set rate per mile for fare calculation

### Drivers (`/drivers`)
- View all driver information
- See driver status (online/offline)
- View ratings and earnings

### Payments (`/payments`)
- View payment transactions
- Track payment status
- Approve pending payments

## Troubleshooting

If the server doesn't start:
1. Make sure port 3001 is not already in use
2. Check that all dependencies are installed: `npm install`
3. Clear cache and restart: `rm -rf node_modules && npm install`

## Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

