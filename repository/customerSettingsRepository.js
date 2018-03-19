var lib = require('../include/lib');
//******************SEPARATE******************
exports.updateSetting = function(params, callBack) {
	var repo = require('../include/repo');
	var repository = new repo();
	var validateParams = {"params": params, "requireParams": ['DeviceId', 'UserId', 'NewsletterFlag', 'TripInfoEmailFlag', 'TripInfoSmsFlag']};
	repository.validate.validate(validateParams, function (validationResult) {
		if (validationResult.Result) {
			params.checkCustomer = true;
			repository.user.checkUserId(params, function (result) {
				if (result.Result) {
					lib.dbConnection.CustomerSetting.find({where: {user_id: params.UserId}}).success(function (setting) {
						if (setting) {
							setting.newsletter_flag = parseInt(params.NewsletterFlag);
							setting.trip_info_email_flag = parseInt(params.TripInfoEmailFlag);
							setting.trip_info_sms_flag = parseInt(params.TripInfoSmsFlag);
							setting.save({fields: ['newsletter_flag', 'trip_info_email_flag', 'trip_info_sms_flag']}).success(function (newSetting) {
								callBack({Result: true, data: newSetting});
							}).error(function (error) {
								console.log("an error accord: ", error);
								callBack(lib.errorCodes.setError('dbError'));
							});
						} else {
							callBack(lib.errorCodes.setError('notExistRecord'));
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