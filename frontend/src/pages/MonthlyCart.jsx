// src/App.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { monthlyCartAPI } from '../services/api';
import '../components/CartItem.css';
import CartItem from '../components/CartItem';
import Breadcrumbs from '../components/Breadcrumbs';
import Header from '../components/Header';

const MonthlyCart = () => {
  const { user } = useAuth();
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
  };
  const updateQuantity = async (id, type) => {
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

  const total = items
  .filter(item => selectedItems.includes(item.id))
  .reduce((sum, item) => sum + item.price * item.quantity, 0);

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

  const totalPrice = selectedItems.length * 25000; // Assuming each item is 25000

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
      <div className="container">
        <div className="select-all-container">
          <div className="select-all-box">
          <input
            type="checkbox"
            id="select-all"
            checked={selectAll}
            onChange={handleSelectAll}
          />
          <label htmlFor="select-all">Select All</label>
        </div>
        </div>

        {items.map(item => (
          <CartItem
            key={item.id}
            {...item}
            isSelected={selectedItems.includes(item.id)}
            onToggle={() => {
              const isChecked = selectedItems.includes(item.id);
              if (isChecked) {
                setSelectedItems(selectedItems.filter(id => id !== item.id));
                setSelectAll(false);
              } else {
                const newSelected = [...selectedItems, item.id];
                setSelectedItems(newSelected);
                if (newSelected.length === items.length) {
                  setSelectAll(true);
                }
              }
            }}
            onIncrease={() => updateQuantity(item.id, 'increase')}
            onDecrease={() => updateQuantity(item.id, 'decrease')}
          />
        ))}

        {/* Checkout Footer */}
        <div className="checkout-footer">
          <div className="total-shape">
            <div className="total">
              <span>Total Price</span>
              <span1>Rp {total.toLocaleString('id-ID')},00</span1>
            </div>
          </div>
          <button className="checkout-button">Check Out</button>
        </div>
      </div>
    </>
  );
};

export default MonthlyCart;
