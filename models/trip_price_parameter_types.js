module.exports = function(sequelize, DataTypes) {
	var TripPriceParameterTypes = sequelize.define('TripPriceParameterTypes', {
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
	  	tableName: 'trip_price_parameter_types',

    	classMethods: {
	        associate : function(models) {
		        TripPriceParameterTypes.belongsTo( models.Flag, { foreignKey: 'flag_id'} );
	        },
    	},

		instanceMethods: {

    	}
    }
  );
 
  return TripPriceParameterTypes;
}