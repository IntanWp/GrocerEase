import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  firstName:{
    type: String,
    required: true,
  },
    lastName: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  regularCart: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'regularCart',
    default: null
  },
  monthlyCart: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'monthlyCart',
    default: null
  },
  activeCollabCart: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'collaborativeCart',
    default: null
  }
}, {minimize: false});

const userModel = mongoose.models.user || mongoose.model("user", userSchema);

export default userModel;
