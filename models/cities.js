module.exports = function(sequelize, DataTypes) {
	var City = sequelize.define('City', {
        name : {
	        type : DataTypes.STRING,
	        allowNull : true
	    },
		state_id : {
	        type : DataTypes.INTEGER,
	        allowNull : true
	    },
		code : {
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
	  	tableName: 'cities',

    	classMethods: {
	        associate : function(models) {
		        City.belongsTo( models.State, { foreignKey: 'state_id'} );
		        City.belongsTo( models.Flag, { foreignKey: 'flag_id'} );
	        },
    	},

		instanceMethods: {
    	}
    }
  );
 
  return City;
}