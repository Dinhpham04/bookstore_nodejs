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
        }
    }
    Address.init({ // không cần khai báo khóa chính 
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
