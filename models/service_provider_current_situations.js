module.exports = function(sequelize, DataTypes) {
	var ServiceProviderCurrentSituation = sequelize.define('ServiceProviderCurrentSituation', {
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
	  	tableName: 'service_provider_current_situations',

    	classMethods: {
	        associate : function(models) {
		        ServiceProviderCurrentSituation.belongsTo( models.Flag, { foreignKey: 'flag_id'} );
	        },
    	},

		instanceMethods: {
    	}
    }
  );
 
  return ServiceProviderCurrentSituation;
}