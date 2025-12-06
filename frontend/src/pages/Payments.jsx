import React, { useState } from 'react';
import { FiDollarSign, FiClock, FiBarChart2, FiEye, FiCheck } from 'react-icons/fi';
import './Payments.css';

const Payments = () => {
  const [payments] = useState([
    {
      id: 'PAY-001',
      driverName: 'John Doe',
      amount: 125.50,
      rideId: 'RIDE-123',
      date: '2024-01-15',
      status: 'completed',
      method: 'Bank Transfer',
    },
    {
      id: 'PAY-002',
      driverName: 'Jane Smith',
      amount: 89.25,
      rideId: 'RIDE-124',
      date: '2024-01-15',
      status: 'pending',
      method: 'PayPal',
    },
    {
      id: 'PAY-003',
      driverName: 'Mike Johnson',
      amount: 156.75,
      rideId: 'RIDE-125',
      date: '2024-01-14',
      status: 'completed',
      method: 'Bank Transfer',
    },
  ]);

  const getStatusBadge = (status) => {
    return (
      <span className={`payment-status ${status}`}>
        {status === 'completed' ? (
          <>
            <FiCheck size={14} /> Completed
          </>
        ) : (
          <>
            <FiClock size={14} /> Pending
          </>
        )}
      </span>
    );
  };

  const totalEarnings = payments
    .filter((p) => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingPayments = payments.filter((p) => p.status === 'pending').length;

  return (
    <div className="payments">
      <div className="payments-header">
        <h1>Payments</h1>
        <p>View and manage driver payments</p>
      </div>

      <div className="payments-stats">
        <div className="stat-card">
          <div className="stat-icon" style={{ color: '#32CD32' }}>
            <FiDollarSign size={32} />
          </div>
          <div className="stat-info">
            <div className="stat-label">Total Paid</div>
            <div className="stat-value">${totalEarnings.toFixed(2)}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ color: '#FFA500' }}>
            <FiClock size={32} />
          </div>
          <div className="stat-info">
            <div className="stat-label">Pending</div>
            <div className="stat-value">{pendingPayments}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ color: '#667eea' }}>
            <FiBarChart2 size={32} />
          </div>
          <div className="stat-info">
            <div className="stat-label">Total Transactions</div>
            <div className="stat-value">{payments.length}</div>
          </div>
        </div>
      </div>

      <div className="payments-table-container">
        <table className="payments-table">
          <thead>
            <tr>
              <th>Payment ID</th>
              <th>Driver</th>
              <th>Ride ID</th>
              <th>Amount</th>
              <th>Date</th>
              <th>Method</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={payment.id}>
                <td className="payment-id">{payment.id}</td>
                <td>{payment.driverName}</td>
                <td className="ride-id">{payment.rideId}</td>
                <td className="amount">${payment.amount.toFixed(2)}</td>
                <td>{payment.date}</td>
                <td>{payment.method}</td>
                <td>{getStatusBadge(payment.status)}</td>
                <td>
                  <button className="action-btn view">
                    <FiEye size={14} /> View
                  </button>
                  {payment.status === 'pending' && (
                    <button className="action-btn approve">
                      <FiCheck size={14} /> Approve
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

export default Payments;

