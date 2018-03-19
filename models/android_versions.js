module.exports = function(sequelize, DataTypes) {
	var AndroidVersions = sequelize.define('AndroidVersions', {
		type_id : {
			type : DataTypes.INTEGER,
			allowNull : true
		},
		label : {
			type : DataTypes.STRING,
			allowNull : true
		},
		code : {
			type : DataTypes.STRING,
			allowNull : true
		},
		url : {
			type : DataTypes.STRING,
			allowNull : true
		},
	}, {
		timestamps: true,
		freezeTableName: true,
		tableName: 'android_versions',
		
		classMethods: {
			associate : function(models) {
				AndroidVersions.belongsTo( models.UserType, { foreignKey: 'type_id'} );
			},
		},
		
		instanceMethods: {
		}
	});
	
	return AndroidVersions;
}