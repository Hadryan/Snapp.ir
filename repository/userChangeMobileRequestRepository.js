var lib = require('../include/lib');
//******************SEPARATE******************
var sendSms = function(mobile, activationCode) {
	return true;
};
//******************SEPARATE******************
var checkActivationCodeTime = function(params) {
	if(((Date.parse(params.generateTime)/1000)+(params.ttl*60))>(Date.parse(new Date())/1000)) {
		var timeRemain = (params.ttl*60*1000)-(Date.parse(new Date())-Date.parse(params.generateTime));
		return { Result: false, timeRemain: timeRemain };
	} else {
		return { Result: true };
	}
};
//******************SEPARATE******************
var activationCode = function(params) {
	var checkActivationCodeTimeResult = checkActivationCodeTime(params);
	if(checkActivationCodeTimeResult.Result){
		var ret = {
			success: true,
			activationCode: lib.randomstring.generate({charset: 'numeric', length: 4}),
			ttl: ttl(params.ttl)
		};
		return ret;
	} else {
		return { success: false, timeRemain:checkActivationCodeTimeResult.timeRemain};
	}
};
//******************SEPARATE******************
var ttl = function(ttl) {
	if(!ttl){ttl=0;}
	switch(ttl) {
		case 0:{ return 5; break; }
		case 5:{ return 10; break; }
		case 10:{ return 15; break; }
		case 15:{ return 30; break; }
		case 30:{ return 60; break; }
		case 60:{ return 120; break; }
		case 120:{ return 300; break; }
		case 300:{ return 600; break; }
		case 600:{ return 1440; break; }
		default:{ return 1440; break; }
	}
};
//******************SEPARATE******************
exports.saveRequest = function(params, callBack) {
	var repo = require('../include/repo');
	var repository = new repo();
	var validateParams = {"params": params, "requireParams": ['DeviceId', 'NewMobile', 'UserId']};
	repository.validate.validate(validateParams, function (validationResult) {
		if (validationResult.Result) {
			repository.user.checkUserId(params, function (result) {
				if (result.Result) {
					lib.dbConnection.UserChangeMobileRequest.find({where:{user_id: params.UserId}}).success(function (oldChangeMobileRequest) {
						if (oldChangeMobileRequest) {
							if (oldChangeMobileRequest.newMobile == params.NewMobile) {
								var activationCodeParams = {
									generateTime: oldChangeMobileRequest.generate_time,
									ttl: oldChangeMobileRequest.auth_ttl
								};
								var changeMobileRequest = oldChangeMobileRequest;
							} else {
								var activationCodeParams = {
									generateTime: result.data.generate_time,
									ttl: result.data.auth_ttl
								};
								oldChangeMobileRequest.destroy();
								var changeMobileRequest = lib.dbConnection.UserChangeMobileRequest.build();
							}
						} else {
							var activationCodeParams = {
								generateTime: result.data.generate_time,
								ttl: result.data.auth_ttl
							};
							var changeMobileRequest = lib.dbConnection.UserChangeMobileRequest.build();
						}
						var res = activationCode(activationCodeParams);
						if (res.success) {
							changeMobileRequest.user_id = params.UserId;
							changeMobileRequest.newMobile = params.NewMobile;
							changeMobileRequest.activation_code = res.activationCode;
							changeMobileRequest.generate_time = new Date();
							changeMobileRequest.auth_ttl = res.ttl;
							changeMobileRequest.save().success(function (newChangeMobileRequest) {
								lib.tools.sendSms(changeMobileRequest.newMobile,"کد فعالسازی شما: "+changeMobileRequest.activation_code,lib.config.production.sms,function(){
									callBack({Result: true, User: newChangeMobileRequest});
								});
							}).error(function (error) {
								console.log("an error accord: ", error);
								callBack(lib.errorCodes.setError('dbError'));
							});
						} else {
							var returnParams = lib.errorCodes.setError('activationCodeGeneratedBefore');
							returnParams.timeRemain = res.timeRemain;
							callBack(returnParams);
						}
					}).error(function (error) {
						console.log("an error accord: ", error);
						callBack(lib.errorCodes.setError('dbError'));
					});
				} else {
					callBack(result);
				}
			});
		} else {
			callBack(validationResult);
		}
	});
}
//******************SEPARATE******************
exports.initializeActivationCode = function(params, callBack) {
	var repo = require('../include/repo');
	var repository = new repo();
	var validateParams = {"params": params, "requireParams": ['DeviceId', 'NewMobile', 'UserId', 'ActivationCode']};
	repository.validate.validate(validateParams, function (validationResult) {
		if (validationResult.Result) {
			repository.user.checkUserId(params, function (result) {
				lib.dbConnection.UserChangeMobileRequest.find({
					where: {
						user_id: params.UserId,
						activation_code: params.ActivationCode
					}
				}).success(function (changeMobileRequest) {
					if (changeMobileRequest) {
						var activationCodeParams = {
							generateTime: changeMobileRequest.generate_time,
							ttl: changeMobileRequest.auth_ttl
						};
						re = checkActivationCodeTime(activationCodeParams);
						if (re.Result) {
							callBack(lib.errorCodes.setError('activationCodeExpire'));
						} else {
							lib.dbConnection.User.find({
								where: {id: params.UserId}
							}).success(function (User) {
								if (User) {
									User.updateAttributes({
										mobile: params.NewMobile,
										activation_code: null,
										generate_time: null,
										auth_ttl: 0,
									}, ['mobile', 'activation_code', 'generate_time', 'auth_ttl']).success(function (newUser) {
										lib.dbConnection.UserChangeMobileRequest.destroy({user_id: params.UserId});
										callBack({Result: true, User: newUser});
									}).error(function (error) {
										console.log("an error accord: ", error);
										callBack(lib.errorCodes.setError('dbError'));
									});
								}
							}).error(function (error) {
								console.log("an error accord: ", error);
								callBack(lib.errorCodes.setError('dbError'));
							});
						}
					} else {
						callBack(lib.errorCodes.setError('invalidAuthentication'));
					}
				}).error(function (error) {
					console.log("an error accord: ", error);
					callBack(lib.errorCodes.setError('dbError'));
				});
			});
		} else {
			callBack(validationResult);
		}
	});
}
//******************SEPARATE******************
exports.checkUserId = function(params, callBack) {
	var repo = require('../include/repo');
	var repository = new repo();
	lib.dbConnection.User.find({ where: { id: params.UserId } }).success(function (user) {
		if(user) {
			if ( repository.user.situation_id == 1 ) {
				if(params.checkCustomer){
					if(repository.user.user_type_id==2){
						callBack({Result: true});
					} else {
						callBack(lib.errorCodes.setError('notCustomerUser'));
					}
				} else {
					callBack({Result: true});
				}
			} else {
				callBack ( lib.errorCodes.setError( 'inactiveUser' ) );
			}
		} else {
			callBack ( lib.errorCodes.setError( 'invalidAuthentication' ) );
		}
	} ).error(function(error){
		console.log("an error accord: ",error);
		callBack ( lib.errorCodes.setError( 'dbError' ) );
	});
}