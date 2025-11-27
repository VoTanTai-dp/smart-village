'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Count extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Count.belongsTo(models.Session, { foreignKey: 'sessionId' });
    }
  };
  Count.init({
    sessionId: DataTypes.INTEGER,
    countPeople: DataTypes.INTEGER,
    countVehicle: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Count',
  });
  return Count;
};