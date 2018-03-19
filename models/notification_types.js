module.exports = function(sequelize, DataTypes) {
	var NotificationType = sequelize.define('NotificationType', {
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
	  	tableName: 'notification_types',

    	classMethods: {
	        associate : function(models) {
		        NotificationType.belongsTo( models.Flag, { foreignKey: 'flag_id'} );
	        },
    	},

		instanceMethods: {

    	}
    }
  );
 
  return NotificationType;
}