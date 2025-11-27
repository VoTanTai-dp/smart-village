'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Data extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Data.belongsTo(models.Session, { foreignKey: 'sessionId' });
    }
  };
  Data.init({
    sessionId: DataTypes.INTEGER,
    temperature: DataTypes.FLOAT,
    humidity: DataTypes.FLOAT,
    atTime: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Data',
  });
  return Data;
};