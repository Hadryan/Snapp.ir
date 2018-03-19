module.exports = function(sequelize, DataTypes) {
	var TripDriversComment = sequelize.define('TripDriversComment', {
		trip_id : {
	        type : DataTypes.INTEGER,
	        allowNull : true
	    },
		driver_id : {
			type : DataTypes.INTEGER,
			allowNull : true
	    },
		passenger_id : {
			type : DataTypes.INTEGER,
			allowNull : true
	    },
		body : {
	        type : DataTypes.TEXT,
			allowNull : true
	    },
  	}, {
	  	timestamps: true,
	  	freezeTableName: true,
	  	tableName: 'trip_drivers_comments',

    	classMethods: {
	        associate : function(models) {
		        TripDriversComment.belongsTo( models.TripDriversComment, { foreignKey: 'trip_id'} );
		        TripDriversComment.belongsTo( models.User, { foreignKey: 'driver_id',as:'driver'} );
		        TripDriversComment.belongsTo( models.User, { foreignKey: 'passenger_id',as:'passenger'} );
	        },
    	},

		instanceMethods: {

    	}
    }
  );
 
  return TripDriversComment;
}