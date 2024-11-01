'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) { // định danh các mối quan hệ 
      // define association here
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
