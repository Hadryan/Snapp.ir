module.exports = function(redisClient, namespaceKey, socket, dbConnection, appConfig,io) {
	socket.on('firstConnect',function(params){
		var lib = require('../../../include/lib');
		var repo = require('../../../include/repo');
		var repository = new repo();
		redisClient.set(params.UserId,socket.id,function(){
			redisClient.set(socket.id,params.UserId,function(){
				console.log("passenger socket saved for user id "+params.UserId);
			});
		});
		var tLParams = {};
		tLParams.userId = params.UserId;
		tLParams.tripId = null;
		var UPCSParams = {};
		UPCSParams.PassengerId = params.UserId;
		UPCSParams.SituationId = lib.Constants.setConstant("customerCurrentSituationDetermineSourceAndDestination");
		repository.user.updatePassengerCurrentSituation(UPCSParams,function(PSituationResult) {
			repository.drivers.allDrivers(params, function (result) {
				tLParams.newSituation = UPCSParams.SituationId;
				tLParams.description = "passenger first connect";
				repository.user.setTripLog(tLParams,function(tLResult) {});
				socket.emit('firstConnectRes', result);
			});
		});
	})
}