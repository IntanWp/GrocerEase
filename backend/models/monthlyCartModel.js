import mongoose from "mongoose";

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

const monthlyCartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  items: [itemSchema]
});

const monthlyCartModel = mongoose.models.monthlyCart || mongoose.model("monthlyCart", monthlyCartSchema);

export default monthlyCartModel;
