'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Image extends Model {
    static associate(models) { 
      Image.belongsTo(models.Product, {
        foreignKey: 'productId', 
        as: 'product'
      })
    }
  }
  Image.init({ // không cần khai báo khóa chính 
    url: DataTypes.STRING,
    isPrimary: DataTypes.BOOLEAN,
    orderNumber: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'Image',
  });
  return Image;
};