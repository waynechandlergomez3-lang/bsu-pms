import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FaTachometerAlt,
  FaCar,
  FaUsers,
  FaEnvelope,
  FaCog
} from 'react-icons/fa';
import 'assets/sidebar.css';

const Sidebar = () => {
  const location = useLocation();

  return (
    <div className="sidebar">
      {/* Logo section with title split into two lines */}
      <Link to="home/dashboard" className="sidebar-logo">
        <img
          src={require('assets/logo.png')}
          alt="Logo"
          className="logo-image"
        />
        <div className="logo-title">
          <div className="logo-line1">PARKING MANAGEMENT</div>
          <div className="logo-line2">SYSTEM</div>
        </div>
      </Link>

      <ul className="sidebar-menu">
        <li className={location.pathname === '/dashboard' ? 'active' : ''}>
          <Link to="home/dashboard">
            <FaTachometerAlt className="sidebar-icon" />
            DASHBOARD
          </Link>
        </li>
        <li className={location.pathname === '/parkingspaces' ? 'active' : ''}>
          <Link to="/home/parkingspaces">
            <FaCar className="sidebar-icon" />
            PARKING SPACES
          </Link>
        </li>
      </ul>

      <ul className="sidebar-menu">
        <li className={location.pathname === '/userlist' ? 'active' : ''}>
          <Link to="/userlist">
            <FaUsers className="sidebar-icon" />
            USER LIST
          </Link>
        </li>
        <li className={location.pathname === '/messages' ? 'active' : ''}>
          <Link to="/messages">
            <FaEnvelope className="sidebar-icon" />
            MESSAGES
          </Link>
        </li>
      </ul>

      <ul className="sidebar-menu">
        <li className={location.pathname === '/settings' ? 'active' : ''}>
          <Link to="/settings">
            <FaCog className="sidebar-icon" />
            SETTINGS
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
