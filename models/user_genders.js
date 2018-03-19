module.exports = function(sequelize, DataTypes) {
	var UserGender = sequelize.define('UserGender', {
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
	  	tableName: 'user_genders',

    	classMethods: {
	        associate : function(models) {
		        UserGender.belongsTo( models.Flag, { foreignKey: 'flag_id'} );
	        },
    	},

		instanceMethods: {

    	}
    }
  );
 
  return UserGender;
}