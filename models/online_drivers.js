module.exports = function(sequelize, DataTypes) {
	var OnlineDriver = sequelize.define('OnlineDriver', {
		driverId : {
	        type : DataTypes.INTEGER,
	        allowNull : true
	    },
		lat : {
	        type : DataTypes.DECIMAL(18,14),
	        allowNull : true
	    },
		long : {
	        type : DataTypes.DECIMAL(18,14),
	        allowNull : true
	    },
		direction : {
	        type : DataTypes.INTEGER,
	        allowNull : true
	    },
		rate : {
	        type : DataTypes.DECIMAL(10,2),
			allowNull : true
	    },
		sumTripCount : {
	        type : DataTypes.INTEGER,
			allowNull : true
	    },
		sumTripRejected : {
	        type : DataTypes.INTEGER,
			allowNull : true
	    },
		current_situation_id : {
	        type : DataTypes.INTEGER,
			allowNull : true
	    },
  	}, {
	  	timestamps: false,
	  	freezeTableName: true,
	  	tableName: 'online_drivers',

    	classMethods: {
	        associate : function(models) {
		        OnlineDriver.belongsTo( models.User, { foreignKey: 'driverId'} );
	        },
    	},

		instanceMethods: {
    	}
    }
  );
 
  return OnlineDriver;
}