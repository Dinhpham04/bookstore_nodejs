'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CartItem extends Model {
    static associate(models) { 
      CartItem.belongsTo(models.Cart, {
        foreignKey: 'cartId', 
        as: 'cart'
      }); 
      CartItem.belongsTo(models.Product, {
        foreignKey: 'productId', 
        as: 'product'
      })
    }
  }
  CartItem.init({
    quantity: DataTypes.INTEGER, 
    currentPrice: DataTypes.INTEGER,
    isCheckedOut: DataTypes.BOOLEAN,
    isChecked: DataTypes.BOOLEAN, 
  }, {
    sequelize,
    modelName: 'CartItem',
  });
  return CartItem;
};