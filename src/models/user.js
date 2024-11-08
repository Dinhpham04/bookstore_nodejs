'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.Order, {
        foreignKey: 'userId',
        as: 'orders'
      });
      User.hasOne(models.Cart, {
        foreignKey: 'userId',
        as: 'cart'
      });
      User.hasMany(models.VoucherUser, {
        foreignKey: 'userId',
        as: 'voucherUsers'
      });
      User.hasMany(models.Notification, {
        foreignKey: 'userId',
        as: 'notifications'
      });
      User.hasMany(models.Address, {
        foreignKey: 'userId',
        as: 'addresses'
      });
      User.hasMany(models.Review, {
        foreignKey: 'userId',
        as: 'reviews'
      })
    }
  }
  User.init({ // không cần khai báo khóa chính 
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    phoneNumber: DataTypes.STRING,
    gender: DataTypes.BOOLEAN,
    profileImage: DataTypes.STRING,
    userType: DataTypes.ENUM('customer', 'admin')
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'Users',
  });
  return User;
};
