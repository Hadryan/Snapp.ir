var lib = require('../include/lib');
//******************SEPARATE******************
var sendSms = function(params){
	return true;
};
exports.applyDriverRate = function(params, callBack) {
	var repo = require('../include/repo');
	var repository = new repo();
	var validateParams = {"params": params, "requireParams": ['DeviceId', 'UserId', 'DriverId', 'TripId', 'Rate']};
	repository.validate.validate(validateParams, function (validationResult) {
		if (validationResult.Result) {
			params.checkCustomer = true;
			repository.user.checkUserId(params, function (userFlag) {
				if (userFlag.Result) {
					var checkDriverIdParams = {
						UserId: params.DriverId,
						checkServiceProvider: true,
						include: [{
							model: lib.dbConnection.ServiceProviderProfile,
							attributes: ["sum_rate", "rate_count","current_situation_id"],
						}],
					};
					repository.user.checkUserId(checkDriverIdParams, function (driverFlag) {
						if (driverFlag.Result) {
							var checkTripParams = {
								TripId: params.TripId,
								PassengerId: params.UserId,
								DriverId: params.DriverId,
							};
							repository.trip.checkTripIdByDriverAndPassenger(checkTripParams, function (tripFlag) {
								if (tripFlag.Result) {
									lib.dbConnection.TripDriverRateLog.create({
										trip_id: params.TripId,
										user_id: params.DriverId,
										rate: params.Rate,
									}).success(function (rateLog) {
										driverFlag.data.serviceProviderProfile.sum_rate += params.Rate;
										driverFlag.data.serviceProviderProfile.rate_count++;
										driverFlag.data.serviceProviderProfile.current_situation_id = lib.Constants.setConstant("serviceProviderCurrentSituationOnline");
										driverFlag.data.serviceProviderProfile.save({fields: ['sum_rate', 'rate_count', 'current_situation_id']}).success(function (profile) {
											var UPCSParams = {};
											UPCSParams.PassengerId = params.UserId;
											UPCSParams.SituationId = lib.Constants.setConstant("customerCurrentSituationOffline");
											repository.user.updatePassengerCurrentSituation(UPCSParams,function(PSituationResult) {
												var returnParams = {
													userBalance: userFlag.data.balance,
													SumRate: profile.sum_rate,
													RateCount: profile.rate_count,
													RateAverage: (profile.sum_rate / profile.rate_count)
												};
												callBack({Result: true, data: returnParams});
											});
										}).error(function (error) {
											console.log("an error accord: ", error);
											callBack(lib.errorCodes.setError('dbError'));
										});
										
										// console.log('driverFlag',driverFlag);
										
									}).error(function (error) {
										console.log("an error accord: ", error);
										callBack(lib.errorCodes.setError('dbError'));
									});
								} else {
									callBack(tripFlag);
								}
							});
						} else {
							callBack(driverFlag);
						}
					});
				} else {
					callBack(userFlag);
				}
			});
		} else {
			callBack(validationResult);
		}
	});
}