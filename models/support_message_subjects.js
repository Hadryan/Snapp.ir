module.exports = function(sequelize, DataTypes) {
	var SupportMessageSubject = sequelize.define('SupportMessageSubject', {
        name : {
	        type : DataTypes.STRING,
	        allowNull : true
	    },
		user_type_id : {
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
	  	tableName: 'support_message_subjects',

    	classMethods: {
	        associate : function(models) {
		        SupportMessageSubject.belongsTo( models.Flag, { foreignKey: 'flag_id'} );
		        SupportMessageSubject.belongsTo( models.UserType, { foreignKey: 'user_type_id'} );
	        },
    	},

		instanceMethods: {

    	}
    }
  );
 
  return SupportMessageSubject;
}