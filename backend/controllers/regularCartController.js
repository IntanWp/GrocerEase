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

    // Populate product details for each cart item
    const populatedItems = await Promise.all(
      cart.items.map(async (item) => {
        try {
          const product = await productModel.findById(item.productId);
          
          return {
            productId: item.productId,
            quantity: item.quantity,
            product: product || null // null if product not found
          };
        } catch (error) {
          console.log(error.message);
          return {
            productId: item.productId,
            quantity: item.quantity,
            product: null
          };
        }
      })
    );

    const populatedCart = {
      ...cart.toObject(),
      items: populatedItems
    };

    res.json({
      success: true,
      cart: populatedCart,
    });
  } catch (error) {
    console.log(error.message);
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

    // Validate product and stock availability
    const product = await productModel.findById(productId);
    if (!product) {
      return res.json({
        success: false,
        message: "Product not found",
      });
    }

    if (product.stock < quantity) {
      return res.json({
        success: false,
        message: `Insufficient stock. Only ${product.stock} items available.`,
      });
    }

    let cart = await regularCartModel.findOne({ userId });

    if (!cart) {
      // Create new cart if doesn't exist
      cart = new regularCartModel({
        userId,
        items: [],
      });
    }

    // Convert productId to string to match schema
    const productIdString = String(productId);

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      (item) => item.productId === productIdString
    );    if (existingItemIndex > -1) {
      const currentQuantity = Number(cart.items[existingItemIndex].quantity) || 0;
      const addQuantity = Number(quantity) || 0;
      const newQuantity = currentQuantity + addQuantity;
      
      // Check if new total quantity exceeds stock
      if (newQuantity > product.stock) {
        return res.json({
          success: false,
          message: `Cannot add ${addQuantity} more items. Only ${product.stock - currentQuantity} more can be added (current: ${currentQuantity}, stock: ${product.stock}).`,
        });
      }

      cart.items[existingItemIndex].quantity = newQuantity;
    } else {
      // Add new item
      cart.items.push({
        productId: productIdString,
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
    console.log(error.message);
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
    } const newQuantity = Number(quantity) || 0;

    const oldQuantity = cart.items[itemIndex].quantity;

    // Validate stock if quantity is being increased
    if (newQuantity > 0) {
      const product = await productModel.findById(productId);
      if (!product) {
        return res.json({
          success: false,
          message: "Product not found",
        });
      }
      
      if (newQuantity > product.stock) {
        return res.json({
          success: false,
          message: `Insufficient stock. Only ${product.stock} items available.`,
        });
      }
    }

    if (newQuantity <= 0) {
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
    console.log(error.message);
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

    const originalCount = cart.items.length;
    const itemExists = cart.items.some(item => item.productId === productId);

    cart.items = cart.items.filter((item) => item.productId !== productId);
    await cart.save();

    const newCount = cart.items.length;
    const removed = originalCount - newCount;

    res.json({
      success: true,
      message: "Item removed from cart",
      cart,
    });
  } catch (error) {
    console.log(error.message);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

// Checkout selected items from regular cart
const checkoutRegularCart = async (req, res) => {
  try {
    const { userId, productId } = req.body;

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

    // Validate stock availability for all items before processing
    for (const item of itemsToCheckout) {
      const product = await productModel.findById(item.productId);
      if (!product) {
        return res.json({
          success: false,
          message: `Product not found: ${item.productId}`,
        });
      }
      
      if (product.stock < item.quantity) {
        return res.json({
          success: false,
          message: `Insufficient stock for ${product.name}. Only ${product.stock} items available, but ${item.quantity} requested.`,
        });
      }
    }

    // Update stock for all checked out items
    for (const item of itemsToCheckout) {
      const product = await productModel.findById(item.productId);
      product.stock -= item.quantity;
      await product.save();
    }

    // Remove checked out items from cart
    const originalItemCount = cart.items.length;
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
    console.log(error.message);
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
    }    if (cart.items.length === 0) {
      return res.json({
        success: false,
        message: "Cannot checkout empty cart",
      });
    }

    const itemsToCheckout = [...cart.items]; // Copy all items

    // Validate stock availability for all items before processing
    for (const item of itemsToCheckout) {
      const product = await productModel.findById(item.productId);
      if (!product) {
        return res.json({
          success: false,
          message: `Product not found: ${item.productId}`,
        });
      }
      
      if (product.stock < item.quantity) {
        return res.json({
          success: false,
          message: `Insufficient stock for ${product.name}. Only ${product.stock} items available, but ${item.quantity} requested.`,
        });
      }
    }

    // Update stock for all checked out items
    for (const item of itemsToCheckout) {
      const product = await productModel.findById(item.productId);
      product.stock -= item.quantity;
      await product.save();
    }

    cart.items = []; // Clear the cart
    await cart.save();

    res.json({
      success: true,
      message: "Entire cart checkout successful",
      checkedOutItems: itemsToCheckout,
      remainingCart: cart,
    });
  } catch (error) {
    console.log(error.message);
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
    console.log(error.message);
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