import db from '../models/index';

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
        if (paymentMethod != 'cart_on_delivery' && paymentMethod != 'bank_transfer') {
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

        const { items, totalAmount, shippingFee, } = await checkOrder(userId);
        if (!items) {
            return {
                statusCode: 404,
                message: 'CartItems slected is empty',
            }
        }

        const order = await db.Order.create({
            userId,
            addressId: address.id,
            orderDate: new Date(),
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

        // await CartItem.destroy({
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
        return {
            statusCode: 200,
            message: 'Order created'
        }
    } catch (error) {
        return {
            statusCode: 500,
            message: 'Error while creating order ' + error.message
        }
    }


}


module.exports = {
    checkOrder,
    createOrder,

}