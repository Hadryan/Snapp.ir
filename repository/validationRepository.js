var lib = require('../include/lib');

//******************SEPARATE******************

//******************SEPARATE******************
exports.validate = function(params,callBack) {
	var repo = require('../include/repo');
	var repository = new repo();
	var requireParams,params,status;
	requireParams = params.requireParams;
	params = params.params;
	status = true;
	for(var key in requireParams) {
		if((!params[requireParams[key]]) || (params[requireParams[key]] == "")) {
			if(!params.allowZero) {
				if(params[requireParams[key]]!=0) {
					console.log('miss requireParams:', requireParams[key]);
					status = false;
				}
			}
		}
	}
	if(!status) {
		callBack(lib.errorCodes.setError("emptyParams"));
	} else {
		repository.userToken.existDeviceId(params.DeviceId, function(result) {
			if(result.success) {
				callBack({ Result: true });
			} else {
				callBack(lib.errorCodes.setError("missesDeviceId"));
			}
		});
	}
}
//******************SEPARATE******************