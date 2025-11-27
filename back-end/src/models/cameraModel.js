'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Camera_Model extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  Camera_Model.init({
    cameraId: DataTypes.INTEGER,
    modelAIId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Camera_Model',
  });
  return Camera_Model;
};