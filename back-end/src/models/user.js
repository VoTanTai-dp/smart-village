'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.belongsTo(models.Group, { foreignKey: 'groupId' });
      User.hasMany(models.Camera, { foreignKey: 'userId' });
    }
  };
  User.init({
    groupId: DataTypes.INTEGER,
    email: DataTypes.STRING,
    username: DataTypes.STRING,
    password: DataTypes.STRING,
    phone: DataTypes.STRING,
    sex: DataTypes.STRING,
    avatar: { type: DataTypes.STRING, defaultValue: '/uploads/blank-avatar.jpg' }
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};