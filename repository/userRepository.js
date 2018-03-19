var lib = require('../include/lib');
//******************SEPARATE******************
var sendSms = function(mobile, activationCode) {
	console.log("mobile",mobile)
	console.log("activationCode",activationCode)
	lib.tools.sendSms(mobile,activationCode,lib.config.production.sms,function(){
		return true;
	});
};
//******************SEPARATE******************
var DiscountCode = function(userId) {
	return "HB-PR"+lib.randomstring.generate({charset: 'numeric', length:4})+userId;
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
		var newTtl = ttl(params.ttl);
		var ret = {
			success: true,
			activationCode: lib.randomstring.generate({charset: 'numeric', length: 4}),
			ttl: newTtl,
			timeRemain: newTtl*60*1000
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
exports.authentication = function(params, callBack) {
	var repo = require('../include/repo');
	var repository = new repo();
	var validateParams = {"params": params, "requireParams": ['DeviceId', 'Mobile', 'TypeId']};
	repository.validate.validate(validateParams, function (validationResult) {
		if (validationResult.Result) {
			lib.dbConnection.User.find({
				where: {
					mobile: params.Mobile,
					user_type_id: params.TypeId
				}
			}).success(function (user) {
				if (user) {
					if (user.situation_id == 1) {
						/* begin test mode for ios confirmation*/
						/*if(user.id==59){
						 var returnParams = {
						 UserId: user.id,
						 balance: user.balance,
						 TypeId: user.user_type_id,
						 LastOnline: Date.parse(user.last_online),
						 timeRemain: 1000000000
						 };
						 return callBack({Result: true, User: returnParams});
						 }*/
						/* end test mode for ios confirmation*/
						var activationCodeParams = {generateTime: user.generate_time, ttl: user.auth_ttl};
						var res = activationCode(activationCodeParams);
						if (res.success) {
							user.activation_code = res.activationCode;
							user.auth_ttl = res.ttl;
							user.generate_time = new Date();
							user.save().success(function (newUser) {
								lib.tools.sendSms(user.mobile,"کد فعالسازی شما: "+user.activation_code,lib.config.production.sms,function(){
									if(user.user_type_id==lib.Constants.setConstant("UserTypePassenger")) {
										lib.dbConnection.DiscountCode.find({where: {user_id: newUser.id}}).success(function (discountCode) {
											if(discountCode) {
												var returnParams = {
													DiscountCode: discountCode.id,
													UserId: newUser.id,
													balance: newUser.balance,
													TypeId: newUser.user_type_id,
													LastOnline: Date.parse(newUser.last_online),
													IsNewUser: false,
													timeRemain: res.timeRemain
												};
												callBack({Result: true, User: returnParams});
											}
										}).error(function (error) {
											console.log("an error accord: ", error);
											callBack(lib.errorCodes.setError('dbError'));
										});
									} else {
										var returnParams = {
											UserId: newUser.id,
											balance: newUser.balance,
											TypeId: newUser.user_type_id,
											LastOnline: Date.parse(newUser.last_online),
											timeRemain: res.timeRemain
										};
										callBack({Result: true, User: returnParams});
									}
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
					} else {
						callBack(lib.errorCodes.setError('inactiveUser'));
					}
				} else {
					if(params.TypeId == lib.Constants.setConstant("UserTypeDriver")){
						return callBack(lib.errorCodes.setError('DriverNotRegister'));
					} else {
						var activationCodeParams = {generateTime: new Date(), ttl: 0};
						var res = activationCode(activationCodeParams);
						if (res.success) {
							lib.dbConnection.User.create({
								mobile: params.Mobile,
								user_type_id: params.TypeId,
								balance: 0,
								activation_code: res.activationCode,
								generate_time: new Date(),
								auth_ttl: res.ttl,
								situation_id: 1,
							}).success(function (user) {
								user.reload().success(function (newUser) {
									lib.dbConnection.CustomerProfile.create({user_id: newUser.id}).success(function (profile) {
										lib.dbConnection.CustomerSetting.create({user_id: newUser.id}).success(function (setting) {
											lib.dbConnection.DiscountCode.create({
												user_id: newUser.id,
												discount_code: DiscountCode(newUser.id)
											}).success(function (discountCode) {
												lib.tools.sendSms(newUser.mobile,"کد فعالسازی شما: "+newUser.activation_code,lib.config.production.sms,function() {
													var returnParams = {
														DiscountCode: discountCode.discount_code,
														UserId: newUser.id,
														balance: newUser.balance,
														TypeId: newUser.user_type_id,
														LastOnline: Date.parse(newUser.last_online),
														IsNewUser: true
													};
													callBack({Result: true, User: returnParams});
												});
											}).error(function (error) {
												console.log("an error accord: ", error);
												setting.destroy();
												profile.destroy();
												newUser.destroy();
												callBack(lib.errorCodes.setError('dbError'));
											});
										}).error(function (error) {
											profile.destroy();
											newUser.destroy();
											console.log("an error accord: ", error);
											callBack(lib.errorCodes.setError('dbError'));
										});
									}).error(function (error) {
										newUser.destroy();
										console.log("an error accord: ", error);
										callBack(lib.errorCodes.setError('dbError'));
									});
								}).error(function (error) {
									console.log("an error accord: ", error);
									callBack(lib.errorCodes.setError('dbError'));
								})
							}).error(function (error) {
								console.log("an error accord: ", error);
								callBack(lib.errorCodes.setError('dbError'));
							});
						} else {
							var returnParams = lib.errorCodes.setError('activationCodeGeneratedBefore');
							returnParams.timeRemain = res.timeRemain;
							callBack(returnParams);
						}
					}
				}
			}).error(function (error) {
				console.log("an error accord: ", error);
				callBack(lib.errorCodes.setError('dbError'));
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
	var validateParams = {"params": params, "requireParams": ['DeviceId', 'Mobile', 'TypeId', 'ActivationCode']};
	repository.validate.validate(validateParams, function (validationResult) {
		if (validationResult.Result) {
			var userFindParams = {
				where: {
					mobile: params.Mobile,
					user_type_id: params.TypeId,
					activation_code: params.ActivationCode
				}
			};
			if(params.TypeId==lib.Constants.setConstant("UserTypePassenger")){
				userFindParams.include = [{
					model: lib.dbConnection.CustomerProfile,
					aatributes: ["full_name", "gender_id", "phone", "address", "birth_date"]
				}];
			}
			lib.dbConnection.User.find(userFindParams).success(function (user) {
				if (user) {
					if (user.situation_id == 1) {
						var activationCodeParams = {generateTime: user.generate_time, ttl: user.auth_ttl};
						var re = checkActivationCodeTime(activationCodeParams);
						if (re.Result) {
							callBack(lib.errorCodes.setError('activationCodeExpire'));
						} else {
							var userTokenSetUserIdParams = {DeviceId: params.DeviceId, userId: user.id};
							repository.userToken.setUserId(userTokenSetUserIdParams, function (result) {
								if (result.success) {
									/* begin test mode for ios confirmation*/
									if(user.id!=59){
										/* end test mode for ios confirmation*/
										user.activation_code = null;
										user.generate_time = null;
										user.auth_ttl = 0;
										/* begin test mode for ios confirmation*/
									}
									/* end test mode for ios confirmation*/
									user.save().success(function (newUser) {
										if(params.TypeId==lib.Constants.setConstant("UserTypePassenger")){
											lib.dbConnection.DiscountCode.find({where: {user_id: user.id}}).success(function (discountCode) {
												var returnParams = {};
												returnParams.discount_code = discountCode.discount_code;
												returnParams.UserId = user.id;
												returnParams.full_name = user.customerProfile.full_name;
												returnParams.email = user.email;
												returnParams.balance = user.balance;
												returnParams.mobile = user.mobile;
												returnParams.gender = user.customerProfile.gender_id;
												returnParams.phone = user.customerProfile.phone;
												returnParams.address = user.customerProfile.address;
												returnParams.birth_date = user.customerProfile.birth_date;
												returnParams.profileNotSet = user.customerProfile.gender_id?false:true;
												console.log('returnParams',returnParams);
												callBack({Result: true, User: returnParams});
											}).error(function (error) {
												callBack(lib.errorCodes.setError('dbError'));
											});
										} else {
											callBack({Result: true, User: newUser});
										}
									}).error(function (error) {
										callBack(lib.errorCodes.setError('dbError'));
									});
								} else {
									callBack(lib.errorCodes.setError('dbError'));
								}
							});
						}
					} else {
						callBack(lib.errorCodes.setError('inactiveUser'));
					}
				} else {
					callBack(lib.errorCodes.setError('invalidAuthentication'));
				}
			}).error(function (error) {
				console.log("an error accord: ", error);
				callBack(lib.errorCodes.setError('dbError'));
			});
		} else {
			callBack(validationResult);
		}
	});
}
//******************SEPARATE******************
exports.checkUserId = function(params, callBack) {
	var findParams = {where: {id: params.UserId}};
	if(params.include) {
		findParams.include = params.include;
	}
	if(params.attributes) {
		findParams.attributes = params.attributes;
	}
	lib.dbConnection.User.find(findParams).success(function (user) {
		if(user) {
			if ( user.situation_id == 1 || params.activationNotRequire ) {
				if(params.checkCustomer){
					if(user.user_type_id==2){
						callBack({Result: true, data:user});
					} else {
						callBack(lib.errorCodes.setError('notCustomerUser'));
					}
				} else {
					if(params.checkServiceProvider) {
						if(user.user_type_id==1){
							callBack({Result: true, data:user});
						} else {
							callBack(lib.errorCodes.setError('notServiceProviderUser'));
						}
					} else {
						callBack({Result: true, data: user});
					}
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
//******************SEPARATE******************
exports.updateDriverCurrentSituation = function(params, callBack) {
	var repo = require('../include/repo');
	var repository = new repo();
	lib.dbConnection.ServiceProviderProfile.update({
		current_situation_id:params.SituationId
	},{
		user_id:params.DriverId
	}).success(function (profile) {
		lib.dbConnection.OnlineDriver.update({
			current_situation_id: params.SituationId
		}, {
			driverId: params.DriverId
		}).success(function (onlineDriver) {
			if (params.SituationId == lib.Constants.setConstant("serviceProviderCurrentSituationOnline")) {
				lib.dbConnection.User.update({
					last_online: new Date()
				}, {
					id: params.DriverId
				}).success(function (user) {
					callBack({Result: true, Data: [profile]});
				}).error(function (error) {
					var tLParams = {};
					tLParams.userId = params.DriverId;
					tLParams.tripId = null;
					tLParams.newSituation = null;
					tLParams.description = "Driver UPCSParams make driver online error,error was: "+JSON.stringify(error);
					repository.user.setTripLog(tLParams,function(tLResult) {});
					console.log("an error accord: ", error);
					callBack(lib.errorCodes.setError('dbError'));
				});
			} else {
				callBack({Result: true, Data: [profile]});
			}
		}).error(function (error) {
			var tLParams = {};
			tLParams.userId = params.DriverId;
			tLParams.tripId = null;
			tLParams.newSituation = null;
			tLParams.description = "Driver UPCSParams online driver update error,error was: "+JSON.stringify(error);
			repository.user.setTripLog(tLParams,function(tLResult) {});
			console.log("an error accord: ", error);
			callBack(lib.errorCodes.setError('dbError'));
		});
	}).error(function(error){
		var tLParams = {};
		tLParams.userId = params.DriverId;
		tLParams.tripId = null;
		tLParams.newSituation = null;
		tLParams.description = "Driver UPCSParams profile update error,error was: "+JSON.stringify(error);
		repository.user.setTripLog(tLParams,function(tLResult) {});
		console.log("an error accord: ",error);
		callBack ( lib.errorCodes.setError( 'dbError' ) );
	});
}
//******************SEPARATE******************
exports.updatePassengerCurrentSituation = function(params, callBack) {
	lib.dbConnection.CustomerProfile.find({where:{user_id:params.PassengerId}}).success(function (profile) {
		if(profile) {
			profile.current_situation_id = params.SituationId;
			profile.save().success(function (newProfile) {
				if(params.SituationId==lib.Constants.setConstant("customerCurrentSituationDetermineSourceAndDestination")){
					lib.dbConnection.User.update({
						last_online:new Date()
					},{
						id:params.PassengerId
					}).success(function (user) {
						callBack({Result:true,Data: [newProfile]});
					}).error(function(error){
						console.log("an error accord: ",error);
						callBack ( lib.errorCodes.setError( 'dbError' ) );
					});
				} else {
					callBack({Result:true,Data: [newProfile]});
				}
			}).error(function(error){
				console.log("an error accord: ",error);
				callBack ( lib.errorCodes.setError( 'dbError' ) );
			});
		} else {
			callBack ( lib.errorCodes.setError( 'invalidAuthentication' ) );
		}
	}).error(function(error){
		console.log("an error accord: ",error);
		callBack ( lib.errorCodes.setError( 'dbError' ) );
	});
}
//******************SEPARATE******************
exports.setTripLog = function(params, callBack) {
	/*console.log("");
	 console.log('set trip log params: ',params);
	 console.log("");*/
	var tripLog = lib.dbConnection.tripLogs.build();
	tripLog.new_situation = params.newSituation;
	tripLog.user_id = params.userId;
	tripLog.trip_id = params.tripId;
	tripLog.description = params.description;
	tripLog.date = new Date();
	tripLog.save().success(function (tripLog) {
		callBack({Result:true});
	}).error(function(error){
		console.log("an error accord: ",error);
		callBack ( lib.errorCodes.setError( 'dbError' ) );
	});
}
//******************SEPARATE******************
exports.disconnectUserSocket = function(params, callBack) {
	console.log("");
	console.log('disconnect user socket: ',params);
	console.log("");
	lib.dbConnection.User.find({where:{id:params.userId}}).success(function (user) {
		if(user.user_type_id==lib.Constants.setConstant("UserTypeDriver")){
			lib.dbConnection.ServiceProviderProfile.find({where:{user_id:params.userId}}).success(function (driverProfile) {
				if(driverProfile.current_situation_id<lib.Constants.setConstant("serviceProviderCurrentSituationOnPassengerWay")){
					driverProfile.current_situation_id = lib.Constants.setConstant("serviceProviderCurrentSituationOffline");
					driverProfile.save({fields:["current_situation_id"]}).success(function (newDriverProfile) {
						lib.dbConnection.OnlineDriver.find({where: {driverId: params.userId}}).success(function (onlineDriver) {
							onlineDriver.current_situation_id = lib.Constants.setConstant("serviceProviderCurrentSituationOffline");
							onlineDriver.save({fields:["current_situation_id"]}).success(function (newOnlineDriver) {
								callBack({Result: true});
							}).error(function (error) {
								console.log("an error accord: ", error);
								callBack(lib.errorCodes.setError('dbError'));
							});
						}).error(function (error) {
							console.log("an error accord: ", error);
							callBack(lib.errorCodes.setError('dbError'));
						});
					}).error(function (error) {
						console.log("an error accord: ", error);
						callBack(lib.errorCodes.setError('dbError'));
					});
				} else {
					lib.dbConnection.OnlineDriver.find({where: {driverId: params.userId}}).success(function (onlineDriver) {
						if(onlineDriver.current_situation_id<lib.Constants.setConstant("serviceProviderCurrentSituationOnPassengerWay")) {
							onlineDriver.current_situation_id = lib.Constants.setConstant("serviceProviderCurrentSituationOffline");
							onlineDriver.save({fields: ["current_situation_id"]}).success(function (newOnlineDriver) {
								driverProfile.current_situation_id = lib.Constants.setConstant("serviceProviderCurrentSituationOffline");
								driverProfile.save({fields:["current_situation_id"]}).success(function (newDriverProfile) {
									callBack({Result: true});
								}).error(function (error) {
									console.log("an error accord: ", error);
									callBack(lib.errorCodes.setError('dbError'));
								});
							}).error(function (error) {
								console.log("an error accord: ", error);
								callBack(lib.errorCodes.setError('dbError'));
							});
						} else {
							callBack({Result: false});
						}
					}).error(function (error) {
						console.log("an error accord: ", error);
						callBack(lib.errorCodes.setError('dbError'));
					});
				}
			}).error(function(error){
				console.log("an error accord: ",error);
				callBack ( lib.errorCodes.setError( 'dbError' ) );
			});
		} else if(user.user_type_id==lib.Constants.setConstant("UserTypePassenger")){
			lib.dbConnection.CustomerProfile.find({where:{user_id:params.userId}}).success(function (passengerProfile) {
				if(passengerProfile.current_situation_id<lib.Constants.setConstant("customerCurrentSituationWaitingToFindDriver")) {
					passengerProfile.current_situation_id = lib.Constants.setConstant("customerCurrentSituationOffline");
					passengerProfile.save({fields: ["current_situation_id"]}).success(function (newPassengerProfile) {
						callBack({Result: true});
					}).error(function (error) {
						console.log("an error accord: ", error);
						callBack(lib.errorCodes.setError('dbError'));
					});
				} else {
					callBack({Result: false});
				}
			}).error(function (error) {
				console.log("an error accord: ", error);
				callBack(lib.errorCodes.setError('dbError'));
			});
		}
	}).error(function(error){
		console.log("an error accord: ",error);
		callBack ( lib.errorCodes.setError( 'dbError' ) );
	});
}
//******************SEPARATE******************
exports.getUserSituation = function(params, callBack) {
	var repo = require('../include/repo');
	var repository = new repo();
	var validateParams = {"params": params, "requireParams": ['DeviceId', 'UserId', 'TypeId']};
	repository.validate.validate(validateParams, function (validationResult) {
		if (validationResult.Result) {
			var userParams = params;
			if(params.TypeId==lib.Constants.setConstant("UserTypeDriver")){
				userParams.checkServiceProvider = true;
				userParams.include = [{
					model: lib.dbConnection.ServiceProviderProfile,
					attributes: ["current_situation_id"]
				}];
			} else if(params.TypeId==lib.Constants.setConstant("UserTypePassenger")){
				userParams.checkCustomer = true;
				userParams.include = [{
					model: lib.dbConnection.CustomerProfile,
					attributes: ["current_situation_id", "gender_id"]
				}];
			}
			repository.user.checkUserId(userParams, function (user) {
				if (user.Result) {
					if(params.TypeId==lib.Constants.setConstant("UserTypeDriver")){
						var returnParams = user.data.serviceProviderProfile;
						if(returnParams.current_situation_id==lib.Constants.setConstant("serviceProviderCurrentSituationHasRequest")){
							returnParams.current_situation_id=lib.Constants.setConstant("serviceProviderCurrentSituationOnline");
						}
					} else if(params.TypeId==lib.Constants.setConstant("UserTypePassenger")){
						var returnParams = user.data.customerProfile;
						if(!user.data.customerProfile.gender_id) {
							returnParams.current_situation_id=lib.Constants.setConstant("customerNotFillHisProfile");
						} else if(returnParams.current_situation_id==lib.Constants.setConstant("customerCurrentSituationWaitingToFindDriver")){
							returnParams.current_situation_id=lib.Constants.setConstant("customerCurrentSituationDetermineSourceAndDestination");
						}
						
					}
					callBack({Result: true, data: [returnParams]});
				} else {
					callBack(user);
				}
			});
		} else {
			callBack(validationResult);
		}
	});
}
//******************SEPARATE******************
exports.updateUsersTripInfo = function(trip, callBack) {
	var repo = require('../include/repo');
	var repository = new repo();
	lib.dbConnection.TripDestination.sum('trip_time',{where:{trip_id:trip.id}}).success(function (time) {
		lib.dbConnection.TripDestination.sum('trip_distance',{where:{trip_id:trip.id}}).success(function (distance) {
			lib.dbConnection.CustomerProfile.find({where:{user_id:trip.passenger_user_id}}).success(function (passenger) {
				passenger.sum_trip_times += time;
				passenger.sum_trip_distances += distance;
				passenger.save({fields:["sum_trip_times","sum_trip_distances"]}).success(function (newPassenger) {
					lib.dbConnection.ServiceProviderProfile.find({where:{user_id:trip.driver_user_id}}).success(function (driver) {
						driver.sum_trip_times += time;
						driver.sum_trip_distances += distance;
						driver.save({fields:["sum_trip_times","sum_trip_distances"]}).success(function (newDriver) {
							callBack({Result:true});
						}).error(function (error) {
							console.log("an error accord: ", error);
							callBack(lib.errorCodes.setError('dbError'));
						});
					}).error(function (error) {
						console.log("an error accord: ", error);
						callBack(lib.errorCodes.setError('dbError'));
					});
				}).error(function (error) {
					console.log("an error accord: ", error);
					callBack(lib.errorCodes.setError('dbError'));
				});
			}).error(function (error) {
				console.log("an error accord: ", error);
				callBack(lib.errorCodes.setError('dbError'));
			});
		}).error(function (error) {
			console.log("an error accord: ", error);
			callBack(lib.errorCodes.setError('dbError'));
		});
	}).error(function (error) {
		console.log("an error accord: ", error);
		callBack(lib.errorCodes.setError('dbError'));
	});
}
//******************SEPARATE******************
exports.disableDebtorDriver = function(driverId) {
	var repo = require('../include/repo');
	var repository = new repo();
	lib.dbConnection.User.update({
		situation_id: lib.Constants.setConstant("UserSituationDeActive")
	},{
		id: driverId
	}).error(function (error) {
		console.log("an error accord: ", error);
		callBack(lib.errorCodes.setError('dbError'));
	});
}