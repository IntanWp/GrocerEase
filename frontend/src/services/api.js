const API_BASE_URL = 'https://grocerease-backend.vercel.app/';

// Utility to get auth headers with token
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { token })
  };
};

// Utility to handle API requests with error handling
const apiRequest = async (url, options = {}) => {
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      // Handle non-2xx responses
      if (response.status === 401) {
        // Token expired or invalid, clear it and redirect to login
        localStorage.removeItem('token');
        window.location.href = '/';
        throw new Error('Authentication expired. Please login again.');
      }
      throw new Error(`Server error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Check if the response indicates authentication failure
    if (!data.success && (data.message === 'Not Authorized Login Again' || data.message === 'Invalid token')) {
      localStorage.removeItem('token');
      window.location.href = '/';
      throw new Error('Authentication expired. Please login again.');
    }
    
    return data;
  } catch (error) {
    console.error(`API request failed: ${url}`, error);
    // Return a consistent error response
    return {
      success: false,
      message: error.message || 'Request failed'
    };
  }
};

// User API calls
export const userAPI = {
  register: async (userData) => {
    return apiRequest(`${API_BASE_URL}/user/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData)
    });
  },

  login: async (credentials) => {
    return apiRequest(`${API_BASE_URL}/user/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials)
    });
  },

  getProfile: async (userId) => {
    return apiRequest(`${API_BASE_URL}/user/profile/${userId}`, {
      headers: getAuthHeaders()
    });
  },

  updateProfile: async (userId, profileData) => {
    return apiRequest(`${API_BASE_URL}/user/profile/${userId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(profileData)
    });
  }
};

// Product API calls
export const productAPI = {
  getProducts: async () => {
    return apiRequest(`${API_BASE_URL}/product/list`, {
      headers: getAuthHeaders()
    });
  },

  searchProducts: async (query) => {
    return apiRequest(`${API_BASE_URL}/product/list?search=${encodeURIComponent(query)}`, {
      headers: getAuthHeaders()
    });
  },

  getProduct: async (productId) => {
    return apiRequest(`${API_BASE_URL}/product/single`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ productId })
    });
  }
};

// Recipe API calls
export const recipeAPI = {
  getRecipes: async () => {
    return apiRequest(`${API_BASE_URL}/recipe/list`, {
      headers: getAuthHeaders()
    });
  },

  searchRecipes: async (query) => {
    return apiRequest(`${API_BASE_URL}/recipe/list?search=${encodeURIComponent(query)}`, {
      headers: getAuthHeaders()
    });
  },

  getRecipe: async (recipeId) => {
    return apiRequest(`${API_BASE_URL}/recipe/single`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ recipeId })
    });
  }
};

// Search API calls
export const searchAPI = {
  searchProducts: async (query) => {
    return apiRequest(`${API_BASE_URL}/product/list?search=${encodeURIComponent(query)}`, {
      headers: getAuthHeaders()
    });
  },
  
  searchRecipes: async (query) => {
    return apiRequest(`${API_BASE_URL}/recipe/list?search=${encodeURIComponent(query)}`, {
      headers: getAuthHeaders()
    });
  },
  
  searchAll: async (query) => {
    try {
      const [products, recipes] = await Promise.all([
        searchAPI.searchProducts(query),
        searchAPI.searchRecipes(query)
      ]);
      return { products, recipes };
    } catch (error) {
      console.error('Search failed:', error);
      return { 
        products: { success: false, products: [] }, 
        recipes: { success: false, data: [] } 
      };
    }
  }
};

// Regular Cart API calls
export const regularCartAPI = {
  getRegularCart: async (userId) => {
    return apiRequest(`${API_BASE_URL}/regular-cart/get/${userId}`, {
      headers: getAuthHeaders()
    });
  },

  addItemToRegularCart: async (userId, productId, quantity = 1) => {
    return apiRequest(`${API_BASE_URL}/regular-cart/add`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ userId, productId, quantity })
    });
  },

  updateRegularCartQuantity: async (userId, productId, quantity) => {
    return apiRequest(`${API_BASE_URL}/regular-cart/update-quantity`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ userId, productId, quantity })
    });
  },

  removeFromRegularCart: async (userId, productId) => {
    return apiRequest(`${API_BASE_URL}/regular-cart/remove`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ userId, productId })
    });
  },

  checkoutRegularCart: async (userId, productId) => {
    return apiRequest(`${API_BASE_URL}/regular-cart/checkout-selected`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ userId, productId })
    });
  },

  checkoutEntireRegularCart: async (userId) => {
    return apiRequest(`${API_BASE_URL}/regular-cart/checkout-entire`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ userId })
    });
  },

  clearRegularCart: async (userId) => {
    return apiRequest(`${API_BASE_URL}/regular-cart/clear`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ userId })
    });
  }
};

// Monthly Cart API calls with same pattern
export const monthlyCartAPI = {
  getMonthlyCart: async (userId) => {
    return apiRequest(`${API_BASE_URL}/monthly-cart/get/${userId}`, {
      headers: getAuthHeaders()
    });
  },

  addItemToMonthlyCart: async (userId, productId, quantity = 1) => {
    return apiRequest(`${API_BASE_URL}/monthly-cart/add`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ userId, productId, quantity })
    });
  },

  updateMonthlyCartQuantity: async (userId, productId, quantity) => {
    return apiRequest(`${API_BASE_URL}/monthly-cart/update-quantity`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ userId, productId, quantity })
    });
  },

  removeFromMonthlyCart: async (userId, productId) => {
    return apiRequest(`${API_BASE_URL}/monthly-cart/remove`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ userId, productId })
    });
  },

  checkoutMonthlyCart: async (userId, productId) => {
    return apiRequest(`${API_BASE_URL}/monthly-cart/checkout-selected`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ userId, productId })
    });
  },

  checkoutEntireMonthlyCart: async (userId) => {
    return apiRequest(`${API_BASE_URL}/monthly-cart/checkout-entire`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ userId })
    });
  },

  clearMonthlyCart: async (userId) => {
    return apiRequest(`${API_BASE_URL}/monthly-cart/clear`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ userId })
    });
  }
};

// Collaborative Cart API calls
export const collabCartAPI = {  createCart: async (userId, settings = {}) => {
    return apiRequest(`${API_BASE_URL}/collab-cart/create`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ userId, settings })
    });
  },

  getUserCart: async (userId) => {
    return apiRequest(`${API_BASE_URL}/collab-cart/user/${userId}`, {
      headers: getAuthHeaders()
    });
  },

  addItemToCart: async (cartId, productId, quantity = 1) => {
    return apiRequest(`${API_BASE_URL}/collab-cart/add-item`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ cartId, productId, quantity })
    });
  },
  updateItemQuantity: async (cartId, userId, productId, quantity) => {
    return apiRequest(`${API_BASE_URL}/collab-cart/update-quantity`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ cartId, userId, productId, quantity })
    });
  },
  removeItemFromCart: async (cartId, userId, productId) => {
    return apiRequest(`${API_BASE_URL}/collab-cart/remove-item`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ cartId, userId, productId })
    });
  },
  generateInviteLink: async (cartId, userId, invitedEmail) => {
    return apiRequest(`${API_BASE_URL}/collab-cart/invite`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ cartId, userId, invitedEmail })
    });
  },

  getInviteDetails: async (inviteToken) => {
    return apiRequest(`${API_BASE_URL}/collab-cart/invite/${inviteToken}`, {
      headers: getAuthHeaders()
    });
  },

  joinCartViaInvite: async (inviteToken) => {
    return apiRequest(`${API_BASE_URL}/collab-cart/join/${inviteToken}`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
  },
  checkoutCart: async (cartId, userId) => {
    return apiRequest(`${API_BASE_URL}/collab-cart/checkout`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ cartId, userId })
    });
  },
  endCart: async (cartId, userId) => {
    return apiRequest(`${API_BASE_URL}/collab-cart/end`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ cartId, userId })
    });
  },

  leaveCart: async (cartId, userId) => {
    return apiRequest(`${API_BASE_URL}/collab-cart/leave`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ cartId, userId })
    });
  }
};
