'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Cart extends Model {
    static associate(models) { 
      Cart.belongsTo(models.User, {
        foreignKey: 'customerId', 
        as: 'customer'
      }); 
      Cart.hasMany(models.CartItem, {
        foreignKey: 'cartId', 
        as: 'cartItems'
      })
    }
  }
  Cart.init({
  }, {
    sequelize,
    modelName: 'Cart',
    tableName: 'Carts'
  });
  return Cart;
};