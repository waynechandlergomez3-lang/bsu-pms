import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import 'assets/forgotpassword.css';

function ForgotPassword() {
  const [values, setValues] = useState({
    email: '',
    code: '',
    newPassword: '',
    repeatPassword: ''
  });

  const handleChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const handleSendCode = () => {
    // Placeholder for sending code logic
    console.log('Code sent to:', values.email);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Placeholder for submit logic
    console.log('Form submitted:', values);
  };

  return (
    <div className="forgot-wrapper">
      <div className="forgot-left">
        <div className="forgot-form-container">
          <img
            src={require('assets/logo.png')}
            alt="BulSU Logo"
            className="forgot-logo"
          />
          <h2 className="forgot-title">Forgot Password</h2>
          <p className="forgot-subtitle">Enter your email to recover your password</p>

          <form onSubmit={handleSubmit}>
            <input
              type="email"
              name="email"
              placeholder="Email address"
              value={values.email}
              onChange={handleChange}
              className="forgot-input"
            />

            <input
              type="text"
              name="code"
              placeholder="Verification code"
              value={values.code}
              onChange={handleChange}
              className="forgot-input"
            />

            <input
              type="password"
              name="newPassword"
              placeholder="New password"
              value={values.newPassword}
              onChange={handleChange}
              className="forgot-input"
            />

            <input
              type="password"
              name="repeatPassword"
              placeholder="Repeat new password"
              value={values.repeatPassword}
              onChange={handleChange}
              className="forgot-input"
            />

            <div className="button-group">
              <button
                type="button"
                className="send-code-button"
                onClick={handleSendCode}
              >
                Send Code
              </button>
              <button type="submit" className="forgot-button">Submit</button>
            </div>

            <p className="back-link">
              <Link to="/admin/sign-in">← Back to Login</Link>
            </p>
          </form>
        </div>
      </div>

      <div className="forgot-right">
        <div className="forgot-overlay">
          <h3 className="forgot-banner-title">BULACAN STATE UNIVERSITY</h3>
          <h4 className="forgot-banner-sub">PARKING MANAGEMENT SYSTEM</h4>
          <p className="forgot-banner-tagline">Drive In. Park Smart. Move On.</p>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
