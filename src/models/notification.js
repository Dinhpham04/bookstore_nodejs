'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Notification extends Model {
    static associate(models) { 
      Notification.belongsTo(models.User, {
        foreignKey: 'customerId', 
        as: 'customer' 
      })
    }
  }
  Notification.init({ // không cần khai báo khóa chính 
    type: DataTypes.STRING,
    title: DataTypes.TEXT,
    message: DataTypes.TEXT,
    isReaded: DataTypes.BOOLEAN,
  }, {
    sequelize,
    modelName: 'Notification',
  });
  return Notification;
};
