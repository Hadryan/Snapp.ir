module.exports = function(sequelize, DataTypes) {
	var Flag = sequelize.define('Flag', {
        name : {
	        type : DataTypes.STRING,
	        allowNull : true
	    },
  	}, {
	  	timestamps: false,
	  	freezeTableName: false,
	  	tableName: 'flags',

    	classMethods: {
	        associate : function(models) {
	        },
    	},

		instanceMethods: {
    	}
    }
  );
 
  return Flag;
}