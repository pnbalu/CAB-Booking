import React from 'react';
import { FiUsers, FiNavigation, FiDollarSign, FiTrendingUp } from 'react-icons/fi';
import './Dashboard.css';

const Dashboard = () => {
  const stats = [
    { label: 'Total Drivers', value: '156', icon: FiUsers, color: '#667eea' },
    { label: 'Active Rides', value: '42', icon: FiNavigation, color: '#32CD32' },
    { label: 'Total Revenue', value: '$45,230', icon: FiDollarSign, color: '#FFD700' },
    { label: 'Total Rides', value: '1,234', icon: FiTrendingUp, color: '#FF6B6B' },
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Welcome to CAB Booking Admin Panel</p>
      </div>
      <div className="stats-grid">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div key={index} className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: stat.color + '20', color: stat.color }}>
                <IconComponent size={32} />
              </div>
              <div className="stat-content">
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="dashboard-content">
        <div className="content-card">
          <h2>Recent Activity</h2>
          <p>No recent activity to display</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

