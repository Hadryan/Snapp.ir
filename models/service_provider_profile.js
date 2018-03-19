module.exports = function(sequelize, DataTypes) {
	var ServiceProviderProfile = sequelize.define('ServiceProviderProfile', {
		user_id : {
	        type : DataTypes.INTEGER,
			allowNull : true
	    },
		special_code : {
			type : DataTypes.STRING,
			allowNull : true
		},
		gender_id : {
			type : DataTypes.INTEGER,
			allowNull : true
		},
		first_name : {
			type : DataTypes.STRING,
			allowNull : true
		},
		last_name : {
			type : DataTypes.STRING,
			allowNull : true
		},
		representer_code : {
			type : DataTypes.STRING,
			allowNull : true
		},
		state_id : {
			type : DataTypes.INTEGER,
			allowNull : true
		},
		city_id : {
			type : DataTypes.INTEGER,
			allowNull : true
		},
		national_code : {
			type : DataTypes.STRING(15),
			allowNull : true
		},
		bank_atm_number : {
			type : DataTypes.STRING(31),
			allowNull : true
		},
		bank_shaba_number : {
			type : DataTypes.STRING(31),
			allowNull : true
		},
		deposit_amount : {
			type : DataTypes.DECIMAL(10,2),
			allowNull : true
		},
		visit_date : {
			type : DataTypes.STRING(12),
			allowNull : true
		},
		current_situation_id : {
			type : DataTypes.INTEGER,
			allowNull : true
		},
		sum_trip_times : {
			type : DataTypes.DECIMAL(10,2),
			allowNull : true
		},
		sum_trip_counts : {
			type : DataTypes.INTEGER,
			allowNull : true
		},
		sum_trip_distances : {
			type : DataTypes.DECIMAL(10,2),
			allowNull : true
		},
		sum_trip_rejected : {
			type : DataTypes.INTEGER,
			allowNull : true
		},
		sum_rate : {
			type : DataTypes.DECIMAL(10,2),
			allowNull : true
		},
		rate_count : {
			type : DataTypes.INTEGER,
			allowNull : true
		},
		last_pony_date : {
			type : DataTypes.DATE,
			allowNull : true
		},
		special_info_id : {
			type : DataTypes.INTEGER,
			allowNull : true
		},
		documents_id : {
			type : DataTypes.INTEGER,
			allowNull : true
		},
  	}, {
	  	timestamps: true,
	  	freezeTableName: true,
	  	tableName: 'service_provider_profile',

    	classMethods: {
	        associate : function(models) {
		        ServiceProviderProfile.belongsTo( models.User, { foreignKey: 'user_id'} );
		        ServiceProviderProfile.belongsTo( models.UserGender, { foreignKey: 'gender_id'} );
		        ServiceProviderProfile.belongsTo( models.State, { foreignKey: 'state_id'} );
		        ServiceProviderProfile.belongsTo( models.City, { foreignKey: 'city_id'} );
		        ServiceProviderProfile.belongsTo( models.ServiceProviderSpecialInfo, { foreignKey: 'special_info_id'} );
		        ServiceProviderProfile.belongsTo( models.ServiceProviderDocument, { foreignKey: 'documents_id'} );
		        ServiceProviderProfile.belongsTo( models.ServiceProviderCurrentSituation, { foreignKey: 'current_situation_id'} );
	        },
    	},

		instanceMethods: {

    	}
    }
  );
 
  return ServiceProviderProfile;
}