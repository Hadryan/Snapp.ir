module.exports = function (sequelize, DataTypes) {
	var tripDriverAcceptedLogs = sequelize.define('tripDriverAcceptedLogs', {
		trip_id: {
			type: DataTypes.INTEGER,
			allowNull: true
		},
		driver_user_id: {
			type: DataTypes.INTEGER,
			allowNull: true
		},
		date: {
			type: DataTypes.DATE,
			allowNull: true
		},
	}, {
		timestamps: false,
		freezeTableName: true,
		tableName: 'trip_driver_accepted_logs',
		classMethods: {
			associate: function (models) {

			}
		}
	});
	return tripDriverAcceptedLogs;
};