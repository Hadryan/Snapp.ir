var lib = require('../include/lib');
//******************SEPARATE******************
exports.vehicleBrandsList = function(callBack) {
	lib.dbConnection.VehicleBrand.findAll( {
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
exports.checkVehicleBrandId = function(id, callBack) {
	lib.dbConnection.VehicleBrand.find( {
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