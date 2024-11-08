import db from '../models/index';


let addToCart = async (userId, productId, quantity) => {
    try {
        if (!userId || !productId || quantity <= 0) {
            return {
                statusCode: 400,
                message: 'Invalid user or product id or quantity',
            }
        }

        const product = await db.Product.findByPk(productId);
        if (!product) {
            return {
                statusCode: 404,
                message: 'Product not found',
            }
        }
        // cải tiến: xóa bảng cart thao tác trực tiếp user cartItem product 
        const cart = await db.Cart.findOne({
            where: {
                userId: userId,
            }
        })

        if (!cart) {
            await db.Cart.create({
                userId,
            })
        }

        // Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa nếu có thì chỉ cập nhật số lượng thôi 
        const existingCartItem = await db.CartItem.findOne({
            where: {
                cartId: cart.id,
                productId,
            }
        })

        // Kiểm tra xem còn đủ số lượng không 
        if (existingCartItem) {
            const totalQuantity = existingCartItem.quantity + parseInt(quantity);
            if (totalQuantity > product.quantityAvailable) {
                return {
                    statusCode: 400,
                    statusMes: 'STOCK_INSUFFICIENT',
                    message: `Số lượng yêu cầu cho ${totalQuantity} không có sẵn`,
                    quantityAvailable: product.quantityAvailable
                }
            }
            existingCartItem.quantity += parseInt(quantity);
            await existingCartItem.save();
        } else {
            if (parseInt(quantity) > product.quantityAvailable) {
                return {
                    statusCode: 400,
                    statusMes: 'STOCK_INSUFFICIENT',
                    message: `Số lượng yêu cầu cho ${quantity} không có sẵn`,
                    quantityAvailable: product.quantityAvailable
                }
            }
            await db.CartItem.create({
                cartId: cart.id,
                productId,
                quantity,
                currentPrice: product.price
            })
        }
        return {
            statusCode: 200,
            statusMes: 'CART_PRODUCT_ADDED',
            message: 'Product added to cart successfully',
        }
    } catch (error) {
        return {
            statusCode: 500,
            message: 'Error: ' + error.message,
        }
    }
}

let getCart = async (userId) => {
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
                    attributes: ['id', 'quantity', 'isChecked', 'isCheckedOut'],
                    include: [
                        {
                            model: db.Product,
                            as: 'product',
                            attributes: ['id', 'name', 'price', 'originalPrice',
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
                message: 'Cart not found',
            }
        }

        const cartDetails = cart.cartItems.map(item => {
            const totalPrice = item.quantity * item.product.price;
            return {
                cartItemId: item.id,
                productId: item.product.id,
                name: item.product.name,
                price: item.product.price,
                originalPrice: item.product.originalPrice,
                image: item.product.dataValues.image,
                quantity: item.quantity,
                totalPrice,
                isChecked: item.isChecked,
                isCheckedOut: item.isCheckedOut,
            }
        })
        const totalAmount = cartDetails.reduce((acc, item) => acc + item.totalPrice, 0);
        const totalQuantity = cartDetails.length;
        return {
            statusCode: 200,
            message: 'Get cart successfully',
            cart: cartDetails,
            totalAmount,
            totalQuantity
        }
    } catch (error) {
        return {
            statusCode: 500,
            message: 'Error:' + error.message,
        }
    }
}

module.exports = {
    addToCart,
    getCart,
}