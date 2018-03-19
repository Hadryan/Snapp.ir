module.exports = function(sequelize, DataTypes) {
	var UserDefects = sequelize.define('UserDefects', {
		user_id : {
			type : DataTypes.INTEGER,
			allowNull : true
		},
		description : {
			type : DataTypes.TEXT,
			allowNull : true
		},
	}, {
	  	timestamps: false,
	  	freezeTableName: true,
	  	tableName: 'user_defects',

    	classMethods: {
	        associate : function(models) {
		        UserDefects.belongsTo( models.User, { foreignKey: 'user_id'} );
	        },
    	},

		instanceMethods: {

    	}
    }
  );
 
  return UserDefects;
}