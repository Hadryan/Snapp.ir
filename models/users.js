module.exports = function(sequelize, DataTypes) {
	var User = sequelize.define('User', {
		username : {
	        type : DataTypes.STRING,
	        allowNull : true
	    },
		password : {
	        type : DataTypes.STRING,
			allowNull : true
	    },
		email : {
	        type : DataTypes.STRING,
			allowNull : true
	    },
		mobile : {
	        type : DataTypes.STRING(31),
			allowNull : true
	    },
		balance : {
	        type : DataTypes.DECIMAL(10,2),
			allowNull : true
	    },
		user_type_id : {
	        type : DataTypes.INTEGER,
			allowNull : true
	    },
		password_reset_token : {
	        type : DataTypes.STRING,
			allowNull : true
	    },
		activation_code : {
	        type : DataTypes.STRING(127),
			allowNull : true
	    },
		generate_time : {
	        type : DataTypes.DATE,
			allowNull : true
	    },
		auth_token : {
	        type : DataTypes.STRING(127),
			allowNull : true
	    },
		auth_ttl : {
	        type : DataTypes.INTEGER,
			allowNull : true
	    },
		situation_id : {
	        type : DataTypes.INTEGER,
			allowNull : true
	    },
		last_online : {
	        type : DataTypes.DATE,
			allowNull : true
	    },
  	}, {
	  	timestamps: true,
	  	freezeTableName: true,
	  	tableName: 'users',

    	classMethods: {
	        associate : function(models) {
		        User.belongsTo( models.UserType, { foreignKey: 'user_type_id'} );
		        User.belongsTo( models.UserSituation, { foreignKey: 'situation_id'} );
		        User.hasOne( models.ServiceProviderProfile, {foreignKey: 'user_id'} );
		        User.hasOne( models.CustomerProfile, {foreignKey: 'user_id'} );
		        User.hasMany( models.TripDriversComment, {foreignKey: 'driver_id',as:'driverComments'} );
		        User.hasMany( models.TripDriversComment, {foreignKey: 'passenger_id',as:'passengerComments'} );
		        User.hasOne( models.OnlineDriver, {foreignKey: 'driverId'} );
	        },
    	},

		instanceMethods: {

    	}
    }
  );
 
  return User;
}