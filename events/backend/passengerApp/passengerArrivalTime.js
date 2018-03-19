module.exports = function(redisClient, namespaceKey, socket, dbConnection, appConfig,io) {
	socket.on('passengerArrivalTime',function(params) {
		var ioDriverApp = io.of('/backend_driverApp');
		var lib = require('../../../include/lib');
		var repo = require('../../../include/repo');
		var repository = new repo();
		redisClient.set(params.UserId,socket.id,function(){
			redisClient.set(socket.id, params.UserId, function () {
				console.log("socket saved for user id "+params.UserId);
			});
		});
		lib.dbConnection.Trip.find({where:{id: params.TripId}}).success(function (trip) {
			if(trip.trip_situation_id<parseInt(lib.Constants.setConstant("tripSituationOnTrip"))) {
				var tLParams = {};
				tLParams.userId = params.UserId;
				tLParams.tripId = params.TripId;
				var UPCSParams = {};
				UPCSParams.PassengerId = params.UserId;
				UPCSParams.SituationId = lib.Constants.setConstant("customerCurrentSituationOnDriverWay");
				repository.user.updatePassengerCurrentSituation(UPCSParams, function (PSituationResult) {
					repository.trip.passengerArrivalTime(params, function (res) {
						if (res.Result) {
							var UDCSParams = {};
							UDCSParams.DriverId = res.Data[0].driver_user_id;
							UDCSParams.SituationId = lib.Constants.setConstant("serviceProviderCurrentSituationWaitingForPassenger");
							repository.user.updateDriverCurrentSituation(UDCSParams, function (DSituationResult) {
								redisClient.get(res.Data[0].driver_user_id, function (error, result) {
									if (error) {
										tLParams.newSituation = UPCSParams.SituationId;
										tLParams.description = "passenger arrival,but driver socket id not found,error was: " + JSON.stringify(error);
										repository.user.setTripLog(tLParams, function (tLResult) {});
										console.log('error', error);
									}
									if (result) {
										var socketId = result;
										if (ioDriverApp.sockets[socketId]) {
											tLParams.newSituation = UPCSParams.SituationId;
											tLParams.description = "passenger arrival";
											repository.user.setTripLog(tLParams, function (tLResult) {
											});
											var returnParams = res;
											returnParams.arrival = params.Arrival;
											ioDriverApp.sockets[socketId].emit('passengerArrivalTime', returnParams);
											socket.emit('passengerArrivalTimeRes', {Result: true});
										} else {
											tLParams.newSituation = UPCSParams.SituationId;
											tLParams.description = "passenger arrival and driver socket id found, but driver not online, error was: " + JSON.stringify(error);
											repository.user.setTripLog(tLParams, function (tLResult) {
											});
											console.log(res.Data[0].driver_user_id + " not online!!");
										}
									} else {
										tLParams.newSituation = UPCSParams.SituationId;
										tLParams.description = "passenger arrival has error! error was:" + JSON.stringify(res);
										repository.user.setTripLog(tLParams, function (tLResult) {
										});
										console.log(res.Data[0].driver_user_id + " socketId not found on redis!!");
									}
								});
							});
						} else {
							tLParams.newSituation = UPCSParams.SituationId;
							tLParams.description = "passenger arrival has error! error was:" + JSON.stringify(res);
							repository.user.setTripLog(tLParams, function (tLResult) {
							});
							console.log(res);
						}
					});
				});
			} else {
				socket.emit('passengerArrivalTimeRes', {Result: true});
			}
		});
	});
}