import { Router } from 'express'
import auth from '../middleware/auth.js'
import { createProductController, deleteProductDetails, getProductByCategory, getProductByCategoryAndSubCategory, getProductController, getProductDetails, searchProduct, updateProductDetails } from '../controllers/product.controller.js'
import { admin } from '../middleware/Admin.js'
import seller from '../middleware/Seller.js'

const productRouter = Router()

productRouter.post(
  "/create",
  auth,
  async (req, res, next) => {
    console.log("User object:", req.user); 
    console.log("User role:", req.user.role); 
    if (req.user.role === "ADMIN") return next();
    if (req.user.role === "SELLER") return next();
    return res.status(403).json({ message: "You do not have permission" });
  },
  createProductController
);

productRouter.post('/get',getProductController)
productRouter.post("/get-product-by-category",getProductByCategory)
productRouter.post('/get-pruduct-by-category-and-subcategory',getProductByCategoryAndSubCategory)
productRouter.post('/get-product-details',getProductDetails)

//update product
productRouter.put('/update-product-details', auth, (req, res, next) => {
    if (req.user.role === "ADMIN") return admin(req, res, next);
    if (req.user.role === "SELLER") return seller(req, res, next);
    return res.status(403).json({ message: "You do not have permission" });
}, updateProductDetails);

//delete product
productRouter.delete('/delete-product', auth, (req, res, next) => {
    if (req.user.role === "ADMIN") return admin(req, res, next);
    if (req.user.role === "SELLER") return seller(req, res, next);
    return res.status(403).json({ message: "You do not have permission" });
}, deleteProductDetails);

//search product 
productRouter.post('/search-product',searchProduct)

export default productRouter