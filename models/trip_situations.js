module.exports = function(sequelize, DataTypes) {
	var TripSituation = sequelize.define('TripSituation', {
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
	  	tableName: 'trip_situations',

    	classMethods: {
	        associate : function(models) {
		        TripSituation.belongsTo( models.Flag, { foreignKey: 'flag_id'} );
	        },
    	},

		instanceMethods: {

    	}
    }
  );
 
  return TripSituation;
}