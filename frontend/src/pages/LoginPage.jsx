import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '@fontsource/poppins/300.css';
import '@fontsource/poppins/400.css';
import '@fontsource/poppins/600.css';
import '@fontsource/poppins/700.css';
import './LoginPage.css';
import logo from '../images/logo.png';
import userIcon from '../images/user.png';
import lockIcon from '../images/lock.png';
import belanjaan from '../images/belanjaan.png';

function LoginPage() {
  const navigate = useNavigate();
  const { login, user, loading: authLoading } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
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

    const result = await login(formData);

    if (result.success) {
      navigate('/home');
    } else {
      setError(result.message);
    }

    setLoading(false);
  };

  return (
    <div>
      <div className="login-container">
        <div className="tagline-container">
          <div className="login-logo">
            <img src={logo} alt="logo" />
          </div>
          <h1 className="tagline">Organic & Healthy <br /> Products</h1>
          <p className="desc">
            Access your personalized grocery lists, add ingredients from your 
            favorite recipes directly to your cart, track your orders in real-time, 
            and discover high quality deals tailored just for you.
          </p>

          {error && <div className="error-message">{error}</div>}
          <form className='login-form' onSubmit={handleSubmit}>
            <div className="input-container">
              <img src={userIcon} alt="User Icon" className="input-icon" />
              <input 
                type="text" 
                name="username" 
                placeholder="Username" 
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-container">
              <img src={lockIcon} alt="Password Icon" className="input-icon" />
              <input 
                type="password" 
                name="password" 
                placeholder="Password" 
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-buttons">
              <button 
                type="submit" 
                className="login-btn"
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
              <button type="button" className="signup-btn" onClick={() => navigate('/register')}>Sign Up</button>
            </div>  
          </form>
        </div>

        <div className="belanjaan-container">
          <img src={belanjaan} alt="belanjaan" />
        </div>
      </div>
    </div>
  );
}

export default LoginPage;

