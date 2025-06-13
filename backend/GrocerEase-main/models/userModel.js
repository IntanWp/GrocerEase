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
  cartData: {
    type: Object,
    default: {},
  }
}, {minimize: false});

const userModel = mongoose.models.user || mongoose.model("user", userSchema);

export default userModel;
