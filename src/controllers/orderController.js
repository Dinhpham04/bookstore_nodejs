import orderService from '../services/orderService';

let handleCheckout = async (req, res) => {
    try {
        const userId = req.query.userId;
        const respon = await orderService.checkOrder(userId);
        const { statusCode, ...data } = respon;
        res.status(statusCode).json({
            ...data
        });
    } catch (error) {
        res.status(500).json({
            message: 'Internal Server Error',
            error: error.message,
        })
    }
}

let handleCreateOrder = async (req, res) => {
    try {
        const respon = await orderService.createOrder(req.body);
        const { statusCode, ...data } = respon;
        return res.status(statusCode).json({
            ...data,
        })
    } catch (error) {
        res.status(500).json({
            message: 'Internal Server Error',
            error: error.message,
        })
    }
}

module.exports = {
    handleCheckout,
    handleCreateOrder,
}