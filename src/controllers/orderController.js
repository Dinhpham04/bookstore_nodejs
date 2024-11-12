import orderService from '../services/orderService';


let handleGetAddress = async (req, res) => {
    try {
        const userId = req.query.userId;
        const respon = await orderService.getAddress(userId);
        const { statusCode, ...data } = respon;
        res.status(statusCode).json({
            ...data,
        })
    } catch (error) {
        return res.status(500).json({
            message: 'Internal Server Error',
            error: error.message,
        })
    }
}
module.exports = {
    handleGetAddress,
}