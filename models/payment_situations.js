module.exports = function(sequelize, DataTypes) {
	var paymentSituation = sequelize.define('paymentSituation', {
        name:{
	        type : DataTypes.STRING,
	        allowNull : true
	    },
		flag_id:{
	        type : DataTypes.INTEGER,
			allowNull : true
	    },
  	}, {
	  	timestamps: false,
	  	freezeTableName: true,
	  	tableName: 'payment_situations',

    	classMethods: {
	        associate : function(models) {
		        paymentSituation.belongsTo( models.Flag, { foreignKey: 'flag_id'} );
	        },
    	},

		instanceMethods: {
    	}
    }
  );
 
  return paymentSituation;
}