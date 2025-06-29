import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { productAPI, recipeAPI } from '../services/api';
import Header from "../components/Header"
import CartModal from "../components/CartModal"
import "./HomePage.css"

import bannerGraphic from "../images/banner-graphic.png"

const HomePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddToCartModal, setShowAddToCartModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    if (user && user.id) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [productsResponse, recipesResponse] = await Promise.all([
        productAPI.getProducts(),
        recipeAPI.getRecipes()
      ]);      if (productsResponse.success) {
        setProducts(productsResponse.products.slice(0, 20));
      }

      if (recipesResponse.success) {
        setRecipes(recipesResponse.data.slice(0, 12));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRecipeClick = (recipeId) => {
    navigate(`/recipe/${recipeId}`);
  };  const handleAddToCart = async (productId) => {
    if (!user || !user.id) {
      alert('User session expired. Please login again.');
      logout();
      return;
    }

    // Find the product by ID
    const product = products.find(p => p._id === productId);
    if (!product) {
      alert('Product not found');
      return;
    }

    setSelectedProduct(product);
    setShowAddToCartModal(true);
  };

  const handleModalSuccess = (cartType, quantity) => {
    console.log(`Added ${quantity} items to ${cartType} cart`);
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  if (loading) {
    return (
      <div className="homepage">
        <Header />
        <div style={{ textAlign: 'center', padding: '50px' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div className="homepage">
      <Header />

      <div className="banner">
        <div className="banner-content">
          <h2>All the best products!</h2>
        </div>
        <div className="banner-illustration">
          <img src={bannerGraphic || "/placeholder.svg"} alt="banner graphic" />
        </div>
      </div>

      <div className="main-content">
        <div className="section">
          <h3>Recipe Recommendation</h3>
          <div className="slider-container">
            <div className="card-container home-recipe-slider">
              {recipes.map((recipe) => (
                <div className="home-recipe-card" key={recipe._id} onClick={() => handleRecipeClick(recipe._id)}>
                  <div className="card-image">
                    <img src={recipe.image || "/placeholder.svg"} alt={recipe.title} />
                  </div>
                  <div className="card-content">
                    <p className="card-title">{recipe.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="section">
          <h3>Product Recommendation</h3>
          <div className="card-container">            {products.map((product) => (
              <div className="home-product-card" key={product._id}>
                <div className="card-image" onClick={() => handleProductClick(product._id)} style={{ cursor: 'pointer' }}>
                  <img src={product.image || "/placeholder.svg"} alt={product.name} />
                </div>
                <div className="card-content">
                  <p className="price">Rp {product.price.toLocaleString('id-ID')}</p>
                  <p className="home-product-title" onClick={() => handleProductClick(product._id)} style={{ cursor: 'pointer' }}>{product.name}</p>
                  <button 
                    className="add-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(product._id);
                    }}
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>        </div>
      </div>      {/* Add to Cart Modal */}
      <CartModal
        isOpen={showAddToCartModal}
        onClose={() => setShowAddToCartModal(false)}
        modalType="addToCart"
        product={selectedProduct}
        user={user}
        onSuccess={handleModalSuccess}
      />
    </div>
  )
}

export default HomePage
