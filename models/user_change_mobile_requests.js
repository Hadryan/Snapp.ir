module.exports = function(sequelize, DataTypes) {
	var UserChangeMobileRequest = sequelize.define('UserChangeMobileRequest', {
        user_id : {
	        type : DataTypes.INTEGER,
	        allowNull : true
	    },
        newMobile : {
	        type : DataTypes.STRING(31),
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
        auth_ttl : {
	        type : DataTypes.INTEGER,
			allowNull : true
	    },
  	}, {
	  	timestamps: true,
	  	freezeTableName: true,
	  	tableName: 'user_change_mobile_requests',

    	classMethods: {
	        associate : function(models) {
		        UserChangeMobileRequest.belongsTo( models.User, { foreignKey: 'user_id'} );
	        },
    	},

		instanceMethods: {

    	}
    }
  );
 
  return UserChangeMobileRequest;
}