import express from "express";
import {
getMonthlyCart,
  addItemToMonthlyCart,
  updateMonthlyCartItemQuantity,
  removeItemFromMonthlyCart,
  checkoutMonthlyCart,
  checkoutEntireMonthlyCart,
  clearMonthlyCart,
} from "../controllers/monthlyCartController.js";
import authUser from "../middleware/adminAuth.js";

const monthlyCartRouter = express.Router();

// Get user's monthly cart
monthlyCartRouter.get("/get/:userId", authUser, getMonthlyCart);

// Add item to monthly cart
monthlyCartRouter.post("/add", authUser, addItemToMonthlyCart);

// Update item quantity in monthly cart
monthlyCartRouter.post("/update-quantity", authUser, updateMonthlyCartItemQuantity);

// Remove item from monthly cart
monthlyCartRouter.post("/remove", authUser, removeItemFromMonthlyCart);

// Checkout selected items from monthly cart
monthlyCartRouter.post("/checkout-selected", authUser, checkoutMonthlyCart);

// Checkout entire monthly cart
monthlyCartRouter.post("/checkout-entire", authUser, checkoutEntireMonthlyCart);

// Clear entire monthly cart
monthlyCartRouter.delete("/clear", authUser, clearMonthlyCart);

export default monthlyCartRouter;