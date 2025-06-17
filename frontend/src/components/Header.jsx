import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import "./Header.css"
import logo from "../images/logoalt.png"
import cartIcon from "../images/cart.png"
import profileIcon from "../images/user1.png"

const Header = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="header">
      <div className="header-left">
        <div className="logo-link" onClick={() => navigate('/home')} style={{ cursor: 'pointer' }}>
          <img src={logo || "/placeholder.svg"} alt="GrocerEase" className="logo" />
          <span className="brand"></span>
        </div>
      </div>
      <input type="text" className="search-bar" placeholder="Search here" />
      <div className="header-icons">
        <div className="icon-link" onClick={() => navigate('/cart')} style={{ cursor: 'pointer' }}>
          <img src={cartIcon || "/placeholder.svg"} alt="Cart" className="icon" />
        </div>
        <div className="icon-link" onClick={() => navigate('/account')} style={{ cursor: 'pointer' }}>
          <img src={profileIcon || "/placeholder.svg"} alt="Profile" className="icon" />
        </div>
        {user && (
          <div className="user-info">
            <span>Hello, {user.firstName || 'User'}</span>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header

