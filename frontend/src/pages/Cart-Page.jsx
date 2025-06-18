// src/pages/CartPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { regularCartAPI } from '../services/api';
import '../components/CartItem.css';
import CartItem from '../components/CartItem';
import Breadcrumbs from '../components/Breadcrumbs';
import Header from '../components/Header.jsx';

const CartPage = () => {
  const { user, logout } = useAuth();
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
      
      const response = await regularCartAPI.getRegularCart(user.id);
      
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
        setError('Failed to load cart');
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      setError('Error loading cart');
    } finally {
      setLoading(false);
    }
  };
  const updateQuantity = async (id, type) => {
    try {
      const item = items.find(item => item.id === id);
      if (!item) return;

      const newQty = type === 'increase' ? item.quantity + 1 : item.quantity - 1;
      const finalQty = Math.max(1, newQty);

      // Update backend
      const response = await regularCartAPI.updateRegularCartQuantity(user.id, id, finalQty);
      
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
      const response = await regularCartAPI.removeFromRegularCart(user.id, id);
      
      if (response.success) {
        // Update local state
        const updatedItems = items.filter(item => item.id !== id);
        setItems(updatedItems);
        const updatedSelected = selectedItems.filter(selectedId => selectedId !== id);
        setSelectedItems(updatedSelected);
        setSelectAll(updatedSelected.length === updatedItems.length);
      } else {
        console.error('Failed to remove item:', response.message);
      }
    } catch (error) {
      console.error('Error removing item:', error);
    }
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
    setSelectAll(newSelectedItems.length === items.length);
  };
  const total = items
    .filter(item => selectedItems.includes(item.id))
    .reduce((sum, item) => sum + item.price * item.quantity, 0);  const goToMonthly = () => navigate('/monthly-cart');
  const goToCollab = () => navigate('/collaboration-cart');

  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      alert('Please select items to checkout');
      return;
    }

    // Get selected items with full details
    const selectedItemsData = items.filter(item => selectedItems.includes(item.id));
    
    // Navigate to checkout page with selected items
    navigate('/checkout', { 
      state: { 
        selectedItems: selectedItemsData,
        totalAmount: total 
      } 
    });
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="container" style={{ textAlign: 'center', padding: '50px' }}>
          <p>Loading cart...</p>
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

  return (
    <>
      <Header />

      <div className="profile">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Shopping Cart', current: true },
          ]}
        />
      </div>
      
      <div className="container">
        <div className="select-all-container">
          <div className="select-all-box">
            <input type="checkbox" checked={selectAll} onChange={handleSelectAll} />
            <label htmlFor="select-all">Select All</label>
          </div>
          <button className="green-button" onClick={goToMonthly}>Monthly Cart</button>
          <button className="green-button" onClick={goToCollab}>Collaboration Cart</button>
        </div>

        {items.map(item => (
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
      </div>
    </>
  );
};

export default CartPage;
