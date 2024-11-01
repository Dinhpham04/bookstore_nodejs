'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Image extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) { // định danh các mối quan hệ 
      // define association here
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