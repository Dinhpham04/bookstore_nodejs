'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Address extends Model {
        static associate(models) {
            Address.belongsTo(models.User, {
                foreignKey: 'userId',
                as: 'user'
            });
            Address.hasOne(models.Order, {
                foreignKey: 'addressId',
                as: 'order'
            })
        }
    }
    Address.init({ // không cần khai báo khóa chính 
        // Thêm trường tên người nhận và số điện thoại 
        recipientName: DataTypes.STRING,
        phoneNumber: DataTypes.STRING,
        city: DataTypes.STRING,
        district: DataTypes.STRING,
        ward: DataTypes.STRING,
        addressDetail: DataTypes.STRING,
        isDefault: DataTypes.BOOLEAN,
    }, {
        sequelize,
        modelName: 'Address',
    });
    return Address;
};
