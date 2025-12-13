import React, { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './EmployeeDashboard.css';

// Helper function for consistent date display
const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

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

    // Dummy leave balances (Use actual data fetched from API if available)
    const leaveBalances = {
        casual: 12,
        sick: 7,
        earned: 15
    };

    const fetchLeaves = useCallback(async () => {
        if (!user || !user.id) return; // Check if user and user.id exist
        try {
            const res = await axios.get(`http://localhost:5000/api/leaves/my-leaves/${user.id}`);
            setLeaves(res.data);
        } catch (err) {
            console.error("Error fetching leaves:", err);
            // Optionally set an error state here
        }
    }, [user]);

    useEffect(() => {
        fetchLeaves();
    }, [fetchLeaves]);

    const handleApply = async (e) => {
        e.preventDefault();
        
        // Basic Input Validation
        if (!formData.startDate || !formData.endDate || !formData.reason) {
            alert('Please fill in all required fields.');
            return;
        }
        if (new Date(formData.startDate) > new Date(formData.endDate)) {
            alert('Start date cannot be after end date.');
            return;
        }

        try {
            await axios.post('http://localhost:5000/api/leaves/apply', {
                employeeId: user.id,
                ...formData
            });

            alert('Leave Applied Successfully! Awaiting Manager Approval.');
            // Reset form fields
            setFormData({ startDate: '', endDate: '', leaveType: 'Casual', reason: '' }); 
            fetchLeaves(); // Re-fetch list
            
        } catch (err) {
            console.error("Application error:", err);
            alert(err.response?.data?.msg || 'Error applying for leave. Please check server connection.');
        }
    };

    const handleCancel = async (id) => {
        if (!window.confirm("Are you sure you want to cancel this pending request?")) return;

        try {
            await axios.delete(`http://localhost:5000/api/leaves/${id}`);
            alert('Leave Cancelled');
            fetchLeaves();
        } catch (err) {
            console.error("Cancellation error:", err);
            alert(err.response?.data?.msg || 'Error cancelling leave. Only pending leaves can be cancelled.');
        }
    };

    return (
        <div className="emp-container">

            {/* 1. Header and Welcome */}
            <header className="emp-header">
                <h2>👋 Welcome, {user?.name || 'Employee'}</h2>
                <button className="logout-btn" onClick={() => { logout(); navigate('/'); }}>
                    Logout
                </button>
            </header>

            {/* 2. Leave Summary Cards */}
            <div className="leave-cards">
                <div className="leave-card border-casual">
                    <h4>Casual Leave Remaining</h4>
                    <p className="leave-count">{leaveBalances.casual}</p>
                </div>

                <div className="leave-card border-sick">
                    <h4>Sick Leave Remaining</h4>
                    <p className="leave-count">{leaveBalances.sick}</p>
                </div>

                <div className="leave-card border-earned">
                    <h4>Earned Leave Remaining</h4>
                    <p className="leave-count">{leaveBalances.earned}</p>
                </div>
            </div>
            
            {/* 3. Main Content Grid: Form (Left) and History (Right) */}
            <div className="dashboard-content-grid">
                
                {/* A. Apply Leave Form Card */}
                <div className="leave-form-card">
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
                            placeholder="Briefly describe your reason for taking leave."
                            required
                        />

                        <button type="submit" className="apply-btn">Submit Request</button>
                    </form>
                </div>

                {/* B. Leave History Table Card */}
                <div className="table-card">
                    <div className="section-title">My Leave History</div>
                    
                    <div className="table-container">
                        <table className="leave-table">
                            <thead>
                                <tr>
                                    <th>Type</th>
                                    <th>From</th>
                                    <th>To</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {leaves.length > 0 ? (
                                    leaves.map((leave) => (
                                        <tr key={leave._id}>
                                            <td>{leave.leaveType}</td>
                                            <td>{formatDate(leave.startDate)}</td>
                                            <td>{formatDate(leave.endDate)}</td>
                                            <td className={`status ${leave.status?.toLowerCase()}`}>
                                                {leave.status}
                                            </td>
                                            <td>
                                                {/* Only allow cancellation if status is Pending */}
                                                {leave.status === 'Pending' ? (
                                                    <button className="cancel-btn" onClick={() => handleCancel(leave._id)}>
                                                        Cancel
                                                    </button>
                                                ) : (
                                                    <span style={{ color: '#ccc', fontSize: '0.85rem' }}>N/A</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>
                                            No leave history found. Apply for your first leave!
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div> {/* End dashboard-content-grid */}

        </div>
    );
};

export default EmployeeDashboard;