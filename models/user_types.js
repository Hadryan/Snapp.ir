module.exports = function(sequelize, DataTypes) {
	var UserType = sequelize.define('UserType', {
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
	  	tableName: 'user_types',

    	classMethods: {
	        associate : function(models) {
		        UserType.belongsTo( models.Flag, { foreignKey: 'flag_id'} );
	        },
    	},

		instanceMethods: {

    	}
    }
  );
 
  return UserType;
}