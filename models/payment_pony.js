module.exports = function(sequelize, DataTypes) {
	var PaymentPony= sequelize.define('PaymentPony', {
		user_id : {
	        type : DataTypes.INTEGER,
	        allowNull : true
	    },
		amount : {
	        type : DataTypes.DECIMAL(10,2),
			allowNull : true
	    },
		pony_start_date : {
	        type : DataTypes.DATE,
			allowNull : true
	    },
		pony_end_date : {
	        type : DataTypes.DATE,
			allowNull : true
	    },
		total_pony_id : {
	        type : DataTypes.INTEGER,
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
	  	tableName: 'payment_pony',

    	classMethods: {
	        associate : function(models) {
		        PaymentPony.belongsTo( models.User, { foreignKey: 'receiver_user_id'} );
		        PaymentPony.belongsTo( models.BackendUser, { foreignKey: 'creator_user_id'} );
		        PaymentPony.belongsTo( models.PaymentTotalPony, { foreignKey: 'total_pony_id'} );
	        },
    	},

		instanceMethods: {

    	}
    }
  );
 
  return PaymentPony;
}