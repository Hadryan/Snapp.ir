module.exports = function(sequelize, DataTypes) {
	var TripDriverRateLog = sequelize.define('TripDriverRateLog', {
		trip_id : {
	        type : DataTypes.INTEGER,
	        allowNull : true
	    },
		user_id : {
			type : DataTypes.INTEGER,
			allowNull : true
	    },
		rate : {
	        type : DataTypes.DECIMAL(4,2),
			allowNull : true
	    },
  	}, {
	  	timestamps: true,
	  	freezeTableName: true,
	  	tableName: 'trip_driver_rate_logs',

    	classMethods: {
	        associate : function(models) {
		        TripDriverRateLog.belongsTo( models.Trip, { foreignKey: 'trip_id'} );
		        TripDriverRateLog.belongsTo( models.User, { foreignKey: 'user_id'} );
	        },
    	},

		instanceMethods: {

    	}
    }
  );
 
  return TripDriverRateLog;
}