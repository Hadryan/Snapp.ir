var lib = require('../include/lib');
//******************SEPARATE******************
exports.list = function(params, callBack) {
	var repo = require('../include/repo');
	var repository = new repo();
	var validateParams = {"params": params, "requireParams": ['DeviceId', 'TypeId']};
	repository.validate.validate(validateParams, function (validationResult) {
		if (validationResult.Result) {
			lib.dbConnection.SupportMessageSubject.findAll({
				where: {flag_id: 1, user_type_id: params.TypeId},
			}).success(function (subjects) {
				if (subjects) {
					callBack({Result: true, data: subjects});
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
exports.checkSubjectId = function(params, callBack) {
	lib.dbConnection.SupportMessageSubject.find({ where: { id: params.messageSubjectId } }).success(function (subject) {
		if(subject) {
			if(subject.flag_id == 1) {
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
//******************SEPARATE******************
exports.findLossSubjectId = function(params, callBack) {
	lib.dbConnection.SupportMessageSubject.find({ where: { name: "اعلام اینکه مسافر شی را در خودرو راننده جا گذاشته است", user_type_id: 1, flag_id: 1 } }).success(function (subject) {
		if(subject) {
			callBack({Result: true, data: subject});
		} else {
			lib.dbConnection.SupportMessageSubject.find({ where: { name: "سایر", user_type_id: 1, flag_id: 1 } }).success(function (subject) {
				if(subject) {
					callBack({Result: true, data: subject});
				} else {
					callBack(lib.errorCodes.setError('notExistRecord'));
				}
			}).error(function(error){
				console.log("an error accord: ",error);
				callBack ( lib.errorCodes.setError( 'dbError' ) );
			});
		}
	}).error(function(error){
		console.log("an error accord: ",error);
		callBack ( lib.errorCodes.setError( 'dbError' ) );
	});
}