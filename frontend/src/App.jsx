import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import Drivers from './pages/Drivers';
import Payments from './pages/Payments';
import PaymentMethods from './pages/PaymentMethods';
import SupportChat from './pages/SupportChat';
import Riders from './pages/Riders';
import Referrals from './pages/Referrals';
import Login from './pages/Login';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { PaymentMethodsProvider } from './contexts/PaymentMethodsContext';
import { SupportChatProvider } from './contexts/SupportChatContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <PaymentMethodsProvider>
          <SupportChatProvider>
            <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="settings" element={<Settings />} />
                <Route path="drivers" element={<Drivers />} />
                <Route path="payments" element={<Payments />} />
                <Route path="payment-methods" element={<PaymentMethods />} />
                <Route path="support-chat" element={<SupportChat />} />
                <Route path="riders" element={<Riders />} />
                <Route path="referrals" element={<Referrals />} />
              </Route>
            </Routes>
          </Router>
          </SupportChatProvider>
        </PaymentMethodsProvider>
      </SettingsProvider>
    </AuthProvider>
  );
}

export default App;

