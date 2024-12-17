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

let handleCheckAllCartItem = async (req, res) => {
    try {
        const { userId, isChecked } = req.body;
        const respon = await cartService.checkAllCartItem(userId, isChecked);
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

let handleGetCheckedAllCartItem = async (req, res) => {
    try {
        const userId = req.query.userId;
        let respon = await cartService.getCheckedAllCartItem(userId);
        const { statusCode, ...data } = respon;
        res.status(statusCode).json({
            ...data
        })
    } catch (error) {
        return {
            statusCode: 500,
            message: 'Internal Server Error',
            error: error.message,
        }
    }
}

module.exports = {
    handleAddToCart,
    handleGetCart,
    handleUpdateCartItem,
    handleDeleteCartItem,
    handleCheckAllCartItem,
    handleGetCheckedAllCartItem,
}