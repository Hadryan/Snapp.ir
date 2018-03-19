var lib = require('../include/lib');
//******************SEPARATE******************
exports.updateInfo = function(params, callBack) {
	var repo = require('../include/repo');
	var repository = new repo();
	var validateParams = {"params": params, "requireParams": ['DeviceId', 'UserId', 'GenderId', 'FullName', 'Phone', 'Address', 'BirthDate', 'Email']};
	repository.validate.validate(validateParams, function (validationResult) {
		if (validationResult.Result) {
			params.checkCustomer = true;
			repository.user.checkUserId(params, function (result) {
				if (result.Result) {
                    result.data.email = params.Email;
                    result.data.save({fields: ["email"]}).success(function (newUser) {
                        lib.dbConnection.CustomerProfile.find({
                            where: {user_id: params.UserId}
                        }).success(function (profile) {
                            if (profile) {
                                repository.userGender.checkGenderId(params.GenderId, function (res) {
                                    if (res.Result) {
                                        profile.gender_id = params.GenderId;
                                        profile.full_name = params.FullName;
                                        profile.phone = params.Phone;
                                        profile.address = params.Address;
                                        profile.birth_date = params.BirthDate;
                                        profile.save({fields: ['gender_id', 'full_name', 'phone', 'address', 'birth_date']}).success(function (newProfile) {
                                            lib.dbConnection.DiscountCode.find({where: {user_id: newUser.id}}).success(function (discountCode) {
                                                var returnParams = {};
                                                returnParams.discount_code = discountCode.discount_code;
                                                returnParams.UserId = newProfile.user_id;
                                                returnParams.full_name = newProfile.full_name;
                                                returnParams.balance = newUser.balance;
                                                returnParams.email = newUser.email;
                                                returnParams.mobile = newUser.mobile;
                                                returnParams.gender = newProfile.gender_id;
                                                returnParams.phone = newProfile.phone;
                                                returnParams.address = newProfile.address;
                                                returnParams.birth_date = newProfile.birth_date;
                                                callBack({Result: true, data: returnParams});
                                            }).error(function (error) {
                                                callBack(lib.errorCodes.setError('dbError'));
                                            });
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