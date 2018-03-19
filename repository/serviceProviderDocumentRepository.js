var lib = require('../include/lib');
//******************SEPARATE******************
exports.updateDrivingLicenceInfo = function(params, callBack) {
	if(params.DrivingLicence) {
		var repo = require('../include/repo');
		var repository = new repo();
		var validateParams = {"params": params, "requireParams": ['DeviceId', 'UserId', 'ExpireYear', 'ExpireMonth']};
		repository.validate.validate(validateParams, function (validationResult) {
			if (validationResult.Result) {
				params.checkServiceProvider = true;
				params.activationNotRequire = true;
				repository.user.checkUserId(params, function (result) {
					if (result.Result) {
						lib.dbConnection.ServiceProviderProfile.find({
							where: {user_id: params.UserId},
							include: [lib.dbConnection.ServiceProviderDocument]
						}).success(function (profile) {
							if (profile) {
								profile.serviceProviderDocument.driving_licence_pic = params.DrivingLicence.path.substr(7).replace(/\\/g,"/");
								profile.serviceProviderDocument.driving_licence_expiration_date = params.ExpireYear + "-" + params.ExpireMonth;
								profile.serviceProviderDocument.save({fields: ['driving_licence_pic', 'driving_licence_expiration_date']}).success(function (newProfile) {
									var returnData = {};
									returnData.url = "http://"+lib.config.production.host.domain+":"+lib.config.production.host.port+"/"+newProfile.driving_licence_pic;
									returnData.expiration_dDate = newProfile.driving_licence_expiration_date;
									callBack({Result: true, data: returnData});
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
	} else {
		callBack(lib.errorCodes.setError('NotFileSent'));
	}
}
//******************SEPARATE******************
exports.updateDiagnosisInfo = function(params, callBack) {
	if(params.Diagnosis) {
		var repo = require('../include/repo');
		var repository = new repo();
		var validateParams = {"params": params, "requireParams": ['DeviceId', 'UserId', 'ExpireYear', 'ExpireMonth']};
		repository.validate.validate(validateParams, function (validationResult) {
			if (validationResult.Result) {
				params.checkServiceProvider = true;
				params.activationNotRequire = true;
				repository.user.checkUserId(params, function (result) {
					if (result.Result) {
						lib.dbConnection.ServiceProviderProfile.find({
							where: {user_id: params.UserId},
							include: [lib.dbConnection.ServiceProviderDocument]
						}).success(function (profile) {
							if (profile) {
								profile.serviceProviderDocument.technical_diagnosis_pic = params.Diagnosis.path.substr(7).replace(/\\/g,"/");
								profile.serviceProviderDocument.technical_diagnosis_expiration_date = params.ExpireYear + "-" + params.ExpireMonth;
								profile.serviceProviderDocument.save({fields: ['technical_diagnosis_pic', 'technical_diagnosis_expiration_date']}).success(function (newProfile) {
									var returnData = {};
									returnData.url = "http://"+lib.config.production.host.domain+":"+lib.config.production.host.port+"/"+newProfile.technical_diagnosis_pic;
									returnData.expiration_dDate = newProfile.technical_diagnosis_expiration_date;
									callBack({Result: true, data: returnData});
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
	} else {
		callBack(lib.errorCodes.setError('NotFileSent'));
	}
}
//******************SEPARATE******************
exports.updateVehicleCardInfo = function(params, callBack) {
	var repo = require('../include/repo');
	var repository = new repo();
	var validateParams = {"params": params, "requireParams": ['DeviceId', 'UserId']};
	repository.validate.validate(validateParams, function (validationResult) {
		if (validationResult.Result) {
			params.checkServiceProvider = true;
			params.activationNotRequire = true;
			repository.user.checkUserId(params, function (result) {
				if (result.Result) {
					lib.dbConnection.ServiceProviderProfile.find({
						where: {user_id: params.UserId},
						include: [lib.dbConnection.ServiceProviderDocument]
					}).success(function (profile) {
						if (profile) {
							profile.serviceProviderDocument.vehicle_card_front = params.VehicleCardFront.path.substr(7).replace(/\\/g,"/");
							profile.serviceProviderDocument.vehicle_card_back = params.VehicleCardBack.path.substr(7).replace(/\\/g,"/");
							profile.serviceProviderDocument.save({fields: ['vehicle_card_front', 'vehicle_card_back']}).success(function (newProfile) {
								var returnData = {};
								returnData.frontUrl = "http://"+lib.config.production.host.domain+":"+lib.config.production.host.port+"/"+newProfile.vehicle_card_front;
								returnData.backUrl = "http://"+lib.config.production.host.domain+":"+lib.config.production.host.port+"/"+newProfile.vehicle_card_back;
								callBack({Result: true, data: returnData});
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
exports.updateClearances = function(params, callBack) {
	if(params.Clearances) {
		var repo = require('../include/repo');
		var repository = new repo();
		var validateParams = {"params": params, "requireParams": ['DeviceId', 'UserId', 'ExpireYear', 'ExpireMonth']};
		repository.validate.validate(validateParams, function (validationResult) {
			if (validationResult.Result) {
				params.checkServiceProvider = true;
				params.activationNotRequire = true;
				repository.user.checkUserId(params, function (result) {
					if (result.Result) {
						lib.dbConnection.ServiceProviderProfile.find({
							where: {user_id: params.UserId},
							include: [lib.dbConnection.ServiceProviderDocument]
						}).success(function (profile) {
							if (profile) {
								profile.serviceProviderDocument.clearances_pic = params.Clearances.path.substr(7).replace(/\\/g,"/");
								profile.serviceProviderDocument.clearances_expiration_date = params.ExpireYear + "-" + params.ExpireMonth;
								profile.serviceProviderDocument.save({fields: ['clearances_pic', 'clearances_expiration_date']}).success(function (newProfile) {
									var returnData = {};
									returnData.url = "http://"+lib.config.production.host.domain+":"+lib.config.production.host.port+"/"+newProfile.clearances_pic;
									returnData.expiration_dDate = newProfile.clearances_expiration_date;
									callBack({Result: true, data: returnData});
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
	} else {
		callBack(lib.errorCodes.setError('NotFileSent'));
	}
}
//******************SEPARATE******************
exports.updateOwnership = function(params, callBack) {
	if(params.Ownership) {
		var repo = require('../include/repo');
		var repository = new repo();
		var validateParams = {"params": params, "requireParams": ['DeviceId', 'UserId']};
		repository.validate.validate(validateParams, function (validationResult) {
			if (validationResult.Result) {
				params.checkServiceProvider = true;
				params.activationNotRequire = true;
				repository.user.checkUserId(params, function (result) {
					if (result.Result) {
						lib.dbConnection.ServiceProviderProfile.find({
							where: {user_id: params.UserId},
							include: [lib.dbConnection.ServiceProviderDocument]
						}).success(function (profile) {
							if (profile) {
								profile.serviceProviderDocument.vehicle_ownership_document_pic = params.Ownership.path.substr(7).replace(/\\/g,"/");
								profile.serviceProviderDocument.save({fields: ['vehicle_ownership_document_pic']}).success(function (newProfile) {
									var returnData = {};
									returnData.url = "http://"+lib.config.production.host.domain+":"+lib.config.production.host.port+"/"+newProfile.vehicle_ownership_document_pic;
									callBack({Result: true, data: returnData});
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
	} else {
		callBack(lib.errorCodes.setError('NotFileSent'));
	}
}
//******************SEPARATE******************
exports.updateInsurance = function(params, callBack) {
	if(params.Insurance) {
		var repo = require('../include/repo');
		var repository = new repo();
		var validateParams = {"params": params, "requireParams": ['DeviceId', 'UserId', 'ExpireYear', 'ExpireMonth']};
		repository.validate.validate(validateParams, function (validationResult) {
			if (validationResult.Result) {
				params.checkServiceProvider = true;
				params.activationNotRequire = true;
				repository.user.checkUserId(params, function (result) {
					if (result.Result) {
						lib.dbConnection.ServiceProviderProfile.find({
							where: {user_id: params.UserId},
							include: [lib.dbConnection.ServiceProviderDocument]
						}).success(function (profile) {
							if (profile) {
								profile.serviceProviderDocument.vehicle_insurance_pic = params.Insurance.path.substr(7).replace(/\\/g,"/");
								profile.serviceProviderDocument.vehicle_insurance_expiration_date = params.ExpireYear + "-" + params.ExpireMonth;
								profile.serviceProviderDocument.save({fields: ['vehicle_insurance_pic', 'vehicle_insurance_expiration_date']}).success(function (newProfile) {
									var returnData = {};
									returnData.url = "http://"+lib.config.production.host.domain+":"+lib.config.production.host.port+"/"+newProfile.vehicle_insurance_pic;
									returnData.expiration_dDate = newProfile.vehicle_insurance_expiration_date;
									callBack({Result: true, data: returnData});
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
	} else {
		callBack(lib.errorCodes.setError('NotFileSent'));
	}
}
//******************SEPARATE******************
exports.updatePic = function(params, callBack) {
	if(params.Pic) {
		var repo = require('../include/repo');
		var repository = new repo();
		var validateParams = {"params": params, "requireParams": ['DeviceId', 'UserId']};
		repository.validate.validate(validateParams, function (validationResult) {
			if (validationResult.Result) {
				params.checkServiceProvider = true;
				params.activationNotRequire = true;
				repository.user.checkUserId(params, function (result) {
					if (result.Result) {
						lib.dbConnection.ServiceProviderProfile.find({
							where: {user_id: params.UserId},
							include: [lib.dbConnection.ServiceProviderDocument]
						}).success(function (profile) {
							if (profile) {
								profile.serviceProviderDocument.user_pic = params.Pic.path.substr(7).replace(/\\/g,"/");
								profile.serviceProviderDocument.save({fields: ['user_pic']}).success(function (newProfile) {
									var returnData = {};
									returnData.url = "http://"+lib.config.production.host.domain+":"+lib.config.production.host.port+"/"+newProfile.user_pic;
									callBack({Result: true, data: returnData});
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
	} else {
		callBack(lib.errorCodes.setError('NotFileSent'));
	}
}
//******************SEPARATE******************
exports.getDocument = function(params, callBack) {
	var repo = require('../include/repo');
	var repository = new repo();
	var validateParams = {"params": params, "requireParams": ['DeviceId', 'UserId', 'Type']};
	repository.validate.validate(validateParams, function (validationResult) {
		if (validationResult.Result) {
			params.checkServiceProvider = true;
			params.activationNotRequire = true;
			repository.user.checkUserId(params, function (result) {
				if (result.Result) {
					lib.dbConnection.ServiceProviderProfile.find({
						where: {user_id: params.UserId},
						include: [lib.dbConnection.ServiceProviderDocument]
					}).success(function (profile) {
						if (profile) {
							var returnParams = {};
							var existFlag = true;
							if(params.Type == "DriverLicence") {
								if(profile.serviceProviderDocument.driving_licence_pic) {
									returnParams.Url = profile.serviceProviderDocument.driving_licence_pic;
									var expDate = profile.serviceProviderDocument.driving_licence_expiration_date.split('-');
									returnParams.ExpireYear = expDate[0];
									returnParams.ExpireMonth = expDate[1];
								} else {
									return callBack(lib.errorCodes.setError('documentTypeNotSet'));
								}
							}
							else if(params.Type == "Diagnosis") {
								if(profile.serviceProviderDocument.driving_licence_pic) {
									returnParams.Url = profile.serviceProviderDocument.technical_diagnosis_pic;
									var expDate = profile.serviceProviderDocument.technical_diagnosis_expiration_date.split('-');
									returnParams.ExpireYear = expDate[0];
									returnParams.ExpireMonth = expDate[1];
								} else {
									return callBack(lib.errorCodes.setError('documentTypeNotSet'));
								}
							}
							else if(params.Type == "VehicleCardFront") {
								if(profile.serviceProviderDocument.driving_licence_pic) {
									returnParams.Url = profile.serviceProviderDocument.vehicle_card_front;
								} else {
									return callBack(lib.errorCodes.setError('documentTypeNotSet'));
								}
							}
							else if(params.Type == "VehicleCardBack") {
								if(profile.serviceProviderDocument.driving_licence_pic) {
									returnParams.Url = profile.serviceProviderDocument.vehicle_card_back;
								} else {
									return callBack(lib.errorCodes.setError('documentTypeNotSet'));
								}
							}
							else if(params.Type == "Clearances") {
								if(profile.serviceProviderDocument.driving_licence_pic) {
									returnParams.Url = profile.serviceProviderDocument.clearances_pic;
									var expDate = profile.serviceProviderDocument.clearances_expiration_date.split('-');
									returnParams.ExpireYear = expDate[0];
									returnParams.ExpireMonth = expDate[1];
								} else {
									return callBack(lib.errorCodes.setError('documentTypeNotSet'));
								}
							}
							else if(params.Type == "Ownership") {
								if(profile.serviceProviderDocument.driving_licence_pic) {
									returnParams.Url = profile.serviceProviderDocument.vehicle_ownership_document_pic;
								} else {
									return callBack(lib.errorCodes.setError('documentTypeNotSet'));
								}
							}
							else if(params.Type == "Insurance") {
								if(profile.serviceProviderDocument.driving_licence_pic) {
									returnParams.Url = profile.serviceProviderDocument.vehicle_insurance_pic;
									var expDate = profile.serviceProviderDocument.vehicle_insurance_expiration_date.split('-');
									returnParams.ExpireYear = expDate[0];
									returnParams.ExpireMonth = expDate[1];
								} else {
									return callBack(lib.errorCodes.setError('documentTypeNotSet'));
								}
							}
							else if(params.Type == "Pic") {
								if(profile.serviceProviderDocument.driving_licence_pic) {
									returnParams.Url = profile.serviceProviderDocument.user_pic;
								} else {
									return callBack(lib.errorCodes.setError('documentTypeNotSet'));
								}
							}
							else {
								return callBack(lib.errorCodes.setError('invalidDocumentType'));
							}
							returnParams.Url = "http://"+lib.config.production.host.domain+":"+lib.config.production.host.port+"/"+returnParams.Url;
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