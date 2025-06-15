// src/components/Header.jsx
import React from 'react';
import './Header.css';
import logo from '../assets/logo.png'; // pastikan ini logo GrocerEase
import cartIcon from '../assets/cart.png'; // ikon keranjang
import bellIcon from '../assets/bell.png'; // ikon notifikasi
import profileIcon from '../assets/user.png'; // ikon profil

const Header = () => {
  return (
    <header className="header">
      <div className="header-left">
        <img src={logo} alt="GrocerEase" className="logo" />
        <span className="brand"></span>
      </div>
      <input type="text" className="search-bar" placeholder="Search here" />
      <div className="header-icons">
        <img src={cartIcon} alt="Cart" className="icon" />
        <img src={bellIcon} alt="Notifications" className="icon" />
        <img src={profileIcon} alt="Profile" className="icon" />
      </div>
    </header>
  );
};

export default Header;
