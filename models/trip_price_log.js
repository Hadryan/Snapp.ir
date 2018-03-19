module.exports = function (sequelize, DataTypes) {
	var tripPriceLog = sequelize.define('tripPriceLog', {
		user_id: {
			type: DataTypes.INTEGER,
			allowNull: true
		},
		distance: {
			type: DataTypes.STRING,
			allowNull: true
		},
		time: {
			type: DataTypes.STRING,
			allowNull: true
		},
		calculated_price: {
			type: DataTypes.DECIMAL(10, 2),
			allowNull: true
		},
		final_price: {
			type: DataTypes.DECIMAL(10, 2),
			allowNull: true
		},
		final_rounded_price: {
			type: DataTypes.DECIMAL(10, 2),
			allowNull: true
		},
		date: {
			type: DataTypes.DATE,
			allowNull: true
		},
		parameters: {
			type: DataTypes.TEXT,
			allowNull: true
		}
	}, {
		timestamps: false,
		freezeTableName: true,
		tableName: 'trip_price_log',
		classMethods: {
			associate: function (models) {

			}
		}
	});
	return tripPriceLog;
};