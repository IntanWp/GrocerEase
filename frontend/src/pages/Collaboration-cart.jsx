// src/pages/Collaboration-cart.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { collabCartAPI } from '../services/api';
import '../components/CartItem.css';
import './Collaboration-cart.css';
import CartItem from '../components/CartItem';
import CartModal from '../components/CartModal';
import Breadcrumbs from '../components/Breadcrumbs';
import Header from '../components/Header';
import user1 from '../images/user1.png'

const CollaborationCart = () => {
  const { user } = useAuth();
  const navigate = useNavigate();  const [selectedItems, setSelectedItems] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);  const [cart, setCart] = useState(null);
  const [inviteModal, setInviteModal] = useState(false);
  const [leaveModal, setLeaveModal] = useState(false);
  const [endModal, setEndModal] = useState(false);

  useEffect(() => {
    if (user && user.id) {
      fetchCartData();
    }
  }, [user]);

  const fetchCartData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await collabCartAPI.getUserCart(user.id);
      
      if (response.success && response.cart) {
        setCart(response.cart);
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
        // No collaborative cart found
        setCart(null);
        setItems([]);
      }
    } catch (error) {
      console.error('Error fetching collaborative cart:', error);
      setError('Error loading collaborative cart');
    } finally {
      setLoading(false);
    }
  };
  const updateQuantity = async (id, type) => {
    try {
      if (!cart) return;

      const item = items.find(item => item.id === id);
      if (!item) return;

      const newQty = type === 'increase' ? item.quantity + 1 : item.quantity - 1;
      const finalQty = Math.max(1, newQty);      // Update backend
      const response = await collabCartAPI.updateItemQuantity(cart.cartId, user.id, id, finalQty);
      
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
      if (!cart) return;      // Remove from backend
      const response = await collabCartAPI.removeItemFromCart(cart.cartId, user.id, id);
      
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
    }  };  const total = items
    .filter(item => selectedItems.includes(item.id))
    .reduce((sum, item) => sum + item.price * item.quantity, 0);

  const goToRegular = () => navigate('/cart');
  const goToMonthly = () => navigate('/monthly-cart');
  const handleCreateCart = async () => {
    try {
      setLoading(true);
      const response = await collabCartAPI.createCart(user.id, {
        allowMembersToInvite: false,
        allowMembersToRemoveItems: true,
        maxMembers: 10
      });

      if (response.success) {
        setCart(response.cart);
        alert('Collaboration cart created successfully!');
        await fetchCartData(); // Refresh cart data
      } else {
        alert('Failed to create cart: ' + response.message);
      }
    } catch (error) {
      console.error('Error creating cart:', error);
      alert('Failed to create cart');
    } finally {
      setLoading(false);
    }
  };  const handleInviteUser = async (email) => {
    if (!cart) return;
    
    try {
      const response = await collabCartAPI.generateInviteLink(cart.cartId, user.id, email);
      
      if (response.success) {
        const inviteUrl = `${window.location.origin}/collab-invite/${response.inviteToken}`;
        
        // Copy to clipboard
        navigator.clipboard.writeText(inviteUrl).then(() => {
          alert(`Invite link copied to clipboard!\n\nShare this link: ${inviteUrl}`);
        }).catch(() => {
          alert(`Invite link generated!\n\nShare this link: ${inviteUrl}`);
        });
      } else {
        alert('Failed to generate invite: ' + response.message);
      }
    } catch (error) {
      console.error('Error generating invite:', error);
      alert('Failed to generate invite');
    }
  };  const handleEndCart = async () => {
    if (!cart) return;
    
    try {
      const response = await collabCartAPI.endCart(cart.cartId, user.id);
      
      if (response.success) {
        alert('Collaboration cart ended successfully!');
        setCart(null);
        setItems([]);
        setSelectedItems([]);
      } else {
        alert('Failed to end cart: ' + response.message);
      }
    } catch (error) {
      console.error('Error ending cart:', error);
      alert('Failed to end cart');
    }
  };

  const handleLeaveCart = async () => {
    if (!cart) return;
    
    try {
      const response = await collabCartAPI.leaveCart(cart.cartId, user.id);
      
      if (response.success) {
        alert('You have left the collaboration cart!');
        setCart(null);
        setItems([]);
        setSelectedItems([]);
      } else {
        alert('Failed to leave cart: ' + response.message);
      }
    } catch (error) {
      console.error('Error leaving cart:', error);
      alert('Failed to leave cart');
    }
  };
  
  const isAdmin = cart && cart.createdBy._id === user.id;

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
        cartType: 'collaboration',
        cartId: cart?.cartId
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
        <div className="container collab-cart-loading">
          <p>Loading collaborative cart...</p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="container collab-cart-error">
          <p>Error: {error}</p>
          <button onClick={fetchCartData}>Retry</button>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />

      {/* Breadcrumb Navigation */}
      <div className="profile">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Shopping Cart', href: '/cart' },
            { label: 'Collaboration Cart', current: true }
          ]}
        />      </div>
        {/* Collaboration Cart Section */}
      <div className="collab-cart-section">
        {cart ? (
          <>
            {/* User Icons - Dynamic based on members */}
            <div className="collab-cart-user-icons">
              {cart.members && cart.members.slice(0, 5).map((member, index) => (
                <img 
                  key={member.userId._id || member.userId || index}
                  src={user1}
                  alt={`User ${index + 1}`}
                  className="collab-cart-user-icon"
                />
              ))}
              {cart.members && cart.members.length > 5 && (
                <span className="collab-cart-more-users">
                  +{cart.members.length - 5} more
                </span>
              )}
            </div>            {/* Action Buttons */}
            <div className="collab-cart-actions">
              {isAdmin ? (
                <>
                  <button 
                    onClick={() => setInviteModal(true)}
                    className="collab-cart-btn"
                  >
                    Invite
                  </button>
                  <button 
                    onClick={() => setEndModal(true)}
                    className="collab-cart-btn collab-cart-btn-end"
                  >
                    End Cart
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => setLeaveModal(true)}
                  className="collab-cart-btn"
                >
                  Leave Cart
                </button>
              )}
            </div>
          </>
        ) : (
          /* No Cart - Show Create Button */
          <div className="collab-cart-actions">
            <button 
              onClick={handleCreateCart}
              disabled={loading}
              className="collab-cart-btn"
            >
              {loading ? 'Creating...' : 'Create New Cart'}
            </button>
          </div>
        )}
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
          <button className="green-button" onClick={goToRegular}>Regular Cart</button>
          <button className="green-button" onClick={goToMonthly}>Monthly Cart</button>
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
        ))}        {/* Empty cart message when no items */}
        {items.length === 0 && (
          <div className="collab-cart-empty">
            <p className="collab-cart-empty-text">
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
            </button>          </div>        )}
      </div>

      {/* Invite Modal */}
      <CartModal
        isOpen={inviteModal}
        onClose={() => setInviteModal(false)}
        modalType="invite"
        onConfirm={handleInviteUser}
        user={user}
      />

      {/* Leave Cart Modal */}
      <CartModal
        isOpen={leaveModal}
        onClose={() => setLeaveModal(false)}
        modalType="leaveCart"
        title="Leave Collaboration Cart"
        message="Are you sure you want to leave this collaboration cart?"
        confirmText="Leave Cart"
        cancelText="Cancel"
        onConfirm={handleLeaveCart}
      />

      {/* End Cart Modal */}
      <CartModal
        isOpen={endModal}
        onClose={() => setEndModal(false)}
        modalType="endCart"
        title="End Collaboration Cart"
        message="Are you sure you want to end this collaboration cart? This action cannot be undone."
        confirmText="End Cart"
        cancelText="Cancel"
        onConfirm={handleEndCart}
      />
    </>
  );
};

export default CollaborationCart;
