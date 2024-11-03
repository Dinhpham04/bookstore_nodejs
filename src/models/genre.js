'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Genre extends Model {
   
    static associate(models) { 
      Genre.belongsTo(models.Topic, {
        foreignKey: 'topicId', 
        as: 'topic' 
      }); 
      Genre.hasMany(models.Product, {
        foreignKey: 'genreId',
        as: 'products'
      })
    }
  }
  Genre.init({ // không cần khai báo khóa chính 
    name: DataTypes.STRING,
    imageUrl: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Genre',
  });
  return Genre;
};