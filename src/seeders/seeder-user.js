'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.bulkInsert('Users', [
      {
        email: 'admin@gmail.com',
        password: '123456',
        firstName: 'Dinh',
        lastName: 'Pham',
        address: '123 Main St',
        gender: 1,
        phoneNumber: '0346119773',
        image: 'http://',
        positionId: '123456',
        roleId: 'ADMIN',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('Users', null, {});
  }
};

// định nghĩa ví dụ cho các bảng 
