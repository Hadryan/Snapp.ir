module.exports = function(sequelize, DataTypes) {
	var ServiceProviderDocument = sequelize.define('ServiceProviderDocument', {
		driving_licence_pic : {
	        type : DataTypes.STRING,
			allowNull : true
	    },
		driving_licence_confirm : {
	        type : DataTypes.BOOLEAN,
			allowNull : true
	    },
		driving_licence_expiration_date : {
			type : DataTypes.STRING(10),
			allowNull : true
		},
		technical_diagnosis_pic : {
			type : DataTypes.STRING,
			allowNull : true
		},
		technical_diagnosis_confirm : {
			type : DataTypes.BOOLEAN,
			allowNull : true
		},
		technical_diagnosis_expiration_date : {
			type : DataTypes.STRING(10),
			allowNull : true
		},
		vehicle_card_front : {
			type : DataTypes.STRING,
			allowNull : true
		},
		vehicle_card_back : {
			type : DataTypes.STRING,
			allowNull : true
		},
		vehicle_card_confirm : {
			type : DataTypes.BOOLEAN,
			allowNull : true
		},
		clearances_pic : {
			type : DataTypes.STRING,
			allowNull : true
		},
		clearances_confirm : {
			type : DataTypes.BOOLEAN,
			allowNull : true
		},
		clearances_expiration_date : {
			type : DataTypes.STRING(10),
			allowNull : true
		},
		vehicle_ownership_document_pic : {
			type : DataTypes.STRING,
			allowNull : true
		},
		vehicle_ownership_document_confirm : {
			type : DataTypes.BOOLEAN,
			allowNull : true
		},
		vehicle_insurance_pic : {
			type : DataTypes.STRING,
			allowNull : true
		},
		vehicle_insurance_confirm : {
			type : DataTypes.BOOLEAN,
			allowNull : true
		},
		vehicle_insurance_expiration_date : {
			type : DataTypes.STRING(10),
			allowNull : true
		},
		user_pic : {
			type : DataTypes.STRING,
			allowNull : true
		},
		confirmed_at : {
			type : DataTypes.TEXT,
			allowNull : true
		},
  	}, {
	  	timestamps: true,
	  	freezeTableName: true,
	  	tableName: 'service_provider_documents',

    	classMethods: {
	        associate : function(models) {
		        
	        },
    	},

		instanceMethods: {

    	}
    }
  );
 
  return ServiceProviderDocument;
}