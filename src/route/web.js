import express from "express";
import userController from "../controllers/userController";
import productController from "../controllers/productController";
import cartController from "../controllers/cartController";
import addressController from "../controllers/addressController";
import authenticateToken from "../utils/authenticateToken";
let router = express.Router();

let initWebRoutes = (app) => {
    // API 
    router.post('/api/login', userController.handleLogin);
    router.get('/api/get-all-users', userController.handleGetAllUsers);
    router.post('/api/create-new-user', userController.handleCreateNewUser);
    router.put('/api/edit-user', userController.handleEditUser);
    router.delete('/api/delete-user', userController.handleDeleteUser);
    router.get('/api/getUserInfo', authenticateToken, userController.handleGetUserInfo);

    // API product 
    router.get('/api/get-all-categories', productController.handleGetAllCategories);
    router.get('/api/get-products', productController.handleGetProducts);
    router.get('/api/get-product-details', productController.handleGetProductDetails);
    router.get('/api/get-products-related', productController.handleGetProductsRelated);

    // API cart 
    router.post('/api/add-to-cart', cartController.handleAddToCart);
    router.get('/api/get-cart', cartController.handleGetCart);
    router.put('/api/update-cartitem', cartController.handleUpdateCartItem);
    router.delete('/api/delete-cartitem', cartController.handleDeleteCartItem);

    // API address
    router.get('/api/get-address', addressController.handleGetAddress);
    router.post('/api/add-address', addressController.handleAddAddress);
    router.put('/api/edit-address', addressController.handleEditAddress);
    router.put('/api/set-address-default', addressController.handleSetAddressDefault);

    // rest api 
    return app.use("/", router);
}

module.exports = initWebRoutes; 