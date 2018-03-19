var lib = require('../include/lib');
//******************SEPARATE******************
exports.checkVersion = function(params, callBack) {
	var repo = require('../include/repo');
	var repository = new repo();
	var validateParams = {"params": params, "requireParams": ['DeviceId', 'TypeId']};
	repository.validate.validate(validateParams, function (validationResult) {
		if (validationResult.Result) {
			lib.dbConnection.AndroidVersions.findAll({
				where:{"type_id": params.TypeId},
				order: 'id DESC'
			}).success(function (data) {
				if (data.length) {
					var version = data[0];
					if (version) {
						callBack({Result: true, data: version});
					} else {
						callBack(lib.errorCodes.setError('dbError'));
					}
				} else {
					callBack(lib.errorCodes.setError('notExistRecord'));
				}
			}).error(function (error) {
				console.log("an error accord: ", error);
				callBack(lib.errorCodes.setError('dbError'));
			});
		}
	});
}