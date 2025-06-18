import React, { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { productAPI, regularCartAPI } from "../services/api"
import "./ProductDetail.css"
import Header from "../components/Header"
import Breadcrumbs from "../components/Breadcrumbs"

export default function ProductDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [otherProducts, setOtherProducts] = useState([])
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [addingToCart, setAddingToCart] = useState(false)
  const [checkingOut, setCheckingOut] = useState(false)

  useEffect(() => {
    if (id) {
      fetchProductData()
    }
  }, [id])

  const fetchProductData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('Fetching product with ID:', id)
      const [productResponse, allProductsResponse] = await Promise.all([
        productAPI.getProduct(id),
        productAPI.getProducts()
      ])
      
      if (productResponse.success) {
        setProduct(productResponse.product)
      } else {
        setError('Product not found')
        return
      }

      if (allProductsResponse.success) {
        // Filter out current product and limit to 10 other products
        const filtered = allProductsResponse.products
          .filter(p => p._id !== id)
          .slice(0, 10)
          .map((p, index) => ({
            id: p._id,
            img: p.image,
            price: p.price.toLocaleString('id-ID'),
            name: p.name
          }))
        setOtherProducts(filtered)
      }
    } catch (error) {
      console.error('Error fetching product:', error)
      setError('Error loading product details')
    } finally {
      setLoading(false)
    }
  }
  const breadcrumbItems = [
    { label: "Home", href: "/home" },
    { label: "Product Detail", current: true },
  ]

  const handleQuantityChange = (type) => {
    if (type === "increase") {
      setQuantity((prev) => prev + 1)
    } else if (type === "decrease" && quantity > 1) {
      setQuantity((prev) => prev - 1)
    }
  }
  
  const handleAddToCart = async () => {
    try {
      if (!user || !user.id) {
        alert('Please login to add items to cart')
        return
      }

      setAddingToCart(true)
      const response = await regularCartAPI.addItemToRegularCart(user.id, product._id, quantity)
      
      if (response.success) {
        alert(`Added ${quantity} ${product.name}(s) to cart successfully!`)
      } else {
        alert('Failed to add item to cart: ' + response.message)
      }
    } catch (error) {
      console.error('Error adding to cart:', error)
      alert('Failed to add item to cart')
    } finally {
      setAddingToCart(false)
    }
  }

  const handleCheckout = async () => {
    try {
      if (!user || !user.id) {
        alert('Please login to checkout')
        return
      }

      setCheckingOut(true)
      // Bypass cart - go directly to checkout with this item
      const checkoutItem = {
        id: product._id,
        name: product.name,
        price: product.price,
        img: product.image,
        quantity: quantity
      }

      navigate('/checkout', {
        state: {
          selectedItems: [checkoutItem]
        }
      })
    } catch (error) {
      console.error('Error during checkout:', error)
      alert('Failed to proceed to checkout')
    } finally {
      setCheckingOut(false)
    }
  }
  const handleOtherProductClick = (productId) => {
    navigate(`/product/${productId}`)
  }

  // Loading state
  if (loading) {
    return (
      <div className="product-detail-wrapper">
        <Header />
        <div style={{ textAlign: 'center', padding: '50px' }}>Loading product...</div>
      </div>
    )
  }

  // Error state
  if (error || !product) {
    return (
      <div className="product-detail-wrapper">
        <Header />
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <p>{error || 'Product not found'}</p>
          <button onClick={() => navigate('/home')}>Back to Home</button>
        </div>
      </div>
    )
  }

  return (
    <div className="product-detail-wrapper">
      <Header />

      <div className="sticky-breadcrumbs">
        <Breadcrumbs items={breadcrumbItems} />
      </div>

      <div className="product-detail-container">
        {/* Main Product Section */}
        <div className="product-main">
          {/* Product Image */}
          <div className="product-image-section">            
            <div className="product-image-container">
              <img
                src={product.image || "/placeholder.svg?height=400&width=400"}
                alt={product.name}
                className="product-image"
              />
            </div>
            <div className="stock-info">
              <span className="stock-label">Stok total:</span>
              <span className="stock-number">{product.stock || 0}</span>
            </div>
          </div>

          {/* Product Info */}          
          <div className="product-info-section">
            <div className="product-info-card">
              <h1 className="product-title">{product.name}</h1>
              <p className="product-description">
                {product.description}
              </p>
              <div className="product-price">Rp {product.price.toLocaleString('id-ID')}</div>

              {/* Product Details */}
              <div className="product-details">
                <h3 className="details-title">Detail</h3>
                <div className="details-grid">
                  <div className="detail-row">
                    <span className="detail-label">Stock</span>
                    <span className="detail-value">{product.stock > 0 ? 'Available' : 'Out of Stock'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Advantages</span>
                    <span className="detail-value">{product.advantages}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Weight</span>
                    <span className="detail-value">{product.weight}</span>
                  </div>
                </div>
              </div>
            </div>           
            {/* Purchase Section */}
            <div className="purchase-section">
              <div className="quantity-section">
                <label className="quantity-label">Quantity</label>
                <div className="quantity-controls">
                  <button
                    className="quantity-btn"
                    onClick={() => handleQuantityChange("decrease")}
                    disabled={quantity <= 1}
                  >
                    −
                  </button>
                  <span className="quantity-display">{quantity}</span>
                  <button className="quantity-btn" onClick={() => handleQuantityChange("increase")}>
                    +
                  </button>
                </div>
              </div>

              <button className="cart-button" onClick={handleAddToCart} disabled={addingToCart}>
                {addingToCart ? 'Adding...' : 'Keranjang'}
              </button>
              <button className="checkout-button" onClick={handleCheckout} disabled={checkingOut}>
                {checkingOut ? 'Processing...' : 'Check Out'}
              </button>
            </div>
          </div>
        </div>

        {/* Other Products Section */}
        <div className="other-products-section">
          <h2 className="other-products-title">Other Products</h2>
          <div className="other-products-grid">
            {otherProducts.map((product) => (
              <div key={product.id} className="other-product-card" onClick={() => handleOtherProductClick(product.id)} style={{ cursor: 'pointer' }}>
                <div className="other-product-image">
                  <img src={product.img || "/placeholder.svg?height=120&width=120"} alt={product.name} />
                </div>
                <div className="other-product-info">
                  <div className="other-product-price">Rp {product.price}</div>
                  <div className="other-product-name">{product.name}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>    
    </div>
  )
}