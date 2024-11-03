'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Orders', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      status: {
        type: Sequelize.ENUM('pending_payment', 'processing', 'shipping', 'completed', 'returned'),
        allowNull: false,
        defaultValue: 'processing'
      },
      orderDate: {
        type: Sequelize.DATE,
      },
      supplier: {
        type: Sequelize.STRING
      },
      paymentMethod: {
        type: Sequelize.ENUM('cash_on_delivery', 'credit_card', 'debit_card', 'bank_transfer')
      },
      paymentStatus: {
        type: Sequelize.ENUM('unpaid', 'paid')
      },
      totalAmount: {
        type: Sequelize.INTEGER
      },
      shippingFee: {
        type: Sequelize.STRING
      },
      note: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Orders');
  }
};