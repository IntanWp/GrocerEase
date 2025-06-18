import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { regularCartAPI, userAPI } from '../services/api'
import "./CheckOutPage.css"
import Header from "../components/Header"
import Breadcrumbs from "../components/Breadcrumbs"
import mastercardImg from "../images/mastercard.png"

export default function CheckoutPage() {
  const { user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [checkoutItems, setCheckoutItems] = useState([])
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
    useEffect(() => {
    const initializeCheckout = async () => {
      // Get checkout items from location state or redirect to cart
      if (location.state && location.state.selectedItems) {
        setCheckoutItems(location.state.selectedItems)
        
        // Fetch user profile for shipping address
        if (user && user.id) {
          try {
            const profileResponse = await userAPI.getProfile(user.id)
            if (profileResponse.success) {
              setUserProfile(profileResponse.user)
            } else {
              console.error('Failed to fetch user profile:', profileResponse.message)
            }
          } catch (error) {
            console.error('Error fetching user profile:', error)
          }
        }
      } else {
        navigate('/cart')
      }
      setLoading(false)
    }
    
    initializeCheckout()
  }, [location.state, navigate, user])

  const calculateTotal = () => {
    const itemsTotal = checkoutItems.reduce((total, item) => total + (item.price * item.quantity), 0)
    const shipping = 7000
    return { itemsTotal, shipping, total: itemsTotal + shipping }
  }
  const handlePayment = async () => {
    if (processing) return;
    
    setProcessing(true);
    
    try {
      // Get product IDs from checkout items
      const productIds = checkoutItems.map(item => item.id);
      
      // Process checkout through backend
      const response = await regularCartAPI.checkoutRegularCart(user.id, productIds);
      
      if (response.success) {
        // Navigate to success page with order details
        navigate('/checkout-response', {
          state: {
            success: true,
            checkedOutItems: checkoutItems,
            totalAmount: total,
            orderDate: new Date().toISOString()
          }
        });
      } else {
        alert('Checkout failed: ' + response.message);
        setProcessing(false);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Checkout failed. Please try again.');
      setProcessing(false);
    }
  }

  const breadcrumbItems = [
    { label: "Home", href: "/home" },
    { label: "Cart", href: "/cart" },
    { label: "Checkout", current: true },
  ]

  if (loading) {
    return <div>Loading...</div>
  }

  const { itemsTotal, shipping, total } = calculateTotal()

  return (
    <div className="checkout-wrapper">
      <Header />
      <Breadcrumbs items={breadcrumbItems} />

      <div className="checkout-container">
        {/* Shipping Section */}
        <section className="checkout-section shipping">
          <div className="section-header">
            <h3>Shipping Location</h3>
            <button className="change-btn">Change</button>
          </div>          
          <div className="shipping-info">
            <div className="shipping-row">
              <span className="label">Home</span>
              <span className="separator">|</span>
              <span className="name">{userProfile ? `${userProfile.firstName} ${userProfile.lastName}` : 'User'}</span>
            </div>
            {userProfile && userProfile.phoneNumber && (
              <p className="phone">
                +62 {userProfile.phoneNumber}
              </p>
            )}
            <p className="address">
              {userProfile ? userProfile.address : 'Default shipping address will be displayed here'}
            </p>
            
          </div>
        </section>        {/* Product Section */}
        <section className="checkout-section items">
          {checkoutItems.map((item, index) => (
            <div className="item" key={index}>
              <img src={item.img || "/placeholder.svg"} alt={item.name} className="item-image" />
              <div className="item-details">
                <h4>{item.name}</h4>
                <p>{item.description || "Product description"}</p>
                <div className="item-bottom">
                  <span className="quantity">{item.quantity}x</span>
                  <strong className="price">Rp {(item.price * item.quantity).toLocaleString('id-ID')}</strong>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* Payment Summary */}
        <section className="checkout-section summary">
          <h3>Payment Summary</h3>
          <div className="summary-content">
            <div className="summary-row">
              <span>Total Item(s) Price</span>
              <span>Rp {itemsTotal.toLocaleString('id-ID')}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span>Rp {shipping.toLocaleString('id-ID')}</span>
            </div>
            <div className="summary-row total">
              <span>Total Price</span>
              <span>Rp {total.toLocaleString('id-ID')}</span>
            </div>
          </div>
        </section>

        {/* Payment Method */}
        <section className="checkout-section payment-method">
          <div className="payment-header">
            <h3>Payment Method</h3>
            <span className="payment-type">Credit Card</span>
          </div>
          <div className="card-info">
            <div className="card-left">
              <img src={mastercardImg || "/placeholder.svg"} alt="Mastercard" className="card-logo" />
              <span className="bank-name">DBS</span>
            </div>
            <span className="card-number">*0XXX</span>
          </div>
        </section>        {/* Pay Button */}
        <button 
          className="pay-btn" 
          onClick={handlePayment}
          disabled={processing}
        >
          {processing ? 'Processing...' : `Pay Rp ${total.toLocaleString('id-ID')}`}
        </button>
      </div>
    </div>
  )
}
