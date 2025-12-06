# Environment Variables Setup

## Google Maps API Key Configuration

### 1. Create/Update `.env` file

The `.env` file should be located in the `mobile/` directory:

```
mobile/.env
```

### 2. Add your API key

Add the following line to `mobile/.env`:

```
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
```

**Important:** 
- The variable name MUST start with `EXPO_PUBLIC_` for Expo to load it
- No spaces around the `=` sign
- No quotes needed around the value

### 3. Get your Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Directions API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Directions API"
   - Click "Enable"
4. Create credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy the API key
5. (Optional) Restrict the API key to only Directions API for security

### 4. Restart the Expo dev server

After adding or changing the `.env` file, you MUST restart the Expo dev server:

```bash
# Stop the current server (Ctrl+C)
# Then restart with cache cleared:
cd mobile
npm start -- --clear
```

Or if using Expo CLI directly:
```bash
expo start --clear
```

### 5. Verify it's working

Check the console logs when the app loads. You should see:
- ✅ `Google Maps API key loaded: AIzaSyChd...` (if working)
- ⚠️ `Google Maps API key not found!` (if not working)

### Troubleshooting

**If the API key is not loading:**

1. **Check file location**: Make sure `.env` is in `mobile/` directory, not the root
2. **Check variable name**: Must be exactly `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY`
3. **Restart server**: Always restart with `--clear` flag after changing `.env`
4. **Check for typos**: No extra spaces, correct spelling
5. **Verify API key**: Make sure the API key is valid and Directions API is enabled

**Common errors:**

- `REQUEST_DENIED`: API key is invalid or Directions API is not enabled
- `OVER_QUERY_LIMIT`: API quota exceeded, check billing
- `ZERO_RESULTS`: No route found (might be valid, but check coordinates)

### File Structure

```
CAB-Booking/
├── mobile/
│   ├── .env                    ← Your API key goes here
│   ├── .env.example           ← Example file (don't commit .env)
│   ├── App.js
│   └── src/
│       └── screens/
│           └── driver/
│               └── ActiveRideScreen.js  ← Uses the API key
```

### Security Note

⚠️ **Never commit your `.env` file to git!**

Make sure `.env` is in your `.gitignore` file.

