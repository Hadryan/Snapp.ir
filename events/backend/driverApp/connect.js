module.exports = function(redisClient, namespaceKey, socket, dbConnection, appConfig,io) {
	socket.on('firstConnect',function(params){
		var tLParams = {};
		tLParams.userId = params.UserId;
		tLParams.tripId = null;
		console.log("");
		console.log("driver first connect!!!!!!!!!!!");
		console.log("");
		var repo = require('../../../include/repo');
		var lib = require('../../../include/lib');
		var repository = new repo();
		var updateDriverCurrentSituationParams = {};
		updateDriverCurrentSituationParams.DriverId = params.UserId;
		updateDriverCurrentSituationParams.SituationId = lib.Constants.setConstant("serviceProviderCurrentSituationOnline");
		repository.user.updateDriverCurrentSituation(updateDriverCurrentSituationParams,function(situationResult) {
			if(situationResult.Result) {
				repository.drivers.driverOnline(params, function (result) {
					if (result.Result) {
						redisClient.set(params.UserId, socket.id, function () {
							redisClient.set(socket.id, params.UserId, function () {
								tLParams.newSituation = updateDriverCurrentSituationParams.SituationId;
								tLParams.description = "Driver first connect";
								repository.user.setTripLog(tLParams, function (tLResult) {});
								console.log("driver socket saved for user id " + params.UserId + " at first connect");
								socket.emit('firstConnectRes', result);
							});
						});
					} else {
						tLParams.newSituation = updateDriverCurrentSituationParams.SituationId;
						tLParams.description = "Driver first connect error.error was:"+JSON.stringify(result);
						repository.user.setTripLog(tLParams, function (tLResult) {});
						socket.emit('firstConnectRes', result);
					}
				});
			} else {
				tLParams.newSituation = updateDriverCurrentSituationParams.SituationId;
				tLParams.description = "Driver first connect error.update driver current situation had error.error was:"+JSON.stringify(situationResult);
				repository.user.setTripLog(tLParams, function (tLResult) {});
				socket.emit('firstConnectRes', situationResult);
			}
		});
	})
}