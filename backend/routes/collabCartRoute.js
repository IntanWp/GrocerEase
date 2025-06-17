import express from 'express';
import {
    createCollaborativeCart,
  getUserCollaborativeCart,
  generateInviteLink,
  joinCartViaInvite,
  addItemToCart,
  removeItemFromCart,
  updateItemQuantity,
  checkoutCollaborativeCart,
  endCollaborativeCart,
  leaveCollaborativeCart,
  getInviteDetails,
} from '../controllers/collabCartController.js';
import authMiddleware from '../middleware/adminAuth.js';

const collabCartRouter = express.Router();

// Create a new collaborative cart
collabCartRouter.post('/create', authMiddleware, createCollaborativeCart);

// Get user's collaborative cart
collabCartRouter.get('/user/:userId', authMiddleware, getUserCollaborativeCart);

// Generate invite link
collabCartRouter.post('/invite', authMiddleware, generateInviteLink);

// Get invite details (public route for invite page)
collabCartRouter.get('/invite/:inviteToken', getInviteDetails);

// Join cart via invite link (when clicking the link)
collabCartRouter.post('/join/:inviteToken', authMiddleware, joinCartViaInvite);

// Add item to cart
collabCartRouter.post('/add-item', authMiddleware, addItemToCart);

// Remove item from cart
collabCartRouter.post('/remove-item', authMiddleware, removeItemFromCart);

// Update item quantity
collabCartRouter.post('/update-quantity', authMiddleware, updateItemQuantity);

// Checkout cart
collabCartRouter.post('/checkout', authMiddleware, checkoutCollaborativeCart);

// End cart
collabCartRouter.post('/end', authMiddleware, endCollaborativeCart);

// Leave cart
collabCartRouter.post('/leave', authMiddleware, leaveCollaborativeCart);

export default collabCartRouter;