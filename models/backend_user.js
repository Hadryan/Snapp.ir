var soap = require('soap');
var tools = require('../include/tools');

module.exports = function(sequelize, DataTypes) {
  var BackendUser = sequelize.define('BackendUser', 
  	{
	    fullname: { type : DataTypes.STRING, allowNull : false },
	    username: { type : DataTypes.STRING, allowNull : false, unique : true },
	    img: { type : DataTypes.STRING, defaultValue : 'default.jpg' },
	    email: { type : DataTypes.STRING, allowNull : false, unique : true },
	    password: { type : DataTypes.STRING, allowNull : false },
	    gender : { type : DataTypes.ENUM('Shemale','Female','Unknown','Male'), defaultValue : 'Male', allowNull : false },
	    mobileNumber: { type : DataTypes.STRING, allowNull : false, unique : true },
	    status: { type : DataTypes.ENUM('Active','Inactive'), defaultValue : 'Active', allowNull : false }
  	}, 
  	{
	  	timestamps: true,
	  	freezeTableName: true,
	  	tableName: 'backend_users',

    	classMethods: {
	        associate : function(models) {
	        },    
    	},

		instanceMethods: {
			login : function(namespace, sessionId, cb) {
				tools.loginUser(namespace, sessionId, JSON.stringify(this.values), function( result ){
			  		cb(result);
				});
			},

		    forgotPassword : function(smsConfig, cb) {
				smsContent = "کاربر گرامی, کلمه عبور شما " + tools.decode(this.password) + " می باشد.";
				smsMobileNumber = '98' + this.mobileNumber.substring(1);
		    	tools.sendSms(smsMobileNumber, smsContent, smsConfig, cb());
		    }
    	}
    }
  );
 
  return BackendUser;
}