'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Address extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) { // định danh các mối quan hệ 
            // define association here
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
