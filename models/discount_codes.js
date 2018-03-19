module.exports = function(sequelize, DataTypes) {
	var DiscountCode = sequelize.define('DiscountCode', {
		user_id : {
	        type : DataTypes.INTEGER,
	        allowNull : true
	    },
		discount_code : {
	        type : DataTypes.STRING,
			allowNull : true
	    },
		used_count : {
	        type : DataTypes.INTEGER,
			allowNull : true
	    },
  	}, {
	  	timestamps: true,
	  	freezeTableName: true,
	  	tableName: 'discount_codes',

    	classMethods: {
	        associate : function(models) {
		        DiscountCode.belongsTo( models.User, { foreignKey: 'user_id'} );
	        },
    	},

		instanceMethods: {

    	}
    }
  );
 
  return DiscountCode;
}