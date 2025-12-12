import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './ManagerDashboard.css';  // <-- NEW CSS FILE

const ManagerDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [leaves, setLeaves] = useState([]);

  useEffect(() => {
    if (user) fetchAllLeaves();
  }, [user]);

  const fetchAllLeaves = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/leaves/all');
      setLeaves(res.data);
    } catch (err) {
      console.error("Error fetching leaves", err);
    }
  };

  const handleAction = async (id, status) => {
    const comment = prompt(`Enter comment for ${status} (Optional):`);
    try {
      await axios.put(`http://localhost:5000/api/leaves/${id}`, {
        status,
        managerComment: comment
      });
      alert(`Leave ${status} Successfully`);
      fetchAllLeaves();
    } catch (err) {
      alert('Error updating leave');
    }
  };

  const getTileContent = ({ date, view }) => {
    if (view === 'month') {
      const isLeave = leaves.some(leave => {
        const start = new Date(leave.startDate);
        const end = new Date(leave.endDate);
        start.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);
        date.setHours(0, 0, 0, 0);
        return leave.status === 'Approved' && date >= start && date <= end;
      });
      return isLeave ? (
        <div className="calendar-off">OFF</div>
      ) : null;
    }
  };

  return (
    <div className="mgr-container">

      {/* Header */}
      <div className="mgr-header">
        <h2>Manager Dashboard: {user?.name}</h2>
        <button className="logout-btn" onClick={() => { logout(); navigate('/'); }}>Logout</button>
      </div>

      <div className="mgr-layout">

        {/* LEFT — Table */}
        <div className="mgr-table-section">
          <h3>Pending Leave Requests</h3>

          <div className="table-wrapper">
            <table className="mgr-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Type</th>
                  <th>Dates</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {leaves.map(leave => (
                  <tr key={leave._id}>
                    <td>{leave.employeeId?.name || 'Unknown'}</td>
                    <td>{leave.leaveType}</td>
                    <td>
                      {new Date(leave.startDate).toLocaleDateString()} - 
                      {new Date(leave.endDate).toLocaleDateString()}
                    </td>
                    <td>{leave.reason}</td>
                    <td className={`status ${leave.status.toLowerCase()}`}>{leave.status}</td>

                    <td>
                      {leave.status === 'Pending' ? (
                        <>
                          <button 
                            className="approve-btn" 
                            onClick={() => handleAction(leave._id, 'Approved')}
                          >
                            ✓
                          </button>

                          <button 
                            className="reject-btn"
                            onClick={() => handleAction(leave._id, 'Rejected')}
                          >
                            ✗
                          </button>
                        </>
                      ) : (
                        <span>-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        </div>

        {/* RIGHT — Calendar */}
        <div className="mgr-calendar-section">
          <h3>Team Availability</h3>

          <div className="calendar-box">
            <Calendar tileContent={getTileContent} />
          </div>

          <p className="calendar-note">
            * Dates marked "OFF" indicate approved leave.
          </p>
        </div>

      </div>
    </div>
  );
};

export default ManagerDashboard;
