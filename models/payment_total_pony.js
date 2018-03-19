module.exports = function(sequelize, DataTypes) {
	var PaymentTotalPony = sequelize.define('PaymentTotalPony', {
		code : {
	        type : DataTypes.STRING(10),
	        allowNull : true
	    },
		sum_amount : {
	        type : DataTypes.DECIMAL(10,2),
			allowNull : true
	    },
		situation_id : {
			type : DataTypes.STRING(10),
			allowNull : true
		},
  	}, {
	  	timestamps: true,
	  	freezeTableName: true,
	  	tableName: 'payment_total_pony',

    	classMethods: {
	        associate : function(models) {
		        PaymentTotalPony.belongsTo( models.PaymentTotalPonySituation, { foreignKey: 'situation_id'} );
	        },
    	},

		instanceMethods: {

    	}
    }
  );
 
  return PaymentTotalPony;
}