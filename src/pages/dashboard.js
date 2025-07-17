import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaParking,
  FaUsers,
  FaClock,
  FaEnvelope,
  FaCog,
  FaBell,
} from 'react-icons/fa';
import 'assets/dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="dashboard">
      <h2>Welcome back, Admin Joseph!</h2>
      <div className="dashboard-cards">

        <div className="card" onClick={() => navigate('/parkingspaces')}>
          <FaParking className="card-icon" />
          <h3>Parking Spaces</h3>
        </div>

        <div className="card" onClick={() => navigate('/userlist')}>
          <FaUsers className="card-icon" />
          <h3>User List</h3>
        </div>

        <div className="card" onClick={() => navigate('/pendinglist')}>
          <FaClock className="card-icon" />
          <h3>Pending List</h3>
        </div>

        <div className="card" onClick={() => navigate('/messages')}>
          <FaEnvelope className="card-icon" />
          <h3>Messages</h3>
        </div>

        <div className="card" onClick={() => navigate('/settings')}>
          <FaCog className="card-icon" />
          <h3>Settings</h3>
        </div>

        <div className="card" onClick={() => navigate('/notifications')}>
          <FaBell className="card-icon" />
          <h3>Notifications</h3>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
