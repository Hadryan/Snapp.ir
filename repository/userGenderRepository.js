var lib = require('../include/lib');
//******************SEPARATE******************
exports.gendersList = function(callBack) {
	var repo = require('../include/repo');
	var repository = new repo();
	var validateParams = {"params": params, "requireParams": ['DeviceId']};
	repository.validate.validate(validateParams, function (validationResult) {
		if (validationResult.Result) {
			lib.dbConnection.UserGender.findAll({
				where: {flag_id: 1}
			}).success(function (datas) {
				if (datas) {
					callBack({Result: true, data: datas});
				} else {
					callBack(lib.errorCodes.setError('notExistRecord'));
				}
			}).error(function (error) {
				console.log("an error accord: ", error);
				callBack(lib.errorCodes.setError('dbError'));
			});
		} else {
			callBack(validationResult);
		}
	});
}
//******************SEPARATE******************
exports.checkGenderId = function(id, callBack) {
	lib.dbConnection.UserGender.find( {
		where: { id: id }
	}).success(function (data) {
		if(data) {
			if(data.flag_id == 1) {
				callBack({Result:true});
			} else {
				callBack ( lib.errorCodes.setError( 'inactiveRecord' ) );
			}
		} else {
			callBack ( lib.errorCodes.setError( 'notExistRecord' ) );
		}
	}).error(function(error){
		console.log("an error accord: ",error);
		callBack ( lib.errorCodes.setError( 'dbError' ) );
	});
}