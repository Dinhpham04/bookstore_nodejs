'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Specialty extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) { // định danh các mối quan hệ 
      // define association here
    }
  }
  Specialty.init({ // không cần khai báo khóa chính 
    name: DataTypes.STRING,
    decription: DataTypes.TEXT,
    image: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Specialty',
  });
  return Specialty;
};