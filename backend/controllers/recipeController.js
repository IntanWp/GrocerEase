import recipeModel from '../models/recipeModel.js';
import { v2 as cloudinary } from "cloudinary";
import productModel from '../models/productModel.js';

// Get recipe with associated products
const singleRecipe = async (req, res) => {
  try {
    const { recipeId } = req.body;
    console.log('Fetching recipe with ID:', recipeId);
    
    const recipe = await recipeModel.findById(recipeId);
    console.log('Recipe found:', recipe ? 'YES' : 'NO');

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found'
      });
    }

    console.log('Recipe ingredients count:', recipe.ingredients?.length || 0);// Find products for ingredients
    const ingredientsWithProducts = await Promise.all(
      recipe.ingredients.map(async (ingredient) => {
        let product = null;
        
        // Try to find product by ID first
        if (ingredient.productId) {
          product = await productModel.findById(ingredient.productId);
        }
        
        // If no product found by ID, try to match by productName
        if (!product && ingredient.productName) {
          product = await productModel.findOne({
            name: { $regex: ingredient.productName, $options: 'i' }
          });
        }
        
        // If still no product, try to match by ingredient name (with safety check)
        if (!product && ingredient.name) {
          product = await productModel.findOne({
            name: { $regex: ingredient.name, $options: 'i' }
          });
        }

        return {
          ingredient,
          product
        };
      })
    );

    res.json({
      success: true,
      data: {
        recipe,
        ingredientsWithProducts      }
    });
  } catch (error) {
    console.error('Error in singleRecipe controller:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};



const listRecipes = async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};
    
    // Add search functionality if search parameter provided
    if (search && search.trim()) {
      query.title = { $regex: search.trim(), $options: 'i' };
    }
    
    const recipes = await recipeModel.find(query);
    res.json({
      success: true,
      data: recipes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Create new recipe (existing function)
const addRecipe = async (req, res) => {
  try {
    const { title, description, difficulty } = req.body;
    
    let ingredients, cookingSteps;
    try {
      ingredients = JSON.parse(req.body.ingredients);
      cookingSteps = JSON.parse(req.body.cookingSteps);
    } catch (parseError) {
      return res.json({
        success: false,
        message: "Invalid JSON format for ingredients or cookingSteps"
      });
    }

    const image = req.file;

    let result = await cloudinary.uploader.upload(image.path, {
        resource_type: "image",
    });
    let imageUrl = result.secure_url;

    const newRecipe = new recipeModel({
      title,
      description,
      difficulty,
      image: imageUrl,
      ingredients,
      cookingSteps,
    });

    console.log(newRecipe);
    await newRecipe.save();

    res.json({ success: true, message: "Recipe added successfully" });

  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

const removeRecipe = async (req, res) => {
    try {
        await recipeModel.findByIdAndDelete(req.body.id);
        res.json({ success: true, message: "Recipe removed successfully" });
    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: error.message,
        });
    }
}

export {
    addRecipe,
    listRecipes,
    singleRecipe,
    removeRecipe
};