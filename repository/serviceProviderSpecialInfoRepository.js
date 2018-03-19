var lib = require('../include/lib');
//******************SEPARATE******************
var sendSms = function(mobile, activationCode) {
	return true;
};
//******************SEPARATE******************
exports.updateVehicleInfo = function(params, callBack) {
	var repo = require('../include/repo');
	var repository = new repo();
	var validateParams = {"params": params, "requireParams": ['DeviceId', 'UserId', 'BrandId', 'ModelId', 'ProductYear', 'Color', 'Capacity', 'PlaqueLeft', 'PlaqueAlphabet', 'PlaqueRight', 'PlaqueIran']};
	repository.validate.validate(validateParams, function (validationResult) {
		if (validationResult.Result) {
			params.checkServiceProvider = true;
			params.activationNotRequire = true;
			repository.user.checkUserId(params, function (result) {
				if (result.Result) {
					repository.vehicleBrand.checkVehicleBrandId(params.BrandId, function (res) {
						if (res.Result) {
							repository.vehicleModel.checkVehicleModelId(params.ModelId, function (res1) {
								if (res1.Result) {
									lib.dbConnection.ServiceProviderProfile.find({
										where: {user_id: params.UserId},
										include: [lib.dbConnection.ServiceProviderSpecialInfo]
									}).success(function (profile) {
										if (profile) {
											profile.serviceProviderSpecialInfo.vehicle_brand_id = params.BrandId;
											profile.serviceProviderSpecialInfo.vehicle_model_id = params.ModelId;
											profile.serviceProviderSpecialInfo.vehicle_product_year = params.ProductYear;
											profile.serviceProviderSpecialInfo.vehicle_color = params.Color;
											profile.serviceProviderSpecialInfo.vehicle_capacity = params.Capacity;
											profile.serviceProviderSpecialInfo.vehicle_plaque_left = params.PlaqueLeft;
											profile.serviceProviderSpecialInfo.vehicle_plaque_alphabet = params.PlaqueAlphabet;
											profile.serviceProviderSpecialInfo.vehicle_plaque_right = params.PlaqueRight;
											profile.serviceProviderSpecialInfo.vehicle_plaque_iran = params.PlaqueIran;
											profile.serviceProviderSpecialInfo.vehicle_has_license_traffic_plan = params.HasLicenseTrafficPlan;
											profile.serviceProviderSpecialInfo.license_traffic_plan_expiration_date = params.LicenseTrafficPlanExpirationDate;
											profile.serviceProviderSpecialInfo.description = params.Description;
											profile.serviceProviderSpecialInfo.save().success(function (newProfile) {
												profile.special_code = profile.id+111111;
												profile.save().success(function (newProfile2) {
													var data = JSON.parse(JSON.stringify(newProfile.dataValues));
													data.special_code = newProfile2.special_code;
													callBack({Result: true, data: data});
												}).error(function (error) {
													console.log("an error accord: ", error);
													callBack(lib.errorCodes.setError('dbError'));
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
									callBack(lib.errorCodes.setError('inputsNotValid'));
								}
							});
						} else {
							callBack(lib.errorCodes.setError('inputsNotValid'));
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
exports.finish = function(params, callBack) {
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
						attributes:["special_code","first_name","last_name","gender_id"],
					}).success(function (profile) {
						lib.tools.sendSms(result.data.mobile,"کد پیگیری شما: "+profile.special_code,lib.config.production.sms,function(){
							var returnParams = {};
							returnParams.mobile = result.data.mobile;
							returnParams.balance = result.data.balance;
							returnParams.specialCode = profile.special_code;
							returnParams.firstName = profile.first_name;
							returnParams.lastName = profile.last_name;
							returnParams.genderId = profile.gender_id;
							callBack({Result: true, data: returnParams});
						});
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