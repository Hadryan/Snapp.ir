module.exports = function(redisClient, namespaceKey, socket, dbConnection, appConfig,io) {
	socket.on('cancelTrip',function(params) {
		var ioDriverApp = io.of('/backend_driverApp');
		var lib = require('../../../include/lib');
		var repo = require('../../../include/repo');
		var repository = new repo();
		var validateParams = {"params": params, "requireParams": ['DeviceId', 'UserId', 'TripId']};
		var tLParams = {};
		tLParams.userId = params.UserId;
		tLParams.tripId = params.TripId;
		repository.validate.validate(validateParams, function (validationResult) {
			if (validationResult.Result) {
				redisClient.set(params.UserId, socket.id, function () {
					redisClient.set(socket.id,params.UserId,function(){
						console.log("socket saved for user id " + params.UserId);
					});
				});
				var UPCSParams = {};
				UPCSParams.PassengerId = params.UserId;
				UPCSParams.SituationId = lib.Constants.setConstant("customerCurrentSituationDetermineSourceAndDestination");
				repository.user.updatePassengerCurrentSituation(UPCSParams, function (PSituationResult) {
					var userParams = params;
					userParams.checkCustomer = true;
					userParams.include = [{
						model: lib.dbConnection.CustomerProfile,
						attributes: ["sum_trip_canceled"]
					}];
					repository.user.checkUserId(userParams, function (user) {
						if (user.Result) {
							user.data.customerProfile.sum_trip_canceled++;
							user.data.customerProfile.save({fields: ["sum_trip_canceled"]}).success(function (newPassenger) {
								redisClient.get("trip_" + params.TripId, function (error, tripSituation) {
									if (tripSituation != 2) {
										redisClient.set("trip_" + params.TripId, 2, function () {
											console.log("trip " + params.TripId + " Saved To Redis!(Cancel)");
											repository.trip.cancelTrip(params, function (res) {
												if (res.Result) {
													tLParams.newSituation = UPCSParams.SituationId;
													tLParams.description = "passenger cancel trip";
													repository.user.setTripLog(tLParams,function(tLResult) {});
													socket.emit('cancelTripRes', {Result: true});
													console.log('res',res);
													if (res.lastSituationId > parseInt(lib.Constants.setConstant("tripSituationLookingForDriver"))) {
														redisClient.get(res.DriverUserId, function (error, result) {
															if (error) {
																tLParams.newSituation = UPCSParams.SituationId;
																tLParams.description = "passenger cancell trip,but driver socket id not found,error was: " + JSON.stringify(error);
																repository.user.setTripLog(tLParams, function (tLResult) {
																});
																console.log('error', error);
															}
															if (result) {
																if(ioDriverApp.sockets[result]) {
																	ioDriverApp.sockets[result].emit('cancelTrip', {Result: true});
																} else {
																	tLParams.newSituation = UPCSParams.SituationId;
																	tLParams.description = "passenger cancel trip and driver socket id found but ioDriverApp.sockets[result] is undefined";
																	repository.user.setTripLog(tLParams, function (tLResult) {});
																	console.log('error', error);
																}
															}
														});
													}
												} else {
													tLParams.newSituation = UPCSParams.SituationId;
													tLParams.description = "passenger cancel trip,but trip cancellation has error: "+JSON.stringify(res);
													repository.user.setTripLog(tLParams,function(tLResult) {});
													socket.emit('cancelTripRes', res);
													console.log(res);
												}
											});
										});
									} else {
										tLParams.newSituation = UPCSParams.SituationId;
										tLParams.description = "passenger cancel trip,but trip canceled or accepted before";
										repository.user.setTripLog(tLParams,function(tLResult) {});
										socket.emit('cancelTripRes', lib.errorCodes.setError('tripAcceptedOrCanceledBefore'));
									}
								});
							}).error(function (error) {
								tLParams.newSituation = UPCSParams.SituationId;
								tLParams.description = "passenger cancel trip has error: "+JSON.stringify(error);
								repository.user.setTripLog(tLParams,function(tLResult) {});
								console.log("an error accord: ", error);
								socket.emit('cancelTripRes', lib.errorCodes.setError('dbError'));
							});
						} else {
							tLParams.newSituation = UPCSParams.SituationId;
							tLParams.description = "passenger cancel trip has error: "+JSON.stringify(user);
							repository.user.setTripLog(tLParams,function(tLResult) {});
							socket.emit('cancelTripRes', user);
						}
					});
				});
			} else {
				tLParams.newSituation = null;
				tLParams.description = "passenger cancel trip has error: "+JSON.stringify(error);
				repository.user.setTripLog(tLParams,function(tLResult) {});
				socket.emit('cancelTripRes', validationResult);
			}
		});
	});
}