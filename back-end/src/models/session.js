'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Session extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Session.belongsTo(models.Camera, { foreignKey: 'cameraId' });
      Session.hasMany(models.Data, { foreignKey: 'sessionId' });
      Session.hasMany(models.Count, { foreignKey: 'sessionId' });
    }
  };
  Session.init({
    cameraId: DataTypes.INTEGER,
    startDate: DataTypes.STRING,
    endDate: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Session',
  });
  return Session;
};