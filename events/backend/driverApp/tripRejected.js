module.exports = function(redisClient, namespaceKey, socket, dbConnection, appConfig,io) {
	socket.on('tripRejected',function(params){
		var lib = require('../../../include/lib');
		var repo = require('../../../include/repo');
		var repository = new repo();
		redisClient.set(params.UserId,socket.id,function(){
			redisClient.set(socket.id, params.UserId, function () {
				console.log("socket saved for user id "+params.UserId);
			});
		});
		var tLParams = {};
		tLParams.userId = params.UserId;
		tLParams.tripId = params.TripId;
		var UDCSParams = {};
		UDCSParams.DriverId = params.UserId;
		redisClient.get("trip_" + params.TripId, function (error, tripSituation) {
			if (tripSituation == 1) {
				UDCSParams.SituationId = lib.Constants.setConstant("serviceProviderCurrentSituationOnline");
				repository.user.updateDriverCurrentSituation(UDCSParams,function(DSituationResult) {
					tLParams.newSituation = UDCSParams.SituationId;
					tLParams.description = "Driver trip rejected,but trip accepted before!";
					repository.user.setTripLog(tLParams,function(tLResult) {});
					console.log("trip " + params.TripId + " accepted before!")
					socket.emit('tripRejectedRes', lib.errorCodes.setError('tripAcceptedOrCanceledBefore'));
				});
			} else if (tripSituation == 2) {
				UDCSParams.SituationId = lib.Constants.setConstant("serviceProviderCurrentSituationOnline");
				repository.user.updateDriverCurrentSituation(UDCSParams,function(DSituationResult) {
					tLParams.newSituation = UDCSParams.SituationId;
					tLParams.description = "Driver trip rejected,but trip canceled by passenger!";
					repository.user.setTripLog(tLParams,function(tLResult) {});
					console.log("trip " + params.TripId + " canceled By Passenger!")
					socket.emit('tripRejectedRes', lib.errorCodes.setError('tripAcceptedOrCanceledBefore'));
				});
			} else {
				UDCSParams.SituationId = lib.Constants.setConstant("serviceProviderCurrentSituationWaitingToDetermineRejectReason");
				repository.user.updateDriverCurrentSituation(UDCSParams, function (DSituationResult) {
					repository.drivers.tripRejected(params, function (res) {
						tLParams.newSituation = UDCSParams.SituationId;
						tLParams.description = "Driver trip rejected";
						repository.user.setTripLog(tLParams,function(tLResult) {});
						socket.emit('tripRejectedRes', res);
					});
				});
			}
		});
	})
}