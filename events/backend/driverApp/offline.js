module.exports = function(redisClient, namespaceKey, socket, dbConnection, appConfig,io) {
	socket.on('offline',function(params) {
		var lib = require('../../../include/lib');
		var repo = require('../../../include/repo');
		var repository = new repo();
		redisClient.del(params.UserId,function(){
			redisClient.set(socket.id, params.UserId, function () {
				console.log("socket saved for user id "+params.UserId);
			});
		});
		repository.drivers.setDriverOffline(params, function (res) {
			var tLParams = {};
			tLParams.userId = params.UserId;
			tLParams.tripId = null;
			tLParams.newSituation = lib.Constants.setConstant("serviceProviderCurrentSituationOffline");
			tLParams.description = "Driver offline";
			repository.user.setTripLog(tLParams,function(tLResult) {});
			socket.emit('offlineRes', res);
		});
	});
}