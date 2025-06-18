import regularCartModel from "../models/regularCartModel.js";
import productModel from "../models/productModel.js";

// Get user's regular cart
const getRegularCart = async (req, res) => {
  try {
    const { userId } = req.params;
    
    console.log('====== CART GET ITEMS ======');
    console.log('User ID:', userId);
    console.log('============================');
    console.log('');

    const cart = await regularCartModel.findOne({ userId });
    
    console.log('====== CART FETCH RESULT ======');
    console.log('Cart Found:', cart ? 'YES' : 'NO');
    console.log('Items Count:', cart ? cart.items.length : 0);
    console.log('===============================');
    console.log('');

    if (!cart) {
      console.log('====== CART EMPTY RESPONSE ======');
      console.log('Returning empty cart for user:', userId);
      console.log('==================================');
      console.log('');
      
      return res.json({
        success: true,
        message: "No cart found",
        cart: { userId, items: [] },
      });
    }

    console.log('====== CART POPULATE START ======');
    console.log('Populating products for items:', cart.items.map(item => item.productId));
    console.log('==================================');
    console.log('');

    // Populate product details for each cart item
    const populatedItems = await Promise.all(
      cart.items.map(async (item) => {
        try {
          const product = await productModel.findById(item.productId);
          
          console.log('====== PRODUCT LOOKUP ======');
          console.log('Product ID:', item.productId);
          console.log('Product Found:', product ? 'YES' : 'NO');
          console.log('Product Name:', product ? product.name : 'N/A');
          console.log('============================');
          console.log('');
          
          return {
            productId: item.productId,
            quantity: item.quantity,
            product: product || null // null if product not found
          };
        } catch (error) {
          console.log('====== PRODUCT ERROR ======');
          console.log('Product ID:', item.productId);
          console.log('Error:', error.message);
          console.log('===========================');
          console.log('');
          
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

    console.log('====== CART SUCCESS ======');
    console.log('Total Items Returned:', populatedItems.length);
    console.log('Valid Products:', populatedItems.filter(item => item.product).length);
    console.log('==========================');
    console.log('');

    res.json({
      success: true,
      cart: populatedCart,
    });
  } catch (error) {
    console.log(error);
    console.log('====== CART GET ERROR ======');
    console.log('User ID:', req.params.userId);
    console.log('Error:', error.message);
    console.log('============================');
    console.log('');
    
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
    
    console.log('====== CART ADD ITEM ======');
    console.log('User ID:', userId);
    console.log('Product ID:', productId);
    console.log('Quantity:', quantity);
    console.log('Product ID Type:', typeof productId);
    console.log('===========================');
    console.log('');

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
      console.log('====== CART CREATE NEW ======');
      console.log('Creating new cart for user:', userId);
      console.log('=============================');
      console.log('');
      
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
      
      console.log('====== CART UPDATE EXISTING ======');
      console.log('Current Quantity:', currentQuantity);
      console.log('Adding Quantity:', addQuantity);
      console.log('New Quantity:', newQuantity);
      console.log('==================================');
      console.log('');
      
      cart.items[existingItemIndex].quantity = newQuantity;
    } else {
      console.log('====== CART ADD NEW ITEM ======');
      console.log('Adding new item to cart');
      console.log('Product ID String:', productIdString);
      console.log('Final Quantity:', Number(quantity) || 1);
      console.log('===============================');
      console.log('');
      
      // Add new item
      cart.items.push({
        productId: productIdString,
        quantity: Number(quantity) || 1,
      });
    }

    await cart.save();
    
    console.log('====== CART SAVE SUCCESS ======');
    console.log('Total Items in Cart:', cart.items.length);
    console.log('Cart Items:', cart.items.map(item => ({ id: item.productId, qty: item.quantity })));
    console.log('===============================');
    console.log('');

    res.json({
      success: true,
      message: "Item added to cart",
      cart,
    });
  } catch (error) {
    console.log('====== CART ADD ERROR ======');
    console.log('User ID:', req.body.userId);
    console.log('Product ID:', req.body.productId);
    console.log('Error:', error.message);
    console.log('============================');
    console.log('');
    
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

    console.log('====== CART UPDATE QUANTITY ======');
    console.log('User ID:', userId);
    console.log('Product ID:', productId);
    console.log('New Quantity:', quantity);
    console.log('===================================');
    console.log('');

    const cart = await regularCartModel.findOne({ userId });

    if (!cart) {
      console.log('====== CART UPDATE ERROR ======');
      console.log('Cart not found for user:', userId);
      console.log('===============================');
      console.log('');
      
      return res.json({
        success: false,
        message: "Cart not found",
      });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.productId === productId
    );

    if (itemIndex === -1) {
      console.log('====== CART UPDATE ERROR ======');
      console.log('Product not found in cart:', productId);
      console.log('Available Products:', cart.items.map(item => item.productId));
      console.log('===============================');
      console.log('');
      
      return res.json({
        success: false,
        message: "Item not found in cart",
      });
    }    const newQuantity = Number(quantity) || 0;
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

    console.log('====== CART UPDATE PROCESS ======');
    console.log('Old Quantity:', oldQuantity);
    console.log('New Quantity:', newQuantity);
    console.log('==================================');
    console.log('');

    if (newQuantity <= 0) {
      // Remove item if quantity is 0 or negative
      console.log('====== CART ITEM REMOVE ======');
      console.log('Removing item due to quantity <= 0');
      console.log('==============================');
      console.log('');
      
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = newQuantity;
    }

    await cart.save();

    console.log('====== CART UPDATE SUCCESS ======');
    console.log('Action:', newQuantity <= 0 ? 'REMOVED' : 'UPDATED');
    console.log('Remaining Items:', cart.items.length);
    console.log('=================================');
    console.log('');

    res.json({
      success: true,
      message: "Item quantity updated",
      cart,
    });
  } catch (error) {
    console.log('====== CART UPDATE ERROR ======');
    console.log('User ID:', req.body.userId);
    console.log('Product ID:', req.body.productId);
    console.log('Error:', error.message);
    console.log('===============================');
    console.log('');
    
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

    console.log('====== CART REMOVE ITEM ======');
    console.log('User ID:', userId);
    console.log('Product ID:', productId);
    console.log('==============================');
    console.log('');

    const cart = await regularCartModel.findOne({ userId });

    if (!cart) {
      console.log('====== CART REMOVE ERROR ======');
      console.log('Cart not found for user:', userId);
      console.log('===============================');
      console.log('');
      
      return res.json({
        success: false,
        message: "Cart not found",
      });
    }

    const originalCount = cart.items.length;
    const itemExists = cart.items.some(item => item.productId === productId);

    console.log('====== CART REMOVE PROCESS ======');
    console.log('Original Item Count:', originalCount);
    console.log('Item Exists:', itemExists);
    console.log('=================================');
    console.log('');

    cart.items = cart.items.filter((item) => item.productId !== productId);
    await cart.save();

    const newCount = cart.items.length;
    const removed = originalCount - newCount;

    console.log('====== CART REMOVE SUCCESS ======');
    console.log('Items Removed:', removed);
    console.log('Remaining Items:', newCount);
    console.log('=================================');
    console.log('');

    res.json({
      success: true,
      message: "Item removed from cart",
      cart,
    });
  } catch (error) {
    console.log('====== CART REMOVE ERROR ======');
    console.log('User ID:', req.body.userId);
    console.log('Product ID:', req.body.productId);
    console.log('Error:', error.message);
    console.log('===============================');
    console.log('');
    
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

    console.log('====== CART CHECKOUT START ======');
    console.log('User ID:', userId);
    console.log('Selected Product IDs:', productId);
    console.log('Product Count:', productId ? productId.length : 0);
    console.log('==================================');
    console.log('');

    const cart = await regularCartModel.findOne({ userId });

    if (!cart) {
      console.log('====== CART CHECKOUT ERROR ======');
      console.log('Cart not found for user:', userId);
      console.log('==================================');
      console.log('');
      
      return res.json({
        success: false,
        message: "Cart not found",
      });
    }

    if (!productId || productId.length === 0) {
      console.log('====== CART CHECKOUT ERROR ======');
      console.log('No items selected for checkout');
      console.log('==================================');
      console.log('');
      
      return res.json({
        success: false,
        message: "No items selected for checkout",
      });
    }

    // Convert all productIds to strings for consistent comparison
    const selectedProductIds = productId.map(id => String(id));

    console.log('====== CART CHECKOUT PROCESS ======');
    console.log('Selected Product IDs (String):', selectedProductIds);
    console.log('Cart Items Before:', cart.items.map(item => ({ id: item.productId, qty: item.quantity })));
    console.log('===================================');
    console.log('');

    // Get the selected items with their details
    const itemsToCheckout = cart.items.filter((item) =>
      selectedProductIds.includes(String(item.productId))
    );

    console.log('====== CART CHECKOUT ITEMS ======');
    console.log('Items to Checkout:', itemsToCheckout.length);
    console.log('Checkout Items:', itemsToCheckout.map(item => ({ id: item.productId, qty: item.quantity })));
    console.log('==================================');
    console.log('');    if (itemsToCheckout.length === 0) {
      console.log('====== CART CHECKOUT ERROR ======');
      console.log('Selected items not found in cart');
      console.log('==================================');
      console.log('');
      
      return res.json({
        success: false,
        message: "Selected items not found in cart",
      });
    }

    // Validate stock availability for all items before processing
    console.log('====== STOCK VALIDATION START ======');
    for (const item of itemsToCheckout) {
      const product = await productModel.findById(item.productId);
      if (!product) {
        console.log('Product not found:', item.productId);
        return res.json({
          success: false,
          message: `Product not found: ${item.productId}`,
        });
      }
      
      if (product.stock < item.quantity) {
        console.log(`Insufficient stock for ${product.name}: Available ${product.stock}, Requested ${item.quantity}`);
        return res.json({
          success: false,
          message: `Insufficient stock for ${product.name}. Only ${product.stock} items available, but ${item.quantity} requested.`,
        });
      }
    }
    console.log('Stock validation passed for all items');
    console.log('=====================================');
    console.log('');

    // Update stock for all checked out items
    console.log('====== STOCK UPDATE START ======');
    for (const item of itemsToCheckout) {
      const product = await productModel.findById(item.productId);
      product.stock -= item.quantity;
      await product.save();
      console.log(`Updated stock for ${product.name}: ${product.stock + item.quantity} -> ${product.stock}`);
    }
    console.log('Stock update completed');
    console.log('=================================');
    console.log('');

    // Remove checked out items from cart
    const originalItemCount = cart.items.length;
    cart.items = cart.items.filter(
      (item) => !selectedProductIds.includes(String(item.productId))
    );

    await cart.save();

    console.log('====== CART CHECKOUT SUCCESS ======');
    console.log('Items Checked Out:', itemsToCheckout.length);
    console.log('Original Cart Items:', originalItemCount);
    console.log('Remaining Cart Items:', cart.items.length);
    console.log('Items Removed:', originalItemCount - cart.items.length);
    console.log('===================================');
    console.log('');

    res.json({
      success: true,
      message: "Checkout successful",
      checkedOutItems: itemsToCheckout,
      remainingCart: cart,
    });
  } catch (error) {
    console.log('====== CART CHECKOUT ERROR ======');
    console.log('User ID:', req.body.userId);
    console.log('Error:', error.message);
    console.log('Stack:', error.stack);
    console.log('==================================');
    console.log('');
    
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