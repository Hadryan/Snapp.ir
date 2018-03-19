module.exports = function(redisClient, namespaceKey, socket, dbConnection, appConfig,io) {
	socket.on('acceptTrip',function(params) {
		var ioPassengerApp = io.of('/backend_passengerApp');
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
		var nowDriver = 'nowDriver_'+ params.TripId;
		redisClient.get(nowDriver,function(err,presentDriver){
			if(err) console.log(err);
			if(presentDriver == params.UserId){
				redisClient.get("trip_" + params.TripId, function (error, tripSituation) {
					if (tripSituation == 1) {
						UDCSParams.SituationId = lib.Constants.setConstant("serviceProviderCurrentSituationOnline");
						repository.user.updateDriverCurrentSituation(UDCSParams,function(DSituationResult) {
							tLParams.newSituation = UDCSParams.SituationId;
							tLParams.description = "Driver accept trip,but trip accepted before!";
							repository.user.setTripLog(tLParams,function(tLResult) {});
							console.log("trip " + params.TripId + " accepted before!")
							socket.emit('acceptTripRes', lib.errorCodes.setError('tripAcceptedOrCanceledBefore'));
						});
					} else if (tripSituation == 2) {
						UDCSParams.SituationId = lib.Constants.setConstant("serviceProviderCurrentSituationOnline");
						repository.user.updateDriverCurrentSituation(UDCSParams,function(DSituationResult) {
							tLParams.newSituation = UDCSParams.SituationId;
							tLParams.description = "Driver accept trip,but trip canceled by passenger!";
							repository.user.setTripLog(tLParams,function(tLResult) {});
							console.log("trip " + params.TripId + " canceled By Passenger!")
							socket.emit('acceptTripRes', lib.errorCodes.setError('tripAcceptedOrCanceledBefore'));
						});
					} else {
						redisClient.set("trip_"+params.TripId,1,function() {
							console.log("trip "+params.TripId+" in redis updated.(Started)")
						});
						UDCSParams.SituationId = lib.Constants.setConstant("serviceProviderCurrentSituationOnPassengerWay");
						repository.user.updateDriverCurrentSituation(UDCSParams,function(DSituationResult) {
							repository.trip.acceptTrip(params, function (res) {
								if (res.Result) {
									tLParams.newSituation = UDCSParams.SituationId;
									tLParams.description = "Driver accept trip";
									repository.user.setTripLog(tLParams,function(tLResult) {});
									var UPCSParams = {};
									UPCSParams.PassengerId = res.Data[0].passengerId;
									UPCSParams.SituationId = lib.Constants.setConstant("customerCurrentSituationWaitingForDriver");
									repository.user.updatePassengerCurrentSituation(UPCSParams,function(PSituationResult) {
										redisClient.get(res.Data[0].passengerId, function (error, result) {
											if (error) {
												console.log('error', error);
											}
											if (result) {
												var socketId = result;
												if (ioPassengerApp.sockets[socketId]) {
													ioPassengerApp.sockets[socketId].emit('tripAccepted', res);
													socket.emit('acceptTripRes', {Result: true});
												} else {
													var cancellTripParams = {
														DeviceId: params.DeviceId,
														UserId: res.Data[0].passengerId,
														TripId: params.TripId,
													};
													repository.trip.cancelTrip(cancellTripParams, function (resss) {
														console.log('trip canceled because passenger not online',resss);
													});
													socket.emit('acceptTripRes', lib.errorCodes.setError('passengerNoLongerOnline'));
													console.log(res.passengerId + " not online!!");
												}
											} else {
												var cancellTripParams = {
													DeviceId: params.DeviceId,
													UserId: res.Data[0].passengerId,
													TripId: res.trip.id,
												};
												repository.trip.cancelTrip(cancellTripParams, function (resss) {
													console.log('trip canceled because passenger not online',resss);
												});
												socket.emit('acceptTripRes', lib.errorCodes.setError('passengerNoLongerOnline'));
												console.log(res.passengerId + " socketId not found on redis!!");
											}
										});
									});
								} else {
									tLParams.newSituation = UDCSParams.SituationId;
									tLParams.description = "Driver accept trip,but trip acception has error! error was:"+JSON.stringify(res);
									repository.user.setTripLog(tLParams,function(tLResult) {});
									console.log(res);
								}
							});
						});
					}
				});
			}
			else {
				socket.emit('acceptTripRes', lib.errorCodes.setError('AcceptingTripOutOfTime'));
			}
		});
		
	});
}