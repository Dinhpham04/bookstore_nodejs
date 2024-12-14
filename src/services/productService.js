import db from '../models/index';
import { Op, fn, col, literal } from 'sequelize';
let getAllCategories = async () => {
    try {
        const categories = await db.Category.findAll({
            include: [{
                model: db.Topic,
                as: 'topics',
                include: [{
                    model: db.Genre,
                    as: 'genres'
                }]
            }],
            raw: false
        });

        if (categories) {
            return {
                statusCode: 200,
                message: "Get all categories successfully",
                data: categories
            }
        } else {
            return {
                statusCode: 404,
                message: "No categories found"
            }
        }
    } catch (e) {
        return {
            statusCode: 500,
            message: "Error while fetching categories",
            error: e.message
        }
    }
}

let getProducts = async (params) => {
    try {
        let { categoryId, topicId, genreId, minPrice, maxPrice, page = 1, limit = 50 } = params;
        // dieu kien loc 
        const whereCondition = {};

        // Bo loc theo danh muc 
        if (genreId) {
            whereCondition.GenreId = genreId;
        } else if (topicId) {
            const genres = await db.Genre.findAll({ where: { topicId }, attributes: ['id'] });
            whereCondition.genreId = genres.map(g => g.id);
        }
        else if (categoryId) {
            const topics = await db.Topic.findAll({ where: { categoryId }, include: { model: db.Genre, as: 'genres', attributes: ['id'] }, raw: false });
            whereCondition.genreId = topics.flatMap(topic => topic.genres.map(genre => genre.id));
        }

        // Bo loc theo gia 
        if (minPrice) {
            whereCondition.price = { [Op.gte]: parseFloat(minPrice) };
        }

        if (maxPrice) {
            whereCondition.price = { ...(whereCondition.price || {}), [Op.lte]: parseFloat(maxPrice) };
        }

        // thiết lập phân trang 
        const offset = (page - 1) * limit;

        //truy vấn sản phẩm 
        const products = await db.Product.findAndCountAll({
            where: whereCondition,
            limit: parseInt(limit),
            offset,
            order: [['id', 'ASC']], // Sắp xếp theo ID tăng dần
            attributes: [
                'id', 'name', 'price', 'originalPrice', 'quantityAvailable',
                [
                    db.sequelize.cast(
                        db.sequelize.literal(
                            `(SELECT COALESCE(AVG(rating), 0) FROM Reviews WHERE Reviews.productId = Product.id)`
                        ),
                        'FLOAT'
                    ),
                    'averageRating'
                ],
                [
                    db.sequelize.literal(
                        `(SELECT url FROM Images WHERE Images.productId = Product.id AND Images.isPrimary = true )`
                    ),
                    'image'
                ],
                [
                    db.sequelize.cast(
                        db.sequelize.literal(`(
                            SELECT COALESCE(SUM(quantity), 0) FROM OrderItems WHERE OrderItems.productId = Product.id)`
                        ),
                        'FLOAT'
                    ),
                    'soldCount'
                ]
            ],
            raw: false,
            distinct: true,
        });


        return {
            statusCode: 200,
            message: 'get Product successfully',
            data: products.rows,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(products.count / limit),
                totalItems: products.count,
            },
        }
    } catch (e) {
        return {
            statusCode: 500,
            message: 'An error occurred: ' + e.message,
        }
    }
}

let getProductDetails = async (productId) => {
    try {
        if (!productId) {
            return {
                statusCode: 400,
                message: 'Invalid product ID',
            }
        }
        let product = await db.Product.findOne({
            where: { id: productId },
            include: [
                {
                    model: db.Image,
                    as: 'images',
                    attributes: ['url', 'isPrimary', 'orderNumber', 'productId'],
                },
                {
                    model: db.Review,
                    as: 'reviews',
                    attributes: ['rating', 'comment', 'userId', 'productId'],
                },
            ],
            attributes: [
                'id', 'name', 'author', 'supplier', 'publisher', 'bookLayout', 'price', 'originalPrice', 'productCode',
                'publishYear', 'language', 'weight', 'size', 'quantityOfPages', 'quantityAvailable', 'description', 'genreId',
                [
                    db.sequelize.cast(
                        db.sequelize.literal(
                            `(SELECT COALESCE(AVG(rating), 0) FROM Reviews WHERE Reviews.productId = Product.id)`
                        ),
                        'FLOAT'
                    ),
                    'averageRating'
                ],
                [
                    db.sequelize.cast(
                        db.sequelize.literal(`(
                            SELECT COALESCE(SUM(quantity), 0) FROM OrderItems WHERE OrderItems.productId = Product.id)`
                        ),
                        'FLOAT'
                    ),
                    'soldCount'
                ]
            ],
            raw: false
        });
        if (!product) {
            return {
                statusCode: 404,
                message: 'Product not found',
            }
        }

        return {
            statusCode: 200,
            message: 'Success',
            product,
        }
    } catch (e) {
        return {
            statusCode: 500,
            message: 'An error occurred: ' + e.message,
        }
    }
}

let getProductsRelated = async (productId) => {
    try {
        const mainProduct = await db.Product.findOne({
            where: { id: productId },
            attributes: ['id', 'author', 'genreId'],
            include: [
                {
                    model: db.Genre,
                    as: 'genre',
                    attributes: ['id', 'topicId'],
                    include: [
                        {
                            model: db.Topic,
                            as: 'topic',
                            attributes: ['id', 'categoryId'],
                            include: [
                                {
                                    model: db.Category,
                                    as: 'category',
                                    attributes: ['id']
                                }
                            ]
                        }
                    ]
                }
            ],
            raw: false
        });

        if (!mainProduct) {
            return {
                statusCode: 404,
                message: 'Product not found',
            }
        }

        // lấy thông tin author, genreId, topicId, categoryId,
        const { author, genreId } = mainProduct;
        const topicId = mainProduct.genre?.topicId;
        const categoryId = mainProduct.genre?.topic?.categoryId;
        // Truy vấn các sản phẩm liên quan dựa trên mức độ ưu tiên
        const relatedProducts = await db.Product.findAll({
            where: {
                id: { [Op.ne]: productId }, // Loại trừ sản phẩm chính
                [Op.or]: [
                    { author },
                    { genreId },
                    { '$genre.topicId$': topicId },
                    { '$genre.topic.categoryId$': categoryId }
                ].filter(Boolean)
            },
            attributes: ['id', 'name', 'price', 'originalPrice', 'quantityAvailable',
                [
                    db.sequelize.cast(
                        db.sequelize.literal(
                            `(SELECT COALESCE(AVG(rating), 0) FROM Reviews WHERE Reviews.productId = Product.id)`
                        ),
                        'FLOAT'
                    ),
                    'averageRating'
                ],
                [
                    db.sequelize.literal(
                        `(SELECT url FROM Images WHERE Images.productId = Product.id AND Images.isPrimary = true )`
                    ),
                    'image'
                ],
                [
                    db.sequelize.cast(
                        db.sequelize.literal(`(
                            SELECT COALESCE(SUM(quantity), 0) FROM OrderItems WHERE OrderItems.productId = Product.id)`
                        ),
                        'FLOAT'
                    ),
                    'soldCount'
                ]
            ],
            include: [
                {
                    model: db.Genre,
                    as: 'genre',
                    attributes: [],
                    include: [{
                        model: db.Topic,
                        as: 'topic',
                        attributes: [],
                        include: [{
                            model: db.Category,
                            as: 'category',
                            attributes: []
                        }]
                    }]
                }
            ],
            order: [
                [db.sequelize.literal(`author = "${author}"`), 'DESC'],
                [db.sequelize.literal(`genreId = ${genreId}`), 'DESC'],
                [db.sequelize.literal(`genre.topicId = ${topicId}`), 'DESC'],
                // [db.sequelize.literal(`genre.topic.categoryId = ${categoryId}`), 'DESC']
            ],
            raw: false,
        });
        return {
            statusCode: 200,
            message: 'Get related product successfully',
            relatedProducts
        }
    } catch (e) {
        return {
            statusCode: 500,
            message: 'An error occurred: ' + e.message,
        }
    }
}


let getProductsBestSeller = async (params) => {
    try {
        let { categoryId, topicId, genreId, minPrice, maxPrice, page = 1, limit = 50 } = params;
        // điều kiện lọc
        const whereCondition = {};

        // Bộ lọc theo danh mục
        if (genreId) {
            whereCondition.GenreId = genreId;
        } else if (topicId) {
            const genres = await db.Genre.findAll({ where: { topicId }, attributes: ['id'] });
            whereCondition.genreId = genres.map(g => g.id);
        } else if (categoryId) {
            const topics = await db.Topic.findAll({ where: { categoryId }, include: { model: db.Genre, as: 'genres', attributes: ['id'] }, raw: false });
            whereCondition.genreId = topics.flatMap(topic => topic.genres.map(genre => genre.id));
        }

        // Bộ lọc theo giá
        if (minPrice) {
            whereCondition.price = { [Op.gte]: parseFloat(minPrice) };
        }

        if (maxPrice) {
            whereCondition.price = { ...(whereCondition.price || {}), [Op.lte]: parseFloat(maxPrice) };
        }

        // Thiết lập phân trang
        const offset = (page - 1) * limit;

        // Truy vấn sản phẩm
        const products = await db.Product.findAndCountAll({
            where: whereCondition,
            limit: parseInt(limit),
            offset,
            order: [[
                db.sequelize.literal(`(
                    SELECT COALESCE(SUM(quantity), 0) 
                    FROM OrderItems 
                    WHERE OrderItems.productId = Product.id
                )`), 'DESC' // Sắp xếp theo số lượng bán giảm dần
            ]],
            attributes: [
                'id', 'name', 'price', 'originalPrice', 'quantityAvailable',
                [
                    db.sequelize.cast(
                        db.sequelize.literal(
                            `(SELECT COALESCE(AVG(rating), 0) FROM Reviews WHERE Reviews.productId = Product.id)`
                        ),
                        'FLOAT'
                    ),
                    'averageRating'
                ],
                [
                    db.sequelize.literal(
                        `(SELECT url FROM Images WHERE Images.productId = Product.id AND Images.isPrimary = true )`
                    ),
                    'image'
                ],
                [
                    db.sequelize.cast(
                        db.sequelize.literal(`(
                            SELECT COALESCE(SUM(quantity), 0) 
                            FROM OrderItems 
                            WHERE OrderItems.productId = Product.id)`
                        ),
                        'FLOAT'
                    ),
                    'soldCount'
                ]
            ],
            raw: false,
            distinct: true,
        });

        return {
            statusCode: 200,
            message: 'Get best-selling products successfully',
            data: products.rows,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(products.count / limit),
                totalItems: products.count,
            },
        };
    } catch (e) {
        return {
            statusCode: 500,
            message: 'An error occurred: ' + e.message,
        };
    }
};


module.exports = {
    getAllCategories,
    getProducts,
    getProductDetails,
    getProductsRelated,
    getProductsBestSeller
}
