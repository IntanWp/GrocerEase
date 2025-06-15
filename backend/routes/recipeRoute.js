import express from 'express';
import { 
    addRecipe,
    listRecipes,
    removeRecipe,
    singleRecipe 
} from '../controllers/recipeController.js';  
import upload from '../middleware/multer.js';

const recipeRouter = express.Router();

recipeRouter.post('/add', upload.single('image'), addRecipe);
recipeRouter.post('/remove', removeRecipe);
recipeRouter.post('/single', singleRecipe);
recipeRouter.get('/list', listRecipes);

export default recipeRouter;