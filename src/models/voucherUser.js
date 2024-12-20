'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class VoucherUser extends Model {
    static associate(models) { 
      VoucherUser.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });
      VoucherUser.belongsTo(models.Voucher, {
        foreignKey: 'voucherId',
        as: 'voucher'
      })
    }
  }
  VoucherUser.init({
  }, {
    sequelize,
    modelName: 'VoucherUser',
  });
  return VoucherUser;
};