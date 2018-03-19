module.exports = function(redisClient, namespaceKey, socket, dbConnection, appConfig,io) {
	socket.on('requestDriver',function(params){
		var ioDriverApp = io.of('/backend_driverApp');
		var NanoTimer = require('nanotimer');
		var timer = new NanoTimer();
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
		tLParams.tripId = null;
		var UPCSParams = {};
		UPCSParams.PassengerId = params.UserId;
		UPCSParams.SituationId = lib.Constants.setConstant("customerCurrentSituationWaitingToFindDriver");
		repository.user.updatePassengerCurrentSituation(UPCSParams,function(PSituationResult) {
			repository.drivers.findDriver(params, function (res) {
				if (res.Result) {
					var driversList = [];
					var idcheck = false;
					for(var i in res.drivers){
						if( idcheck !== res.drivers[i].driverId || !idcheck ){
							driversList.push(res.drivers[i]);
							idcheck = res.drivers[i].driverId;
						}
					}
					if(driversList.length) {
						redisClient.set("trip_" + res.trip.id, 0, function () {
							tLParams.tripId = res.trip.id;
							tLParams.newSituation = UPCSParams.SituationId;
							tLParams.description = "passenger request driver and trip saved to redis.res was: "+JSON.stringify(res);
							repository.user.setTripLog(tLParams,function(tLResult) {});
							console.log("trip " + res.trip.id + " Saved To Redis!");
							var i = 0;
							var j = 0;
                            var passengerRequestDriverResReturnParams = JSON.parse(JSON.stringify(res.trip));
                            passengerRequestDriverResReturnParams.balance = res.passenger.balance;
                            socket.emit('requestDriverRes', { Result: true, Data: [passengerRequestDriverResReturnParams] });
							findDriver();
							timer.setInterval(findDriver, '', '16s');
							function findDriver() {
								redisClient.get("trip_" + res.trip.id, function (error, tripSituation) {
									if (tripSituation == 1) {
										tLParams.tripId = res.trip.id;
										tLParams.newSituation = UPCSParams.SituationId;
										tLParams.description = "passenger request driver but trip accepted before";
										repository.user.setTripLog(tLParams,function(tLResult) {});
										console.log("trip " + res.trip.id + " updated before!")
										timer.clearInterval();
									} else if (tripSituation == 2) {
										tLParams.tripId = res.trip.id;
										tLParams.newSituation = UPCSParams.SituationId;
										tLParams.description = "passenger request driver but trip canceled before by passenger";
										repository.user.setTripLog(tLParams,function(tLResult) {});
										console.log("trip " + res.trip.id + " canceled By Passenger!")
										timer.clearInterval();
									} else {
										if (i == driversList.length) {
											repository.trip.cancelTrip({TripId: res.trip.id}, function (resss) {
												tLParams.tripId = res.trip.id;
												tLParams.newSituation = UPCSParams.SituationId;
												tLParams.description = "passenger request driver but no driver accept trip and trip cancelled";
												repository.user.setTripLog(tLParams,function(tLResult) {});
												console.log('trip canceled because no driver accepted!',resss);
											});
											console.log("noDriverAcceptRequest");
											socket.emit('requestDriverRes', lib.errorCodes.setError('noDriverAcceptRequest'));
											timer.clearInterval();
										} else {
											var driverId = driversList[i].driverId;
											lib.dbConnection.ServiceProviderProfile.find({where: {user_id: driverId}}).success(function (driverUser) {
												if (driverUser.current_situation_id == lib.Constants.setConstant("serviceProviderCurrentSituationOnline")) {
													redisClient.get(driverId, function (error, result) {
														if (error) {
															tLParams.tripId = res.trip.id;
															tLParams.newSituation = UPCSParams.SituationId;
															tLParams.description = "passenger request driver but driver socket id not found,error was: "+JSON.stringify(error);
															repository.user.setTripLog(tLParams,function(tLResult) {});
															console.log('error', error);
															timer.clearInterval();
															timer.setInterval(findDriver, '', '15s');
														}
														if (result) {
															var socketId = result;
															if (ioDriverApp.sockets[socketId]) {
																var UDCSParams = {};
																UDCSParams.DriverId = driverId;
																UDCSParams.SituationId = lib.Constants.setConstant("serviceProviderCurrentSituationHasRequest");
																repository.user.updateDriverCurrentSituation(UDCSParams, function (DSituationResult) {
																	tLParams.tripId = res.trip.id;
																	tLParams.newSituation = UPCSParams.SituationId;
																	tLParams.description = "trip request driver send to "+driverId;
																	repository.user.setTripLog(tLParams,function(tLResult) {});
																	var returnData = {
																		TripId: res.trip.id,
																		PassengerLat: params.PassengerLat,
																		PassengerLong: params.PassengerLong,
																		PassengerLabel: params.PassengerLabel,
																		SourceLat: params.SourceLat,
																		SourceLong: params.SourceLong,
																		SourceLabel: params.SourceLabel,
                                                                        SourceDescription: params.SourceDescription,
																		DestinationLat: res.tripDestination.geographical_lat,
																		DestinationLong: res.tripDestination.geographical_long,
																		DestinationLabel: res.tripDestination.destination_label,
																		DestinationDescription: res.tripDestination.destination_description,
																		TripPrice: params.TripPrice,
																		PassengerId: res.passenger.id,
																		passengerFullName: res.passenger.fullName,
																		passengerGenderId: res.passenger.genderId,
																		passengerMobile: res.passenger.mobile,
																	};
																	var nowdriver = 'nowDriver_'+ res.trip.id;
																	redisClient.set(nowdriver,driverId);
																	ioDriverApp.sockets[socketId].emit('newTrip', {Result: true, Data: [returnData]});
																});
															} else {
																tLParams.tripId = res.trip.id;
																tLParams.newSituation = UPCSParams.SituationId;
																tLParams.description = "trip request not send to "+driverId+" because driver not online";
																repository.user.setTripLog(tLParams,function(tLResult) {});
																var UDCSParams = {};
                                                                console.log('i before',i);
                                                                UDCSParams.DriverId = driverId;
                                                                UDCSParams.SituationId = lib.Constants.setConstant("serviceProviderCurrentSituationOffline");
                                                                repository.user.updateDriverCurrentSituation(UDCSParams, function (DSituationResult) {
                                                                    console.log('i after',i);
                                                                    console.log(driverId + " not online!!");
	                                                                timer.clearInterval();
	                                                                timer.setInterval(findDriver, '', '15s');
                                                                });
                                                            }
														}
														i++;
													});
												} else {
													tLParams.newSituation = null;
													tLParams.description = "passenger request driver,but driverUser "+driverId+" current_situation_id is not online.his current_situation_id was: "+driverUser.current_situation_id;
													repository.user.setTripLog(tLParams,function(tLResult) {});
													console.log("an error accord: ", error);
													// socket.emit('requestDriverRes', lib.errorCodes.setError('driverIsNotOnline'));
													i++;
													timer.clearInterval();
													timer.setInterval(findDriver, '', '15s');
												}
											}).error(function (error) {
												tLParams.newSituation = null;
												tLParams.description = "passenger request driver,but ServiceProviderProfile query has error ,error was: "+JSON.stringify(error);
												repository.user.setTripLog(tLParams,function(tLResult) {});
												console.log("an error accord: ", error);
												socket.emit('requestDriverRes', lib.errorCodes.setError('dbError'));
											});
										}
									}
								});
							}
						});
					} else {
						tLParams.tripId = res.trip.id;
						tLParams.newSituation = UPCSParams.SituationId;
						tLParams.description = "passenger request driver,but no driver find";
						repository.user.setTripLog(tLParams,function(tLResult) {});
						socket.emit('requestDriverRes', lib.errorCodes.setError('noOnlineDriverFound'));
					}
				} else {
					tLParams.newSituation = null;
					tLParams.description = "passenger request driver,but find driver has error ,error was: "+JSON.stringify(res);
					repository.user.setTripLog(tLParams,function(tLResult) {});
					socket.emit('requestDriverRes', res);
				}
			});
		});
	});
}