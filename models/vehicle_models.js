module.exports = function(sequelize, DataTypes) {
	var VehicleModel = sequelize.define('VehicleModel', {
		brand_id : {
	        type : DataTypes.INTEGER,
		    allowNull : true
	    },
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
	  	tableName: 'vehicle_models',

    	classMethods: {
	        associate : function(models) {
		        VehicleModel.belongsTo( models.Flag, { foreignKey: 'flag_id'} );
		        VehicleModel.belongsTo( models.VehicleBrand, { foreignKey: 'brand_id'} );
	        },
    	},

		instanceMethods: {

    	}
    }
  );
 
  return VehicleModel;
}