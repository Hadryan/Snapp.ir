module.exports = function(sequelize, DataTypes) {
	var Trip = sequelize.define('Trip', {
		trip_code : {
	        type : DataTypes.STRING(32),
	        allowNull : true
	    },
		trip_type_id : {
	        type : DataTypes.INTEGER,
			allowNull : true
	    },
		request_time : {
	        type : DataTypes.DATE,
			allowNull : true
	    },
		trip_millisecond : {
	        type : DataTypes.STRING(50),
			allowNull : true
	    },
		start_time : {
	        type : DataTypes.DATE,
			allowNull : true
	    },
		end_time : {
	        type : DataTypes.DATE,
			allowNull : true
	    },
		driver_place_geographical_lat : {
	        type : DataTypes.DECIMAL(18,14),
			allowNull : true
	    },
		driver_place_geographical_long : {
	        type : DataTypes.DECIMAL(18,14),
			allowNull : true
	    },
		driver_place_label : {
	        type : DataTypes.STRING,
			allowNull : true
	    },
		trip_source_geographical_lat : {
	        type : DataTypes.DECIMAL(18,14),
			allowNull : true
	    },
		trip_source_geographical_long : {
	        type : DataTypes.DECIMAL(18,14),
			allowNull : true
	    },
		trip_source_label : {
			type : DataTypes.STRING,
			allowNull : true
		},
		trip_source_description : {
			type : DataTypes.TEXT,
			allowNull : true
		},
		driver_user_id : {
	        type : DataTypes.INTEGER,
			allowNull : true
	    },
		passenger_user_id : {
	        type : DataTypes.INTEGER,
			allowNull : true
	    },
		trip_situation_id : {
	        type : DataTypes.INTEGER,
			allowNull : true
	    },
		main_price : {
	        type : DataTypes.DECIMAL(10,2),
			allowNull : true
	    },
		discount_price : {
			type : DataTypes.DECIMAL(10,2),
			allowNull : true
		},
		net_price : {
			type : DataTypes.DECIMAL(10,2),
			allowNull : true
		},
		discount_code_id : {
	        type : DataTypes.INTEGER,
			allowNull : true
	    },
		discount_coupon_id : {
	        type : DataTypes.INTEGER,
			allowNull : true
	    },
		driver_slice : {
	        type : DataTypes.DECIMAL(10,2),
			allowNull : true
	    },
		system_slice : {
	        type : DataTypes.DECIMAL(10,2),
			allowNull : true
	    },
		payment_id : {
	        type : DataTypes.INTEGER,
			allowNull : true
		},
		payment_flag : {
			type : DataTypes.BOOLEAN,
			allowNull : true
	    },
		payment_pony_id : {
	        type : DataTypes.INTEGER,
			allowNull : true
	    },
		description : {
	        type : DataTypes.TEXT,
			allowNull : true
	    },
  	}, {
	  	timestamps: false,
	  	freezeTableName: true,
	  	tableName: 'trip',

    	classMethods: {
	        associate : function(models) {
		        Trip.belongsTo( models.User, { as: 'driverUser', foreignKey: 'driver_user_id'} );
		        Trip.belongsTo( models.User, { as: 'passengerUser', foreignKey: 'passenger_user_id'} );
		        Trip.belongsTo( models.Payment, { foreignKey: 'payment_id'} );
		        Trip.belongsTo( models.TripType, { foreignKey: 'trip_type_id'} );
		        Trip.belongsTo( models.PaymentPony, { foreignKey: 'payment_pony_id'} );
		        Trip.belongsTo( models.DiscountCode, { foreignKey: 'discount_code_id'} );
		        Trip.belongsTo( models.DiscountCoupon, { foreignKey: 'discount_coupon_id'} );
		        Trip.belongsTo( models.TripSituation, { foreignKey: 'trip_situation_id'} );
		        Trip.hasMany(models.TripDestination,{ foreignKey: 'trip_id'});
		        Trip.hasOne( models.TripDriverRateLog, {foreignKey: 'trip_id'} );
		
	        },
    	},

		instanceMethods: {

    	}
    }
  );
 
  return Trip;
}