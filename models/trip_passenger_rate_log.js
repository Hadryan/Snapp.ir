module.exports = function(sequelize, DataTypes) {
	var TripPassengerRateLog = sequelize.define('TripPassengerRateLog', {
		trip_id : {
	        type : DataTypes.INTEGER,
	        allowNull : true
	    },
		user_id : {
			type : DataTypes.INTEGER,
			allowNull : true
	    },
		like : {
	        type : DataTypes.BOOLEAN,
			allowNull : true
	    },
		dislike : {
	        type : DataTypes.BOOLEAN,
			allowNull : true
	    },
  	}, {
	  	timestamps: true,
	  	freezeTableName: true,
	  	tableName: 'trip_passenger_rate_log',

    	classMethods: {
	        associate : function(models) {
		        TripPassengerRateLog.belongsTo( models.Trip, { foreignKey: 'trip_id'} );
		        TripPassengerRateLog.belongsTo( models.User, { foreignKey: 'user_id'} );
	        },
    	},

		instanceMethods: {

    	}
    }
  );
 
  return TripPassengerRateLog;
}