import { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './EmployeeDashboard.css';

const EmployeeDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [leaves, setLeaves] = useState([]);
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    leaveType: 'Casual',
    reason: ''
  });

  const fetchLeaves = useCallback(async () => {
    if (!user) return;
    try {
      const res = await axios.get(`http://localhost:5000/api/leaves/my-leaves/${user.id}`);
      setLeaves(res.data);
    } catch (err) {
      console.error("Error fetching leaves", err);
    }
  }, [user]);

  useEffect(() => {
    fetchLeaves();
  }, [fetchLeaves]);

  const handleApply = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/leaves/apply', {
        employeeId: user.id,
        ...formData
      });

      alert('Leave Applied Successfully!');
      setFormData({ startDate: '', endDate: '', leaveType: 'Casual', reason: '' });
      fetchLeaves();

    } catch (err) {
      alert('Error applying for leave');
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this request?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/leaves/${id}`);
      alert('Leave Cancelled');
      fetchLeaves();
    } catch (err) {
      alert(err.response?.data?.msg || 'Error cancelling leave');
    }
  };

  return (
    <div className="emp-container">

      {/* Header */}
      <div className="emp-header">
        <h2>Welcome, {user?.name}</h2>
        <button className="logout-btn" onClick={() => { logout(); navigate('/'); }}>
          Logout
        </button>
      </div>

      {/* Leave Summary Cards */}
      <div className="leave-cards">

        <div className="leave-card border-casual">
          <h4>Casual Leave</h4>
          <p className="leave-count">12</p>
        </div>

        <div className="leave-card border-sick">
          <h4>Sick Leave</h4>
          <p className="leave-count">7</p>
        </div>

        <div className="leave-card border-earned">
          <h4>Earned Leave</h4>
          <p className="leave-count">15</p>
        </div>

      </div>

      {/* Apply Form */}
      <div className="section-title">Apply for Leave</div>

      <form className="leave-form" onSubmit={handleApply}>
        <label>Start Date</label>
        <input
          type="date"
          value={formData.startDate}
          onChange={e => setFormData({ ...formData, startDate: e.target.value })}
          required
        />

        <label>End Date</label>
        <input
          type="date"
          value={formData.endDate}
          onChange={e => setFormData({ ...formData, endDate: e.target.value })}
          required
        />

        <label>Leave Type</label>
        <select
          value={formData.leaveType}
          onChange={e => setFormData({ ...formData, leaveType: e.target.value })}
        >
          <option>Casual</option>
          <option>Sick</option>
          <option>Earned</option>
        </select>

        <label>Reason</label>
        <textarea
          value={formData.reason}
          onChange={e => setFormData({ ...formData, reason: e.target.value })}
          required
        />

        <button type="submit" className="apply-btn">Submit Request</button>
      </form>

      {/* Leave History Table */}
      <div className="section-title">My Leave History</div>

      <div className="table-container">
        <table className="leave-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>From</th>
              <th>To</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Manager Comment</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {leaves.map((leave) => (
              <tr key={leave._id}>
                <td>{leave.leaveType}</td>
                <td>{new Date(leave.startDate).toLocaleDateString()}</td>
                <td>{new Date(leave.endDate).toLocaleDateString()}</td>
                <td>{leave.reason}</td>

                <td className={`status ${leave.status.toLowerCase()}`}>
                  {leave.status}
                </td>

                <td>{leave.managerComment || '-'}</td>

                <td>
                  {leave.status === 'Pending' && (
                    <button className="cancel-btn" onClick={() => handleCancel(leave._id)}>
                      Cancel
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

export default EmployeeDashboard;
