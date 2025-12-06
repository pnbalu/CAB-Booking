import React, { useState, useEffect } from 'react';
import { FiStar, FiEye, FiEdit, FiShield, FiShieldOff } from 'react-icons/fi';
import './Riders.css';

const Riders = () => {
  const [riders, setRiders] = useState([
    {
      id: 1,
      name: 'Alice Johnson',
      email: 'alice.johnson@example.com',
      phone: '+1 234-567-8903',
      totalRides: 45,
      rating: 4.9,
      joinedDate: '2024-01-15',
      verified: true,
      verificationStatus: 'verified',
    },
    {
      id: 2,
      name: 'Bob Williams',
      email: 'bob.williams@example.com',
      phone: '+1 234-567-8904',
      totalRides: 32,
      rating: 4.7,
      joinedDate: '2024-02-20',
      verified: false,
      verificationStatus: 'pending',
    },
    {
      id: 3,
      name: 'Carol Brown',
      email: 'carol.brown@example.com',
      phone: '+1 234-567-8905',
      totalRides: 28,
      rating: 4.8,
      joinedDate: '2024-03-10',
      verified: false,
      verificationStatus: 'pending',
    },
  ]);

  useEffect(() => {
    // Load riders from localStorage
    const stored = localStorage.getItem('riders_data');
    if (stored) {
      setRiders(JSON.parse(stored));
    } else {
      localStorage.setItem('riders_data', JSON.stringify(riders));
    }
  }, []);

  const saveRiders = (updatedRiders) => {
    setRiders(updatedRiders);
    localStorage.setItem('riders_data', JSON.stringify(updatedRiders));
  };

  const handleVerify = (riderId) => {
    const updated = riders.map((rider) =>
      rider.id === riderId
        ? { ...rider, verified: true, verificationStatus: 'verified' }
        : rider
    );
    saveRiders(updated);
  };

  const handleUnverify = (riderId) => {
    const updated = riders.map((rider) =>
      rider.id === riderId
        ? { ...rider, verified: false, verificationStatus: 'pending' }
        : rider
    );
    saveRiders(updated);
  };

  return (
    <div className="riders">
      <div className="riders-header">
        <h1>Riders</h1>
        <p>Manage and view rider details</p>
      </div>

      <div className="riders-table-container">
        <table className="riders-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Contact</th>
              <th>Total Rides</th>
              <th>Rating</th>
              <th>Joined Date</th>
              <th>Verification</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {riders.map((rider) => (
              <tr key={rider.id}>
                <td>{rider.id}</td>
                <td>
                  <div className="rider-name">{rider.name}</div>
                  <div className="rider-email">{rider.email}</div>
                </td>
                <td>{rider.phone}</td>
                <td>{rider.totalRides}</td>
                <td>
                  <span className="rating">
                    <FiStar size={14} fill="#FFD700" color="#FFD700" /> {rider.rating}
                  </span>
                </td>
                <td>{new Date(rider.joinedDate).toLocaleDateString()}</td>
                <td>
                  {rider.verified ? (
                    <span className="verification-badge verified">
                      <FiShield size={14} /> Verified
                    </span>
                  ) : rider.verificationStatus === 'pending' ? (
                    <span className="verification-badge pending">
                      <FiShieldOff size={14} /> Pending
                    </span>
                  ) : (
                    <span className="verification-badge unverified">
                      <FiShieldOff size={14} /> Unverified
                    </span>
                  )}
                </td>
                <td>
                  <button className="action-btn view">
                    <FiEye size={14} /> View
                  </button>
                  <button className="action-btn edit">
                    <FiEdit size={14} /> Edit
                  </button>
                  {rider.verified ? (
                    <button
                      className="action-btn unverify"
                      onClick={() => handleUnverify(rider.id)}
                      title="Unverify Rider"
                    >
                      <FiShieldOff size={14} /> Unverify
                    </button>
                  ) : (
                    <button
                      className="action-btn verify"
                      onClick={() => handleVerify(rider.id)}
                      title="Verify Rider"
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

export default Riders;

