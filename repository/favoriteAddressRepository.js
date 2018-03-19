var lib = require('../include/lib');
//******************SEPARATE******************
exports.saveAddress = function(params, callBack) {
	var repo = require('../include/repo');
	var repository = new repo();
	var validateParams = {"params": params, "requireParams": ['DeviceId', 'UserId', 'AddressName', 'GeographicalLat', 'GeographicalLong', 'Details']};
	repository.validate.validate(validateParams, function (validationResult) {
		if (validationResult.Result) {
			repository.user.checkUserId(params, function (result) {
				if (result.Result) {
					lib.dbConnection.UserFavoriteAddress.create({
						user_id: params.UserId,
						address_name: params.AddressName,
						geographical_lat: params.GeographicalLat,
						geographical_long: params.GeographicalLong,
						details: params.Details
					}).success(function (favoriteAddress) {
						callBack({Result: true, data: favoriteAddress});
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
exports.updateAddress = function(params, callBack) {
	var repo = require('../include/repo');
	var repository = new repo();
	var validateParams = {"params": params, "requireParams": ['DeviceId', 'UserId', 'AddressId', 'AddressName', 'GeographicalLat', 'GeographicalLong', 'Details']};
	repository.validate.validate(validateParams, function (validationResult) {
		if (validationResult.Result) {
			params.checkCustomer = true;
			repository.user.checkUserId(params, function (result) {
				if (result.Result) {
					lib.dbConnection.UserFavoriteAddress.find({where: {id: params.AddressId}}).success(function (favoriteAddress) {
						if (favoriteAddress) {
							if (favoriteAddress.user_id == params.UserId) {
								favoriteAddress.address_name = params.AddressName;
								favoriteAddress.geographical_lat = params.GeographicalLat;
								favoriteAddress.geographical_long = params.GeographicalLong;
								favoriteAddress.details = params.Details;
								favoriteAddress.save({fields: ['address_name', 'geographical_lat', 'geographical_long', 'details']}).success(function (newFavoriteAddress) {
									callBack({Result: true, data: newFavoriteAddress});
								}).error(function (error) {
									console.log("an error accord: ", error);
									callBack(lib.errorCodes.setError('dbError'));
								});
							} else {
								callBack(lib.errorCodes.setError("thisObjectIsNotForThisUser"));
							}
						} else {
							callBack(lib.errorCodes.setError("notExistRecord"));
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
exports.delete = function(params, callBack) {
	var repo = require('../include/repo');
	var repository = new repo();
	var validateParams = {"params": params, "requireParams": ['DeviceId', 'UserId', 'AddressId']};
	repository.validate.validate(validateParams, function (validationResult) {
		if (validationResult.Result) {
			params.checkCustomer = true;
			repository.user.checkUserId(params, function (result) {
				if (result.Result) {
					lib.dbConnection.UserFavoriteAddress.find({where: {id: params.AddressId}}).success(function (favoriteAddress) {
						if (favoriteAddress) {
							if (favoriteAddress.user_id == params.UserId) {
								favoriteAddress.destroy().success(function (newFavoriteAddress) {
									callBack({Result: true});
								}).error(function (error) {
									console.log("an error accord: ", error);
									callBack(lib.errorCodes.setError('dbError'));
								});
							} else {
								callBack(lib.errorCodes.setError("thisObjectIsNotForThisUser"));
							}
						} else {
							callBack(lib.errorCodes.setError("notExistRecord"));
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
exports.list = function(params, callBack) {
	var repo = require('../include/repo');
	var repository = new repo();
	var validateParams = {"params": params, "requireParams": ['DeviceId', 'UserId']};
	repository.validate.validate(validateParams, function (validationResult) {
		if (validationResult.Result) {
			params.checkCustomer = true;
			repository.user.checkUserId(params, function (result) {
				if (result.Result) {
					lib.dbConnection.UserFavoriteAddress.findAll({where: {user_id: params.UserId}}).success(function (favoriteAddresses) {
						callBack({Result: true, data: favoriteAddresses});
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