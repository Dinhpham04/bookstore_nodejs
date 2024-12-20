import db from '../models/index';

let getAllImports = async (query) => {
    try {
        let { page = 1, limit = 10 } = query;
        const currentPage = parseInt(page, 10);
        const pageSize = parseInt(limit, 10);
        if (currentPage < 1 || pageSize < 1) {
            return { statusCode: 400, message: 'Invalid page or limit.' };
        }
        const offset = (currentPage - 1) * pageSize;
        const { rows: imports, count: totalImport } = await db.Stock.findAndCountAll({
            where: {},
            include: [{
                model: db.Product,
                as: 'product',
                attributes: ['name', 'productCode']
            }],
            litmit: pageSize,
            offset: offset,
            order: [['createdAt', 'DESC']],
        })

        // tính tổng số trang 
        const totalPages = Math.ceil(totalImport / pageSize);
        if (!imports) {
            return {
                statusCode: 404,
                message: 'No imports found',
            }
        }
        return {
            statusCode: 200,
            message: "get all import successfully",
            imports,
            pagination: {
                currentPage,
                totalPages,
                pageSize,
                totalImport,
            }
        }
    } catch (error) {
        return {
            statusCode: 500,
            message: 'Failed to get imports',
            error: error.message
        }
    }
}

let getImportById = async (importId) => {
    try {
        if (!importId) {
            return {
                statusCode: 400,
                message: 'Missing import id',
            }
        }
        const importDetail = await db.Stock.findOne({
            where: { id: importId },
            include: [{
                model: db.Product,
                as: 'product',
                attributes: ['name', 'productCode']
            }]
        });
        if (!importDetail) {
            return {
                statusCode: 400,
                message: 'Import not found',
            }
        }
        return {
            statusCode: 200,
            message: 'Get import by id successfully',
            importDetail
        }
    } catch (error) {
        return {
            statusCode: 500,
            message: 'Failed to get import by id',
            error: error
        }
    }
}

let createImport = async (body) => {
    try {
        if (!body.productId || !body.quantity || !body.price) {
            return {
                statusCode: 400,
                message: 'Missing product id, quantity or price',
            }
        }
        const product = await db.Product.findByPk(body.productId);
        if (!product) {
            return {
                statusCode: 404,
                message: 'Product not found',
            }
        }
        const importDetail = await db.Stock.create({
            productId: body.productId,
            quantity: body.quantity,
            price: body.price,
            transactionDate: body.transactionDate ? transactionDate : new Date(),
        });
        if (importDetail) {
            await product.update({
                quantityAvailable: parseInt(product.quantityAvailable) + parseInt(body.quantity)
            })
        }
        return {
            statusCode: 201,
            message: 'Create import successfully',
            importDetail
        }
    } catch (error) {
        return {
            statusCode: 500,
            message: 'Failed to create import',
            error: error
        }
    }
}

let updateImport = async (body) => {
    try {
        if (!body.importId) {
            return {
                statusCode: 400,
                message: 'Missing import id',
            }
        }
        const importDetail = await db.Stock.findOne({ where: { id: body.importId } });
        if (!importDetail) {
            return {
                statusCode: 404,
                message: 'Import not found',
            }
        }
        const product = await db.Product.findOne({ where: { id: importDetail.productId } });
        if (!product) {
            return {
                statusCode: 404,
                message: 'Product not found',
            }
        }
        await product.update({
            quantityAvailable: parseInt(product.quantityAvailable) + parseInt(body.quantity) - parseInt(importDetail.quantity)
        })
        await importDetail.update({
            quantity: body.quantity,
            price: body.price,
        })
        return {
            statusCode: 200,
            message: 'Update import successfully',
        }
    } catch (error) {
        return {
            statusCode: 500,
            message: 'Failed to update import',
            error: error.message,
        }
    }
}
module.exports = {
    getAllImports,
    getImportById,
    createImport,
    updateImport,
}