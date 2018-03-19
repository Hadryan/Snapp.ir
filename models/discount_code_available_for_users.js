module.exports = function(sequelize, DataTypes) {
	var DiscountCodeAvailableForUser = sequelize.define('DiscountCodeAvailableForUser', {
		user_id : {
	        type : DataTypes.INTEGER,
	        allowNull : true
	    },
		discount_code_used_id : {
	        type : DataTypes.INTEGER,
			allowNull : true
	    },
		available_discount_price : {
	        type : DataTypes.DECIMAL(10,2),
			allowNull : true
	    },
		used_flag : {
	        type : DataTypes.BOOLEAN,
			allowNull : true
	    },
  	}, {
	  	timestamps: false,
	  	freezeTableName: true,
	  	tableName: 'discount_code_available_for_users',

    	classMethods: {
	        associate : function(models) {
		        DiscountCodeAvailableForUser.belongsTo( models.User, { foreignKey: 'user_id'} );
		        DiscountCodeAvailableForUser.belongsTo( models.DiscountCodeUsedLog, { foreignKey: 'discount_code_used_id'} );
	        },
    	},

		instanceMethods: {

    	}
    });
 
	return DiscountCodeAvailableForUser;
}