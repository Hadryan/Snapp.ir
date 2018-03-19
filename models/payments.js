module.exports = function(sequelize, DataTypes) {
	var Payment = sequelize.define('Payment', {
		user_id : {
	        type : DataTypes.INTEGER,
	        allowNull : true
	    },
		payment_method_id : {
	        type : DataTypes.INTEGER,
			allowNull : true
	    },
		payment_reason_id : {
	        type : DataTypes.INTEGER,
			allowNull : true
	    },
		payment_situation_id : {
	        type : DataTypes.INTEGER,
			allowNull : true
	    },
		trip_id : {
	        type : DataTypes.INTEGER,
			allowNull : true
	    },
		amount : {
	        type : DataTypes.DECIMAL(10,2),
			allowNull : true
	    },
		last_balance : {
	        type : DataTypes.DECIMAL(10,2),
			allowNull : true
	    },
		description : {
	        type : DataTypes.TEXT,
			allowNull : true
	    },
		creator_user_id : {
	        type : DataTypes.INTEGER,
			allowNull : true
	    },
		creator_user_ip : {
	        type : DataTypes.STRING(50),
			allowNull : true
	    },
  	}, {
	  	timestamps: true,
	  	freezeTableName: true,
	  	tableName: 'payments',

    	classMethods: {
	        associate : function(models) {
		        Payment.belongsTo( models.User, { foreignKey: 'user_id'} );
		        Payment.belongsTo( models.PaymentMethod, { foreignKey: 'payment_method_id'} );
		        Payment.belongsTo( models.PaymentReason, { foreignKey: 'payment_reason_id'} );
		        Payment.belongsTo( models.paymentSituation, { foreignKey: 'payment_situation_id'} );
		        Payment.belongsTo( models.Trip, { foreignKey: 'trip_id'} );
		        Payment.belongsTo( models.BackendUser, { foreignKey: 'creator_user_id'} );
	        },
    	},

		instanceMethods: {

    	}
    }
  );
 
  return Payment;
}