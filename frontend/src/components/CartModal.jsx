import React, { useState } from 'react';
import { regularCartAPI, monthlyCartAPI, collabCartAPI } from '../services/api';
import './CartModal.css';

const CartModal = ({ 
  isOpen, 
  onClose, 
  modalType = 'addToCart', // 'addToCart', 'invite', 'leaveCart', 'endCart'
  product = null, 
  user = null, 
  initialQuantity = 1,
  onSuccess = null,
  onConfirm = null,
  title = '',
  message = '',
  confirmText = 'Confirm',
  cancelText = 'Cancel'
}) => {
  // Add to Cart specific state
  const [selectedCart, setSelectedCart] = useState('regular');
  const [quantity, setQuantity] = useState(initialQuantity);
  const [isAdding, setIsAdding] = useState(false);
  
  // Invite specific state
  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);

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
          break;
        case 'collaboration':
          // First, try to get user's existing collaboration cart
          const userCartResponse = await collabCartAPI.getUserCart(user.id);
          
          if (userCartResponse.success && userCartResponse.cart) {
            // User has an existing collaboration cart
            response = await collabCartAPI.addItemToCart(userCartResponse.cart.cartId, product._id, quantity);
          } else {
            // User doesn't have a collaboration cart, create one first
            const createCartResponse = await collabCartAPI.createCart(user.id, {
              allowMembersToInvite: false,
              allowMembersToRemoveItems: true,
              maxMembers: 10
            });
            
            if (createCartResponse.success) {
              response = await collabCartAPI.addItemToCart(createCartResponse.cart.cartId, product._id, quantity);
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

  const handleInvite = async () => {
    if (!inviteEmail.trim()) {
      alert('Please enter an email address');
      return;
    }

    if (!inviteEmail.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }

    setIsInviting(true);

    try {
      if (onConfirm) {
        await onConfirm(inviteEmail);
      }
      setInviteEmail('');
      onClose();
    } catch (error) {
      console.error('Error sending invite:', error);
    } finally {
      setIsInviting(false);
    }
  };

  const handleConfirmAction = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const renderModalContent = () => {
    switch (modalType) {
      case 'addToCart':
        return (
          <>
            <div className="cart-modal-header">
              <h3>Add to Cart</h3>
              <button className="cart-modal-close" onClick={onClose}>×</button>
            </div>

            <div className="cart-modal-content">
              {product && (
                <div className="cart-product-info">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="cart-product-image"
                  />
                  <div className="cart-product-details">
                    <h4>{product.name}</h4>
                    <p className="cart-product-price">
                      Rp {product.price?.toLocaleString('id-ID') || '0'}
                    </p>
                  </div>
                </div>
              )}

              <div className="cart-quantity-section">
                <label>Quantity:</label>
                <div className="cart-quantity-controls">
                  <button 
                    type="button" 
                    onClick={() => handleQuantityChange('decrease')}
                    disabled={quantity <= 1}
                    className="cart-quantity-btn"
                  >
                    -
                  </button>
                  <span className="cart-quantity-display">{quantity}</span>
                  <button 
                    type="button" 
                    onClick={() => handleQuantityChange('increase')}
                    className="cart-quantity-btn"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="cart-selection">
                <label>Choose Cart:</label>
                <div className="cart-options">
                  <label className="cart-option">
                    <input
                      type="radio"
                      name="cartType"
                      value="regular"
                      checked={selectedCart === 'regular'}
                      onChange={(e) => setSelectedCart(e.target.value)}
                    />
                    <span className="cart-option-text">
                      <strong>Regular Cart</strong>
                      <small>For immediate purchases</small>
                    </span>
                  </label>

                  <label className="cart-option">
                    <input
                      type="radio"
                      name="cartType"
                      value="monthly"
                      checked={selectedCart === 'monthly'}
                      onChange={(e) => setSelectedCart(e.target.value)}
                    />
                    <span className="cart-option-text">
                      <strong>Monthly Cart</strong>
                      <small>For recurring monthly orders</small>
                    </span>
                  </label>

                  <label className="cart-option">
                    <input
                      type="radio"
                      name="cartType"
                      value="collaboration"
                      checked={selectedCart === 'collaboration'}
                      onChange={(e) => setSelectedCart(e.target.value)}
                    />
                    <span className="cart-option-text">
                      <strong>Collaboration Cart</strong>
                      <small>Share cart with others</small>
                    </span>
                  </label>
                </div>
              </div>

              <div className="cart-modal-actions">
                <button 
                  className="cart-modal-cancel" 
                  onClick={onClose}
                  disabled={isAdding}
                >
                  Cancel
                </button>
                <button 
                  className="cart-modal-confirm" 
                  onClick={handleAddToCart}
                  disabled={isAdding}
                >
                  {isAdding ? 'Adding...' : 'Add to Cart'}
                </button>
              </div>
            </div>
          </>
        );

      case 'invite':
        return (
          <>
            <div className="cart-modal-header">
              <h3>Invite User to Collaboration Cart</h3>
              <button className="cart-modal-close" onClick={onClose}>×</button>
            </div>

            <div className="cart-modal-content">
              <div className="cart-invite-section">
                <label htmlFor="inviteEmail">Email Address:</label>
                <input
                  type="email"
                  id="inviteEmail"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="Enter email address to invite"
                  className="cart-invite-input"
                  disabled={isInviting}
                />
              </div>

              <div className="cart-modal-actions">
                <button 
                  className="cart-modal-cancel" 
                  onClick={onClose}
                  disabled={isInviting}
                >
                  {cancelText}
                </button>
                <button 
                  className="cart-modal-confirm" 
                  onClick={handleInvite}
                  disabled={isInviting || !inviteEmail.trim()}
                >
                  {isInviting ? 'Sending...' : 'Send Invite'}
                </button>
              </div>
            </div>
          </>
        );

      case 'leaveCart':
      case 'endCart':
        return (
          <>
            <div className="cart-modal-header">
              <h3>{title || 'Confirm Action'}</h3>
              <button className="cart-modal-close" onClick={onClose}>×</button>
            </div>

            <div className="cart-modal-content">
              <div className="cart-confirmation-message">
                <p>{message}</p>
              </div>

              <div className="cart-modal-actions">
                <button 
                  className="cart-modal-cancel" 
                  onClick={onClose}
                >
                  {cancelText}
                </button>
                <button 
                  className="cart-modal-confirm cart-modal-confirm-danger" 
                  onClick={handleConfirmAction}
                >
                  {confirmText}
                </button>
              </div>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="cart-modal-overlay" onClick={handleOverlayClick}>
      <div className="cart-modal">
        {renderModalContent()}
      </div>
    </div>
  );
};

export default CartModal;
