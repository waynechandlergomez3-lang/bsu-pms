import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'assets/Login.css'; 
import { Link } from "react-router-dom";
import axios from 'axios';

function Login() {
  const [values, setValues] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const handleInput = (e) => {
    setValues(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Login attempt with:', values);
    try {
      const response = await axios.post('http://localhost:8000/api/login', values, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      console.log('Login response:', response);
      
      if (response.data.success && response.data.data.token) {
        localStorage.setItem('token', response.data.data.token);
        alert('Login successful!');
        navigate('/home/dashboard');
      } else {
        alert('Login failed: Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      alert('Login failed: ' + (error.response?.data?.message || 'Something went wrong'));
    }
  }

  return (
<div className="login-wrapper">
  <div className="login-left">
    <div className="login-form-container">
      <img src={require('assets/logo.png')} alt="Logo" className="login-logo" />

      <h2 className="login-title">Welcome back!</h2>
      <p className="login-subtitle">Enter your credentials to access your account</p>

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="Email address"
          value={values.email}
          onChange={handleInput}
          className="login-input"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={values.password}
          onChange={handleInput}
          className="login-input"
        />

        <div className="login-options">
          <label>
            <input type="checkbox" /> Remember me
          </label>
        </div>

        <button type="submit" className="login-button">➔ Sign In</button>
        <p className="forgot-link">
          <Link to="/forgotpassword">Forgot Password?</Link>
        </p>
      </form>
    </div>
  </div>

  <div className="login-right">
    <div className="login-overlay">
      <h3 className="login-banner-title">BULACAN STATE UNIVERSITY</h3>
      <h4 className="login-banner-sub">PARKING MANAGEMENT SYSTEM</h4>
      <p className="login-banner-tagline">Drive In. Park Smart. Move On.</p>
    </div>
  </div>
</div>
  )
}

export default Login;
