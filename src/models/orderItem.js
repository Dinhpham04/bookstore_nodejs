'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class OrderItem extends Model {
    static associate(models) { 
      OrderItem.belongsTo(models.Order, {
        foreignKey: 'OrderId', 
        as: 'order'
      }); 
      OrderItem.belongsTo(models.Product, {
        foreignKey: 'ProductId', 
        as: 'product'
      });
    }
  }
  OrderItem.init({ // không cần khai báo khóa chính 
    currentPrice: DataTypes.INTEGER,
    quantity: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'OrderItem',
  });
  return OrderItem;
};
