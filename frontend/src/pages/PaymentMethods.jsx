import React, { useState } from 'react';
import { usePaymentMethods } from '../contexts/PaymentMethodsContext';
import {
  FiCreditCard,
  FiDollarSign,
  FiTrash2,
  FiEdit,
  FiCheck,
  FiX,
  FiSearch,
  FiFilter,
  FiPlus,
} from 'react-icons/fi';
import './PaymentMethods.css';

const PaymentMethods = () => {
  const {
    paymentMethods,
    deletePaymentMethod,
    togglePaymentMethodStatus,
    refreshPaymentMethods,
  } = usePaymentMethods();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const getPaymentTypeIcon = (type) => {
    switch (type) {
      case 'card':
        return <FiCreditCard size={20} />;
      case 'cash':
        return <FiDollarSign size={20} />;
      case 'googlepay':
        return <span style={{ fontSize: '20px' }}>G</span>;
      case 'internetbanking':
        return <FiDollarSign size={20} />;
      default:
        return <FiCreditCard size={20} />;
    }
  };

  const getPaymentTypeLabel = (method) => {
    switch (method.type) {
      case 'card':
        return `${method.cardType === 'credit' ? 'Credit' : 'Debit'} Card •••• ${method.last4}`;
      case 'cash':
        return 'Cash';
      case 'googlepay':
        return `Google Pay (${method.phone})`;
      case 'internetbanking':
        return `${method.name} ••••${method.accountNumber?.slice(-4)}`;
      default:
        return method.name || 'Unknown';
    }
  };

  const getStatusBadge = (status) => {
    return (
      <span className={`status-badge ${status}`}>
        {status === 'active' ? (
          <>
            <FiCheck size={12} /> Active
          </>
        ) : (
          <>
            <FiX size={12} /> Inactive
          </>
        )}
      </span>
    );
  };

  const filteredMethods = paymentMethods.filter((method) => {
    const matchesSearch =
      method.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      method.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getPaymentTypeLabel(method).toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === 'all' || method.type === filterType;
    const matchesStatus = filterStatus === 'all' || method.status === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this payment method?')) {
      await deletePaymentMethod(id);
      refreshPaymentMethods();
    }
  };

  const handleToggleStatus = async (id) => {
    await togglePaymentMethodStatus(id);
    refreshPaymentMethods();
  };

  const stats = {
    total: paymentMethods.length,
    active: paymentMethods.filter((m) => m.status === 'active').length,
    cards: paymentMethods.filter((m) => m.type === 'card').length,
    digital: paymentMethods.filter((m) => m.type === 'googlepay').length,
  };

  return (
    <div className="payment-methods">
      <div className="payment-methods-header">
        <div>
          <h1>Payment Methods</h1>
          <p>Manage user payment methods</p>
        </div>
        <button className="add-btn">
          <FiPlus size={18} />
          <span>Add Payment Method</span>
        </button>
      </div>

      <div className="payment-methods-stats">
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#667eea15', color: '#667eea' }}>
            <FiCreditCard size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-label">Total Methods</div>
            <div className="stat-value">{stats.total}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#4ade8015', color: '#4ade80' }}>
            <FiCheck size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-label">Active</div>
            <div className="stat-value">{stats.active}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#f093fb15', color: '#f093fb' }}>
            <FiCreditCard size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-label">Cards</div>
            <div className="stat-value">{stats.cards}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#4285f415', color: '#4285f4' }}>
            <span style={{ fontSize: '24px', fontWeight: 'bold' }}>G</span>
          </div>
          <div className="stat-info">
            <div className="stat-label">Digital Wallets</div>
            <div className="stat-value">{stats.digital}</div>
          </div>
        </div>
      </div>

      <div className="payment-methods-filters">
        <div className="search-box">
          <FiSearch size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search by user name, email, or payment method..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-group">
          <div className="filter-item">
            <FiFilter size={16} />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Types</option>
              <option value="card">Cards</option>
              <option value="googlepay">Google Pay</option>
              <option value="cash">Cash</option>
              <option value="internetbanking">Internet Banking</option>
            </select>
          </div>
          <div className="filter-item">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      <div className="payment-methods-table-container">
        <table className="payment-methods-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Payment Method</th>
              <th>Type</th>
              <th>Default</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredMethods.length > 0 ? (
              filteredMethods.map((method) => (
                <tr key={method.id}>
                  <td>
                    <div className="user-info">
                      <div className="user-name">{method.userName}</div>
                      <div className="user-email">{method.userEmail}</div>
                    </div>
                  </td>
                  <td>
                    <div className="payment-method-info">
                      <div className="payment-icon">
                        {getPaymentTypeIcon(method.type)}
                      </div>
                      <div className="payment-details">
                        <div className="payment-name">{getPaymentTypeLabel(method)}</div>
                        {method.type === 'card' && (
                          <div className="payment-meta">
                            {method.cardholderName} • Expires {method.expiryMonth}/{method.expiryYear}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="type-badge">{method.type}</span>
                  </td>
                  <td>
                    {method.isDefault ? (
                      <span className="default-badge">
                        <FiCheck size={14} /> Default
                      </span>
                    ) : (
                      <span className="default-badge inactive">-</span>
                    )}
                  </td>
                  <td>{getStatusBadge(method.status)}</td>
                  <td>{method.createdAt}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="action-btn edit"
                        onClick={() => {
                          alert('Edit functionality coming soon');
                        }}
                        title="Edit"
                      >
                        <FiEdit size={14} />
                      </button>
                      <button
                        className="action-btn toggle"
                        onClick={() => handleToggleStatus(method.id)}
                        title={method.status === 'active' ? 'Deactivate' : 'Activate'}
                      >
                        {method.status === 'active' ? <FiX size={14} /> : <FiCheck size={14} />}
                      </button>
                      <button
                        className="action-btn delete"
                        onClick={() => handleDelete(method.id)}
                        title="Delete"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="no-data">
                  <div className="no-data-content">
                    <FiCreditCard size={48} />
                    <p>No payment methods found</p>
                    <small>Try adjusting your search or filters</small>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PaymentMethods;

