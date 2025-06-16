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


const regularCartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  items: [itemSchema]

});

const regularCartModel = mongoose.models.regularCart || mongoose.model("regularCart", regularCartSchema);

export default regularCartModel;
