import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { useAuth } from '../contexts/AuthContext';
import "./RegisterPage.css"
import sidegreen from "../images/sidebar.png"
import hi from "../images/hi.png"
import logoalt from "../images/logoalt.png"

function RegisterPage() {
  const navigate = useNavigate();
  const { register, user, loading: authLoading } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    address: '',
    phoneNumber: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && user) {
      navigate('/home', { replace: true });
    }
  }, [user, authLoading, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await register(formData);

    if (result.success) {
      navigate('/home');
    } else {
      setError(result.message);
    }    setLoading(false);
  };

  // Show loading if auth is still being checked
  if (authLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px',
        fontFamily: 'Poppins, sans-serif'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <div className="page">
      <div className="sidebar">
        <img src={sidegreen || "/placeholder.svg"} alt="sidegreen" className="sidegreen" />
        <div className="sidebar-content">
          <img src={hi || "/placeholder.svg"} alt="hi" className="hi" />
          <div className="logo-welcome-section">
            <img src={logoalt || "/placeholder.svg"} alt="logoalt" className="logoalt" />
            <h1 className="welcome">Welcome back!</h1>
            <button type="button" className="signin-btn" onClick={() => navigate("/")}>
              Sign in
            </button>
          </div>
        </div>
      </div>

      <div className="form-container">
        <h1 className="create">Create Account</h1>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit} className="register-form">
          <input 
            type="text" 
            name="firstName" 
            placeholder="First name" 
            className="form-input" 
            value={formData.firstName}
            onChange={handleChange}
            required 
          />
          <input 
            type="text" 
            name="lastName" 
            placeholder="Last name" 
            className="form-input" 
            value={formData.lastName}
            onChange={handleChange}
            required 
          />
          <input 
            type="text" 
            name="username" 
            placeholder="Username" 
            className="form-input" 
            value={formData.username}
            onChange={handleChange}
            required 
          />
          <input 
            type="email" 
            name="email" 
            placeholder="Email" 
            className="form-input" 
            value={formData.email}
            onChange={handleChange}
            required 
          />
          <input 
            type="text" 
            name="address" 
            placeholder="Address" 
            className="form-input" 
            value={formData.address}
            onChange={handleChange}
            required 
          />
          <input
            type="tel"
            name="phoneNumber"
            placeholder="Phone number (+621234567890)"
            className="form-input"
            value={formData.phoneNumber}
            onChange={handleChange}
            required
          />
          <input 
            type="password" 
            name="password" 
            placeholder="Password" 
            className="form-input" 
            value={formData.password}
            onChange={handleChange}
            required 
          />
          <button 
            type="submit" 
            className="register-signup-btn"
            disabled={loading}
          >
            {loading ? 'Signing Up...' : 'Sign Up'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default RegisterPage
