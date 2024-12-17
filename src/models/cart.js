'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Cart extends Model {
    static associate(models) {
      Cart.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });
      Cart.hasMany(models.CartItem, {
        foreignKey: 'cartId',
        as: 'cartItems'
      })
    }
  }
  Cart.init({
    isCheckedAll: DataTypes.BOOLEAN,
  }, {
    sequelize,
    modelName: 'Cart',
    tableName: 'Carts'
  });
  return Cart;
};