var lib = require('../include/lib');
//******************SEPARATE******************
var sendSms = function(params){
	return true;
};
exports.saveMessage = function(params, callBack) {
	var repo = require('../include/repo');
	var repository = new repo();
	var validateParams = {"params": params, "requireParams": ['DeviceId', 'TypeId', 'UserId', 'messageSubjectId', 'messageBody']};
	repository.validate.validate(validateParams, function (validationResult) {
		if (validationResult.Result) {
			repository.user.checkUserId(params, function (result) {
				if (result.Result) {
					repository.supportMessageSubject.checkSubjectId(params, function (result) {
						if (result.Result) {
							if (params.TypeId == 1) {
								lib.dbConnection.SupportMessage.create({
									message_subject_id: params.messageSubjectId,
									sender_id: params.UserId,
									message_body: params.messageBody,
									message_flag_id: 1
								}).success(function (message) {
									callBack({Result: true, data: message});
								}).error(function (error) {
									console.log("an error accord: ", error);
									callBack(lib.errorCodes.setError('dbError'));
								});
							} else {
								repository.trip.getTripIdByTripCode(params, function (res) {
									if (res.Result) {
										lib.dbConnection.SupportMessage.create({
											message_subject_id: params.messageSubjectId,
											trip_id: res.data.id,
											sender_id: params.UserId,
											message_body: params.messageBody,
											message_flag_id: 1
										}).success(function (message) {
											callBack({Result: true, data: message});
										}).error(function (error) {
											console.log("an error accord: ", error);
											callBack(lib.errorCodes.setError('dbError'));
										});
									} else {
										callBack(result);
									}
								});
							}
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
exports.passengerMissObject = function(params, callBack) {
	const SMS_DEFAULT_MESSAGE = "مسافر محترم، شما شیئ را در خودرو راننده جا گذاشته اید.";
	const SUPPORT_DEFAULT_MESSAGE = "در سفر با کد " + params.TripCode + " مسافر شیئ را در درون خودرو راننده جا گذاشته است.";
	var repo = require('../include/repo');
	var repository = new repo();
	var validateParams = {"params": params, "requireParams": ['DeviceId', 'UserId', 'TripCode']};
	repository.validate.validate(validateParams, function (validationResult) {
		if (validationResult.Result) {
			params.checkServiceProvider = true;
			repository.user.checkUserId(params, function (result) {
				if (result.Result) {
					repository.supportMessageSubject.findLossSubjectId(params, function (result) {
						if (result.Result) {
							var messageSubjectId = result.data.id;
						} else {
							var messageSubjectId = null;
						}
						lib.dbConnection.SupportMessage.create({
							message_subject_id: messageSubjectId,
							sender_id: params.UserId,
							message_body: SUPPORT_DEFAULT_MESSAGE,
							message_flag_id: 1
						}).success(function (message) {
							params.attributes = ["passenger_user_id"]
							params.include = [{
								model: lib.dbConnection.User,
								as: 'passengerUser',
								attributes: ["mobile"],
							}];
							repository.trip.getTripIdByTripCode(params, function (trip) {
								if (trip.Result) {
									smsParams = {mobile: trip.data.passengerUser.mobile, message: SMS_DEFAULT_MESSAGE};
									callBack({Result: sendSms(smsParams)});
								} else {
									callBack(trip);
								}
							});
						}).error(function (error) {
							console.log("an error accord: ", error);
							callBack(lib.errorCodes.setError('dbError'));
						});
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