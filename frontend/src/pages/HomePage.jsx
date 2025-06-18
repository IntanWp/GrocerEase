import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { productAPI, recipeAPI, regularCartAPI } from '../services/api';
import Header from "../components/Header"
import "./HomePage.css"

import bannerGraphic from "../images/banner-graphic.png"

const HomePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

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
  };
  const handleAddToCart = async (productId) => {
    try {
      if (!user || !user.id) {
        alert('User session expired. Please login again.');
        logout();
        return;
      }

      const response = await regularCartAPI.addItemToRegularCart(user.id, productId, 1);
      if (response.success) {
        alert('Item added to cart successfully!');
      } else {
        alert('Failed to add item to cart: ' + response.message);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add item to cart');
    }
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
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage
