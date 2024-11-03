'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Category extends Model {
    static associate(models) {
      Category.hasMany(models.Topic, {
        foreignKey: 'categoryId',
        as: 'topics',
      })
    }
  }
  Category.init({ // không cần khai báo khóa chính 
    name: DataTypes.STRING,
    imageUrl: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Category',
  });
  return Category;
};