module.exports = function(sequelize, DataTypes) {
	var UserSituation = sequelize.define('UserSituation', {
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
	  	tableName: 'user_situations',

    	classMethods: {
	        associate : function(models) {
		        UserSituation.belongsTo( models.Flag, { foreignKey: 'flag_id'} );
	        },
    	},

		instanceMethods: {

    	}
    }
  );
 
  return UserSituation;
}