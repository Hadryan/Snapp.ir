module.exports = function(sequelize, DataTypes) {
	var CustomerCurrentSituations = sequelize.define('CustomerCurrentSituations', {
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
	  	tableName: 'customer_current_situations',

    	classMethods: {
	        associate : function(models) {
		        CustomerCurrentSituations.belongsTo( models.Flag, { foreignKey: 'flag_id'} );
	        },
    	},

		instanceMethods: {
    	}
    }
  );
 
  return CustomerCurrentSituations;
}