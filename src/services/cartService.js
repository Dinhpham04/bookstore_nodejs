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
        const totalAmount = cartDetails.reduce((acc, item) =>
            acc + (item.isChecked ? item.totalPrice : 0)
            , 0);
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

let updateCartItem = async (cartItemId, quantity, isChecked) => {
    try {
        if (!cartItemId || (!quantity && typeof isChecked === 'undefined')) {
            return {
                statusCode: 400,
                message: 'missing parameter',
            }
        }
        const cartItem = await db.CartItem.findOne({
            where: { id: cartItemId },
            include: [
                {
                    model: db.Product,
                    as: 'product'
                },
                {
                    model: db.Cart,
                    as: 'cart'
                }
            ]
        })


        if (!cartItem) {
            return {
                statusCode: 404,
                message: 'Cart item not found',
            }
        }
        // Kiểm tra và cập nhật số lượng nếu có 
        if (quantity && quantity > cartItem.product.quantityAvailable) {
            return {
                statusCode: 400,
                statusMes: 'STOCK_INSUFFICIENT',
                message: `Số lượng yêu cầu cho ${quantity} không có sẵn`,
                quantityAvailable: cartItem.product.quantityAvailable
            }
        } else if (quantity && quantity <= cartItem.product.quantityAvailable) {
            cartItem.quantity = quantity;
        }
        if (isChecked !== undefined) {
            cartItem.isChecked = isChecked;
        }
        await cartItem.save();
        const cartItemNotChecked = await db.CartItem.findOne({
            where: { isChecked: false },
            include: [
                {
                    model: db.Cart,
                    as: 'cart',
                    where: { userId: cartItem.cart.userId }
                }
            ]
        })
        if (!!cartItemNotChecked) {
            await db.Cart.update(
                { isCheckedAll: false },
                { where: { userId: cartItem.cart.userId } }
            )
        } else {
            await db.Cart.update(
                { isCheckedAll: true },
                { where: { userId: cartItem.cart.userId } }
            )
        }
        return {
            statusCode: 200,
            statusMes: 'CART_ITEM_UPDATED',
            message: 'CartItem update successfully',
        }

    } catch (error) {
        return {
            statusCode: 500,
            message: 'Error:' + error.message,
        }
    }
}

let checkAllCartItem = async (userId, isChecked) => {
    try {
        if (!userId || typeof isChecked === 'undefined') {
            return {
                statusCode: 400,
                message: 'Missing parameter',
            }
        }
        const cartItems = await db.CartItem.findAll({
            includes: [
                { model: db.Cart, where: { userId: userId } }
            ]
        })
        if (!cartItems) {
            return {
                statusCode: 404,
                message: 'Cart items not found',
            }
        }
        await db.CartItem.update({
            isChecked: isChecked
        }, { where: {} })
        await db.Cart.update({
            isCheckedAll: isChecked,
        }, { where: { userId: userId } });
        return {
            statusCode: 200,
            message: 'All cart items updated successfully',
            isCheckedAll: isChecked
        }
    } catch (error) {
        return {
            statusCode: 500,
            message: 'Error:' + error.message,
        }
    }
}

let getCheckedAllCartItem = async (userId) => {
    try {
        if (!userId) {
            return {
                statusCode: 400,
                message: 'missing user id',
            }
        }
        const cart = await db.Cart.findOne({ where: { userId } });
        if (!cart) {
            return {
                statusCode: 404,
                message: 'Cart not found',
            }
        }
        return {
            statusCode: 200,
            message: 'Get checked all cart successfully',
            isCheckedAll: cart.isCheckedAll
        }
    } catch (error) {
        return {
            statusCode: 500,
            message: 'Error:' + error.message,
        }
    }
}


let deleteCartItem = async (cartItemId) => {
    try {
        if (!cartItemId) {
            return {
                statusCode: 400,
                message: 'Missing parameter',
            }
        }

        const cartItem = await db.CartItem.findOne({ where: { id: cartItemId } });
        if (!cartItem) {
            return {
                statusCode: 404,
                message: 'Cart item not found',
            }
        }

        await cartItem.destroy();
        return {
            statusCode: 200,
            statusMes: 'CART_ITEM_DELETED',
            message: 'CartItem deleted successfully',
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
    updateCartItem,
    checkAllCartItem,
    deleteCartItem,
    getCheckedAllCartItem
}