"use client"
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { recipeAPI, regularCartAPI } from '../services/api';
import Header from "../components/Header"
import Breadcrumbs from "../components/Breadcrumbs"
import CartModal from "../components/CartModal"
import "./RecipeDetail.css"

const RecipeDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [recipe, setRecipe] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingToCart, setAddingToCart] = useState(false);
  const [showAddToCartModal, setShowAddToCartModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    if (id) {
      fetchRecipeData();
    }
  }, [id]);

  const fetchRecipeData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching recipe with ID:', id);
      const response = await recipeAPI.getRecipe(id);
      console.log('API Response:', response);
      
      if (response.success) {
        setRecipe(response.data.recipe);
        // Extract products from ingredientsWithProducts
        const availableProducts = response.data.ingredientsWithProducts
          .filter(item => item.product) // Only include items that have associated products
          .map(item => item.product);
        setProducts(availableProducts);
      } else {
        console.error('API returned unsuccessful response:', response);
        setError(`Failed to fetch recipe details: ${response.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error fetching recipe:', error);
      setError('Error loading recipe details');
    } finally {
      setLoading(false);
    }
  };
  const breadcrumbItems = [{ label: "Home", href: "/home" }, { label: "Recipe", current: true }]

  // Loading state
  if (loading) {
    return (
      <div className="recipe-page">
        <Header />
        <div style={{ textAlign: 'center', padding: '50px' }}>Loading recipe...</div>
      </div>
    );
  }

  // Error state
  if (error || !recipe) {
    return (
      <div className="recipe-page">
        <Header />
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <p>{error || 'Recipe not found'}</p>
          <button onClick={() => window.history.back()}>Go Back</button>
        </div>
      </div>
    );
  }

  const handleAddToCart = async (productId) => {
    if (!user || !user.id) {
      alert('Please login to add items to cart');
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
  }

  const handleMainAddToCart = async () => {
    try {
      if (!user || !user.id) {
        alert('Please login to add items to cart');
        return;
      }

      if (products.length === 0) {
        alert('No ingredients available to add to cart');
        return;
      }

      setAddingToCart(true);

      console.log('====== RECIPE ADD TO CART ======');
      console.log('Recipe:', recipe.title);
      console.log('Available Products:', products.length);
      console.log('================================');

      // Add all available products to cart
      const addPromises = products.map(async (product) => {
        try {
          const response = await regularCartAPI.addItemToRegularCart(user.id, product._id, 1);
          console.log(`Added ${product.name}:`, response.success ? 'SUCCESS' : 'FAILED');
          return { product: product.name, success: response.success, message: response.message };
        } catch (error) {
          console.error(`Error adding ${product.name}:`, error);
          return { product: product.name, success: false, message: error.message };
        }
      });

      const results = await Promise.all(addPromises);
      
      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;

      console.log('====== RECIPE ADD RESULTS ======');
      console.log('Successful:', successful);
      console.log('Failed:', failed);
      console.log('================================');

      if (successful > 0) {
        alert(`Successfully added ${successful} ingredient${successful > 1 ? 's' : ''} to cart!${failed > 0 ? ` (${failed} items failed)` : ''}`);
      } else {
        alert('Failed to add ingredients to cart. Please try again.');
      }

    } catch (error) {
      console.error('Error in handleMainAddToCart:', error);
      alert('Failed to add ingredients to cart');
    } finally {
      setAddingToCart(false);
    }
  }

  const handleModalSuccess = (cartType, quantity) => {
    // Optional: You can add additional logic here if needed
    console.log(`Added ${quantity} items to ${cartType} cart`);
  };

  const formatPrice = (price) => {
    return `Rp ${price.toLocaleString("id-ID")}`
  }

  const getDifficultyClass = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "difficulty-easy"
      case "medium":
        return "difficulty-medium"
      case "hard":
        return "difficulty-hard"
      default:
        return "difficulty-easy"
    }
  }

  return (
    <div className="recipe-page">
      <Header />
      <Breadcrumbs items={breadcrumbItems} />

      <main className="recipe-content">
        <div className="recipe-container">
          {/* Recipe Hero Section */}
          <section className="recipe-hero">
            <div className="recipe-card">
              <div className="recipe-image">
                <img src={recipe.image || "/placeholder.svg"} alt={recipe.title} loading="lazy" />
              </div>
              <div className="recipe-info">
                <span className={`difficulty-tag ${getDifficultyClass(recipe.difficulty)}`}>{recipe.difficulty}</span>
                <h1 className="recipe-title">{recipe.title}</h1>
                <p className="recipe-description">{recipe.description}</p>
              </div>
            </div>
          </section>

          {/* Ingredients and Steps */}
          <section className="recipe-details">
            <div className="recipe-details-grid">
              <div className="ingredients-section">
                <h2 className="section-title">Ingredients</h2>
                <ul className="ingredients-list">
                  {recipe.ingredients && recipe.ingredients.map((ingredient, index) => (
                    <li key={index} className="ingredient-item">
                      {ingredient.quantity} {ingredient.name}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="steps-section">
                <h2 className="section-title">
                  <span className="cooking-icon">🍳</span>
                  Cooking Steps
                </h2>
                <ol className="steps-list">
                  {recipe.cookingSteps && recipe.cookingSteps.map((step, index) => (
                    <li key={index} className="step-item">
                      <div className="step-number">{step.stepNumber || index + 1}</div>
                      <div className="step-content">{step.instruction}</div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </section>

          {/* Products Section */}
          <section className="recipe-products-section">
            <h2 className="section-title">Buy The Ingredients Here!</h2>
            <div className="recipe-products-grid">
              {products.map((product) => (
                <div key={product._id} className="recipe-product-card">
                  <div className="recipe-product-image">
                    <img src={product.image || "/placeholder.svg"} alt={product.name} loading="lazy" />
                  </div>
                  <div className="recipe-product-info">
                    <div className="recipe-product-price">{formatPrice(product.price)}</div>
                    <div className="recipe-product-name">{product.name}</div>
                  </div>
                    <button
                      className="add-product-btn"
                      onClick={() => handleAddToCart(product._id)}
                      aria-label={`Add ${product.name} to cart`}
                    >
                    <span className="plus-icon">+</span>
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      {/* Sticky Add to Cart Button */}
      <button 
        className="sticky-cart-btn" 
        onClick={handleMainAddToCart} 
        disabled={addingToCart || products.length === 0}
        aria-label="Add recipe to cart"
      >
        {addingToCart ? 'Adding Ingredients...' : `Add ${products.length} Ingredients to Cart`}
      </button>

      {/* Add to Cart Modal */}
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

export default RecipeDetail
