'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Allcodes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      address: {
        type: Sequelize.STRING
      },
      type: {
        type: Sequelize.STRING
      },
      valueEn: {
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
    await queryInterface.dropTable('Allcods');
  }
};

// file này dùng để cấu trúc cơ sở dữ liệu (các bảng trong database )
// để run các file migration để tạo ra các bảng trong cơ sở dữ liệu gõ lệnh: npx sequelize-cli db:migrate