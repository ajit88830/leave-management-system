import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './ManagerDashboard.css'; 

// 🚀 FIX: Define the base URL dynamically
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Helper function for consistent date display
const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
    });
};

// Helper function to safely get the employee name
const getEmployeeName = (employeeId) => {
    // Check if employeeId is an object and has a name property
    if (employeeId && typeof employeeId === 'object' && employeeId.name) {
        return employeeId.name;
    }
    // If it's just a string ID, return a default or the ID itself (less common)
    if (typeof employeeId === 'string') {
        return `ID: ${employeeId}`;
    }
    // Default fallback
    return 'Unknown Employee';
};


const ManagerDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [leaves, setLeaves] = useState([]);

    useEffect(() => {
        if (user) fetchAllLeaves();
    }, [user]);

    const fetchAllLeaves = async () => {
        try {
            // 🎯 FIXED URL
            const res = await axios.get(`${API_BASE_URL}/api/leaves/all`);
            setLeaves(res.data);
        } catch (err) {
            console.error("Error fetching leaves:", err);
        }
    };

    const handleAction = async (id, status) => {
        const comment = prompt(`Enter comment for ${status} (Optional, press OK to submit):`);
        try {
            // 🎯 FIXED URL
            await axios.put(`${API_BASE_URL}/api/leaves/${id}`, {
                status,
                managerComment: comment
            });
            alert(`Leave ${status} Successfully`);
            fetchAllLeaves();
        } catch (err) {
            console.error("Error updating leave:", err);
            alert(err.response?.data?.msg || 'Error updating leave. Check console for details.');
        }
    };

    const getTileContent = ({ date, view }) => {
        if (view === 'month') {
            const isLeave = leaves.some(leave => {
                if (leave.status !== 'Approved') return false; 
                
                const start = new Date(leave.startDate);
                const end = new Date(leave.endDate);
                
                start.setHours(0, 0, 0, 0);
                end.setHours(0, 0, 0, 0);
                date.setHours(0, 0, 0, 0);
                
                return date >= start && date <= end;
            });
            
            return isLeave ? (
                <div className="calendar-off">OFF</div>
            ) : null;
        }
    };
    
    // Filter pending leaves for the primary table view
    const pendingLeaves = leaves.filter(leave => leave.status === 'Pending');

    return (
        <div className="mgr-container">

            {/* Header */}
            <header className="mgr-header">
                <h2>Manager Dashboard: {user?.name || 'Manager'}</h2>
                <button className="logout-btn" onClick={() => { logout(); navigate('/'); }}>Logout</button>
            </header>

            <div className="mgr-layout">

                {/* LEFT — Table: Focus on Pending Requests */}
                <div className="mgr-table-section">
                    <h3>Pending Leave Requests ({pendingLeaves.length})</h3>

                    <div className="table-wrapper">
                        <div className="table-container">
                            <table className="mgr-table">
                                <thead>
                                    <tr>
                                        <th>Employee</th>
                                        <th>Type</th>
                                        <th>Dates</th>
                                        <th>Reason</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {pendingLeaves.length > 0 ? (
                                        pendingLeaves.map(leave => (
                                            <tr key={leave._id}>
                                                {/* FIXED: Use the robust helper function */}
                                                <td>{getEmployeeName(leave.employeeId)}</td> 
                                                <td>{leave.leaveType}</td>
                                                <td>
                                                    {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                                                </td>
                                                <td>{leave.reason}</td>
                                                <td className="action-buttons-group">
                                                    <button 
                                                        className="approve-btn" 
                                                        onClick={() => handleAction(leave._id, 'Approved')}
                                                    >
                                                        Approve
                                                    </button>

                                                    <button 
                                                        className="reject-btn"
                                                        onClick={() => handleAction(leave._id, 'Rejected')}
                                                    >
                                                        Reject
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>
                                                🎉 All caught up! No pending requests.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>

                            </table>
                        </div>
                    </div>
                </div>

                {/* RIGHT — Calendar/Availability */}
                <div className="mgr-calendar-section">
                    <h3>Team Availability</h3>

                    <div className="calendar-box">
                        <Calendar tileContent={getTileContent} />
                    </div>
                    

                    <p className="calendar-note">
                        * Dates marked <span className="calendar-off" style={{display: 'inline'}}>OFF</span> indicate approved leave by team members.
                    </p>
                </div>

            </div>
        </div>
    );
};

export default ManagerDashboard;