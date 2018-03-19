module.exports = function(sequelize, DataTypes) {
	var PaymentMethod = sequelize.define('PaymentMethod', {
        name : {
	        type : DataTypes.STRING,
	        allowNull : true
	    },
		flag_id : {
	        type : DataTypes.INTEGER,
			allowNull : true
	    },
  	}, {
	  	timestamps: false,
	  	freezeTableName: true,
	  	tableName: 'payment_methods',

    	classMethods: {
	        associate : function(models) {
		        PaymentMethod.belongsTo( models.Flag, { foreignKey: 'flag_id'} );
	        },
    	},

		instanceMethods: {

    	}
    }
  );
 
  return PaymentMethod;
}