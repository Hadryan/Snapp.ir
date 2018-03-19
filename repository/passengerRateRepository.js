var lib = require('../include/lib');
//******************SEPARATE******************
var sendSms = function(params){
	return true;
};
exports.applyPassengerRate = function(params, callBack) {
	var repo = require('../include/repo');
	var repository = new repo();
	params.checkServiceProvider = true;
	var validateParams = {"params": params, "requireParams": ['DeviceId', 'UserId', 'PassengerId', 'TripId', 'Rate']};
	validateParams.allowZero = true;
	repository.validate.validate(validateParams, function (validationResult) {
		if (validationResult.Result) {
			repository.user.checkUserId(params, function (driverFlag) {
				if (driverFlag.Result) {
					var checkPassengerIdParams = {
						UserId: params.PassengerId,
						checkCustomer: true,
						activationNotRequire:true,
						include: [{
							model: lib.dbConnection.CustomerProfile,
							attributes: ["like_count", "dislike_count","current_situation_id"],
						}]
					};
					repository.user.checkUserId(checkPassengerIdParams, function (passengerFlag) {
						// return callBack({Result: true, data: passengerFlag});
						if (passengerFlag.Result) {
							var checkTripParams = {
								TripId: params.TripId,
								PassengerId: params.PassengerId,
								DriverId: params.UserId,
							};
							repository.trip.checkTripIdByDriverAndPassenger(checkTripParams, function (tripFlag) {
								if (tripFlag.Result) {
									var createParams = {
										trip_id: params.TripId,
										user_id: params.PassengerId,
									};
									if (params.Rate == 1) {
										createParams.like = 1;
									} else {
										createParams.dislike = 1;
									}
									lib.dbConnection.TripPassengerRateLog.create(createParams).success(function (rateLog) {
										if (params.Rate == 1) {
											passengerFlag.data.customerProfile.like_count++;
										} else {
											passengerFlag.data.customerProfile.dislike_count++;
										}
										passengerFlag.data.customerProfile.current_situation_id = lib.Constants.setConstant("customerCurrentSituationOffline");
										passengerFlag.data.customerProfile.save({fields: ['like_count', 'dislike_count',"current_situation_id"]}).success(function (profile) {
											var UDCSParams = {};
											UDCSParams.DriverId = params.UserId;
											UDCSParams.SituationId = lib.Constants.setConstant("serviceProviderCurrentSituationOnline");
											repository.user.updateDriverCurrentSituation(UDCSParams,function(DSituationResult) {
												var returnParams = {
													like_count: profile.like_count,
													dislike_count: profile.dislike_count,
												};
												callBack({Result: true, data: returnParams});
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
									callBack(tripFlag);
								}
							});
						} else {
							callBack(passengerFlag);
						}
					});
				} else {
					callBack(driverFlag);
				}
			});
		} else {
			callBack(validationResult);
		}
	});
}