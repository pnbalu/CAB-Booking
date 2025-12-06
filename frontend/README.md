# CAB Booking Admin Panel

Web-based admin panel for managing the CAB Booking mobile application.

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The admin panel will be available at `http://localhost:3001`

## Default Login

- **Username**: `admin`
- **Password**: `admin123`

## Features

### Dashboard
- Overview statistics
- Total drivers, rides, revenue

### Settings
- Configure internationalization (languages)
- Set currency
- Set rate per mile for fare calculation

### Drivers
- View all driver information
- See driver status (online/offline)
- View ratings and earnings
- Manage driver details

### Payments
- View payment transactions
- Track payment status
- Approve pending payments
- View payment statistics

## Project Structure

```
frontend/
├── src/
│   ├── components/     # Reusable components
│   ├── contexts/       # React contexts
│   ├── pages/          # Page components
│   └── main.jsx        # Entry point
├── index.html
├── package.json
└── vite.config.js
```

## Technologies

- React 18
- Vite
- React Router
- CSS3
