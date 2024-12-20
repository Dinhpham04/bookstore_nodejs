import orderService from '../services/orderService';
import db from '../models/index';
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

let handleReturnOrder = async (req, res) => {
    const orderId = req.query.orderCode;
    if (!orderId) {
        return res.status(400).json({
            status: 'error',
            message: 'id missing'
        })
    }
    try {
        const order = await db.Order.findOne({
            where: {
                id: orderId,
            }
        })
        if (!order) {
            return res.status(404).json({
                status: 'error',
                message: 'Order not found',
            })
        }

        order.status = 'processing';
        order.paymentStatus = 'paid';
        await order.save();
        return res.status(200).json({
            status: 'success',
            message: 'Order returned successfully',
        })
    } catch (error) {
        return res.status(500).json({
            message: 'Internal Server Error',
            error: error.message,
        })
    }
}

let handleCancelOrder = async (req, res) => {
    const orderId = req.query.orderCode;
    if (!orderId) {
        return res.status(400).json({
            status: 'error',
            message: 'id missing'
        })
    }
    try {
        const order = await db.Order.findOne({
            where: {
                id: orderId,
            }
        })
        if (!order) {
            return res.status(404).json({
                status: 'error',
                message: 'Order not found',
            })
        }

        // 1. Lấy thông tin các mục hàng trong đơn hàng
        const orderItems = await db.OrderItem.findAll({
            where: { orderId },
            include: [{ model: db.Product, as: 'product' }],
        });

        // 2. Cộng lại số lượng sản phẩm khả dụng
        for (const item of orderItems) {
            await db.Product.update(
                { quantityAvailable: db.sequelize.literal(`quantityAvailable + ${item.quantity}`) },
                { where: { id: item.productId } }
            );
        }


        order.status = 'returned';
        order.paymentStatus = 'unpaid';
        await order.save();
        return res.status(200).json({
            status: 'success',
            message: 'Order is canceled',
        })
    } catch (error) {
        return res.status(500).json({
            message: 'Internal Server Error',
            error: error.message,
        })
    }
}

let handleGetMyOrders = async (req, res) => {
    try {
        const { userId, status } = req.query;
        const respon = await orderService.getMyOrders(userId, status);
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

let handleOrderStatistics = async (req, res) => {
    try {
        const respon = await orderService.getOrderStatistics(req.query);
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

let handleGetRevenueStatistics = async (req, res) => {
    try {
        const respon = await orderService.getRevenueStatistics(req.query);
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

let handelGetAllOrders = async (req, res) => {
    try {
        const respon = await orderService.getAllOrders(req.query);
        const { statusCode, ...data } = respon;
        res.status(statusCode).json({
            message: respon.message,
            ...data
        })
    } catch (error) {
        res.status(500).json({
            message: 'Internal Server Error',
            error: error.message,
        })
    }
}

let handleGetOrderById = async (req, res) => {
    try {
        const orderId = req.query.orderId;
        const respon = await orderService.getOrderById(orderId);
        const { statusCode, ...data } = respon;
        res.status(statusCode).json({
            ...data
        })
    } catch (error) {
        res.status(500).json({
            message: 'Internal Server Error',
            error: error.message,
        })
    }
}

let handleUpdateOrder = async (req, res) => {
    try {
        const respon = await orderService.updateOrder(req.body);
        res.status(respon.statusCode).json({
            message: respon.message,
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
    handleReturnOrder,
    handleCancelOrder,
    handleGetMyOrders,
    handleOrderStatistics,
    handleGetRevenueStatistics,
    handelGetAllOrders,
    handleGetOrderById,
    handleUpdateOrder,
}