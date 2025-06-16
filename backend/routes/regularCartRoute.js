import express from "express";
import {
  getRegularCart,
  addItemToRegularCart,
  updateRegularCartItemQuantity,
  removeItemFromRegularCart,
  checkoutRegularCart,
  checkoutEntireRegularCart,
  clearRegularCart,
} from "../controllers/regularCartController.js";
import authUser from "../middleware/adminAuth.js";

const regularCartRouter = express.Router();

// Get user's regular cart
regularCartRouter.get("/get/:userId", authUser, getRegularCart);

// Add item to regular cart
regularCartRouter.post("/add", authUser, addItemToRegularCart);

// Update item quantity in regular cart
regularCartRouter.post("/update-quantity", authUser, updateRegularCartItemQuantity);

// Remove item from regular cart
regularCartRouter.post("/remove", authUser, removeItemFromRegularCart);

// Checkout selected items from regular cart
regularCartRouter.post("/checkout-selected", authUser, checkoutRegularCart);

// Checkout entire regular cart
regularCartRouter.post("/checkout-entire", authUser, checkoutEntireRegularCart);

// Clear entire regular cart
regularCartRouter.delete("/clear", authUser, clearRegularCart);

export default regularCartRouter;