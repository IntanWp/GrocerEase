// src/components/CartItem.jsx
import React from 'react';

const CartItem = ({
  id, name, price, img, isSelected, onToggle,
  quantity, onIncrease, onDecrease
}) => {
  return (
     <div className="cart-item">
      <input
        type="checkbox"
        checked={isSelected}
        onChange={onToggle}
      />

      <img src={img} alt={name} className="item-image" />

      <div className="item-details">
        <h4>{name}</h4>
        <p>Lorem ipsum dolor sit amet consectetur...</p>
      </div>

      <div className="item-price-section">
        <div className="item-price">Rp {price.toLocaleString('id-ID')},00</div>
        
        <div className="item-controls">
          <div className="quantity-selector">
            <button onClick={onDecrease}>-</button>
            <span>{quantity}</span>
            <button onClick={onIncrease}>+</button>
          </div>
        </div>
      </div>
      <button className="remove-button">×</button>
    </div>
  );
};

export default CartItem;
