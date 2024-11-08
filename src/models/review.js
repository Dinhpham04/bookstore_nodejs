'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Review extends Model {

    static associate(models) {
      Review.belongsTo(models.Product, {
        foreignKey: 'productId',
        as: 'product'
      });
      Review.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      })
    }
  }
  Review.init({ // không cần khai báo khóa chính 
    rating: DataTypes.INTEGER,
    comment: DataTypes.TEXT,
  }, {
    sequelize,
    modelName: 'Review',
    tableName: 'reviews'
  });
  return Review;
};
