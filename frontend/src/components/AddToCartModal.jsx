import React, { useState } from 'react';
import { regularCartAPI, monthlyCartAPI, collabCartAPI } from '../services/api';
import './AddToCartModal.css';

const AddToCartModal = ({ 
  isOpen, 
  onClose, 
  product, 
  user, 
  initialQuantity = 1,
  onSuccess 
}) => {
  const [selectedCart, setSelectedCart] = useState('regular');
  const [quantity, setQuantity] = useState(initialQuantity);
  const [isAdding, setIsAdding] = useState(false);

  const handleQuantityChange = (type) => {
    if (type === 'increase') {
      setQuantity(prev => prev + 1);
    } else if (type === 'decrease' && quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleAddToCart = async () => {
    if (!user || !user.id) {
      alert('Please login to add items to cart');
      return;
    }

    if (!product || !product._id) {
      alert('Product information is missing');
      return;
    }

    setIsAdding(true);

    try {
      let response;
      
      switch (selectedCart) {
        case 'regular':
          response = await regularCartAPI.addItemToRegularCart(user.id, product._id, quantity);
          break;
        case 'monthly':
          response = await monthlyCartAPI.addItemToMonthlyCart(user.id, product._id, quantity);
          break;        case 'collaboration':
          // First, try to get user's existing collaboration cart
          const userCartResponse = await collabCartAPI.getUserCart(user.id);
          
          if (userCartResponse.success && userCartResponse.cart) {
            // User has an existing collaboration cart
            response = await collabCartAPI.addItemToCart(userCartResponse.cart._id, product._id, quantity);
          } else {
            // User doesn't have a collaboration cart, create one first
            const createCartResponse = await collabCartAPI.createCart(user.id, {
              allowMembersToInvite: false,
              allowMembersToRemoveItems: true,
              maxMembers: 10
            });
            
            if (createCartResponse.success) {
              response = await collabCartAPI.addItemToCart(createCartResponse.cart._id, product._id, quantity);
            } else {
              throw new Error('Failed to create collaboration cart');
            }
          }
          break;
        default:
          throw new Error('Invalid cart type selected');
      }

      if (response.success) {
        const cartName = selectedCart === 'regular' ? 'Regular Cart' : 
                        selectedCart === 'monthly' ? 'Monthly Cart' : 
                        'Collaboration Cart';
        
        alert(`Added ${quantity} ${product.name}(s) to ${cartName} successfully!`);
        
        if (onSuccess) {
          onSuccess(selectedCart, quantity);
        }
        onClose();
      } else {
        alert('Failed to add item to cart: ' + (response.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add item to cart');
    } finally {
      setIsAdding(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="add-to-cart-modal-overlay" onClick={handleOverlayClick}>
      <div className="add-to-cart-modal">
        <div className="add-to-cart-modal-header">
          <h3>Add to Cart</h3>
          <button className="add-to-cart-modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="add-to-cart-modal-content">
          {product && (
            <div className="add-to-cart-product-info">
              <img 
                src={product.image} 
                alt={product.name}
                className="add-to-cart-product-image"
              />
              <div className="add-to-cart-product-details">
                <h4>{product.name}</h4>
                <p className="add-to-cart-product-price">
                  Rp {product.price?.toLocaleString('id-ID') || '0'}
                </p>
              </div>
            </div>
          )}

          <div className="add-to-cart-quantity-section">
            <label>Quantity:</label>
            <div className="add-to-cart-quantity-controls">
              <button 
                type="button" 
                onClick={() => handleQuantityChange('decrease')}
                disabled={quantity <= 1}
                className="add-to-cart-quantity-btn"
              >
                -
              </button>
              <span className="add-to-cart-quantity-display">{quantity}</span>
              <button 
                type="button" 
                onClick={() => handleQuantityChange('increase')}
                className="add-to-cart-quantity-btn"
              >
                +
              </button>
            </div>
          </div>

          <div className="add-to-cart-selection">
            <label>Choose Cart:</label>
            <div className="add-to-cart-options">
              <label className="add-to-cart-option">
                <input
                  type="radio"
                  name="cartType"
                  value="regular"
                  checked={selectedCart === 'regular'}
                  onChange={(e) => setSelectedCart(e.target.value)}
                />
                <span className="add-to-cart-option-text">
                  <strong>Regular Cart</strong>
                  <small>For immediate purchases</small>
                </span>
              </label>

              <label className="add-to-cart-option">
                <input
                  type="radio"
                  name="cartType"
                  value="monthly"
                  checked={selectedCart === 'monthly'}
                  onChange={(e) => setSelectedCart(e.target.value)}
                />
                <span className="add-to-cart-option-text">
                  <strong>Monthly Cart</strong>
                  <small>For recurring monthly orders</small>
                </span>
              </label>              <label className="add-to-cart-option">
                <input
                  type="radio"
                  name="cartType"
                  value="collaboration"
                  checked={selectedCart === 'collaboration'}
                  onChange={(e) => setSelectedCart(e.target.value)}
                />
                <span className="add-to-cart-option-text">
                  <strong>Collaboration Cart</strong>
                  <small>Share cart with others</small>
                </span>
              </label>
            </div>
          </div>

          <div className="add-to-cart-modal-actions">
            <button 
              className="add-to-cart-modal-cancel" 
              onClick={onClose}
              disabled={isAdding}
            >
              Cancel
            </button>
            <button 
              className="add-to-cart-modal-confirm" 
              onClick={handleAddToCart}
              disabled={isAdding}
            >
              {isAdding ? 'Adding...' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddToCartModal;
