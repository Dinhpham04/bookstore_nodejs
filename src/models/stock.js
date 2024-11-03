'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Stock extends Model {
    static associate(models) { 
      Stock.belongsTo(models.Product, {
        foreignKey: 'productId',
        as: 'product'
      })
    }
  }
  Stock.init({ // không cần khai báo khóa chính 
    quantity: DataTypes.INTEGER,
    price: DataTypes.INTEGER,
    transactionDate: DataTypes.DATE,
    note: DataTypes.TEXT,
  }, {
    sequelize,
    modelName: 'Stock',
  });
  return Stock;
};
