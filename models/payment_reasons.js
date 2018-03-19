module.exports = function(sequelize, DataTypes) {
	var PaymentReason = sequelize.define('PaymentReason', {
		payment_name : {
	        type : DataTypes.STRING,
	        allowNull : true
	    },
		payment_type_id : {
	        type : DataTypes.INTEGER,
			allowNull : true
	    },
		flag_id : {
	        type : DataTypes.INTEGER,
			allowNull : true
	    },
  	}, {
	  	timestamps: false,
	  	freezeTableName: true,
	  	tableName: 'payment_reasons',

    	classMethods: {
	        associate : function(models) {
		        PaymentReason.belongsTo( models.PaymentType, { foreignKey: 'payment_type_id'} );
		        PaymentReason.belongsTo( models.Flag, { foreignKey: 'flag_id'} );
	        },
    	},

		instanceMethods: {

    	}
    }
  );
 
  return PaymentReason;
}