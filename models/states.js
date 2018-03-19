module.exports = function(sequelize, DataTypes) {
	var State = sequelize.define('State', {
        name : {
	        type : DataTypes.STRING,
	        allowNull : true
	    },
		code : {
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
	  	tableName: 'states',

    	classMethods: {
	        associate : function(models) {
		        State.belongsTo( models.Flag, { foreignKey: 'flag_id'} );
		        State.hasMany( models.City, { foreignKey: 'state_id'} );
	        },
    	},

		instanceMethods: {

    	}
    }
  );
 
  return State;
}