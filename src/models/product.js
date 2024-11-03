'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    static associate(models) { 
      Product.belongsTo(models.Genre, {
        foreignKey: 'genreId',
        as: 'genre'
      });
      Product.hasMany(models.Image, {
        foreignKey: 'productId',
        as: 'images'
      }); 
      Product.hasMany(models.OderItem, {
        foreignKey: 'productId',
        as: 'oderItems'
      }); 
      Product.hasMany(models.CartItem, {
        foreignKey: 'productId',
        as: 'cartItems'
      }); 
      Product.hasMany(models.VoucherProduct, {
        foreignKey: 'productId',
        as: 'voucherProducts'
      });
    }
  }
  Product.init({ // không cần khai báo khóa chính 
    name: DataTypes.STRING,
    author: DataTypes.STRING,
    supplier: DataTypes.STRING,
    publisher: DataTypes.STRING,
    bookLayout: DataTypes.STRING,
    price: DataTypes.INTEGER,
    productCode: DataTypes.STRING,
    publishYear: DataTypes.INTEGER,
    language: DataTypes.STRING,
    weight: DataTypes.INTEGER,
    size: DataTypes.STRING,
    quantityOfPages: DataTypes.INTEGER,
    quantityAvailable: DataTypes.INTEGER,
    description: DataTypes.TEXT,
  }, {
    sequelize,
    modelName: 'Product',
  });
  return Product;
};
