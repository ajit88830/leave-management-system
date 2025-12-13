import React, { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './EmployeeDashboard.css';

// 🚀 FIX: Define the base URL dynamically
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Helper function for consistent date display
const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

// Helper function: Calculate days between two dates
const getDaysDiff = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Add 1 day to include both the start and end date
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
};


const EmployeeDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const [leaves, setLeaves] = useState([]);
    const [leaveBalances, setLeaveBalances] = useState({
        casual: 12, // Initial total allowance
        sick: 7,    // Initial total allowance
        earned: 15  // Initial total allowance
    });
    
    const [formData, setFormData] = useState({
        startDate: '',
        endDate: '',
        leaveType: 'Casual',
        reason: ''
    });

    // --- NEW FUNCTION: Calculate Balances based on fetched leaves ---
    const calculateBalances = useCallback((fetchedLeaves) => {
        // Start with the full initial allowance (Simulating backend allowance)
        let newBalances = { casual: 12, sick: 7, earned: 15 };

        fetchedLeaves.forEach(leave => {
            // Only count APPROVED leaves against the balance
            if (leave.status === 'Approved') {
                const days = getDaysDiff(leave.startDate, leave.endDate);
                const type = leave.leaveType.toLowerCase();

                // Subtract approved days from the corresponding balance
                if (newBalances[type] !== undefined) {
                    newBalances[type] = Math.max(0, newBalances[type] - days); // Ensure balance doesn't go below 0
                }
            }
        });

        setLeaveBalances(newBalances);
    }, []);
    // --- END NEW FUNCTION ---

    const fetchLeaves = useCallback(async () => {
        if (!user || !user.id) return;
        try {
            // 🎯 FIXED URL
            const res = await axios.get(`${API_BASE_URL}/api/leaves/my-leaves/${user.id}`);
            const fetchedLeaves = res.data;
            setLeaves(fetchedLeaves);
            
            // 2. SYNCHRONIZE: Update balances immediately after fetching history
            calculateBalances(fetchedLeaves); 

        } catch (err) {
            console.error("Error fetching leaves:", err);
        }
    }, [user, calculateBalances]);

    useEffect(() => {
        fetchLeaves();
    }, [fetchLeaves]);

    const handleApply = async (e) => {
        e.preventDefault();
        
        // ... (Input Validation remains the same) ...
        if (!formData.startDate || !formData.endDate || !formData.reason) {
            alert('Please fill in all required fields.');
            return;
        }
        if (new Date(formData.startDate) > new Date(formData.endDate)) {
            alert('Start date cannot be after end date.');
            return;
        }

        try {
            // 🎯 FIXED URL
            await axios.post(`${API_BASE_URL}/api/leaves/apply`, {
                employeeId: user.id,
                ...formData
            });

            alert('Leave Applied Successfully! Awaiting Manager Approval.');
            setFormData({ startDate: '', endDate: '', leaveType: 'Casual', reason: '' }); 
            
            // 3. SYNCHRONIZE: Re-fetch list to see the "Pending" status
            fetchLeaves(); 
            
        } catch (err) {
            console.error("Application error:", err);
            alert(err.response?.data?.msg || 'Error applying for leave. Please check server connection.');
        }
    };

    const handleCancel = async (id) => {
        if (!window.confirm("Are you sure you want to cancel this pending request?")) return;

        try {
            // 🎯 FIXED URL
            await axios.delete(`${API_BASE_URL}/api/leaves/${id}`);
            alert('Leave Cancelled');
            
            // 4. SYNCHRONIZE: Re-fetch list, which automatically updates the balances
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

            {/* 2. Leave Summary Cards (Now uses dynamic state) */}
            <div className="leave-cards">
                <div className="leave-card border-casual">
                    <h4>Casual Leave Remaining</h4>
                    {/* Access state data */}
                    <p className="leave-count">{leaveBalances.casual}</p> 
                </div>

                <div className="leave-card border-sick">
                    <h4>Sick Leave Remaining</h4>
                    {/* Access state data */}
                    <p className="leave-count">{leaveBalances.sick}</p> 
                </div>

                <div className="leave-card border-earned">
                    <h4>Earned Leave Remaining</h4>
                    {/* Access state data */}
                    <p className="leave-count">{leaveBalances.earned}</p>
                </div>
            </div>
            
            {/* 3. Main Content Grid: Form (Left) and History (Right) */}
            <div className="dashboard-content-grid">
                
                {/* A. Apply Leave Form Card (JSX is unchanged) */}
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

                {/* B. Leave History Table Card (JSX is unchanged) */}
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