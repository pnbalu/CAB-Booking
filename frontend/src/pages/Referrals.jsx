import React, { useState, useEffect } from 'react';
import { FiSearch, FiFilter, FiDownload, FiEye, FiCheckCircle, FiClock, FiXCircle } from 'react-icons/fi';
import './Referrals.css';

const Referrals = () => {
  const [referrals, setReferrals] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReferrals();
  }, []);

  const loadReferrals = () => {
    // Load from localStorage (in real app, this would be an API call)
    const stored = localStorage.getItem('referrals_data');
    if (stored) {
      setReferrals(JSON.parse(stored));
    } else {
      // Mock data
      const mockReferrals = [
        {
          id: 'ref_1',
          referralCode: 'RIDE1234',
          referrerId: 'user_123',
          referrerName: 'Alice Johnson',
          referrerType: 'rider',
          newUserId: 'user_456',
          newUserName: 'Bob Williams',
          newUserType: 'rider',
          status: 'completed',
          createdAt: '2024-01-15T10:30:00Z',
          completedAt: '2024-01-20T14:20:00Z',
        },
        {
          id: 'ref_2',
          referralCode: 'DRIVE5678',
          referrerId: 'user_789',
          referrerName: 'John Doe',
          referrerType: 'driver',
          newUserId: 'user_101',
          newUserName: 'Jane Smith',
          newUserType: 'driver',
          status: 'pending',
          createdAt: '2024-01-18T09:15:00Z',
          completedAt: null,
        },
        {
          id: 'ref_3',
          referralCode: 'RIDE9012',
          referrerId: 'user_123',
          referrerName: 'Alice Johnson',
          referrerType: 'rider',
          newUserId: 'user_202',
          newUserName: 'Carol Brown',
          newUserType: 'rider',
          status: 'rewarded',
          createdAt: '2024-01-10T11:00:00Z',
          completedAt: '2024-01-12T16:45:00Z',
        },
      ];
      setReferrals(mockReferrals);
      localStorage.setItem('referrals_data', JSON.stringify(mockReferrals));
    }
    setLoading(false);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return (
          <span className="status-badge completed">
            <FiCheckCircle size={14} /> Completed
          </span>
        );
      case 'rewarded':
        return (
          <span className="status-badge rewarded">
            <FiCheckCircle size={14} /> Rewarded
          </span>
        );
      case 'pending':
        return (
          <span className="status-badge pending">
            <FiClock size={14} /> Pending
          </span>
        );
      default:
        return (
          <span className="status-badge rejected">
            <FiXCircle size={14} /> Rejected
          </span>
        );
    }
  };

  const filteredReferrals = referrals.filter((ref) => {
    const matchesSearch =
      ref.referralCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ref.referrerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ref.newUserName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || ref.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: referrals.length,
    pending: referrals.filter((r) => r.status === 'pending').length,
    completed: referrals.filter((r) => r.status === 'completed').length,
    rewarded: referrals.filter((r) => r.status === 'rewarded').length,
  };

  return (
    <div className="referrals">
      <div className="referrals-header">
        <div>
          <h1>Referrals</h1>
          <p>Track and manage referral program</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="referrals-stats">
        <div className="stat-card">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Referrals</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.pending}</div>
          <div className="stat-label">Pending</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.completed}</div>
          <div className="stat-label">Completed</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.rewarded}</div>
          <div className="stat-label">Rewarded</div>
        </div>
      </div>

      {/* Filters */}
      <div className="referrals-filters">
        <div className="search-box">
          <FiSearch size={20} />
          <input
            type="text"
            placeholder="Search by code, referrer, or new user..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="filter-buttons">
          <button
            className={filterStatus === 'all' ? 'active' : ''}
            onClick={() => setFilterStatus('all')}
          >
            All
          </button>
          <button
            className={filterStatus === 'pending' ? 'active' : ''}
            onClick={() => setFilterStatus('pending')}
          >
            Pending
          </button>
          <button
            className={filterStatus === 'completed' ? 'active' : ''}
            onClick={() => setFilterStatus('completed')}
          >
            Completed
          </button>
          <button
            className={filterStatus === 'rewarded' ? 'active' : ''}
            onClick={() => setFilterStatus('rewarded')}
          >
            Rewarded
          </button>
        </div>
      </div>

      {/* Referrals Table */}
      <div className="referrals-table-container">
        <table className="referrals-table">
          <thead>
            <tr>
              <th>Referral Code</th>
              <th>Referrer</th>
              <th>New User</th>
              <th>Status</th>
              <th>Created</th>
              <th>Completed</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '32px' }}>
                  Loading...
                </td>
              </tr>
            ) : filteredReferrals.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '32px' }}>
                  No referrals found
                </td>
              </tr>
            ) : (
              filteredReferrals.map((referral) => (
                <tr key={referral.id}>
                  <td>
                    <span className="referral-code">{referral.referralCode}</span>
                  </td>
                  <td>
                    <div className="user-info">
                      <div className="user-name">{referral.referrerName}</div>
                      <div className="user-type">{referral.referrerType}</div>
                    </div>
                  </td>
                  <td>
                    <div className="user-info">
                      <div className="user-name">{referral.newUserName}</div>
                      <div className="user-type">{referral.newUserType}</div>
                    </div>
                  </td>
                  <td>{getStatusBadge(referral.status)}</td>
                  <td>{new Date(referral.createdAt).toLocaleDateString()}</td>
                  <td>
                    {referral.completedAt
                      ? new Date(referral.completedAt).toLocaleDateString()
                      : '-'}
                  </td>
                  <td>
                    <button className="action-btn view">
                      <FiEye size={14} /> View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Referrals;

