import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { searchAPI } from '../services/api';
import "./Header.css"
import logo from "../images/logoalt.png"
import cartIcon from "../images/cart.png"
import profileIcon from "../images/user1.png"

const Header = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ recipes: [], products: [] });
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef(null);
  const dropdownRef = useRef(null);
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Debounced search function
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim() && searchQuery.trim().length >= 1) {
        performSearch(searchQuery.trim());
      } else {
        setSearchResults({ recipes: [], products: [] });
        setShowDropdown(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);
  // Perform search API call
  const performSearch = async (query) => {
    try {
      setIsSearching(true);
      const result = await searchAPI.searchAll(query);
      
      // Sort by relevance and limit results
      const recipes = result.recipes.success ? sortByRelevance(result.recipes.data, query, 'title').slice(0, 3) : [];
      const products = result.products.success ? sortByRelevance(result.products.products, query, 'name').slice(0, 5) : [];
      
      setSearchResults({ recipes, products });
      setShowDropdown(recipes.length > 0 || products.length > 0);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults({ recipes: [], products: [] });
      setShowDropdown(false);
    } finally {
      setIsSearching(false);
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

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
  };

  // Handle search submit (Enter key)
  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (searchQuery.trim()) {
        setShowDropdown(false);
        navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      }
    }
  };

  // Handle clicking on search result items
  const handleItemClick = (type, id) => {
    setShowDropdown(false);
    setSearchQuery('');
    if (type === 'recipe') {
      navigate(`/recipe/${id}`);
    } else if (type === 'product') {
      navigate(`/product/${id}`);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) && 
          searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
  return (
    <header className="header">
      <div className="header-left">
        <div className="logo-link" onClick={() => navigate('/home')} style={{ cursor: 'pointer' }}>
          <img src={logo || "/placeholder.svg"} alt="GrocerEase" className="header-logo" />
          <span className="brand"></span>
        </div>
      </div>
        <div className="search-container">
        <input 
          ref={searchRef}
          type="text" 
          className={`search-bar ${showDropdown ? 'dropdown-active' : ''}`}
          placeholder="Search here" 
          value={searchQuery}
          onChange={handleSearchChange}
          onKeyDown={handleSearchSubmit}
        />
        
        {showDropdown && (
          <>
            <div className="search-overlay" onClick={() => setShowDropdown(false)} />
            <div ref={dropdownRef} className="search-dropdown">
              {isSearching ? (
                <div className="search-loading">Searching...</div>
              ) : (
                <>
                  {searchResults.recipes.length > 0 && (
                    <div className="search-section">
                      <div className="search-section-title">Recipes</div>
                      {searchResults.recipes.map((recipe) => (
                        <div 
                          key={recipe._id} 
                          className="search-item"
                          onClick={() => handleItemClick('recipe', recipe._id)}
                        >
                          <img 
                            src={recipe.image || "/placeholder.svg"} 
                            alt={recipe.title}
                            className="search-item-image"
                          />
                          <div className="search-item-content">
                            <div className="search-item-name">
                              {highlightText(recipe.title, searchQuery)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {searchResults.products.length > 0 && (
                    <div className="search-section">
                      <div className="search-section-title">Products</div>
                      {searchResults.products.map((product) => (
                        <div 
                          key={product._id} 
                          className="search-item"
                          onClick={() => handleItemClick('product', product._id)}
                        >
                          <img 
                            src={product.image || "/placeholder.svg"} 
                            alt={product.name}
                            className="search-item-image"
                          />
                          <div className="search-item-content">
                            <div className="search-item-name">
                              {highlightText(product.name, searchQuery)}
                            </div>
                            <div className="search-item-price">
                              Rp {product.price.toLocaleString('id-ID')}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {searchResults.recipes.length === 0 && searchResults.products.length === 0 && !isSearching && (
                    <div className="search-no-results">No results found</div>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </div>
      
      <div className="header-icons">
        <div className="icon-link" onClick={() => navigate('/cart')} style={{ cursor: 'pointer' }}>
          <img src={cartIcon || "/placeholder.svg"} alt="Cart" className="icon" />
        </div>
        <div className="icon-link" onClick={() => navigate('/account')} style={{ cursor: 'pointer' }}>
          <img src={profileIcon || "/placeholder.svg"} alt="Profile" className="icon" />
        </div>
        {user && (
          <div className="user-info">
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header

