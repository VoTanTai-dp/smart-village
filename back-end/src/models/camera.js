'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Camera extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Camera.belongsTo(models.User, { foreignKey: 'userId' });
      Camera.hasMany(models.Session, { foreignKey: 'cameraId' });
      Camera.belongsToMany(models.ModelAI, { through: models.Camera_Model, foreignKey: 'cameraId' });
    }
  };
  Camera.init({
    userId: DataTypes.INTEGER,
    ip: DataTypes.STRING,
    password: DataTypes.STRING,
    port: DataTypes.STRING,
    address: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Camera',
  });
  return Camera;
};