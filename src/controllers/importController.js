import importService from '../services/importService';


let handleGetAllImports = async (req, res) => {
    try {
        const respon = await importService.getAllImports(req.query);
        const { statusCode, ...data } = respon;
        res.status(statusCode).json({
            ...data,
        })
    } catch (error) {
        res.status(500).json({
            message: 'Internal Server Error',
            error: error.message,
        })
    }
}

let handleGetImportById = async (req, res) => {
    try {
        const importId = req.query.importId;
        const respon = await importService.getImportById(importId);
        const { statusCode, ...data } = respon;
        res.status(statusCode).json({
            ...data,
        })
    } catch (error) {
        res.status(500).json({
            message: 'Internal Server Error',
            error: error.message,
        })
    }
}

let handleCreateImport = async (req, res) => {
    try {
        const respon = await importService.createImport(req.body);
        const { statusCode, ...data } = respon;
        res.status(statusCode).json({
            message: respon.message,
        })
    } catch (error) {
        res.status(500).json({
            message: 'Internal Server Error',
            error: error.message,
        })
    }
}

let handleUpdateImport = async (req, res) => {
    try {
        const respon = await importService.updateImport(req.body);
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

module.exports = {
    handleGetAllImports,
    handleGetImportById,
    handleCreateImport,
    handleUpdateImport
}