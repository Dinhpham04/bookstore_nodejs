import cartService from '../services/cartService';



let handleAddToCart = async (req, res) => {
    try {
        const { userId, productId, quantity } = req.body;
        const respon = await cartService.addToCart(userId, productId, quantity);
        const { statusCode, ...data } = respon;
        res.status(statusCode).json(data);
    } catch (error) {
        res.status(500).json(error.message);
    }
}

let handleGetCart = async (req, res) => {
    try {
        let userId = req.query.userId;
        let respon = await cartService.getCart(userId);
        res.status(respon.statusCode).json({
            message: respon.message,
            cartItems: respon.cart,
            totalAmount: respon.totalAmount,
            totalQuantity: respon.totalQuantity,
        })
    } catch (error) {
        res.status(500).json(error.message);
    }
}

let handleUpdateCartItem = async (req, res) => {
    try {
        const { cartItemId, quantity, isChecked } = req.body;
        const respon = await cartService.updateCartItem(cartItemId, quantity, isChecked);
        const { statusCode, ...data } = respon;
        res.status(statusCode).json({
            ...data
        })
    } catch (error) {
        res.status(500).json({
            message: error.message,
        })
    }
}

let handleDeleteCartItem = async (req, res) => {
    try {
        const cartItemId = req.query.cartItemId;
        const respon = await cartService.deleteCartItem(cartItemId);
        const { statusCode, ...data } = respon;
        res.status(statusCode).json({
            ...data
        })
    } catch (error) {

    }
}

module.exports = {
    handleAddToCart,
    handleGetCart,
    handleUpdateCartItem,
    handleDeleteCartItem
}