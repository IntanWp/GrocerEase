import { v2 as cloudinary } from "cloudinary";
import productModel from "../models/productModel.js";

//function for adding a product
const addProduct = async (req, res) => {
  //make a middleware with multer to upload images
  try {
    const { name, description, price, category, stock, weight, advantages } = req.body;
    const image = req.file;

    //image gabisa masuk DB, jadi diupload ke cloudinary trs dijadiin url

    let result = await cloudinary.uploader.upload(image.path, {
      resource_type: "image",
    });
    let imageUrl = result.secure_url;

    const productData = {
      name,
      price: Number(price),
      description,
      image: imageUrl,
      category,
      stock: Number(stock),
      weight,
      advantages,
     
    };

    console.log(productData);

    const product = new productModel(productData);
    await product.save();

    res.json({success: true, message: "Product added successfully"});

  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

//function for list product
const listProducts = async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};
    
    // Add search functionality if search parameter provided
    if (search && search.trim()) {
      query.name = { $regex: search.trim(), $options: 'i' };
    }
    
    const products = await productModel.find(query);
    res.json({ success: true, products });

  } catch (error) {
    console.log(error);
    res.json({
        success: false,
        message: error.message,
    });
  }
};

//function for removing a product
const removeProduct = async (req, res) => {
  try {
    await productModel.findByIdAndDelete(req.body.id);
    res.json({ success: true, message: "Product removed successfully" });

  } catch (error) {
    console.log(error);
    res.json({
        success: false,
        message: error.message,
    });
  }
};

//function for single product info
const singleProduct = async (req, res) => {
  try {
    const { productId } = req.body;
    const product = await productModel.findById(productId);
    res.json({ success: true, product });

  } catch (error) {
    console.log(error);
    res.json({
        success: false,
        message: error.message,
    });
  }
};

export { addProduct, listProducts, removeProduct, singleProduct };
