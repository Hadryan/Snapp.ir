module.exports = function(sequelize, DataTypes) {
	var PaymentType = sequelize.define('PaymentType', {
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
	  	tableName: 'payment_types',

    	classMethods: {
	        associate : function(models) {
		        PaymentType.belongsTo( models.Flag, { foreignKey: 'flag_id'} );
	        },
    	},

		instanceMethods: {

    	}
    }
  );
 
  return PaymentType;
}