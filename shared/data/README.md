# Shared Data

This directory contains shared data that can be used by both the web application and mobile application.

## Countries and States Data

The `countriesStates.js` file contains:
- List of countries with their codes and names
- States/provinces for each country
- Helper functions to retrieve countries and states
- Default values

### Usage

#### Web Application
```javascript
import { countries, getStatesByCountryCode } from '../../../shared/data/countriesStates';
```

#### Mobile Application
```javascript
import { countries, getStatesByCountryCode } from '../data/countriesStates';
```

### Available Functions

- `getCountryByCode(code)` - Get country by country code
- `getStatesByCountryCode(countryCode)` - Get all states for a country
- `getStateByCode(countryCode, stateCode)` - Get specific state
- `defaultCountry` - Default country (United States)
- `defaultState` - Default state (Alabama)

### Supported Countries

- United States (US)
- India (IN)
- United Kingdom (GB)
- Canada (CA)
- Australia (AU)
- United Arab Emirates (AE)
- Singapore (SG)
- Malaysia (MY)

## Adding New Countries/States

To add a new country or state, edit the `countriesStates.js` file and add the data following the existing structure:

```javascript
{
  code: 'XX',
  name: 'Country Name',
  states: [
    { code: 'ST1', name: 'State 1' },
    { code: 'ST2', name: 'State 2' },
  ],
}
```

