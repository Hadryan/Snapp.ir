module.exports = function(sequelize, DataTypes) {
	var Setting = sequelize.define('Setting', {
		commission_amount : {
	        type : DataTypes.STRING,
	        allowNull : true
	    }
  	}, {
	  	timestamps: false,
	  	tableName: 'settings',
    	classMethods: {
	        associate : function(models) {
	        },
    	},

		instanceMethods: {
    	}
    }
  );
 
  return Setting;
}