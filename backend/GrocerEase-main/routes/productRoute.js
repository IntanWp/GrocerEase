import express from 'express';
import { 
    addProduct,
    listProducts,
    removeProduct,
    singleProduct 
} from '../controllers/productController.js';
import upload from '../middleware/multer.js';

const productRouter = express.Router();

productRouter.post('/add', upload.single('image'), addProduct);
productRouter.post('/remove', removeProduct);
productRouter.post('/single', singleProduct);
productRouter.get('/list', listProducts);

export default productRouter;
// This code defines the product routes for adding, removing, and listing products in an Express application.

