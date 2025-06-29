// src/components/CartItem.jsx
import React from "react";
import "./CartItem.css";

const CartItem = ({
  id,
  name,
  price,
  img,
  isSelected,
  onToggle,
  quantity,
  onIncrease,
  onDecrease,
  onRemove
}) => {
  return (
    <div className="cart-item">
      <input
        type="checkbox"
        checked={isSelected}
        onChange={onToggle}
        className="cart-checkbox"
      />

      <img src={img || "/placeholder.svg"} alt={name} className="item-image" />

      <div className="item-details">
        <h4 className="item-name">{name}</h4>
        <p className="item-description">Lorem ipsum dolor sit amet consectetur...</p>
      </div>

      <div className="item-price-section">
        <div className="item-price">Rp {price.toLocaleString("id-ID")},00</div>

        <div className="quantity-controls">
          <button className="quantity-btn" onClick={onDecrease} disabled={quantity <= 1}>-</button>
          <span className="quantity-display">{quantity}</span>
          <button className="quantity-btn" onClick={onIncrease}>+</button>
        </div>
      </div>

      <button className="remove-button" onClick={onRemove}>×</button>
    </div>
  );
};

export default CartItem;
