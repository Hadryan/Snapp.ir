module.exports = function(sequelize, DataTypes) {
	var VehicleBrand = sequelize.define('VehicleBrand', {
        name : {
	        type : DataTypes.STRING,
	        allowNull : true
	    },
		logo : {
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
	  	tableName: 'vehicle_brands',

    	classMethods: {
	        associate : function(models) {
		        VehicleBrand.belongsTo( models.Flag, { foreignKey: 'flag_id'} );
	        },
    	},

		instanceMethods: {

    	}
    }
  );
 
  return VehicleBrand;
}