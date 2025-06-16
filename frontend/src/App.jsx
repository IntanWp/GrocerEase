import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import CartPage from './pages/Cart-Page';
import MonthlyCart from './pages/MonthlyCart';
import CollabCart from './pages/Collaboration-cart';
import EmptyCart from './pages/EmptyCart';
import CheckoutPage from './pages/CheckOutPage';
import AccountPage from './pages/AccountPage';
import EmptyMonthlyCart from './pages/EmptyMonthlyCart';
import EmptyCollabCart from './pages/EmptyCollabCart';
import CheckoutResponse from './pages/CheckoutResponse';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/monthly-cart" element={<MonthlyCart />} />
        <Route path="/collaboration-cart" element={<CollabCart />} />
        <Route path="/empty-cart" element={<EmptyCart />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/empty-monthly-cart" element={<EmptyMonthlyCart />} />
        <Route path="/empty-collab-cart" element={<EmptyCollabCart />} />
        <Route path="/checkout-response" element={<CheckoutResponse />} />
      </Routes>
    </Router>
  );
}

export default App;
