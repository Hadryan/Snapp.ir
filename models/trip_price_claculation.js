module.exports = function(sequelize, DataTypes) {
	var TripPriceClaculation= sequelize.define('TripPriceClaculation', {
		var1 : {
	        type : DataTypes.INTEGER,
	        allowNull : true
	    },
		var2 : {
			type : DataTypes.STRING(9),
			allowNull : true
	    },
		var3 : {
	        type : DataTypes.INTEGER,
			allowNull : true
	    },
		cond1_max : {
	        type : DataTypes.INTEGER,
			allowNull : true
	    },
		state1 : {
	        type : DataTypes.INTEGER,
			allowNull : true
	    },
		cond2_min : {
	        type : DataTypes.INTEGER,
			allowNull : true
	    },
		cond2_max : {
	        type : DataTypes.INTEGER,
			allowNull : true
	    },
		state2 : {
	        type : DataTypes.INTEGER,
			allowNull : true
	    },
		cond3_min : {
	        type : DataTypes.INTEGER,
			allowNull : true
	    },
		state3_var : {
	        type : DataTypes.INTEGER,
			allowNull : true
	    },
		discount_codes_price : {
	        type : DataTypes.INTEGER,
			allowNull : true
	    },
  	}, {
	  	timestamps: true,
	  	freezeTableName: true,
	  	tableName: 'trip_price_claculation',

    	classMethods: {
	        associate : function(models) {
	        },
    	},

		instanceMethods: {
    	}
    }
  );
 
  return TripPriceClaculation;
}