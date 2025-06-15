import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import LoginPage from './pages/LoginPage';
import CartPage from './pages/Cart-Page';
import MonthlyCart from './pages/MonthlyCart';
import CollabCart from './pages/Collaboration-cart'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/monthly-cart" element={<MonthlyCart />} />
        <Route path="/Collaboration-cart" element={<CollabCart />} />
      </Routes>
    </Router>
  );
}

export default App;

