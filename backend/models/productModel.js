import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  category: {
      type: String,
      required: true,
  },
  stock: {
      type: Number,
      required: true,
  },
  weight:{
      type: String,
      required: true,
  },
  advantages: {
      type: String,
      required: true,
  }
});

const productModel = mongoose.models.product || mongoose.model("product", productSchema);

export default productModel;
