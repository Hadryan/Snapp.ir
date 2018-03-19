module.exports = function(sequelize, DataTypes) {
	var TripDestination = sequelize.define('TripDestination', {
		trip_id : {
	        type : DataTypes.INTEGER,
	        allowNull : true
	    },
		geographical_lat : {
	        type : DataTypes.DECIMAL(18,14),
			allowNull : true
	    },
		geographical_long : {
	        type : DataTypes.DECIMAL(18,14),
			allowNull : true
	    },
		destination_label : {
	        type : DataTypes.STRING,
			allowNull : true
	    },
		destination_description : {
	        type : DataTypes.TEXT,
			allowNull : true
	    },
		started_at : {
	        type : DataTypes.DATE,
			allowNull : true
	    },
		ended_at : {
	        type : DataTypes.DATE,
			allowNull : true
	    },
		trip_time : {
	        type : DataTypes.INTEGER,
			allowNull : true
	    },
		trip_distance : {
	        type : DataTypes.DECIMAL(10,2),
			allowNull : true
	    },
		trip_situation_id : {
	        type : DataTypes.INTEGER,
			allowNull : true
	    },
  	}, {
	  	timestamps: false,
	  	freezeTableName: true,
	  	tableName: 'trip_destinations',

    	classMethods: {
	        associate : function(models) {
		        TripDestination.belongsTo( models.Trip, { foreignKey: 'trip_id'} );
		        TripDestination.belongsTo( models.TripDestinationSituation, { foreignKey: 'trip_situation_id'} );
	        },
    	},

		instanceMethods: {

    	}
    }
  );
 
  return TripDestination;
}