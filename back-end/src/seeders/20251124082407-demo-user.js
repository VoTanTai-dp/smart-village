'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
    await queryInterface.bulkInsert('Users', [
      {
        email: 'test1@gmail.com',
        username: 'TestUser1',
        password: 'test1',
        role: 0
      },
      {
        email: 'test2@gmail.com',
        username: 'TestUser2',
        password: 'test2',
        role: 0
      },
      {
        email: 'test3@gmail.com',
        username: 'TestUser3',
        password: 'test3',
        role: 0
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
