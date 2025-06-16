import monthlyCartModel from "../models/monthlyCartModel.js";
import productModel from "../models/productModel.js";

// Get user's monthly cart
const getMonthlyCart = async (req, res) => {
  try {
    const { userId } = req.params;

    const cart = await monthlyCartModel.findOne({ userId });

    if (!cart) {
      return res.json({
        success: true,
        message: "No monthly cart found",
        cart: { userId, items: [] },
      });
    }

    res.json({
      success: true,
      cart,
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

// Add item to monthly cart
const addItemToMonthlyCart = async (req, res) => {
  try {
    const { userId, productId, quantity = 1 } = req.body;

    let cart = await monthlyCartModel.findOne({ userId });

    if (!cart) {
      // Create new monthly cart if doesn't exist
      cart = new monthlyCartModel({
        userId,
        items: [],
      });
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      (item) => String(item.productId) === String(productId)
    );

    if (existingItemIndex > -1) {
      // Update quantity
      const currentQuantity = Number(cart.items[existingItemIndex].quantity) || 0;
      const addQuantity = Number(quantity) || 0;
      cart.items[existingItemIndex].quantity = currentQuantity + addQuantity;
    } else {
      // Add new item
      cart.items.push({
        productId,
        quantity: Number(quantity) || 1,
      });
    }

    await cart.save();

    res.json({
      success: true,
      message: "Item added to monthly cart",
      cart,
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

// Update item quantity in monthly cart
const updateMonthlyCartItemQuantity = async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;

    const cart = await monthlyCartModel.findOne({ userId });

    if (!cart) {
      return res.json({
        success: false,
        message: "Monthly cart not found",
      });
    }

    const itemIndex = cart.items.findIndex(
      (item) => String(item.productId) === String(productId)
    );

    if (itemIndex === -1) {
      return res.json({
        success: false,
        message: "Item not found in monthly cart",
      });
    }

    const newQuantity = Number(quantity) || 0;

    if (newQuantity <= 0) {
      // Remove item if quantity is 0 or negative
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = newQuantity;
    }

    await cart.save();

    res.json({
      success: true,
      message: "Monthly cart item quantity updated",
      cart,
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

// Remove item from monthly cart
const removeItemFromMonthlyCart = async (req, res) => {
  try {
    const { userId, productId } = req.body;

    const cart = await monthlyCartModel.findOne({ userId });

    if (!cart) {
      return res.json({
        success: false,
        message: "Monthly cart not found",
      });
    }

    cart.items = cart.items.filter((item) => String(item.productId) !== String(productId));
    await cart.save();

    res.json({
      success: true,
      message: "Item removed from monthly cart",
      cart,
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

// Checkout selected items from monthly cart (items remain in cart)
const checkoutMonthlyCart = async (req, res) => {
  try {
    const { userId, productId } = req.body; // productId is array of productIds

    const cart = await monthlyCartModel.findOne({ userId });

    if (!cart) {
      return res.json({
        success: false,
        message: "Monthly cart not found",
      });
    }

    if (!productId || productId.length === 0) {
      return res.json({
        success: false,
        message: "No items selected for checkout",
      });
    }

    // Convert all productIds to strings for consistent comparison
    const selectedProductIds = productId.map(id => String(id));

    // Get the selected items with their details
    const itemsToCheckout = cart.items.filter((item) =>
      selectedProductIds.includes(String(item.productId))
    );

    if (itemsToCheckout.length === 0) {
      return res.json({
        success: false,
        message: "Selected items not found in monthly cart",
      });
    }



    res.json({
      success: true,
      message: "Monthly cart checkout successful",
      checkedOutItems: itemsToCheckout,
      remainingCart: cart, // Cart remains unchanged
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

// Checkout entire monthly cart (items remain in cart)
const checkoutEntireMonthlyCart = async (req, res) => {
  try {
    const { userId } = req.body;

    const cart = await monthlyCartModel.findOne({ userId });

    if (!cart) {
      return res.json({
        success: false,
        message: "Monthly cart not found",
      });
    }

    if (cart.items.length === 0) {
      return res.json({
        success: false,
        message: "Cannot checkout empty monthly cart",
      });
    }

    const itemsToCheckout = [...cart.items]; // Copy all items
    // DON'T clear the cart - items stay for next month's delivery

    res.json({
      success: true,
      message: "Entire monthly cart checkout successful",
      checkedOutItems: itemsToCheckout,
      remainingCart: cart, // Cart remains unchanged
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

// Clear entire monthly cart
const clearMonthlyCart = async (req, res) => {
  try {
    const { userId } = req.body;

    const cart = await monthlyCartModel.findOne({ userId });

    if (!cart) {
      return res.json({
        success: false,
        message: "Monthly cart not found",
      });
    }

    cart.items = [];
    await cart.save();

    res.json({
      success: true,
      message: "Monthly cart cleared successfully",
      cart,
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

// Set up monthly subscription (special function for monthly cart)
const setupMonthlySubscription = async (req, res) => {
  try {
    const { userId, productId, subscriptionSettings } = req.body; // Changed selectedItems to productId
    
    const cart = await monthlyCartModel.findOne({ userId });

    if (!cart) {
      return res.json({
        success: false,
        message: "Monthly cart not found",
      });
    }

    if (!productId || productId.length === 0) {
      return res.json({
        success: false,
        message: "No items selected for subscription",
      });
    }

    // Convert all productIds to strings for consistent comparison
    const selectedProductIds = productId.map(id => String(id));

    // Get the selected items for subscription
    const subscriptionItems = cart.items.filter((item) =>
      selectedProductIds.includes(String(item.productId))
    );

    if (subscriptionItems.length === 0) {
      return res.json({
        success: false,
        message: "Selected items not found in monthly cart",
      });
    }
    
    res.json({
      success: true,
      message: "Monthly subscription set up successfully",
      subscriptionItems,
      subscriptionSettings,
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

export {
  getMonthlyCart,
  addItemToMonthlyCart,
  updateMonthlyCartItemQuantity,
  removeItemFromMonthlyCart,
  checkoutMonthlyCart,
  checkoutEntireMonthlyCart,
  clearMonthlyCart,
  setupMonthlySubscription,
};