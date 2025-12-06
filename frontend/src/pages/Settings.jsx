import React, { useState, useEffect } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { FiGlobe, FiDollarSign, FiTrendingUp, FiSave, FiCreditCard, FiMapPin, FiHeadphones, FiUsers } from 'react-icons/fi';
import { countries, getStatesByCountryCode } from '../../../shared/data/countriesStates';
import './Settings.css';

const Settings = () => {
  const { settings, updateSettings } = useSettings();
  const [formData, setFormData] = useState(settings);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleLocationChange = (field, value) => {
    const updatedLocation = { ...formData.location };
    if (field === 'country') {
      // Reset state when country changes
      const states = getStatesByCountryCode(value);
      updatedLocation.country = value;
      updatedLocation.state = states.length > 0 ? states[0].code : '';
    } else {
      updatedLocation[field] = value;
    }
    setFormData({ ...formData, location: updatedLocation });
  };

  const handleSave = () => {
    updateSettings(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Spanish', flag: '🇪🇸' },
    { code: 'fr', name: 'French', flag: '🇫🇷' },
  ];

  return (
    <div className="settings">
      <div className="settings-header">
        <h1>Settings</h1>
        <p>Configure application settings</p>
      </div>

      <div className="settings-content">
        {/* Internationalization Settings */}
        <div className="settings-card">
          <div className="settings-card-header">
            <FiGlobe size={24} className="settings-card-icon" />
            <h2>Internationalization</h2>
          </div>
          <div className="form-group">
            <label>Default Language</label>
            <select
              value={formData.defaultLanguage}
              onChange={(e) => handleChange('defaultLanguage', e.target.value)}
              className="form-input"
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Available Languages</label>
            <div className="checkbox-group">
              {languages.map((lang) => (
                <label key={lang.code} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.availableLanguages.includes(lang.code)}
                    onChange={(e) => {
                      const langs = e.target.checked
                        ? [...formData.availableLanguages, lang.code]
                        : formData.availableLanguages.filter((l) => l !== lang.code);
                      handleChange('availableLanguages', langs);
                    }}
                  />
                  <span>{lang.flag} {lang.name}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Currency Settings */}
        <div className="settings-card">
          <div className="settings-card-header">
            <FiDollarSign size={24} className="settings-card-icon" />
            <h2>Currency Settings</h2>
          </div>
          <div className="form-group">
            <label>Default Currency</label>
            <select
              value={formData.currency}
              onChange={(e) => handleChange('currency', e.target.value)}
              className="form-input"
            >
              {formData.currencies.map((curr) => (
                <option key={curr} value={curr}>
                  {curr}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Available Currencies</label>
            <div className="checkbox-group">
              {formData.currencies.map((curr) => (
                <label key={curr} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.currencies.includes(curr)}
                    readOnly
                  />
                  <span>{curr}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Pricing Settings */}
        <div className="settings-card">
          <div className="settings-card-header">
            <FiTrendingUp size={24} className="settings-card-icon" />
            <h2>Pricing Settings</h2>
          </div>
          <div className="form-group">
            <label>Rate Per Mile</label>
            <div className="input-group">
              <span className="input-prefix">{formData.currency}</span>
              <input
                type="number"
                value={formData.ratePerMile}
                onChange={(e) => handleChange('ratePerMile', parseFloat(e.target.value))}
                className="form-input"
                step="0.1"
                min="0"
              />
              <span className="input-suffix">per mile</span>
            </div>
            <small className="form-hint">
              This rate will be used to calculate ride fares
            </small>
          </div>
        </div>

        {/* Payment Methods Settings */}
        <div className="settings-card">
          <div className="settings-card-header">
            <FiCreditCard size={24} className="settings-card-icon" />
            <h2>Payment Methods</h2>
          </div>
          <div className="form-group">
            <label>Available Payment Methods</label>
            <p className="form-hint" style={{ marginBottom: '16px' }}>
              Select which payment methods users can add in the mobile app. Credit/Debit Card is always enabled.
            </p>
            <div className="checkbox-group">
              <label className="checkbox-label" style={{ opacity: 0.6, cursor: 'not-allowed' }}>
                <input
                  type="checkbox"
                  checked={true}
                  disabled
                />
                <span>💳 Credit/Debit Card (Always Enabled)</span>
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.paymentMethods?.cash?.enabled ?? true}
                  onChange={(e) => {
                    handleChange('paymentMethods', {
                      ...formData.paymentMethods,
                      cash: { enabled: e.target.checked },
                    });
                  }}
                />
                <span>💵 Cash</span>
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.paymentMethods?.googlepay?.enabled ?? true}
                  onChange={(e) => {
                    handleChange('paymentMethods', {
                      ...formData.paymentMethods,
                      googlepay: { enabled: e.target.checked },
                    });
                  }}
                />
                <span>📱 Google Pay</span>
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.paymentMethods?.internetbanking?.enabled ?? true}
                  onChange={(e) => {
                    handleChange('paymentMethods', {
                      ...formData.paymentMethods,
                      internetbanking: { enabled: e.target.checked },
                    });
                  }}
                />
                <span>🏦 Internet Banking</span>
              </label>
            </div>
          </div>
        </div>

        {/* Location Settings */}
        <div className="settings-card">
          <div className="settings-card-header">
            <FiMapPin size={24} className="settings-card-icon" />
            <h2>Location Settings</h2>
          </div>
          <div className="form-group">
            <label>Country</label>
            <select
              value={formData.location?.country || ''}
              onChange={(e) => handleLocationChange('country', e.target.value)}
              className="form-input"
            >
              {countries.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.name}
                </option>
              ))}
            </select>
            <small className="form-hint">
              Select the country where the application will operate
            </small>
          </div>
          <div className="form-group">
            <label>State/Province</label>
            <select
              value={formData.location?.state || ''}
              onChange={(e) => handleLocationChange('state', e.target.value)}
              className="form-input"
              disabled={!formData.location?.country}
            >
              {formData.location?.country ? (
                getStatesByCountryCode(formData.location.country).map((state) => (
                  <option key={state.code} value={state.code}>
                    {state.name}
                  </option>
                ))
              ) : (
                <option value="">Select a country first</option>
              )}
            </select>
            <small className="form-hint">
              Select the state/province where the application will operate
            </small>
          </div>
        </div>

        {/* Support Contact Settings */}
        <div className="settings-card">
          <div className="settings-card-header">
            <FiHeadphones size={24} className="settings-card-icon" />
            <h2>Support Contact Information</h2>
          </div>
          
          {/* Rider Support */}
          <div style={{ marginBottom: '32px', paddingBottom: '32px', borderBottom: '1px solid #e0e0e0' }}>
            <h3 style={{ marginBottom: '16px', color: '#667eea' }}>Rider Support</h3>
            <div className="form-group">
              <label>Rider Support Phone Number</label>
              <input
                type="tel"
                value={formData.support?.rider?.phone || ''}
                onChange={(e) => handleChange('support', {
                  ...formData.support,
                  rider: { ...formData.support?.rider, phone: e.target.value }
                })}
                className="form-input"
                placeholder="+1 (800) 123-4567"
              />
              <small className="form-hint">
                Phone number for rider support inquiries
              </small>
            </div>
            <div className="form-group">
              <label>Rider Support Email</label>
              <input
                type="email"
                value={formData.support?.rider?.email || ''}
                onChange={(e) => handleChange('support', {
                  ...formData.support,
                  rider: { ...formData.support?.rider, email: e.target.value }
                })}
                className="form-input"
                placeholder="rider-support@cabbooking.com"
              />
              <small className="form-hint">
                Email address for rider support inquiries
              </small>
            </div>
            <div className="form-group">
              <label>Rider Emergency Phone Number</label>
              <input
                type="tel"
                value={formData.support?.rider?.emergencyPhone || ''}
                onChange={(e) => handleChange('support', {
                  ...formData.support,
                  rider: { ...formData.support?.rider, emergencyPhone: e.target.value }
                })}
                className="form-input"
                placeholder="+1 (800) 911-HELP"
              />
              <small className="form-hint">
                Emergency contact number for rider safety concerns
              </small>
            </div>
          </div>

          {/* Driver Support */}
          <div>
            <h3 style={{ marginBottom: '16px', color: '#667eea' }}>Driver Support</h3>
            <div className="form-group">
              <label>Driver Support Phone Number</label>
              <input
                type="tel"
                value={formData.support?.driver?.phone || ''}
                onChange={(e) => handleChange('support', {
                  ...formData.support,
                  driver: { ...formData.support?.driver, phone: e.target.value }
                })}
                className="form-input"
                placeholder="+1 (800) 123-4568"
              />
              <small className="form-hint">
                Phone number for driver support inquiries
              </small>
            </div>
            <div className="form-group">
              <label>Driver Support Email</label>
              <input
                type="email"
                value={formData.support?.driver?.email || ''}
                onChange={(e) => handleChange('support', {
                  ...formData.support,
                  driver: { ...formData.support?.driver, email: e.target.value }
                })}
                className="form-input"
                placeholder="driver-support@cabbooking.com"
              />
              <small className="form-hint">
                Email address for driver support inquiries
              </small>
            </div>
            <div className="form-group">
              <label>Driver Emergency Phone Number</label>
              <input
                type="tel"
                value={formData.support?.driver?.emergencyPhone || ''}
                onChange={(e) => handleChange('support', {
                  ...formData.support,
                  driver: { ...formData.support?.driver, emergencyPhone: e.target.value }
                })}
                className="form-input"
                placeholder="+1 (800) 911-HELP"
              />
              <small className="form-hint">
                Emergency contact number for driver safety concerns
              </small>
            </div>
          </div>
        </div>

        {/* Preferred Areas Settings */}
        <div className="settings-card">
          <div className="settings-card-header">
            <FiMapPin size={24} className="settings-card-icon" />
            <h2>Preferred Areas Settings</h2>
          </div>
          <div className="form-group">
            <label>Radius Options (kilometers)</label>
            <p className="form-hint" style={{ marginBottom: '16px' }}>
              Configure available radius options for driver preferred areas. Enter comma-separated values (e.g., 2,5,10,15,20,25).
            </p>
            <input
              type="text"
              value={formData.preferredAreas?.radiusOptions?.join(',') || '2,5,10,15,20,25'}
              onChange={(e) => {
                const values = e.target.value
                  .split(',')
                  .map(v => parseInt(v.trim()))
                  .filter(v => !isNaN(v) && v > 0)
                  .sort((a, b) => a - b);
                handleChange('preferredAreas', {
                  ...formData.preferredAreas,
                  radiusOptions: values.length > 0 ? values : [2, 5, 10, 15, 20, 25],
                });
              }}
              className="form-input"
              placeholder="2,5,10,15,20,25"
            />
            <small className="form-hint">
              Current options: {formData.preferredAreas?.radiusOptions?.join(' km, ') || '2, 5, 10, 15, 20, 25'} km
            </small>
          </div>
          <div className="form-group">
            <label>Default Radius (kilometers)</label>
            <input
              type="number"
              value={formData.preferredAreas?.defaultRadius || 5}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                if (!isNaN(value) && value > 0) {
                  handleChange('preferredAreas', {
                    ...formData.preferredAreas,
                    defaultRadius: value,
                  });
                }
              }}
              className="form-input"
              min="1"
              step="1"
            />
            <small className="form-hint">
              Default radius selected when adding a new preferred area
            </small>
          </div>
          <div className="form-group">
            <label>Distance Unit</label>
            <select
              value={formData.preferredAreas?.unit || 'km'}
              onChange={(e) => handleChange('preferredAreas', {
                ...formData.preferredAreas,
                unit: e.target.value,
              })}
              className="form-input"
            >
              <option value="km">Kilometers (km)</option>
              <option value="miles">Miles (mi)</option>
            </select>
            <small className="form-hint">
              Unit of measurement for preferred area radius
            </small>
          </div>
          <div className="form-group">
            <label>Maximum Preferred Areas</label>
            <input
              type="number"
              value={formData.preferredAreas?.maxAreas || 10}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                if (!isNaN(value) && value > 0) {
                  handleChange('preferredAreas', {
                    ...formData.preferredAreas,
                    maxAreas: value,
                  });
                }
              }}
              className="form-input"
              min="1"
              step="1"
            />
            <small className="form-hint">
              Maximum number of preferred areas a driver can add
            </small>
          </div>
        </div>

        <div className="settings-actions">
          <button onClick={handleSave} className="save-btn">
            <FiSave size={18} />
            <span>{saved ? 'Saved!' : 'Save Settings'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;

