import React, { useState, useEffect } from 'react';
import { FiStar, FiEye, FiEdit, FiCheckCircle, FiXCircle, FiShield, FiShieldOff } from 'react-icons/fi';
import './Drivers.css';

const Drivers = () => {
  const [drivers, setDrivers] = useState([
    {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+1 234-567-8900',
      vehicle: 'Toyota Camry',
      licensePlate: 'ABC-1234',
      rating: 4.8,
      totalRides: 234,
      status: 'online',
      earnings: 4523.50,
      verified: true,
      verificationStatus: 'verified',
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      phone: '+1 234-567-8901',
      vehicle: 'Honda Accord',
      licensePlate: 'XYZ-5678',
      rating: 4.9,
      totalRides: 189,
      status: 'offline',
      earnings: 3421.25,
      verified: false,
      verificationStatus: 'pending',
    },
    {
      id: 3,
      name: 'Mike Johnson',
      email: 'mike.johnson@example.com',
      phone: '+1 234-567-8902',
      vehicle: 'Nissan Altima',
      licensePlate: 'DEF-9012',
      rating: 4.7,
      totalRides: 156,
      status: 'online',
      earnings: 2890.75,
      verified: false,
      verificationStatus: 'pending',
    },
  ]);

  useEffect(() => {
    // Load drivers from localStorage
    const stored = localStorage.getItem('drivers_data');
    if (stored) {
      setDrivers(JSON.parse(stored));
    } else {
      localStorage.setItem('drivers_data', JSON.stringify(drivers));
    }
  }, []);

  const saveDrivers = (updatedDrivers) => {
    setDrivers(updatedDrivers);
    localStorage.setItem('drivers_data', JSON.stringify(updatedDrivers));
  };

  const handleVerify = (driverId) => {
    const updated = drivers.map((driver) =>
      driver.id === driverId
        ? { ...driver, verified: true, verificationStatus: 'verified' }
        : driver
    );
    saveDrivers(updated);
  };

  const handleUnverify = (driverId) => {
    const updated = drivers.map((driver) =>
      driver.id === driverId
        ? { ...driver, verified: false, verificationStatus: 'pending' }
        : driver
    );
    saveDrivers(updated);
  };

  const getStatusBadge = (status) => {
    return (
      <span className={`status-badge ${status}`}>
        {status === 'online' ? (
          <>
            <FiCheckCircle size={14} /> Online
          </>
        ) : (
          <>
            <FiXCircle size={14} /> Offline
          </>
        )}
      </span>
    );
  };

  return (
    <div className="drivers">
      <div className="drivers-header">
        <h1>Drivers</h1>
        <p>Manage and view driver details</p>
      </div>

      <div className="drivers-table-container">
        <table className="drivers-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Contact</th>
              <th>Vehicle</th>
              <th>Rating</th>
              <th>Total Rides</th>
              <th>Status</th>
              <th>Verification</th>
              <th>Earnings</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {drivers.map((driver) => (
              <tr key={driver.id}>
                <td>{driver.id}</td>
                <td>
                  <div className="driver-name">{driver.name}</div>
                  <div className="driver-email">{driver.email}</div>
                </td>
                <td>{driver.phone}</td>
                <td>
                  <div>{driver.vehicle}</div>
                  <div className="license-plate">{driver.licensePlate}</div>
                </td>
                <td>
                  <span className="rating">
                    <FiStar size={14} fill="#FFD700" color="#FFD700" /> {driver.rating}
                  </span>
                </td>
                <td>{driver.totalRides}</td>
                <td>{getStatusBadge(driver.status)}</td>
                <td>
                  {driver.verified ? (
                    <span className="verification-badge verified">
                      <FiShield size={14} /> Verified
                    </span>
                  ) : driver.verificationStatus === 'pending' ? (
                    <span className="verification-badge pending">
                      <FiXCircle size={14} /> Pending
                    </span>
                  ) : (
                    <span className="verification-badge unverified">
                      <FiShieldOff size={14} /> Unverified
                    </span>
                  )}
                </td>
                <td className="earnings">${driver.earnings.toFixed(2)}</td>
                <td>
                  <button className="action-btn view">
                    <FiEye size={14} /> View
                  </button>
                  <button className="action-btn edit">
                    <FiEdit size={14} /> Edit
                  </button>
                  {driver.verified ? (
                    <button
                      className="action-btn unverify"
                      onClick={() => handleUnverify(driver.id)}
                      title="Unverify Driver"
                    >
                      <FiShieldOff size={14} /> Unverify
                    </button>
                  ) : (
                    <button
                      className="action-btn verify"
                      onClick={() => handleVerify(driver.id)}
                      title="Verify Driver"
                    >
                      <FiShield size={14} /> Verify
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Drivers;

