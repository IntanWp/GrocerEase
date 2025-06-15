// src/App.jsx
import React, { useState } from 'react';
import './components/CartItem.css';
import CartItem from './components/CartItem';
import riceImg from './assets/rice.jpg';
import oysterImg from './assets/oyster.webp';
import soySauceImg from './assets/soy_sauce.jpg';
import sirloinImg from './assets/sirloin.jpg';
import Breadcrumbs from './components/Breadcrumbs';
import Header from './components/Header';
import Button from './components/ButtonStyles';

const App = () => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  const [items, setItems] = useState([
    { id: 1, name: 'Rice 5 Kg', price: 25000, img: riceImg, quantity: 1 },
    { id: 2, name: 'Oyster Sauce 500ml', price: 25000, img: oysterImg, quantity: 1 },
    { id: 3, name: 'Sweet Soy Sauce 500ml', price: 25000, img: soySauceImg, quantity: 1 },
    { id: 4, name: 'Pieces of Raw Sirloin', price: 25000, img: sirloinImg, quantity: 1 },
  ]);

  const updateQuantity = (id, type) => {
  const updatedItems = items.map(item => {
    if (item.id === id) {
      const newQty = type === 'increase' ? item.quantity + 1 : item.quantity - 1;
      return { ...item, quantity: Math.max(1, newQty) }; // quantity minimal 1
    }
    return item;
  });
  setItems(updatedItems);
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
      <div className="profile-section">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Shopping Cart', href: '/cart' },
            { label: 'Collaboration Cart', current: true }
          ]}
        />
      </div>
      
      <Button />

      {/* Main Content */}
      <div className="container">
        <div className="select-all-section">
          <input
            type="checkbox"
            id="select-all"
            checked={selectAll}
            onChange={handleSelectAll}
          />
          <label htmlFor="select-all">Select All</label>
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

export default App;
