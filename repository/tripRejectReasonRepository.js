var lib = require('../include/lib');
//******************SEPARATE******************
exports.tripRejectReasonList = function(callBack) {
	lib.dbConnection.TripRejectReason.findAll( {
		where: { flag_id: 1 }
	}).success(function (datas) {
		if(datas) {
			callBack({ Result:true, data: datas });
		} else {
			callBack ( lib.errorCodes.setError( 'notExistRecord' ) );
		}
	}).error(function(error){
		console.log("an error accord: ",error);
		callBack ( lib.errorCodes.setError( 'dbError' ) );
	});
}
//******************SEPARATE******************
exports.checkTripRejectReasonId = function(params, callBack) {
	lib.dbConnection.TripRejectReason.find( {
		where: { id: params.id }
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