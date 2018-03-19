module.exports = function(redisClient, namespaceKey, socket, dbConnection, appConfig,io) {
	socket.on('arrivalToPassenger',function(params) {
		var ioPassengerApp = io.of('/backend_passengerApp');
		var lib = require('../../../include/lib');
		var repo = require('../../../include/repo');
		var repository = new repo();
		redisClient.set(params.UserId,socket.id,function(){
			redisClient.set(socket.id,params.UserId,function(){
				console.log("socket saved for user id "+params.UserId);
			});
		});
		var tLParams = {};
		tLParams.userId = params.UserId;
		tLParams.tripId = params.TripId;
		var UDCSParams = {};
		UDCSParams.DriverId = params.UserId;
		UDCSParams.SituationId = lib.Constants.setConstant("serviceProviderCurrentSituationWaitingForPassenger");
		repository.user.updateDriverCurrentSituation(UDCSParams,function(DSituationResult) {
			repository.trip.arrivalToPassenger(params, function (res) {
				if (res.Result) {
					var UPCSParams = {};
					UPCSParams.PassengerId = res.Data[0].passenger_user_id;
					UPCSParams.SituationId = lib.Constants.setConstant("customerCurrentSituationOnDriverWay");
					repository.user.updatePassengerCurrentSituation(UPCSParams,function(PSituationResult) {
						redisClient.get(res.Data[0].passenger_user_id, function (error, result) {
							if (error) {
								tLParams.newSituation = UDCSParams.SituationId;
								tLParams.description = "Driver arrival to passenger,but passenger socket id not found,error was: "+JSON.stringify(error);
								repository.user.setTripLog(tLParams,function(tLResult) {});
								console.log('error', error);
							}
							if (result) {
								var socketId = result;
								if (ioPassengerApp.sockets[socketId]) {
									tLParams.newSituation = UDCSParams.SituationId;
									tLParams.description = "Driver arrival to passenger";
									repository.user.setTripLog(tLParams,function(tLResult) {});
									ioPassengerApp.sockets[socketId].emit('driverArrival', res);
								} else {
									tLParams.newSituation = UDCSParams.SituationId;
									tLParams.description = "Driver arrival to passenger and passenger socket id found, but passenger not online, error was: "+JSON.stringify(error);
									repository.user.setTripLog(tLParams,function(tLResult) {});
									console.log(res.Data[0].passenger_user_id + " not online!!");
								}
							} else {
								tLParams.newSituation = UDCSParams.SituationId;
								tLParams.description = "Driver arrival to passenger and passenger socket id not found, but no error!!";
								repository.user.setTripLog(tLParams,function(tLResult) {});
								console.log(res.Data[0].passenger_user_id + " socketId not found on redis!!");
							}
						});
						socket.emit('arrivalToPassengerRes', {Result: true});
					});
				} else {
					tLParams.newSituation = UDCSParams.SituationId;
					tLParams.description = "Driver arrival has error! error was:"+JSON.stringify(res);
					repository.user.setTripLog(tLParams,function(tLResult) {});
					console.log(res);
				}
			});
		});
	});
}