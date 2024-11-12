import express from "express";
import homeController from "../controllers/homeController";
import userController from "../controllers/userController";
import productController from "../controllers/productController";
import cartController from "../controllers/cartController";
import orderController from "../controllers/orderController";
import authenticateToken from "../utils/authenticateToken";
let router = express.Router();

let initWebRoutes = (app) => {  // khởi tạo các router 
    // router.get("/", homeController.getHomePage);
    // router.get("/about", homeController.getAboutMe);
    // router.get("/crud", homeController.getCRUD);
    // router.post("/post-crud", homeController.postCRUD);
    // router.get("/get-crud", homeController.displayGetCRUD);
    // router.get("/edit-crud", homeController.getEditCRUD);
    // router.post("/put-crud", homeController.putCRUD);
    // router.get("/delete-crud", homeController.deleteCRUD);

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

    // API order 
    router.get('/api/get-address', orderController.handleGetAddress);
    // rest api 
    return app.use("/", router);
}

module.exports = initWebRoutes; 