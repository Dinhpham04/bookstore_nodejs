'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    static associate(models) { 
      Order.belongsTo(models.User, {
        foreignKey: 'customerId', 
        as: 'customer'
      }); 
      Order.hasMany(models.OrderItem, {
        foreignKey: 'cartId', 
        as: 'orderItems'
      }); 
    }
  }
  Order.init({ // không cần khai báo khóa chính 
    status: DataTypes.ENUM('pending_payment', 'processing', 'shipping', 'completed', 'returned'),
    orderDate: DataTypes.DATE,
    paymentMethod: DataTypes.ENUM('cash_on_delivery', 'credit_card', 'debit_card', 'bank_transfer'),
    paymentStatus: DataTypes.ENUM('unpaid', 'paid'),
    totalAmount: DataTypes.INTEGER,
    shippingFee: DataTypes.INTEGER,
    note: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Order',
  });
  return Order;
};
