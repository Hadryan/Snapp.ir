module.exports = function(sequelize, DataTypes) {
	var TripPriceParameters= sequelize.define('TripPriceParameters', {
		title : {
	        type : DataTypes.STRING,
	        allowNull : true
	    },
		parameter_type_id : {
			type : DataTypes.INTEGER,
			allowNull : true
	    },
		change_amount : {
	        type : DataTypes.DECIMAL(4,2),
			allowNull : true
	    },
		creator_user_id : {
	        type : DataTypes.INTEGER,
			allowNull : true
	    },
		creator_user_ip : {
	        type : DataTypes.STRING(50),
			allowNull : true
	    },
		flag_id : {
	        type : DataTypes.INTEGER,
			allowNull : true
	    },
  	}, {
	  	timestamps: true,
	  	freezeTableName: true,
	  	tableName: 'trip_price_parameters',

    	classMethods: {
	        associate : function(models) {
		        TripPriceParameters.belongsTo( models.TripPriceParameterTypes, { foreignKey: 'parameter_type_id'} );
		        TripPriceParameters.belongsTo( models.User, { foreignKey: 'creator_user_id'} );
		        TripPriceParameters.belongsTo( models.Flag, { foreignKey: 'flag_id'} );
	        },
    	},

		instanceMethods: {

    	}
    }
  );
 
  return TripPriceParameters;
}