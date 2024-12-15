import express from "express";
import userController from "../controllers/userController";
import productController from "../controllers/productController";
import cartController from "../controllers/cartController";
import addressController from "../controllers/addressController";
import orderController from "../controllers/orderController";
import authenticateToken from "../utils/authenticateToken";
let router = express.Router();

let initWebRoutes = (app) => {
    // API 
    router.post('/api/login', userController.handleLogin);
    router.get('/api/get-all-users', userController.handleGetAllUsers);
    router.post('/api/create-new-user', userController.handleCreateNewUser);
    router.patch('/api/edit-user', userController.handleEditUser);
    router.delete('/api/delete-user', userController.handleDeleteUser);
    router.get('/api/getUserInfo', authenticateToken, userController.handleGetUserInfo);

    // API product 
    router.get('/api/get-all-categories', productController.handleGetAllCategories);
    router.get('/api/get-products', productController.handleGetProducts);
    router.get('/api/get-product-details', productController.handleGetProductDetails);
    router.get('/api/get-products-related', productController.handleGetProductsRelated);
    router.get('/api/get-bestseller', productController.handleBestSeller);
    router.get('/api/search-products', productController.handleSearchProducts);

    // API cart 
    router.post('/api/add-to-cart', cartController.handleAddToCart);
    router.get('/api/get-cart', cartController.handleGetCart);
    router.patch('/api/update-cartitem', cartController.handleUpdateCartItem);
    router.delete('/api/delete-cartitem', cartController.handleDeleteCartItem);
    router.patch('/api/check-all-cartitem', cartController.handleCheckAllCartItem);
    // API address
    router.get('/api/get-address', addressController.handleGetAddress);
    router.post('/api/add-address', addressController.handleAddAddress);
    router.patch('/api/edit-address', addressController.handleEditAddress);
    router.patch('/api/set-address-default', addressController.handleSetAddressDefault);
    router.delete('/api/delete-address', addressController.handleDeleteAddress);

    // API order 
    router.get('/api/checkout', orderController.handleCheckout);
    router.post('/api/create-order', orderController.handleCreateOrder);
    router.get('/api/return-order', orderController.handleReturnOrder);
    router.get('/api/cancel-order', orderController.handleCancelOrder);
    router.get('/api/get-my-orders', orderController.handleGetMyOrders);
    // rest api 
    return app.use("/", router);
}

module.exports = initWebRoutes; 