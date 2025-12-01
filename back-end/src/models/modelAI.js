'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ModelAI extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      ModelAI.belongsToMany(models.Camera, { through: models.Camera_Model, foreignKey: 'modelAIId' });
    }
  };
  ModelAI.init({
    modelname: DataTypes.STRING,
    description: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'ModelAI',
    tableName: 'ModelAI', // Chỉ định chính xác tên bảng trong DB (giống migration)
    freezeTableName: true,
  });
  return ModelAI;
};