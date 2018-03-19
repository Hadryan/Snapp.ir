module.exports = function(sequelize, DataTypes) {
	var ServiceProviderSpecialInfo = sequelize.define('ServiceProviderSpecialInfo', {
		vehicle_brand_id : {
	        type : DataTypes.INTEGER,
			allowNull : true
	    },
		vehicle_model_id : {
			type : DataTypes.INTEGER,
			allowNull : true
		},
		vehicle_product_year : {
			type : DataTypes.INTEGER,
			allowNull : true
		},
		vehicle_color : {
			type : DataTypes.STRING(127),
			allowNull : true
		},
		vehicle_capacity : {
			type : DataTypes.INTEGER,
			allowNull : true
		},
		vehicle_plaque_left : {
			type : DataTypes.INTEGER,
			allowNull : true
		},
		vehicle_plaque_alphabet : {
			type : DataTypes.STRING(5),
			allowNull : true
		},
		vehicle_plaque_right : {
			type : DataTypes.INTEGER,
			allowNull : true
		},
		vehicle_plaque_iran : {
			type : DataTypes.INTEGER,
			allowNull : true
		},
		vehicle_has_license_traffic_plan : {
			type : DataTypes.BOOLEAN,
			allowNull : true
		},
		license_traffic_plan_expiration_date : {
			type : DataTypes.DATE,
			allowNull : true
		},
		description : {
			type : DataTypes.TEXT,
			allowNull : true
		},
  	}, {
	  	timestamps: true,
	  	freezeTableName: true,
	  	tableName: 'service_provider_special_info',

    	classMethods: {
	        associate : function(models) {
		        ServiceProviderSpecialInfo.belongsTo( models.VehicleBrand, { foreignKey: 'vehicle_brand_id'} );
		        ServiceProviderSpecialInfo.belongsTo( models.VehicleModel, { foreignKey: 'vehicle_model_id'} );
	        },
    	},

		instanceMethods: {

    	}
    }
  );
 
  return ServiceProviderSpecialInfo;
}