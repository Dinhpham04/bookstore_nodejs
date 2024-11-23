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
            attributes: { exclude: ['createdAt', 'updatedAt'] }
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

let addAddress = async (data) => {
    try {
        const { userId, recipientName, phoneNumber, city, district, ward, addressDetail, isDefault } = data;
        if (!userId || !recipientName || !phoneNumber || !city || !district || !ward || !addressDetail) {
            return {
                statusCode: 400,
                message: 'Missing required fields'
            }
        }

        // // sử dụng transaction để toàn vẹn dữ liệu 
        // if (isDefault) {
        //     await db.Address.update(
        //         { isDefault: false },
        //         { where: { userId } }
        //     );
        // }

        const newAddress = await db.Address.create(
            { recipientName, phoneNumber, city, district, ward, addressDetail, isDefault },
        )

        return {
            statusCode: 201,
            message: 'Add address successfully',
            address: newAddress
        }
    } catch (error) {
        return {
            statusCode: 500,
            message: 'Error:' + error.message,
        }
    }
}


let editAddress = async (data) => {
    try {
        const addressId = data.addressId;
        if (!addressId) {
            return {
                statusCode: 400,
                message: 'Missing address ID'
            }
        }
        const address = await db.Address.findOne({
            where: { id: addressId },
        })

        if (!address) {
            return {
                statusCode: 404,
                statusMessage: 'NOT_FOUND_ADDRESS',
                message: 'Address not found'
            }
        }

        await db.Address.update(
            {
                recipientName: data.recipientName || address.recipientName,
                phoneNumber: data.phoneNumber || address.phoneNumber,
                city: data.city || address.city,
                district: data.district || address.district,
                ward: data.ward || address.ward,
                addressDetail: data.addressDetail || address.addressDetail,
            },
            { where: { id: addressId } },
        )
        return {
            statusCode: 200,
            message: 'Edit address successfully',
        }
    } catch (error) {
        return {
            statusCode: 500,
            message: 'Error:' + error.message,
        }
    }
}

let setAddressDefault = async (addressId) => {
    try {
        if (!addressId) {
            return {
                statusCode: 400,
                message: 'Missing address ID'
            }
        }
        const address = await db.Address.findOne({
            where: { id: addressId },
        })
        if (!address) {
            return {
                statusCode: 404,
                statusMessage: 'NOT_FOUND_ADDRESS',
                message: 'Address not found'
            }
        }
        await db.Address.update(
            { isDefault: false },
            { where: { userId: address.userId } },
        )
        await db.Address.update(
            { isDefault: true },
            { where: { id: addressId } }
        )

        return {
            statusCode: 200,
            message: 'Set address default successfully',
        }
    } catch (error) {
        return {
            statusCode: 500,
            message: 'Error:' + error.message,
        }
    }

}

let deleteAddress = async (addressId) => {
    try {
        if (!addressId) {
            return {
                statusCode: 400,
                message: 'Missing address ID'
            }
        }
        const address = await db.Address.findOne({
            where: { id: addressId },
        })

        if (!address) {
            return {
                statusCode: 404,
                message: 'Address not found'
            }
        }
        const isDefault = address.isDefault;
        const userId = address.userId;
        await address.destroy({ where: { id: addressId } });
        if (isDefault) {
            const firstAddress = await db.Address.findOne({
                where: { userId: userId },
                order: [['id', 'ASC']]
            });
            if (firstAddress) {
                await firstAddress.update({ isDefault: true });
            }
        }
        return {
            statusCode: 200,
            message: 'Delete address successfully',
        }
    } catch (error) {
        return {
            statusCode: 500,
            message: 'Error:' + error.message,
        }
    }
}
module.exports = {
    getAddress,
    editAddress,
    addAddress,
    setAddressDefault,
    deleteAddress,
}