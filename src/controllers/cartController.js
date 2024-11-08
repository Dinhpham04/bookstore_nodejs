import cartService from '../services/cartService';



let handleAddToCart = async (req, res) => {
    try {
        const { userId, productId, quantity } = req.body;
        const respon = await cartService.addToCart(userId, productId, quantity);
        res.status(respon.statusCode).json({
            message: respon.message
        });
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

module.exports = {
    handleAddToCart,
    handleGetCart,
}