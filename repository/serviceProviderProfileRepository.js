var lib = require('../include/lib');
//******************SEPARATE******************
var driverMonthEarnings = function(params, callBack) {
	var chainer = new lib.Sequelize.Utils.QueryChainer;
	var returnParams = [];
	var i=params.offset;
	for(var j=0;j<params.limit;i++,j++){
		returnParams[j] = {};
		var start = lib.firstDayOfMonth(i);
		var end = lib.lastDayOfMonth(i);
		returnParams[j].monthName = end.monthName;
		chainer.add(lib.dbConnection.Trip.sum('driver_slice',{
			where: {
				driver_user_id: params.userId,
				start_time: { between: [start.gregorianDate+' 00:00:00', end.gregorianDate+' 23:59:59'] }
			},
		}));
	}
	chainer.run().success(function (info) {
		for(var i=0;i<params.limit;i++){
			returnParams[i].amount = info[i];
		}
	   callBack({Result: true, data: returnParams});
	}).error(function(error){
	   console.log("an error accord: ",error);
	   callBack ( lib.errorCodes.setError( 'dbError' ) );
	});
};
//******************SEPARATE******************
var driverDayTripInfo = function(params, callBack){
	var chainer = new lib.Sequelize.Utils.QueryChainer;
	var returnParams = [];
	var i=params.offset;
	for(var j=0;j<params.limit;i++,j++){
		returnParams[j] = {};
		var date = lib.dayBeforeDate(i);
		returnParams[j].date = date.millisecond;
		var startDate = date.date+' 00:00:00';
		var endDate = date.date+' 23:59:59';
		chainer.add(lib.dbConnection.Trip.count({
			where: {
				driver_user_id: params.userId,
				start_time: { between: [startDate, endDate] }
			},
		}));
		chainer.add(lib.dbConnection.Trip.sum('driver_slice', {
			where: {
				driver_user_id: params.userId,
				start_time: { between: [startDate, endDate] }
			},
		}));
		chainer.add(lib.dbConnection.sequelize.query(
			"SELECT sum(trip.driver_slice) as sum " +
			"FROM payments inner join trip on trip.payment_id=payments.id " +
			"AND trip.driver_user_id=" + params.userId +" "+
			"AND trip.start_time " +
			"between '"+ startDate +"' AND '"+ endDate +"' " +
			"WHERE payments.payment_method_id=1"
		));
		chainer.add(lib.dbConnection.sequelize.query(
			"SELECT sum(trip.driver_slice) as sum " +
			"FROM payments inner join trip on trip.payment_id=payments.id " +
			"AND trip.driver_user_id=" + params.userId +" "+
			"AND trip.start_time " +
			"between '"+ startDate +"' AND '"+ endDate +"' " +
			"WHERE payments.payment_method_id=3"
		));
	}
	chainer.run().success(function (info) {
		for(var i=0,j=0;i<params.limit;i++){
			returnParams[i].tripCount = info[j]?info[j]:0;
			j++;
			returnParams[i].sumDriverEarnings = info[j]?info[j]:0;
			j++;
			returnParams[i].cashDriverEarnings = info[j][0].sum?info[j][0].sum:0;
			j++;
			returnParams[i].onlineDriverEarnings = info[j][0].sum?info[j][0].sum:0;
			j++;
		}
		callBack({Result: true, data: returnParams});
	}).error(function(error){
		console.log("an error accord: ",error);
		callBack ( lib.errorCodes.setError( 'dbError' ) );
	});
}
//******************SEPARATE******************
exports.registerDriver = function(params, callBack) {
	var repo = require('../include/repo');
	var repository = new repo();
	var validateParams = {"params": params, "requireParams": ['DeviceId', 'Mobile', 'GenderId', 'FirstName', 'LastName', 'StateId', 'CityId', 'NationalCode']};
	repository.validate.validate(validateParams, function (validationResult) {
		if (validationResult.Result) {
			repository.userGender.checkGenderId(params.GenderId, function (res) {
				if (res.Result) {
					repository.state.checkStateId(params.StateId, function (res2) {
						if (res2.Result) {
							repository.city.checkCityId(params.CityId, function (res3) {
								if (res3.Result) {
									lib.dbConnection.User.find({
										where: {
											mobile: params.Mobile,
											user_type_id: 1
										}
									}).success(function(driver){
										if(driver) {
											if(driver.situation_id == lib.Constants.setConstant("UserSituationOnProgress")) {
												lib.dbConnection.ServiceProviderProfile.find({
													where: {user_id: driver.id},
												}).success(function (profile) {
													driver.email = params.Email;
													driver.save({fields: ["email"]}).success(function (driverProfile) {
														profile.gender_id = params.GenderId;
														profile.first_name = params.FirstName;
														profile.last_name = params.LastName;
														profile.state_id = params.StateId;
														profile.city_id = params.CityId;
														profile.national_code = params.NationalCode;
														profile.bank_atm_number = params.BankAtmNumber;
														profile.bank_shaba_number = params.BankShabaNumber;
														if(params.RepresenterCode){
															profile.representer_code = params.RepresenterCode;
														}
														profile.save().success(function (driverProfile) {
															driverProfile.email = params.Email;
															callBack({Result: true, data: driverProfile});
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
											} else if(driver.situation_id == lib.Constants.setConstant("UserSituationNotAccept")) {
												callBack(lib.errorCodes.setError('driverCanNotEditHisProfileInfo'));
											} else if(driver.situation_id == lib.Constants.setConstant("UserSituationVisit")) {
												callBack(lib.errorCodes.setError('setVisitDateForDriver'));
											} else if(driver.situation_id == lib.Constants.setConstant("UserSituationActive")) {
												callBack(lib.errorCodes.setError('driverProfileConfirmedAndHeCanLogin'));
											}
										} else {
											lib.dbConnection.User.create({
												email: params.Email,
												mobile: params.Mobile,
												balance: 0,
												user_type_id: 1,
												situation_id: 3
											}).success(function(driver) {
												lib.dbConnection.ServiceProviderDocument.create().success(function (document) {
													lib.dbConnection.ServiceProviderSpecialInfo.create().success(function (specialInfo) {
														var ServiceProviderProfileInsertFields = {
															user_id: driver.id,
															gender_id: params.GenderId,
															first_name: params.FirstName,
															last_name: params.LastName,
															state_id: params.StateId,
															city_id: params.CityId,
															national_code: params.NationalCode,
															bank_atm_number: params.BankAtmNumber,
															bank_shaba_number: params.BankShabaNumber,
															special_info_id: specialInfo.id,
															documents_id: document.id
														};
														if(params.RepresenterCode){
															ServiceProviderProfileInsertFields.representer_code = params.RepresenterCode;
														}
														lib.dbConnection.ServiceProviderProfile.create(ServiceProviderProfileInsertFields).success(function (driverProfile) {
															driverProfile.email = params.Email;
															callBack({Result: true, data: driverProfile});
														}).error(function (error) {
															driver.destroy();
															document.destroy();
															specialInfo.destroy();
															console.log("an error accord: ", error);
															callBack(lib.errorCodes.setError('dbError'));
														});
													}).error(function (error) {
														document.destroy();
														driver.destroy();
														console.log("an error accord: ", error);
														callBack(lib.errorCodes.setError('dbError'));
													});
												}).error(function (error) {
													driver.destroy();
													console.log("an error accord: ", error);
													callBack(lib.errorCodes.setError('dbError'));
												});
											}).error(function (error) {
												console.log("an error accord: ", error);
												callBack(lib.errorCodes.setError('dbError'));
											});
										}
									}).error(function (error) {
										console.log("an error accord: ", error);
										callBack(lib.errorCodes.setError('dbError'));
									});
								} else {
									callBack(lib.errorCodes.setError('inputsNotValid'));
								}
							});
						} else {
							callBack(lib.errorCodes.setError('inputsNotValid'));
						}
					});
				} else {
					callBack(lib.errorCodes.setError('inputsNotValid'));
				}
			});
		} else {
			callBack(validationResult);
		}
	});
}
//******************SEPARATE******************
exports.setVisibility = function(params, callBack) {
	var repo = require('../include/repo');
	var repository = new repo();
	var validateParams = {"params": params, "requireParams": ['DeviceId', 'UserId', 'VisibilityId']};
	repository.validate.validate(validateParams, function (validationResult) {
		if (validationResult.Result) {
			params.checkServiceProvider = true;
			repository.user.checkUserId(params, function (result) {
				if (result.Result) {
					lib.dbConnection.ServiceProviderProfile.find({
						where: {user_id: params.UserId}
					}).success(function (profile) {
						if (profile) {
							repository.ServiceProviderCurrentSituation.checkServiceProviderCurrentSituationId(params.VisibilityId, function (res) {
								if (res.Result) {
									profile.current_situation_id = params.VisibilityId;
									profile.save({fields: ['current_situation_id']}).success(function (newProfile) {
										callBack({Result: true, data: newProfile});
									}).error(function (error) {
										console.log("an error accord: ", error);
										callBack(lib.errorCodes.setError('dbError'));
									});
								} else {
									callBack(lib.errorCodes.setError('inputsNotValid'));
								}
							});
						} else {
							callBack(lib.errorCodes.setError('invalidAuthentication'));
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
exports.bankInfoUpdate = function(params, callBack) {
	var repo = require('../include/repo');
	var repository = new repo();
	var validateParams = {"params": params, "requireParams": ['DeviceId', 'UserId']};
	repository.validate.validate(validateParams, function (validationResult) {
		if (validationResult.Result) {
			params.checkServiceProvider = true;
			repository.user.checkUserId(params, function (result) {
				if (result.Result) {
					if((!params.BankAtmNumber) && (!params.BankShabaNumber)){
						callBack(null, lib.errorCodes.setError("emptyParams"));
					} else {
						lib.dbConnection.ServiceProviderProfile.find({
							where: {user_id: params.UserId}
						}).success(function (profile) {
							if (profile) {
								if (params.BankAtmNumber) {
									profile.bank_atm_number = params.BankAtmNumber;
								}
								if (params.BankShabaNumber) {
									profile.bank_shaba_number = params.BankShabaNumber;
								}
								profile.save({fields: ['bank_atm_number', 'bank_shaba_number']}).success(function (newProfile) {
									callBack({Result: true, data: newProfile});
								}).error(function (error) {
									console.log("an error accord: ", error);
									callBack(lib.errorCodes.setError('dbError'));
								});
							} else {
								callBack(lib.errorCodes.setError('invalidAuthentication'));
							}
						}).error(function (error) {
							console.log("an error accord: ", error);
							callBack(lib.errorCodes.setError('dbError'));
						});
					}
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
exports.mainPageInfo = function(params, callBack) {
	var repo = require('../include/repo');
	var repository = new repo();
	var validateParams = {"params": params, "requireParams": ['DeviceId', 'UserId']};
	repository.validate.validate(validateParams, function (validationResult) {
		if (validationResult.Result) {
			params.checkServiceProvider = true;
			repository.user.checkUserId(params, function (result) {
				if (result.Result) {
					lib.dbConnection.ServiceProviderProfile.find({
						where: {user_id: params.UserId},
						attributes: ['first_name', 'last_name', 'sum_rate', 'rate_count'],
						include: [{
							model: lib.dbConnection.ServiceProviderSpecialInfo,
							attributes: ["vehicle_brand_id", "vehicle_model_id", "vehicle_color"],
							include: [{
								model: lib.dbConnection.VehicleBrand,
								attributes: ["name"],
							}, {
								model: lib.dbConnection.VehicleModel,
								attributes: ["name"],
							}]
						}, {
							model: lib.dbConnection.ServiceProviderDocument,
							attributes: ["user_pic"],
						}],
					}).success(function (profile) {
						if (profile) {
							var returnParams = {};
							returnParams.balance = result.data.balance;
							returnParams.lastOnline = new Date(result.data.last_online).getTime();
							returnParams.vehicle = profile.serviceProviderSpecialInfo.vehicleBrand.name + ' ' + profile.serviceProviderSpecialInfo.vehicleModel.name + ' ' + profile.serviceProviderSpecialInfo.vehicle_color;
							returnParams.name = profile.first_name + ' ' + profile.last_name;
							if(profile.serviceProviderDocument.user_pic) {
								returnParams.pic = "http://" + lib.config.production.host.domain + ":" + lib.config.production.host.port + "/" + profile.serviceProviderDocument.user_pic;
							} else {
								returnParams.pic = "http://" + lib.config.production.host.domain + ":" + lib.config.production.host.port + "/uploads/default.jpg";
							}
							returnParams.rate = profile.rate_count?(Math.floor((parseInt(profile.sum_rate)/parseInt(profile.rate_count))*100)/100):0;
							callBack({Result: true, data: returnParams});
						} else {
							callBack(lib.errorCodes.setError('invalidAuthentication'));
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
exports.profileInfo = function(params, callBack) {
	var repo = require('../include/repo');
	var repository = new repo();
	var validateParams = {"params": params, "requireParams": ['DeviceId', 'UserId']};
	repository.validate.validate(validateParams, function (validationResult) {
		if (validationResult.Result) {
			params.checkServiceProvider = true;
			repository.user.checkUserId(params, function (result) {
				if (result.Result) {
					lib.dbConnection.ServiceProviderProfile.find({
						where: {user_id: params.UserId},
						attributes: ['special_code', 'first_name', 'last_name', 'national_code', 'bank_atm_number', 'bank_shaba_number', 'sum_rate', 'rate_count'],
						include: [{
							model: lib.dbConnection.ServiceProviderSpecialInfo,
							attributes: ["vehicle_brand_id", "vehicle_model_id", "vehicle_color", "vehicle_plaque_left", "vehicle_plaque_alphabet", "vehicle_plaque_right", "vehicle_plaque_iran"],
							include: [{
								model: lib.dbConnection.VehicleBrand,
								attributes: ["name"],
							}, {
								model: lib.dbConnection.VehicleModel,
								attributes: ["name"],
							}]
						}, {
							model: lib.dbConnection.City,
							attributes: ["name"],
						}, {
							model: lib.dbConnection.State,
							attributes: ["name"],
						}, {
							model: lib.dbConnection.User,
							attributes: ["mobile", "balance"],
						}, {
							model: lib.dbConnection.ServiceProviderDocument,
							attributes: ["driving_licence_pic", "technical_diagnosis_pic", "vehicle_card_front", "vehicle_card_back", "clearances_pic", "vehicle_ownership_document_pic", "vehicle_insurance_pic", "user_pic"],
						}],
					}).success(function (profile) {
						if (profile) {
							// callBack({Result: true , data: profile});
							var returnParams = {};
							returnParams.specialCode = profile.special_code;
							returnParams.firstName = profile.first_name;
							returnParams.lastName = profile.last_name;
							returnParams.nationalCode = profile.national_code;
							returnParams.bankAtmNumber = profile.bank_atm_number;
							returnParams.bankShabaNumber = profile.bank_shaba_number;
							returnParams.vehicle = profile.serviceProviderSpecialInfo.vehicleBrand.name + ' ' + profile.serviceProviderSpecialInfo.vehicleModel.name + ' ' + profile.serviceProviderSpecialInfo.vehicle_color;
							returnParams.plaqueLeft = profile.serviceProviderSpecialInfo.vehicle_plaque_left;
							returnParams.plaqueAlphabet = profile.serviceProviderSpecialInfo.vehicle_plaque_alphabet;
							returnParams.plaqueRight = profile.serviceProviderSpecialInfo.vehicle_plaque_right;
							returnParams.plaqueIran = profile.serviceProviderSpecialInfo.vehicle_plaque_iran;
							returnParams.city = profile.city.name;
							returnParams.state = profile.state.name;
							returnParams.mobile = profile.user.mobile;
							returnParams.balance = profile.user.balance;
							returnParams.rate = profile.rate_count?(Math.floor((parseInt(profile.sum_rate)/parseInt(profile.rate_count))*100)/100):0;
							var urlPrefix = "http://"+lib.config.production.host.domain+":"+lib.config.production.host.port+"/";
							returnParams.drivingLicencePic = urlPrefix + profile.serviceProviderDocument.driving_licence_pic;
							returnParams.technicalDiagnosispic = urlPrefix + profile.serviceProviderDocument.technical_diagnosis_pic;
							returnParams.vehicleCardFront = urlPrefix + profile.serviceProviderDocument.vehicle_card_front;
							returnParams.vehicleCardBack = urlPrefix + profile.serviceProviderDocument.vehicle_card_back;
							returnParams.clearancesPic = urlPrefix + profile.serviceProviderDocument.clearances_pic;
							returnParams.vehicleOwnershipDocumentPic = urlPrefix + profile.serviceProviderDocument.vehicle_ownership_document_pic;
							returnParams.vehicleInsurancePic = urlPrefix + profile.serviceProviderDocument.vehicle_insurance_pic;
							// returnParams.userPic = urlPrefix + profile.serviceProviderDocument.user_pic;
							if(profile.serviceProviderDocument.user_pic) {
								returnParams.userPic = urlPrefix + profile.serviceProviderDocument.user_pic;
							} else {
								returnParams.userPic = urlPrefix + "/uploads/default.jpg";
							}
							
							callBack({Result: true, data: returnParams});
						} else {
							callBack(lib.errorCodes.setError('invalidAuthentication'));
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
exports.myHooberInfo = function(params, callBack) {
	var repo = require('../include/repo');
	var repository = new repo();
	var validateParams = {"params": params, "requireParams": ['DeviceId', 'UserId']};
	repository.validate.validate(validateParams, function (validationResult) {
		if (validationResult.Result) {
			params.checkServiceProvider = true;
			repository.user.checkUserId(params, function (result) {
				if (result.Result) {
					lib.dbConnection.ServiceProviderProfile.find({
						where: {user_id: params.UserId},
						attributes: ['deposit_amount'],
						include: [{
							model: lib.dbConnection.User,
							attributes: ["balance"],
						}],
					}).success(function (profile) {
						if (profile) {
							lib.dbConnection.PaymentPony.find({
								where: {user_id: params.UserId},
								attributes: ['createdAt'],
								order: 'createdAt DESC',
							}).success(function (pony) {
								driverMonthEarnings({
									userId: params.UserId,
									limit: 5,
									offset: 0
								}, function (monthlyEarnings) {
									if (monthlyEarnings.Result) {
										driverDayTripInfo({
											userId: params.UserId,
											limit: 5,
											offset: 0
										}, function (dailyData) {
											if (dailyData.Result) {
												var returnData = {
													lastPonyDate: (pony ? Date.parse(pony.createdAt) : null),
													balance: profile.user.balance,
													depositAmount: profile.deposit_amount,
													monthlyEarnings: monthlyEarnings.data,
													dailyData: dailyData.data
												};
												callBack({Result: true, data: returnData});
											} else {
												callBack(result);
											}
										});
									} else {
										callBack(result);
									}
								});
							}).error(function (error) {
								console.log("an error accord: ", error);
								callBack(lib.errorCodes.setError('dbError'));
							});
						} else {
							callBack(lib.errorCodes.setError('invalidAuthentication'));
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
exports.dailyTripsInfo = function(params, callBack) {
	var repo = require('../include/repo');
	var repository = new repo();
	var validateParams = {"params": params, "requireParams": ['DeviceId', 'UserId', 'Limit']};
	repository.validate.validate(validateParams, function (validationResult) {
		if (validationResult.Result) {
			params.checkServiceProvider = true;
			repository.user.checkUserId(params, function (result) {
				if (result.Result) {
					driverDayTripInfo({
						userId: params.UserId,
						limit: params.Limit,
						offset: (params.Offset ? params.Offset : 0)
					}, function (dailyData) {
						if (dailyData.Result) {
							callBack({Result: true, data: dailyData.data});
						} else {
							callBack(result);
						}
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
exports.monthlyTripsInfo = function(params, callBack) {
	var repo = require('../include/repo');
	var repository = new repo();
	var validateParams = {"params": params, "requireParams": ['DeviceId', 'UserId', 'Limit']};
	repository.validate.validate(validateParams, function (validationResult) {
		if (validationResult.Result) {
			params.checkServiceProvider = true;
			repository.user.checkUserId(params, function (result) {
				if (result.Result) {
					driverMonthEarnings({
						userId: params.UserId,
						limit: params.Limit,
						offset: (params.Offset ? params.Offset : 0)
					}, function (monthlyEarnings) {
						if (monthlyEarnings.Result) {
							callBack({Result: true, data: monthlyEarnings.data});
						} else {
							callBack(result);
						}
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