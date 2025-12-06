import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  FiHome, 
  FiSettings, 
  FiUsers, 
  FiDollarSign,
  FiCreditCard,
  FiMessageSquare,
  FiGift,
  FiLogOut,
  FiMenu
} from 'react-icons/fi';
import './Layout.css';

const Layout = () => {
  const { logout } = useAuth();
  const location = useLocation();

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: FiHome },
    { path: '/settings', label: 'Settings', icon: FiSettings },
    { path: '/drivers', label: 'Drivers', icon: FiUsers },
    { path: '/riders', label: 'Riders', icon: FiUsers },
    { path: '/referrals', label: 'Referrals', icon: FiGift },
    { path: '/payments', label: 'Payments', icon: FiDollarSign },
    { path: '/payment-methods', label: 'Payment Methods', icon: FiCreditCard },
    { path: '/support-chat', label: 'Support Chat', icon: FiMessageSquare },
  ];

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo-icon">
            <FiMenu size={28} />
          </div>
          <h1>CAB Admin</h1>
        </div>
        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
              >
                <IconComponent className="nav-icon" size={20} />
                <span className="nav-label">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="sidebar-footer">
          <button onClick={logout} className="logout-btn">
            <FiLogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;

