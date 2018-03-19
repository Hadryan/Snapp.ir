/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tripLogs', {
  	new_situation: {
      type: DataTypes.STRING,
      allowNull: true,
    },
	  user_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
    },
	  trip_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
    },
	  description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
	  date: {
      type: DataTypes.DATE,
      allowNull: true,
    }
  }, {
    tableName: 'trip_logs',
	  timestamps: false,
  });
};
