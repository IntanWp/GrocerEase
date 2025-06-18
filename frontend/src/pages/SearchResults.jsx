import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { searchAPI, productAPI, recipeAPI, regularCartAPI } from '../services/api';
import Header from '../components/Header';
import Breadcrumbs from '../components/Breadcrumbs';
import './SearchResults.css';

const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [products, setProducts] = useState([]);
  const [allRecipes, setAllRecipes] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAllRecipes, setShowAllRecipes] = useState(false);
  const [showAllProducts, setShowAllProducts] = useState(false);

  useEffect(() => {
    // Extract search query from URL
    const params = new URLSearchParams(location.search);
    const query = params.get('q') || '';
    setSearchQuery(query);
    
    if (user && user.id) {
      fetchSearchResults(query);
    }
  }, [location.search, user]);

  const fetchSearchResults = async (query) => {
    try {
      setLoading(true);
      
      if (query.trim()) {
        // Search with query
        const result = await searchAPI.searchAll(query);
        const filteredRecipes = result.recipes.success ? sortByRelevance(result.recipes.data, query, 'title') : [];
        const filteredProducts = result.products.success ? sortByRelevance(result.products.products, query, 'name') : [];
        
        setAllRecipes(filteredRecipes);
        setAllProducts(filteredProducts);
        setRecipes(filteredRecipes.slice(0, 5));
        setProducts(filteredProducts.slice(0, 20));
      } else {
        // Show all items when no query
        const [recipesResponse, productsResponse] = await Promise.all([
          recipeAPI.getRecipes(),
          productAPI.getProducts()
        ]);
        
        const allRecipesList = recipesResponse.success ? recipesResponse.data : [];
        const allProductsList = productsResponse.success ? productsResponse.products : [];
        
        setAllRecipes(allRecipesList);
        setAllProducts(allProductsList);
        setRecipes(allRecipesList.slice(0, 5));
        setProducts(allProductsList.slice(0, 20));
      }
    } catch (error) {
      console.error('Search error:', error);
      setRecipes([]);
      setProducts([]);
      setAllRecipes([]);
      setAllProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Sort items by relevance to search query
  const sortByRelevance = (items, query, nameField) => {
    if (!items || items.length === 0) return [];
    
    return items
      .map(item => {
        const name = item[nameField].toLowerCase();
        const searchQuery = query.toLowerCase();
        
        let score = 0;
        if (name.startsWith(searchQuery)) {
          score += 100; // Starts with query - highest priority
        } else if (name.includes(searchQuery)) {
          score += 50;  // Contains query - medium priority
        }
        
        return { ...item, relevanceScore: score };
      })
      .filter(item => item.relevanceScore > 0) // Only include items with matches
      .sort((a, b) => b.relevanceScore - a.relevanceScore); // Sort by relevance desc
  };

  const handleRecipeClick = (recipeId) => {
    navigate(`/recipe/${recipeId}`);
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  const handleAddToCart = async (productId) => {
    try {
      if (!user || !user.id) {
        alert('Please login to add items to cart');
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

  const handleViewMoreRecipes = () => {
    setShowAllRecipes(true);
    setRecipes(allRecipes);
  };

  const handleViewMoreProducts = () => {
    setShowAllProducts(true);
    setProducts(allProducts);
  };

  // Highlight matching text
  const highlightText = (text, query) => {
    if (!query) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <span key={index} style={{ fontWeight: 'bold', color: '#2d5016' }}>
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  // Generate breadcrumb items
  const breadcrumbItems = [
    { label: 'Home', href: '/home' },
    { 
      label: searchQuery 
        ? `Search Results`
        : 'All Items',
      current: true 
    },
  ];

  if (loading) {
    return (
      <div className="search-page-wrapper">
        <Header />
        <Breadcrumbs items={breadcrumbItems} />
        <div className="search-page-loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="search-page-wrapper">
      <Header />
      <Breadcrumbs items={breadcrumbItems} />
      
      <div className="search-page-container">
        {/* Search Query Display */}
        {searchQuery ? (
          <div className="search-page-query-display">
            <h1>Showing results for: "{searchQuery}"</h1>
          </div>
        ) : (
          <div className="search-page-query-display">
            <h1>Browse all our products and recipes</h1>
          </div>
        )}

        {/* No Results State */}
        {searchQuery && allRecipes.length === 0 && allProducts.length === 0 && (
          <div className="search-page-no-results">
            <h2>No results found for "{searchQuery}"</h2>
            <p>Try different keywords or browse all items.</p>
          </div>
        )}

        {/* Recipes Section */}
        {recipes.length > 0 && (
          <div className="search-page-section">
            <div className="search-page-section-header">
              <h2>Recipes</h2>
              <p className="search-page-result-count">{allRecipes.length} recipe{allRecipes.length !== 1 ? 's' : ''} found</p>
            </div>
            <div className="search-page-recipe-grid">
              {recipes.map((recipe) => (
                <div 
                  key={recipe._id} 
                  className="search-page-recipe-card"
                  onClick={() => handleRecipeClick(recipe._id)}
                >
                  <div className="search-page-recipe-card-image">
                    <img src={recipe.image || "/placeholder.svg"} alt={recipe.title} />
                  </div>
                  <div className="search-page-card-content">
                    <div className="search-page-recipe-title">
                      {highlightText(recipe.title, searchQuery)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {!showAllRecipes && allRecipes.length > 5 && (
              <div className="search-page-view-more-container">
                <button 
                  className="search-page-view-more-btn"
                  onClick={handleViewMoreRecipes}
                >
                  View More Recipes ({allRecipes.length - 5} more)
                </button>
              </div>
            )}
          </div>
        )}

        {/* Products Section */}
        {products.length > 0 && (
          <div className="search-page-section">
            <div className="search-page-section-header">
              <h2>Products</h2>
              <p className="search-page-result-count">{allProducts.length} product{allProducts.length !== 1 ? 's' : ''} found</p>
            </div>            <div className="search-page-product-grid">
              {products.map((product) => (
                <div 
                  key={product._id} 
                  className="search-page-product-card"
                >
                  <div className="search-page-card-image" onClick={() => handleProductClick(product._id)} style={{ cursor: 'pointer' }}>
                    <img src={product.image || "/placeholder.svg"} alt={product.name} />
                  </div>
                  <div className="search-page-card-content">
                    <div className="search-page-product-price">
                      Rp {product.price.toLocaleString('id-ID')}
                    </div>
                    <div className="search-page-product-title" onClick={() => handleProductClick(product._id)} style={{ cursor: 'pointer' }}>
                      {highlightText(product.name, searchQuery)}
                    </div>
                    <button 
                      className="search-page-add-button"
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
            {!showAllProducts && allProducts.length > 20 && (
              <div className="search-page-view-more-container">
                <button 
                  className="search-page-view-more-btn"
                  onClick={handleViewMoreProducts}
                >
                  View More Products ({allProducts.length - 20} more)
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
