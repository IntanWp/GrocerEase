import mongoose from 'mongoose';

const memberSchema = new mongoose.Schema({
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
    role: {
      type: String,
      enum: ['admin', 'member'],
      default: 'member',
    }
})

const itemSchema = new mongoose.Schema({
    productId: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      default: 1,
    }
})

const invitationsSchema = new mongoose.Schema({
    invitedUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
    },
    invitedEmail: {
      type: String,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'expired'],
      default: 'pending',
    },
    inviteToken: {
      type: String,
      required: true,
    }
})

const collaborativeCartSchema = new mongoose.Schema({
  cartId: {
    type: String,
    required: true,
    unique: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  members: [memberSchema],
  invitations: [invitationsSchema],
  items: [itemSchema],
  status: {
    type: String,
    enum: ['active', 'ended', 'checked_out'],
    default: 'active',
  },
  totalAmount: {
    type: Number,
    default: 0,
  },
  endedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
  },
  endedAt: {
    type: Date,
  },
  checkedOutAt: {
    type: Date,
  },
  settings: {
    allowMembersToInvite: {
      type: Boolean,
      default: false,
    },
    allowMembersToRemoveItems: {
      type: Boolean,
      default: true,
    },
    maxMembers: {
      type: Number,
      default: 10,
    }
  }
}, {
  timestamps: true,
  minimize: false
});

// Index for better query performance
// collaborativeCartSchema.index({ cartId: 1 });
collaborativeCartSchema.index({ 'members.userId': 1 });
collaborativeCartSchema.index({ status: 1 });

// Virtual for total members count
collaborativeCartSchema.virtual('memberCount').get(function() {
  return this.members.length;
});

// Method to calculate total amount
collaborativeCartSchema.methods.calculateTotal = function() {
  this.totalAmount = this.items.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);
  return this.totalAmount;
};

// Method to check if user is member
collaborativeCartSchema.methods.isMember = function(userId) {
  return this.members.some(member => member.userId.toString() === userId.toString());
};

// Method to check if user is admin
collaborativeCartSchema.methods.isAdmin = function(userId) {
  return this.members.some(member => 
    member.userId.toString() === userId.toString() && member.role === 'admin'
  ) || this.createdBy.toString() === userId.toString();
};

const collaborativeCartModel = mongoose.models.collaborativeCart || 
  mongoose.model("collaborativeCart", collaborativeCartSchema);

export default collaborativeCartModel;

