import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import CartPage from './pages/Cart-Page';
import MonthlyCart from './pages/MonthlyCart';
import CollabCart from './pages/Collaboration-cart';
import EmptyCart from './pages/EmptyCart';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/monthly-cart" element={<MonthlyCart />} />
        <Route path="/Collaboration-cart" element={<CollabCart />} />
        <Route path="/Empty-cart" element={<EmptyCart />} />
      </Routes>
    </Router>
  );
}

export default App;
