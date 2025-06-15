import collaborativeCartModel from "../models/collabCartModel.js";
import userModel from "../models/userModel.js";
import productModel from "../models/productModel.js";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

// Generate unique cart ID
const generateCartId = () => {
  return uuidv4().substring(0, 8).toUpperCase();
};

// Generate invite token
const generateInviteToken = () => {
  return uuidv4();
};

// Create a new collaborative cart
const createCollaborativeCart = async (req, res) => {
  try {
    const { userId } = req.body;
    const {
      allowMembersToInvite = false,
      allowMembersToRemoveItems = true,
      maxMembers = 10,
    } = req.body.settings || {};

    // Check if user already has an active collaborative cart
    const existingCart = await collaborativeCartModel.findOne({
      $or: [{ createdBy: userId }, { "members.userId": userId }],
      status: "active",
    });

    if (existingCart) {
      return res.json({
        success: false,
        message: "You already have an active collaborative cart",
      });
    }

    const cartId = generateCartId();

    const newCart = new collaborativeCartModel({
      cartId,
      createdBy: userId,
      members: [
        {
          userId,
          role: "admin",
        },
      ],
      settings: {
        allowMembersToInvite,
        allowMembersToRemoveItems,
        maxMembers,
      },
    });

    const savedCart = await newCart.save();
    await savedCart.populate(
      "members.userId",
      "firstName lastName username email"
    );

    res.json({
      success: true,
      message: "Collaborative cart created successfully",
      cart: savedCart,
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

// Get cart details
const getUserCollaborativeCart = async (req, res) => {
  try {

    console.log('=== CONTROLLER DEBUG ===');
    console.log('req.params.userId:', req.params.userId);
    console.log('req.body.userId (from auth):', req.body.userId);
    console.log('req.user:', req.user); // Alternative cleaner approach
    console.log('========================');

    const { userId } = req.params;

    const cart = await collaborativeCartModel
      .findOne({
        $or: [{ createdBy: userId }, { "members.userId": userId }],
        status: "active",
      })
      .populate("members.userId", "firstName lastName username email")
      .populate("createdBy", "firstName lastName username email");

    if (!cart) {
      return res.json({
        success: true,
        message: "No active collaborative cart found",
        cart: null,
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

// Generate invite link
const generateInviteLink = async (req, res) => {
  try {
    const { cartId, userId, invitedEmail } = req.body;

    const cart = await collaborativeCartModel.findOne({
      cartId,
      status: "active",
    });

    if (!cart) {
      return res.json({
        success: false,
        message: "Cart not found or inactive",
      });
    }

    // Check if user has permission to invite
    if (!cart.isAdmin(userId) && !cart.settings.allowMembersToInvite) {
      return res.json({
        success: false,
        message: "You don't have permission to invite members",
      });
    }

    // Check if cart is at max capacity
    if (cart.members.length >= cart.settings.maxMembers) {
      return res.json({
        success: false,
        message: "Cart has reached maximum member limit",
      });
    }

    // Check if user is already invited or member
    const existingInvitation = cart.invitations.find(
      (inv) => inv.invitedEmail === invitedEmail && inv.status === "pending"
    );
    const existingMember = await userModel.findOne({ email: invitedEmail });

    if (existingMember && cart.isMember(existingMember._id)) {
      return res.json({
        success: false,
        message: "User is already a member of this cart",
      });
    }

    if (existingInvitation) {
      return res.json({
        success: false,
        message: "Invitation already sent to this email",
      });
    }

    const inviteToken = generateInviteToken();

    cart.invitations.push({
      invitedEmail,
      inviteToken,
      status: "pending",
    });

    await cart.save();
    // Generate invite link

    res.json({
      success: true,
      message: "Invite link generated successfully",
      inviteToken,
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

//join cart via invite link
const joinCartViaInvite = async (req, res) => {
    try {
        const { inviteToken } = req.params; // Get from URL params
        const { userId } = req.body; // Get from auth middleware

        const cart = await collaborativeCartModel.findOne({ 
            'invitations.inviteToken': inviteToken,
            status: 'active'
        });

        if (!cart) {
            return res.json({
                success: false,
                message: "Invalid or expired invite link"
            });
        }

        const invitation = cart.invitations.find(inv => inv.inviteToken === inviteToken);
        
        if (!invitation || invitation.status !== 'pending') {
            return res.json({
                success: false,
                message: "Invitation is no longer valid"
            });
        }

        // Check if user is already a member
        if (cart.isMember(userId)) {
            return res.json({
                success: true,
                message: "You are already a member of this cart",
                cart,
                alreadyMember: true
            });
        }

        // Check if cart is at max capacity
        if (cart.members.length >= cart.settings.maxMembers) {
            return res.json({
                success: false,
                message: "Cart has reached maximum member limit"
            });
        }

        // Add user to members
        cart.members.push({
            userId,
            role: 'member'
        });

        // Update invitation status
        invitation.status = 'accepted';
        invitation.invitedUserId = userId;

        await cart.save();
        await cart.populate('members.userId', 'firstName lastName username email');

        res.json({
            success: true,
            message: "Successfully joined the collaborative cart",
            cart,
            newMember: true
        });

    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: error.message
        });
    }
};

// Add item to collaborative cart
const addItemToCart = async (req, res) => {
  try {
    const { cartId, userId, productId, quantity = 1 } = req.body;

    const cart = await collaborativeCartModel.findOne({
      cartId,
      status: "active",
    });

    if (!cart) {
      return res.json({
        success: false,
        message: "Cart not found or inactive",
      });
    }

    if (!cart.isMember(userId)) {
      return res.json({
        success: false,
        message: "You are not a member of this cart",
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
      message: "Item added to collaborative cart",
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

// Update item quantity
const updateItemQuantity = async (req, res) => {
  try {
    const { cartId, userId, productId, quantity } = req.body;

    const cart = await collaborativeCartModel.findOne({
      cartId,
      status: "active",
    });

    if (!cart) {
      return res.json({
        success: false,
        message: "Cart not found or inactive",
      });
    }

    if (!cart.isMember(userId)) {
      return res.json({
        success: false,
        message: "You are not a member of this cart",
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

// Remove item from cart
const removeItemFromCart = async (req, res) => {
  try {
    const { cartId, userId, productId } = req.body;

    const cart = await collaborativeCartModel.findOne({
      cartId,
      status: "active",
    });

    if (!cart) {
      return res.json({
        success: false,
        message: "Cart not found or inactive",
      });
    }

    if (!cart.isMember(userId)) {
      return res.json({
        success: false,
        message: "You are not a member of this cart",
      });
    }

    // Check permissions
    if (!cart.settings.allowMembersToRemoveItems && !cart.isAdmin(userId)) {
      return res.json({
        success: false,
        message: "You don't have permission to remove items",
      });
    }

    cart.items = cart.items.filter((item) => item.productId !== productId);
    await cart.save();

    res.json({
      success: true,
      message: "Item removed from collaborative cart",
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

//checkout collaborative cart
const checkoutCollaborativeCart = async (req, res) => {
  try {
    const { cartId, userId } = req.body;

    const cart = await collaborativeCartModel.findOne({
      cartId,
      status: "active",
    });

    if (!cart) {
      return res.json({
        success: false,
        message: "Cart not found or inactive",
      });
    }

    if (!cart.isAdmin(userId)) {
      return res.json({
        success: false,
        message: "Only cart admin can checkout",
      });
    }

    if (cart.items.length === 0) {
      return res.json({
        success: false,
        message: "Cannot checkout empty cart",
      });
    }

    await collaborativeCartModel.findOneAndDelete({ cartId });

    res.json({
      success: true,
      message: "Cart checked out successfully",
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

// End collaborative cart (without checkout)
const endCollaborativeCart = async (req, res) => {
  try {
    const { cartId, userId } = req.body;

    const cart = await collaborativeCartModel.findOne({
      cartId,
      status: "active",
    });

    if (!cart) {
      return res.json({
        success: false,
        message: "Cart not found or inactive",
      });
    }

    if (!cart.isAdmin(userId)) {
      return res.json({
        success: false,
        message: "Only cart admin can end the cart",
      });
    }

    await collaborativeCartModel.findOneAndDelete({ cartId });

    res.json({
      success: true,
      message: "Collaborative cart ended successfully",
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

// Leave collaborative cart
const leaveCollaborativeCart = async (req, res) => {
  try {
    const { cartId, userId } = req.body;

    const cart = await collaborativeCartModel.findOne({
      cartId,
      status: "active",
    });

    if (!cart) {
      return res.json({
        success: false,
        message: "Cart not found or inactive",
      });
    }

    if (!cart.isMember(userId)) {
      return res.json({
        success: false,
        message: "You are not a member of this cart",
      });
    }

    // Don't allow creator to leave (they should end the cart instead)
    if (cart.createdBy.toString() === userId.toString()) {
      return res.json({
        success: false,
        message: "Cart creator cannot leave. Please end the cart instead.",
      });
    }

    cart.members = cart.members.filter(
      (member) => member.userId.toString() !== userId.toString()
    );
    await cart.save();

    res.json({
      success: true,
      message: "Successfully left the collaborative cart",
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

// Get invite details (for invite page)
const getInviteDetails = async (req, res) => {
  try {
    const { inviteToken } = req.params;

    const cart = await collaborativeCartModel
      .findOne({
        "invitations.inviteToken": inviteToken,
        status: "active",
      })
      .populate("createdBy", "firstName lastName username");

    if (!cart) {
      return res.json({
        success: false,
        message: "Invalid or expired invite link",
      });
    }

    const invitation = cart.invitations.find(
      (inv) => inv.inviteToken === inviteToken
    );

    if (!invitation || invitation.status !== "pending") {
      return res.json({
        success: false,
        message: "Invitation is no longer valid",
      });
    }

    res.json({
      success: true,
      inviteDetails: {
        cartId: cart.cartId,
        createdBy: cart.createdBy,
        memberCount: cart.members.length,
        maxMembers: cart.settings.maxMembers,
        itemCount: cart.items.length,
      },
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
};
