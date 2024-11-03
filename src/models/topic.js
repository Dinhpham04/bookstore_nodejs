'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Topic extends Model {
    
    static associate(models) { 
      Topic.belongsTo(models.Category, {
        foreignKey: 'categoryId', 
        as: 'category'
      }); 
      Topic.hasMany(models.Genre, {
        foreignKey: 'topicId', 
        as: 'genres'
      }); 
    }
  }
  Topic.init({ // không cần khai báo khóa chính 
    name: DataTypes.STRING,
    imageUrl: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Topic',
  });
  return Topic;
};