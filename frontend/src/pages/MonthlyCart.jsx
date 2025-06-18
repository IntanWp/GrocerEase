// src/pages/MonthlyCart.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { monthlyCartAPI } from '../services/api';
import '../components/CartItem.css';
import CartItem from '../components/CartItem';
import Breadcrumbs from '../components/Breadcrumbs';
import Header from '../components/Header';

const MonthlyCart = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user && user.id) {
      fetchCartData();
    }
  }, [user]);

  const fetchCartData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await monthlyCartAPI.getMonthlyCart(user.id);
      
      if (response.success) {
        // Transform backend data to frontend format
        const transformedItems = response.cart.items
          .filter(item => item.product) // Only include items with valid products
          .map(item => ({
            id: item.productId,
            name: item.product.name,
            price: item.product.price,
            img: item.product.image,
            quantity: item.quantity
          }));
        
        setItems(transformedItems);
      } else {
        setError('Failed to load monthly cart');
      }
    } catch (error) {
      console.error('Error fetching monthly cart:', error);
      setError('Error loading monthly cart');
    } finally {
      setLoading(false);
    }
  };  const updateQuantity = async (id, type) => {
    try {
      const item = items.find(item => item.id === id);
      if (!item) return;

      const newQty = type === 'increase' ? item.quantity + 1 : item.quantity - 1;
      const finalQty = Math.max(1, newQty);

      // Update backend
      const response = await monthlyCartAPI.updateMonthlyCartQuantity(user.id, id, finalQty);
      
      if (response.success) {
        // Update local state
        const updatedItems = items.map(item => {
          if (item.id === id) {
            return { ...item, quantity: finalQty };
          }
          return item;
        });
        setItems(updatedItems);
      } else {
        console.error('Failed to update quantity:', response.message);
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const handleRemoveItem = async (id) => {
    try {
      // Remove from backend
      const response = await monthlyCartAPI.removeFromMonthlyCart(user.id, id);
      
      if (response.success) {
        // Update local state
        const updatedItems = items.filter(item => item.id !== id);
        setItems(updatedItems);
        const updatedSelected = selectedItems.filter(selectedId => selectedId !== id);
        setSelectedItems(updatedSelected);
        setSelectAll(updatedSelected.length === updatedItems.length && updatedItems.length > 0);
      } else {
        console.error('Failed to remove item:', response.message);
      }
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };
  const total = items
    .filter(item => selectedItems.includes(item.id))
    .reduce((sum, item) => sum + item.price * item.quantity, 0);

  const goToRegular = () => navigate('/cart');
  const goToCollab = () => navigate('/collaboration-cart');

  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      alert('Please select items to checkout');
      return;
    }

    // Get selected items with full details
    const selectedItemsData = items.filter(item => selectedItems.includes(item.id));
    
    // Navigate to checkout page with selected items and cart type
    navigate('/checkout', { 
      state: { 
        selectedItems: selectedItemsData,
        totalAmount: total,
        cartType: 'monthly'
      } 
    });
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedItems([]);
      setSelectAll(false);
    } else {
      const allIds = items.map(item => item.id);
      setSelectedItems(allIds);
      setSelectAll(true);
    }
  };

  const handleToggleItem = (itemId) => {
    const isChecked = selectedItems.includes(itemId);
    const newSelectedItems = isChecked
      ? selectedItems.filter(id => id !== itemId)
      : [...selectedItems, itemId];

    setSelectedItems(newSelectedItems);
    setSelectAll(newSelectedItems.length === items.length && items.length > 0);
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="container" style={{ textAlign: 'center', padding: '50px' }}>
          <p>Loading monthly cart...</p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="container" style={{ textAlign: 'center', padding: '50px' }}>
          <p>Error: {error}</p>
          <button onClick={fetchCartData}>Retry</button>
        </div>
      </>
    );
  }
  // Remove empty cart redirect - show main UI regardless

  return (
    <>
      <Header />

      {/* Breadcrumb Navigation */}
      <div className="profile">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Shopping Cart', href: '/cart' },
            { label: 'Monthly Cart', current: true }
          ]}
        />
      </div>

      {/* Main Content */}
      <div className="container">        <div className="select-all-container">
          <div className="select-all-box">
            <input
              type="checkbox"
              id="select-all"
              checked={selectAll}
              onChange={handleSelectAll}
            />
            <label htmlFor="select-all">Select All</label>
          </div>
          <button className="green-button" onClick={goToRegular}>Regular Cart</button>
          <button className="green-button" onClick={goToCollab}>Collaboration Cart</button>
        </div>        {items.map(item => (
          <CartItem
            key={item.id}
            {...item}
            isSelected={selectedItems.includes(item.id)}
            onToggle={() => handleToggleItem(item.id)}
            onIncrease={() => updateQuantity(item.id, 'increase')}
            onDecrease={() => updateQuantity(item.id, 'decrease')}
            onRemove={() => handleRemoveItem(item.id)}
          />
        ))}

        {/* Empty cart message when no items */}
        {items.length === 0 && (
          <div 
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '200px',
              textAlign: 'center'
            }}
          >
            <p style={{ fontSize: '1.2rem', color: '#555' }}>
              Your shopping cart is empty. Start adding items!
            </p>
          </div>
        )}

        {/* Checkout Footer - only show when there are items */}
        {items.length > 0 && (
          <div className="checkout-footer">
            <div className="total-shape">
              <div className="total">
                <span>Total Price</span>
                <span className="total-value">Rp {total.toLocaleString('id-ID')},00</span>
              </div>
            </div>
            <button 
              className="checkout-button" 
              disabled={selectedItems.length === 0}
              onClick={handleCheckout}
            >
              Check Out
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default MonthlyCart;
