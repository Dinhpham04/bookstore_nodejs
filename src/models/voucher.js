'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Voucher extends Model {
   
    static associate(models) { 
      Voucher.hasMany(models.VoucherProduct, {
        foreignKey: 'voucherId',
        as: 'voucherProducts'
      }); 
      Voucher.hasMany(models.VoucherUser, {
        foreignKey: 'voucherId',
        as: 'voucherUsers'
      })
    }
  }
  Voucher.init({ // không cần khai báo khóa chính 
    code: DataTypes.STRING,
    decription: DataTypes.TEXT,
    type: DataTypes.ENUM('percent', 'amount'),
    minOrderValue: DataTypes.INTEGER, 
    startDate: DataTypes.DATE,
    endDate: DataTypes.DATE,
    usageLimit: DataTypes.INTEGER,
    usagePerUserLimit: DataTypes.INTEGER, 
    isActive: DataTypes.BOOLEAN,
  }, {
    sequelize,
    modelName: 'Voucher',
  });
  return Voucher;
};
