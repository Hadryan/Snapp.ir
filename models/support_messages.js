module.exports = function(sequelize, DataTypes) {
	var SupportMessage = sequelize.define('SupportMessage', {
		message_subject_id : {
	        type : DataTypes.INTEGER,
			allowNull : true
	    },
		trip_id : {
			type : DataTypes.INTEGER,
			allowNull : true
		},
		sender_id : {
			type : DataTypes.INTEGER,
			allowNull : true
		},
		message_body : {
			type : DataTypes.TEXT,
			allowNull : true
		},
		message_flag_id : {
			type : DataTypes.INTEGER,
			allowNull : true
		},
  	}, {
	  	timestamps: true,
	  	freezeTableName: true,
	  	tableName: 'support_messages',

    	classMethods: {
	        associate : function(models) {
		        SupportMessage.belongsTo( models.SupportMessageSubject, { foreignKey: 'message_subject_id'} );
		        SupportMessage.belongsTo( models.Trip, { foreignKey: 'trip_id'} );
		        SupportMessage.belongsTo( models.User, { foreignKey: 'sender_id'} );
		        SupportMessage.belongsTo( models.SupportMessageFlag, { foreignKey: 'message_flag_id'} );
	        },
    	},

		instanceMethods: {

    	}
    }
  );
 
  return SupportMessage;
}