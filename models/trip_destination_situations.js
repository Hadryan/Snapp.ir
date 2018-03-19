module.exports = function(sequelize, DataTypes) {
	var TripDestinationSituation = sequelize.define('TripDestinationSituation', {
        name : {
	        type : DataTypes.STRING,
	        allowNull : true
	    },
		flag_id : {
	        type : DataTypes.INTEGER,
			allowNull : true
	    },
  	}, {
	  	timestamps: false,
	  	freezeTableName: true,
	  	tableName: 'trip_destination_situations',

    	classMethods: {
	        associate : function(models) {
		        TripDestinationSituation.belongsTo( models.Flag, { foreignKey: 'flag_id'} );
	        },
    	},

		instanceMethods: {

    	}
    }
  );
 
  return TripDestinationSituation;
}