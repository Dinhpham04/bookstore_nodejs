import productService from '../services/productService';

let handleGetAllCategories = async (req, res) => {
    let respon = await productService.getAllCategories();
    res.status(respon.statusCode).json({
        error: respon.error,
        message: respon.message,
        categories: respon.data ? respon.data : {}
    });
}

let handleGetProducts = async (req, res) => {
    let params = req.query;
    let respon = await productService.getProducts(params);
    res.status(respon.statusCode).json({
        message: respon.message,
        products: (respon.data ? respon.data : {}),
        pagination: respon.pagination
    })
}

let handleGetProductDetails = async (req, res) => {
    const productId = req.query.id;
    const respon = await productService.getProductDetails(productId);
    const { statusCode, message, product } = respon;
    res.status(statusCode).json({
        message,
        product: product ? product : {},
    })
}

let handleGetProductsRelated = async (req, res) => {
    const productId = req.query.id;
    if (!productId) {
        res.status(400).json({ message: 'Id is empty' })
    }
    const respon = await productService.getProductsRelated(productId);
    res.status(respon.statusCode).json({
        message: respon.message,
        relatedProducts: respon.relatedProducts
    })
}

let handleBestSeller = async (req, res) => {
    let params = req.query;
    let respon = await productService.getProductsBestSeller(params);
    res.status(respon.statusCode).json({
        message: respon.message,
        products: (respon.data ? respon.data : {}),
        pagination: respon.pagination
    })
}

let handleSearchProducts = async (req, res) => {
    try {
        let respon = await productService.getProductsSearch(req.query);
        const { statusCode, message, ...data } = respon;
        res.status(respon.statusCode).json({
            message,
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
    handleGetAllCategories,
    handleGetProducts,
    handleGetProductDetails,
    handleGetProductsRelated,
    handleBestSeller,
    handleSearchProducts,
}