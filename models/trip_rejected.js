module.exports = function(sequelize, DataTypes) {
	var TripRejected= sequelize.define('TripRejected', {
		trip_id : {
	        type : DataTypes.INTEGER,
	        allowNull : true
	    },
		driver_user_id : {
			type : DataTypes.INTEGER,
			allowNull : true
	    },
		reject_reason_id : {
	        type : DataTypes.INTEGER,
			allowNull : true
	    },
		reject_description : {
	        type : DataTypes.TEXT,
			allowNull : true
	    },
		rejected_at : {
	        type : DataTypes.DATE,
			allowNull : true
	    },
  	}, {
	  	timestamps: true,
	  	freezeTableName: true,
	  	tableName: 'trip_rejected',

    	classMethods: {
	        associate : function(models) {
		        TripRejected.belongsTo( models.Trip, { foreignKey: 'trip_id'} );
		        TripRejected.belongsTo( models.User, { foreignKey: 'driver_user_id'} );
		        TripRejected.belongsTo( models.TripRejectReason, { foreignKey: 'reject_reason_id'} );
	        },
    	},

		instanceMethods: {

    	}
    }
  );
 
  return TripRejected;
}