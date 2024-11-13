import orderService from '../services/addressService';


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

let handleAddAddress = async (req, res) => {
    try {
        const respon = await orderService.addAddress(req.body);
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

let handleEditAddress = async (req, res) => {
    try {
        const respon = await orderService.editAddress(req.body);
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


let handleSetAddressDefault = async (req, res) => {
    try {
        const addressId = req.body.addressId;
        const respon = await orderService.setAddressDefault(addressId);
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



module.exports = {
    handleGetAddress,
    handleAddAddress,
    handleEditAddress,
    handleSetAddressDefault,
}