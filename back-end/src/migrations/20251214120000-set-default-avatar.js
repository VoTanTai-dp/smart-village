'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Set default value on column and update existing NULLs
    await queryInterface.changeColumn('Users', 'avatar', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: '/uploads/blank-avatar.jpg'
    });
    await queryInterface.sequelize.query("UPDATE `Users` SET `avatar` = '/uploads/blank-avatar.jpg' WHERE `avatar` IS NULL OR `avatar` = ''");
  },

  down: async (queryInterface, Sequelize) => {
    // Remove default value only
    await queryInterface.changeColumn('Users', 'avatar', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: null
    });
  }
};
