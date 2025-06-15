import mongoose from "mongoose";

const ingredientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  quantity: {
    type: String,
    required: true
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'product', 
    required: false // Optional, some ingredients might not have associated products
  },
  // Alternative product matching (if productId is not available)
  productName: {
    type: String,
    required: false 
  }
});

const cookingStepSchema = new mongoose.Schema({
  stepNumber: {
    type: Number,
    required: true
  },
  instruction: {
    type: String,
    required: true
  }
});

const recipeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Easy'
  },
  image: {
    type: String,
    required: true
  },
  ingredients: [ingredientSchema],
  cookingSteps: [cookingStepSchema]
}, {
  timestamps: true
});

const recipeModel = mongoose.models.recipe || mongoose.model("recipe", recipeSchema);
export default recipeModel;