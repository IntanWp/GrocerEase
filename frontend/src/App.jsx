import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import CartPage from './pages/Cart-Page';
import MonthlyCart from './pages/MonthlyCart';
import CollabCart from './pages/Collaboration-cart';
import CheckoutPage from './pages/CheckOutPage';
import AccountPage from './pages/AccountPage';
import CheckoutResponse from './pages/CheckoutResponse';
import RecipeDetail from './pages/RecipeDetail';
import ProductDetail from './pages/ProductDetail';
import SearchResults from './pages/SearchResults';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
          <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
          <Route path="/monthly-cart" element={<ProtectedRoute><MonthlyCart /></ProtectedRoute>} />
          <Route path="/collaboration-cart" element={<ProtectedRoute><CollabCart /></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
          <Route path="/account" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />                   <Route path="/checkout-response" element={<ProtectedRoute><CheckoutResponse /></ProtectedRoute>} />
          <Route path="/recipe/:id" element={<ProtectedRoute><RecipeDetail /></ProtectedRoute>} />
          <Route path="/product/:id" element={<ProtectedRoute><ProductDetail /></ProtectedRoute>} />
          <Route path="/search" element={<ProtectedRoute><SearchResults /></ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
