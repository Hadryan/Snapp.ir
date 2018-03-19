module.exports = function(sequelize, DataTypes) {
	var CustomerSetting = sequelize.define('CustomerSetting', {
		user_id : {
	        type : DataTypes.INTEGER,
			allowNull : true
	    },
		newsletter_flag : {
			type : DataTypes.BOOLEAN,
			allowNull : true
		},
		trip_info_email_flag : {
			type : DataTypes.BOOLEAN,
			allowNull : true
		},
		trip_info_sms_flag : {
			type : DataTypes.BOOLEAN,
			allowNull : true
		},
  	}, {
	  	timestamps: false,
	  	freezeTableName: true,
	  	tableName: 'customer_settings',

    	classMethods: {
	        associate : function(models) {
		        CustomerSetting.belongsTo( models.User, { foreignKey: 'user_id'} );
	        },
    	},

		instanceMethods: {

    	}
    }
  );
 
  return CustomerSetting;
}