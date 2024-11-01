'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Products', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING
      },
      author: {
        type: Sequelize.STRING
      },
      supplier: {
        type: Sequelize.STRING
      },
      publisher: {
        type: Sequelize.STRING
      },
      bookLayout: {
        type: Sequelize.STRING
      },
      price: {
        type: Sequelize.INTEGER
      },
      productCode: {
        type: Sequelize.STRING
      },
      publishYear: {
        type: Sequelize.INTEGER
      },
      language: {
        type: Sequelize.STRING
      },
      weight: {
        type: Sequelize.INTEGER
      },
      size: {
        type: Sequelize.STRING
      },
      quantityOfPages: {
        type: Sequelize.INTEGER
      },
      quantityAvailable: {
        type: Sequelize.INTEGER
      },
      description: {
        type: Sequelize.TEXT
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
    await queryInterface.dropTable('Products');
  }
};