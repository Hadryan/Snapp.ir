module.exports = function(sequelize, DataTypes) {
	var TripRejectReason = sequelize.define('TripRejectReason', {
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
	  	tableName: 'trip_reject_reasons',

    	classMethods: {
	        associate : function(models) {
		        TripRejectReason.belongsTo( models.Flag, { foreignKey: 'flag_id'} );
	        },
    	},

		instanceMethods: {

    	}
    }
  );
 
  return TripRejectReason;
}