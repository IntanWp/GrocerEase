import regularCartModel from "../models/regularCartModel.js";
import productModel from "../models/productModel.js";

// Get user's regular cart
const getRegularCart = async (req, res) => {
  try {
    const { userId } = req.params;

    const cart = await regularCartModel.findOne({ userId });

    if (!cart) {
      return res.json({
        success: true,
        message: "No cart found",
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

// Add item to regular cart
const addItemToRegularCart = async (req, res) => {
  try {
    const { userId, productId, quantity = 1 } = req.body;

    let cart = await regularCartModel.findOne({ userId });

    if (!cart) {
      // Create new cart if doesn't exist
      cart = new regularCartModel({
        userId,
        items: [],
      });
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      (item) => item.productId === productId
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
      message: "Item added to cart",
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

// Update item quantity in regular cart
const updateRegularCartItemQuantity = async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;

    const cart = await regularCartModel.findOne({ userId });

    if (!cart) {
      return res.json({
        success: false,
        message: "Cart not found",
      });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.productId === productId
    );

    if (itemIndex === -1) {
      return res.json({
        success: false,
        message: "Item not found in cart",
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
      message: "Item quantity updated",
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

// Remove item from regular cart
const removeItemFromRegularCart = async (req, res) => {
  try {
    const { userId, productId } = req.body;

    const cart = await regularCartModel.findOne({ userId });

    if (!cart) {
      return res.json({
        success: false,
        message: "Cart not found",
      });
    }

    cart.items = cart.items.filter((item) => item.productId !== productId);
    await cart.save();

    res.json({
      success: true,
      message: "Item removed from cart",
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

// Checkout selected items from regular cart
// Checkout selected items from regular cart
const checkoutRegularCart = async (req, res) => {
  try {
    const { userId, productId } = req.body; // Changed from selectedItems to productId array

    const cart = await regularCartModel.findOne({ userId });

    if (!cart) {
      return res.json({
        success: false,
        message: "Cart not found",
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
        message: "Selected items not found in cart",
      });
    }

    // Remove checked out items from cart
    cart.items = cart.items.filter(
      (item) => !selectedProductIds.includes(String(item.productId))
    );

    await cart.save();

    res.json({
      success: true,
      message: "Checkout successful",
      checkedOutItems: itemsToCheckout,
      remainingCart: cart,
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

// Checkout entire regular cart
const checkoutEntireRegularCart = async (req, res) => {
  try {
    const { userId } = req.body;

    const cart = await regularCartModel.findOne({ userId });

    if (!cart) {
      return res.json({
        success: false,
        message: "Cart not found",
      });
    }

    if (cart.items.length === 0) {
      return res.json({
        success: false,
        message: "Cannot checkout empty cart",
      });
    }

    const itemsToCheckout = [...cart.items]; // Copy all items
    cart.items = []; // Clear the cart
    await cart.save();

    res.json({
      success: true,
      message: "Entire cart checkout successful",
      checkedOutItems: itemsToCheckout,
      remainingCart: cart,
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

// Clear entire regular cart
const clearRegularCart = async (req, res) => {
  try {
    const { userId } = req.body;

    const cart = await regularCartModel.findOne({ userId });

    if (!cart) {
      return res.json({
        success: false,
        message: "Cart not found",
      });
    }

    cart.items = [];
    await cart.save();

    res.json({
      success: true,
      message: "Cart cleared successfully",
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

export {
  getRegularCart,
  addItemToRegularCart,
  updateRegularCartItemQuantity,
  removeItemFromRegularCart,
  checkoutRegularCart,
  checkoutEntireRegularCart,
  clearRegularCart,
};