module.exports = function(sequelize, DataTypes) {
	var DiscountCodeUsedLog = sequelize.define('DiscountCodeUsedLog', {
		user_id : {
	        type : DataTypes.INTEGER,
	        allowNull : true
	    },
		discount_code_id : {
	        type : DataTypes.INTEGER,
			allowNull : true
	    },
		trip_id : {
	        type : DataTypes.INTEGER,
			allowNull : true
	    },
		discount_price : {
	        type : DataTypes.DECIMAL(10,2),
			allowNull : true
	    },
  	}, {
	  	timestamps: true,
	  	freezeTableName: true,
	  	tableName: 'discount_codes_used_logs',

    	classMethods: {
	        associate : function(models) {
		        DiscountCodeUsedLog.belongsTo( models.User, { foreignKey: 'user_id'} );
		        DiscountCodeUsedLog.belongsTo( models.DiscountCode, { foreignKey: 'discount_code_id'} );
		        DiscountCodeUsedLog.belongsTo( models.Trip, { foreignKey: 'trip_id'} );
	        },
    	},

		instanceMethods: {

    	}
    }
  );
 
  return DiscountCodeUsedLog;
}