module.exports = function(sequelize, DataTypes) {
	var SupportMessageFlag = sequelize.define('SupportMessageFlag', {
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
	  	tableName: 'support_message_flags',

    	classMethods: {
	        associate : function(models) {
		        SupportMessageFlag.belongsTo( models.Flag, { foreignKey: 'flag_id'} );
	        },
    	},

		instanceMethods: {

    	}
    }
  );
 
  return SupportMessageFlag;
}