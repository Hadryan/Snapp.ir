module.exports = function(sequelize, DataTypes) {
	var Notification= sequelize.define('Notification', {
		title : {
	        type : DataTypes.STRING,
	        allowNull : true
	    },
		body : {
	        type : DataTypes.TEXT,
			allowNull : true
	    },
		image : {
	        type : DataTypes.STRING,
			allowNull : true
	    },
		notification_type_id : {
	        type : DataTypes.INTEGER,
			allowNull : true
	    },
		receiver_user_id : {
	        type : DataTypes.INTEGER,
			allowNull : true
	    },
		creator_user_id : {
	        type : DataTypes.INTEGER,
			allowNull : true
	    },
		creator_user_ip : {
	        type : DataTypes.STRING(50),
			allowNull : true
	    },
  	}, {
	  	timestamps: true,
	  	freezeTableName: true,
	  	tableName: 'notifications',

    	classMethods: {
	        associate : function(models) {
		        Notification.belongsTo( models.User, { foreignKey: 'receiver_user_id'} );
		        Notification.belongsTo( models.BackendUser, { foreignKey: 'creator_user_id'} );
		        Notification.belongsTo( models.NotificationType, { foreignKey: 'notification_type_id'} );
	        },
    	},

		instanceMethods: {

    	}
    }
  );
 
  return Notification;
}