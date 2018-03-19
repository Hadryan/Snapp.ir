module.exports = function(sequelize, DataTypes) {
	var CustomerProfile = sequelize.define('CustomerProfile', {
		user_id : {
	        type : DataTypes.INTEGER,
	        allowNull : true,
	    },
		gender_id : {
	        type : DataTypes.INTEGER,
	        allowNull : true,
	    },
		full_name : {
	        type : DataTypes.STRING(511),
	        allowNull : true,
	    },
		phone : {
	        type : DataTypes.STRING(31),
	        allowNull : true,
	    },
		address : {
	        type : DataTypes.STRING(511),
	        allowNull : true,
	    },
		birth_date : {
	        type : DataTypes.STRING(20),
	        allowNull : true,
	    },
		current_situation_id : {
	        type : DataTypes.INTEGER,
	        allowNull : true,
	    },
		sum_trip_times : {
	        type : DataTypes.DECIMAL(10, 2),
	        allowNull : true,
	    },
		sum_trip_counts : {
	        type : DataTypes.DECIMAL(18, 14),
	        allowNull : true,
	    },
		sum_trip_distances : {
	        type : DataTypes.DECIMAL(18, 14),
	        allowNull : true,
	    },
		sum_trip_canceled : {
	        type : DataTypes.INTEGER,
	        allowNull : true,
	    },
		like_count : {
	        type : DataTypes.INTEGER,
	        allowNull : true,
	    },
		dislike_count : {
	        type : DataTypes.INTEGER,
	        allowNull : true,
	    },
  	}, {
	  	timestamps: true,
	  	freezeTableName: true,
	  	tableName: 'customer_profile',

    	classMethods: {
	        associate : function(models) {
		        CustomerProfile.belongsTo( models.User, { foreignKey: 'user_id'} );
		        CustomerProfile.belongsTo( models.UserGender, { foreignKey: 'gender_id'} );
		        CustomerProfile.belongsTo( models.CustomerCurrentSituations, { foreignKey: 'current_situation_id'} );
	        },
    	},

		instanceMethods: {
    	}
    }
  );
 
  return CustomerProfile;
}