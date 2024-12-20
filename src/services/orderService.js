import db from '../models/index';
const axios = require('axios');
const crypto = require('crypto');
import { Op, fn, col, literal } from 'sequelize';
require('dotenv').config();
let shippingPrice = (origin, destination, weight, serviceType = "standard") => {
    try {
        const shippingRates = {
            local: {
                standard: 20000, // Nội thành Hà Nội
                express: 30000,
            },
            regional: {
                standard: 30000, // Các tỉnh lân cận Hà Nội
                express: 50000,
            },
            national: {
                standard: 50000, // Tỉnh thành xa
                express: 800000,
            },
        };

        const destinationDistrict = destination.district.toLowerCase();
        const destinationCity = destination.city.toLowerCase();

        const localDistricts = [
            "ba đình", "hoàn kiếm", "hai bà trưng", "đống đa",
            "thanh xuân", "cầu giấy", "hoàng mai", "long biên",
            "hà đông", "tây hồ", "nam từ liêm", "bắc từ liêm"
        ];

        const regionalDistricts = [
            "thanh trì", "gia lâm", "đông anh", "sóc sơn", "hoài đức",
            "quốc oai", "thạch thất", "đan phượng", "phúc thọ", "chương mỹ",
            "thanh oai", "ứng hòa", "mỹ đức", "ba vì", "thường tín", "sơn tây"
        ];

        let region;

        if (
            origin.city.toLowerCase() === destinationCity &&
            localDistricts.includes(destinationDistrict)
        ) {
            region = "local";
        } else if (
            origin.city.toLowerCase() === destinationCity &&
            regionalDistricts.includes(destinationDistrict)
        ) {
            region = "regional";
        } else {
            region = "national";
        }

        let baseCost = shippingRates[region][serviceType];
        if (weight > 2000) {
            const extraWeight = weight - 2000;
            baseCost += Math.ceil(extraWeight / 500) * 5000; // Tăng 5.000 VNĐ cho mỗi 500g
        }
        return baseCost;
    } catch (error) {
        throw error;
    }
}
let checkOrder = async (userId) => {
    try {
        if (!userId) {
            return {
                statusCode: 400,
                message: 'Invalid user id',
            }
        }

        const cart = await db.Cart.findOne({
            where: { userId },
            include: [
                {
                    model: db.CartItem,
                    as: 'cartItems',
                    attributes: ['quantity'],
                    where: { isChecked: true },
                    include: [
                        {
                            model: db.Product,
                            as: 'product',
                            attributes: ['id', 'name', 'price', 'originalPrice', 'weight',
                                [
                                    db.sequelize.literal(
                                        `(SELECT url FROM Images WHERE Images.productId = cartItems.productId AND Images.isPrimary = true )`
                                    ),
                                    'image'
                                ]
                            ]
                        }
                    ]
                }
            ]
        });

        if (!cart) {
            return {
                statusCode: 404,
                message: 'Slected cartItem is not found',
            }
        }

        let totalWeight = 0;

        const selectedItemDetails = cart.cartItems.map(item => {
            const totalPrice = item.quantity * item.product.price;
            totalWeight += item.product.weight;
            return {
                cartItemId: item.id,
                productId: item.product.id,
                name: item.product.name,
                price: item.product.price,
                originalPrice: item.product.originalPrice,
                image: item.product.dataValues.image,
                quantity: item.quantity,
                totalPrice,
            }
        })

        const address = await db.Address.findOne({
            where: { userId: userId, isDefault: true },
        })

        const shippingFee = shippingPrice({
            city: 'Hà Nội',
            district: 'Cầu Giấy'
        }, address, totalWeight);
        const totalAmount = selectedItemDetails.reduce((acc, item) =>
            acc + item.totalPrice
            , 0);
        const totalQuantity = selectedItemDetails.length;
        return {
            statusCode: 200,
            message: 'Get cart successfully',
            items: selectedItemDetails,
            totalAmount,
            totalQuantity,
            shippingFee,
        }
    } catch (error) {
        return {
            statusCode: 500,
            message: 'Error:' + error.message,
        }
    }
}

let createOrder = async (data) => {
    try {
        const { userId, note, paymentMethod } = data;
        if (!userId || !paymentMethod) {
            return {
                statusCode: 400,
                message: 'Missing parameter',
            }
        }
        if (paymentMethod != 'cash_on_delivery' && paymentMethod != 'bank_transfer') {
            return {
                statusCode: 400,
                message: 'Invalid payment method',
            }
        }
        const address = await db.Address.findOne({
            where: {
                userId,
                isDefault: true,
            }
        });

        if (!address) {
            return {
                statusCode: 404,
                message: 'Default address not found, please add address',
            }
        }

        const { items, totalAmount, shippingFee, } = await checkOrder(userId);
        if (!items) {
            return {
                statusCode: 404,
                message: 'CartItems slected is empty',
            }
        }

        // Trừ số lượng sản phẩm khả dụng 
        for (const item of items) {
            await db.Product.update(
                { quantityAvailable: db.sequelize.literal(`quantityAvailable - ${item.quantity}`) },
                { where: { id: item.productId } }
            );
        }

        const order = await db.Order.create({
            userId,
            addressId: address.id,
            orderDate: new Date(),
            status: paymentMethod === 'cash_on_delivery' ? 'processing' : 'pending_payment',
            paymentMethod,
            paymentStatus: 'unpaid',
            totalAmount,
            shippingFee,
            note,
        });

        if (!order) {
            return {
                statusCode: 500,
                message: 'can not create order'
            }
        }

        const orderItems = items.map(item => ({
            orderId: order.id,
            productId: item.productId,
            quantity: item.quantity,
            currentPrice: item.price,
        }))

        const checkOrderItems = await db.OrderItem.bulkCreate(orderItems);
        if (!checkOrderItems) {
            return {
                statusCode: 500,
                message: 'can not create order items'
            }
        }

        // await db.CartItem.destroy({
        //     where: {
        //         isChecked: true,
        //     },
        //     include: [
        //         {
        //             model: db.Cart,
        //             as: 'cart',
        //             where: {
        //                 userId
        //             }
        //         }
        //     ]
        // })

        if (paymentMethod === 'bank_transfer') {
            const paymentUrl = await processPayment({
                orderCode: order.id,
                amount: parseInt(order.totalAmount + order.shippingFee),
                description: '',
                cancelUrl: `http://localhost:8081/api/cancel-order`,
                returnUrl: `http://localhost:8081/api/return-order`,
            })
            return {
                statusCode: 200,
                message: 'Order created, please wait for payment',
                paymentMethod: paymentMethod,
                paymentUrl,
            }
        }

        return {
            statusCode: 200,
            message: 'Order created',
            paymentMethod: paymentMethod,
        }
    } catch (error) {
        return {
            statusCode: 500,
            message: 'Error while creating order ' + error.message
        }
    }


}

const processPayment = async ({ orderCode, amount, description, returnUrl, cancelUrl }) => {
    try {
        // Tạo chữ ký (signature)
        const signatureString = `amount=${amount}&cancelUrl=${cancelUrl}&description=${description}&orderCode=${orderCode}&returnUrl=${returnUrl}`;
        const signature = crypto.createHmac('sha256', process.env.CHECKSUM_KEY)
            .update(signatureString)
            .digest('hex');

        // Tạo dữ liệu gửi tới API
        const requestBody = {
            orderCode,
            amount,
            description,
            cancelUrl,
            returnUrl,
            signature
        };
        // Cấu hình header
        const headers = {
            'x-client-id': '9839db1c-a791-4996-b43b-7032bd5d93ad',
            'x-api-key': 'e9696bbf-e940-46dc-95e8-96f6301f31a2',
            'Content-Type': 'application/json'
        };

        //Gửi request tới API
        const response = await axios.post(
            'https://api-merchant.payos.vn/v2/payment-requests',
            JSON.stringify(requestBody),
            { headers, timeout: 10000 } // Timeout 10 giây
        );

        //Xử lý phản hồi từ API
        if (response.data) {
            return response.data.data.checkoutUrl;
        } else {
            console.error('Invalid API response:', response.data);
            throw new Error('Failed to retrieve checkout URL');
        }
    } catch (e) {
        if (e.response) {
            console.error('API Error:', e.response.data);
        } else {
            console.error('Error:', e.message);
        }
        throw e;
    }
};

let getMyOrders = async (userId, status) => {
    try {
        if (!userId, !status) {
            return {
                statusCode: 400,
                message: 'Missing parameter',
            }
        }
        let whereCondition = { userId };
        if (status !== 'all') {
            whereCondition.status = status; // thêm điều kiện status nếu status khác all 
        }
        let orders = await db.Order.findAll({
            where: whereCondition,
            include: [
                { model: db.Address, as: 'address' },
                {
                    model: db.OrderItem, as: 'orderItems',
                    include: [
                        {
                            model: db.Product,
                            as: 'product',
                            attributes: ['id', 'name', 'price', 'originalPrice', 'weight',
                                [
                                    db.sequelize.literal(
                                        `(SELECT url FROM Images WHERE Images.productId = orderItems.productId AND Images.isPrimary = true )`
                                    ),
                                    'image'
                                ]
                            ]
                        }
                    ]
                }
            ]
        })
        if (!orders) {
            return {
                statusCode: 404,
                message: 'No order found',
            }
        }
        orders = orders.map(order => {
            let products = order.orderItems.map(orderItem => {
                return {
                    id: orderItem.product.id,
                    name: orderItem.product.name,
                    price: orderItem.product.price,
                    originalPrice: orderItem.product.originalPrice,
                    image: orderItem.product.image,
                    quantity: orderItem.quantity,
                    totalPrice: orderItem.quantity * orderItem.product.price,
                }
            })
            return {
                orderCode: order.id,
                status: order.status,
                orderDate: order.orderDate,
                paymentMethod: order.paymentMethod,
                paymentStatus: order.paymentStatus,
                totalAmount: order.totalAmount,
                shippingFee: parseInt(order.shippingFee),
                total: order.totalAmount + parseInt(order.shippingFee),
                note: order.note,
                address: order.address,
                products
            }
        })
        return {
            statusCode: 200,
            orders
        }
    } catch (error) {
        return {
            statusCode: 500,
            message: 'Error while getting orders' + error.message
        }
    }
}

let getOrderStatistics = async (query) => {
    try {
        const { timeRange, startDate, endDate } = query;
        if (!timeRange && !(startDate && endDate)) {
            return {
                statusCode: 400,
                message: 'Missing parameter',
            }
        }
        let start, end;
        // Xử lý khoảng thời gian dựa vào timeRange
        const currentDate = new Date();
        switch (timeRange) {
            case 'day':
                start = new Date(currentDate.setHours(0, 0, 0, 0)); // Đầu ngày
                end = new Date(currentDate.setHours(23, 59, 59, 999)); // Cuối ngày
                break;
            case 'week':
                const weekStart = currentDate.getDate() - currentDate.getDay(); // Chủ nhật
                start = new Date(currentDate.setDate(weekStart));
                start.setHours(0, 0, 0, 0);
                end = new Date(start);
                end.setDate(start.getDate() + 6); // Thứ 7
                end.setHours(23, 59, 59, 999);
                break;
            case 'month':
                start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1); // Ngày đầu tháng
                end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0); // Ngày cuối tháng
                end.setHours(23, 59, 59, 999);
                break;
            default:
                if (startDate && endDate) {
                    start = new Date(startDate);
                    end = new Date(endDate);
                } else {
                    return {
                        statusCode: 400,
                        message: "Invalid 'timeRange'. Valid values are 'day', 'week', 'month'."
                    };
                }
        }

        // Lấy thống kê đơn hàng
        const orders = await db.Order.findAll({
            attributes: ['status', [db.Sequelize.fn('COUNT', db.Sequelize.col('id')), 'count']],
            where: {
                orderDate: {
                    [Op.between]: [start, end]
                }
            },
            group: ['status']
        });

        // Định dạng kết quả
        const result = {
            processing: 0,
            shipping: 0,
            completed: 0,
            returned: 0,
        };

        orders.forEach(order => {
            const status = order.dataValues.status;
            const count = order.dataValues.count;
            if (result[status] !== undefined) {
                result[status] = count;
            }
        });

        return {
            statusCode: 200,
            timeRange: timeRange || `${startDate} to ${endDate}`,
            data: result
        };
    } catch (error) {
        return {
            statusCode: 500,
            message: 'Error while getting order statistics' + error.message
        }
    }
}

let getRevenueStatistics = async (query) => {
    try {
        const { startDate, endDate, timeRange } = query;
        if (!timeRange) {
            return { statusCode: 400, message: 'timeRange is required. Use "day" or "month".' };
        }

        let results = [];
        const today = new Date();

        if (timeRange === 'month') {
            // Trả về doanh thu của từng tháng từ tháng 1 đến tháng 12
            const yearStart = new Date(today.getFullYear(), 0, 1); // 1/1 của năm hiện tại
            const yearEnd = new Date(today.getFullYear(), 11, 31, 23, 59, 59, 999); // 31/12 của năm hiện tại

            results = await db.Order.findAll({
                attributes: [
                    [db.Sequelize.fn('MONTH', db.Sequelize.col('createdAt')), 'month'],
                    [db.Sequelize.fn('SUM', db.Sequelize.col('totalAmount')), 'totalRevenue']
                ],
                where: {
                    createdAt: { [Op.between]: [yearStart, yearEnd] },
                    status: { [Op.in]: ['processing', 'shipping', 'completed'] }
                },
                group: [db.Sequelize.fn('MONTH', db.Sequelize.col('createdAt'))],
                order: [[db.Sequelize.fn('MONTH', db.Sequelize.col('createdAt')), 'ASC']]
            });

            // Định dạng kết quả trả về
            const formattedResults = Array.from({ length: 12 }, (_, i) => {
                const month = i + 1;
                const matchingResult = results.find(r => r.dataValues.month == month);
                return {
                    month,
                    totalRevenue: matchingResult ? parseFloat(matchingResult.dataValues.totalRevenue) : 0
                };
            });

            return { statusCode: 200, timeRange, data: formattedResults };
        } else if (timeRange === 'day') {
            let start, end;

            if (startDate && endDate) {
                start = new Date(startDate);
                end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
            } else {
                // Thống kê doanh thu từng ngày trong tháng hiện tại
                start = new Date(today.getFullYear(), today.getMonth(), 1); // Ngày 1 của tháng hiện tại
                end = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999); // Ngày cuối tháng
            }

            // Kiểm tra khoảng thời gian hợp lệ
            if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
                return { statusCode: 400, message: 'Invalid date range.' };
            }

            // Truy vấn doanh thu
            results = await db.Order.findAll({
                attributes: [
                    [db.Sequelize.fn('DATE', db.Sequelize.col('createdAt')), 'date'],
                    [db.Sequelize.fn('SUM', db.Sequelize.col('totalAmount')), 'totalRevenue']
                ],
                where: {
                    createdAt: { [Op.between]: [start, end] },
                    status: { [Op.in]: ['processing', 'shipping', 'completed'] }
                },
                group: [db.Sequelize.fn('DATE', db.Sequelize.col('createdAt'))],
                order: [[db.Sequelize.fn('DATE', db.Sequelize.col('createdAt')), 'ASC']]
            });

            // Định dạng kết quả trả về
            const formattedResults = [];
            const currentDate = new Date(start);

            // Tạo mảng với các ngày từ startDate -> endDate
            while (currentDate <= end) {
                const dateString = currentDate.toISOString().split('T')[0];
                const matchingResult = results.find(r => r.dataValues.date === dateString);
                formattedResults.push({
                    date: dateString,
                    totalRevenue: matchingResult ? parseFloat(matchingResult.dataValues.totalRevenue) : 0
                });
                currentDate.setDate(currentDate.getDate() + 1); // Tăng ngày
            }

            return { statusCode: 200, timeRange, startDate, endDate, data: formattedResults };
        } else {
            return { statusCode: 400, message: 'Invalid timeRange. Use "day" or "month".' };
        }
    } catch (error) {
        return {
            statusCode: 500,
            message: 'Error while getting order statistics' + error.message
        }
    }
}

let getAllOrders = async (query) => {
    try {
        let { status, limit = 10, page = 1 } = query;
        const currentPage = parseInt(page, 10);
        const pageSize = parseInt(limit, 10);
        if (currentPage < 1 || pageSize < 1) {
            return { statusCode: 400, message: 'Invalid page or limit.' };
        }

        const offset = (currentPage - 1) * pageSize;
        // filtering conditions
        const whereCondition = status ? { status: status } : {};
        const { rows: orders, count: totalOrders } = await db.Order.findAndCountAll({
            where: whereCondition,
            litmit: pageSize,
            offset: offset,
            order: [['createdAt', 'DESC']],
        })

        // tính tổng số trang 
        const totalPages = Math.ceil(totalOrders / pageSize);
        return {
            statusCode: 200,
            message: "get all orders successfully)",
            orders: orders,
            pagination: {
                currentPage,
                totalPages,
                pageSize,
                totalOrders,
            }
        }
    } catch (error) {
        return {
            statusCode: 500,
            message: 'Error while getting all orders' + error.message
        }
    }
}

let getOrderById = async (orderId) => {
    try {
        if (!orderId) {
            return { statusCode: 400, message: 'Order ID is required.' };
        }
        const order = await db.Order.findByPk(orderId);
        if (!order) {
            return { statusCode: 404, message: 'Order not found.' };
        }
        return {
            statusCode: 200,
            message: 'Get order by ID successfully.',
            order
        }
    } catch (error) {
        return {
            statusCode: 500,
            message: 'Error while getting order by ID' + error.message
        }
    }
}

let updateOrder = async (body) => {
    try {
        const orderId = body.orderId;
        if (!orderId) {
            return { statusCode: 400, message: 'Order ID is required.' };
        }
        const order = await db.Order.findByPk(orderId);
        if (!order) {
            return { statusCode: 404, message: 'Order not found.' };
        }
        await order.update({
            status: body.status,
            paymentStatus: body.paymentStatus,
            note: body.note,
        })
        return { statusCode: 200, message: 'Order updated successfully' }
    } catch (error) {
        return {
            statusCode: 500,
            message: 'Error while updating order' + error.message
        }
    }
}

module.exports = {
    checkOrder,
    createOrder,
    getMyOrders,
    getOrderStatistics,
    getRevenueStatistics,
    getAllOrders,
    getOrderById,
    updateOrder,
}