'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class VoucherProduct extends Model {
    static associate(models) { 
      VoucherProduct.belongsTo(models.Product, {
        foreignKey: 'productId', 
        as: 'product'
      });
      VoucherProduct.belongsTo(models.Voucher, {
        foreignKey: 'voucherId',
        as: 'voucher'
      })
    }
  }
  VoucherProduct.init({
  }, {
    sequelize,
    modelName: 'VoucherProduct',
  });
  return VoucherProduct;
};