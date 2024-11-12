import db from '../models/index';

let getAddress = async (userId) => {
    try {
        if (!userId) {
            return {
                statusCode: 400,
                message: 'Missing user ID',
            }
        }

        const userAddresses = await db.Address.findAll({
            where: {
                userId
            },
            attributes: ['id', 'city', 'district', 'ward', 'addressDetail', 'isDefault']
        })

        if (!userAddresses) {
            return {
                statusCode: 404,
                statusMessage: 'NOT_FOUND_ADDRESSES',
                message: 'Address not found'
            }
        }

        return {
            statusCode: 200,
            message: 'get user addresses successfully',
            address: userAddresses
        }
    } catch (error) {
        return {
            statusCode: 500,
            message: 'Error: ' + error.message,
        }
    }
}

let editAddress = async (addressId, data) => {
    try {

    } catch (error) {

    }
}

module.exports = {
    getAddress,
    editAddress,
}