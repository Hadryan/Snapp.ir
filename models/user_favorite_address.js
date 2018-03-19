module.exports = function(sequelize, DataTypes) {
	var UserFavoriteAddress= sequelize.define('UserFavoriteAddress', {
		user_id : {
	        type : DataTypes.INTEGER,
	        allowNull : true
	    },
		address_name : {
			type : DataTypes.STRING,
			allowNull : true
	    },
		geographical_lat : {
	        type : DataTypes.DECIMAL(18,14),
			allowNull : true
	    },
		geographical_long : {
	        type : DataTypes.DECIMAL(18,14),
			allowNull : true
	    },
		details : {
	        type : DataTypes.STRING(1023),
			allowNull : true
	    },
  	}, {
	  	timestamps: true,
	  	freezeTableName: true,
	  	tableName: 'user_favorite_address',

    	classMethods: {
	        associate : function(models) {
		        UserFavoriteAddress.belongsTo( models.User, { foreignKey: 'user_id'} );
	        },
    	},

		instanceMethods: {

    	}
    }
  );
 
  return UserFavoriteAddress;
}