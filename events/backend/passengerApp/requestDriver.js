module.exports = function(redisClient, namespaceKey, socket, dbConnection, appConfig,io) {
	/*socket.on('requestDriver',function(params){
		var ioDriverApp = io.of('/backend_driverApp');
		// var NanoTimer = require('nanotimer');
		// var timer = new NanoTimer();
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
					if(res.drivers.length) {
						redisClient.set("trip_" + res.trip.id, 0, function () {
							tLParams.tripId = res.trip.id;
							tLParams.newSituation = UPCSParams.SituationId;
							tLParams.description = "passenger request driver and trip saved to redis.res was: "+JSON.stringify(res);
							repository.user.setTripLog(tLParams,function(tLResult) {});
							console.log("trip " + res.trip.id + " Saved To Redis!");
                            var passengerRequestDriverResReturnParams = JSON.parse(JSON.stringify(res.trip));
                            passengerRequestDriverResReturnParams.balance = res.passenger.balance;
                            socket.emit('requestDriverRes', { Result: true, Data: [passengerRequestDriverResReturnParams] });
                            var socketIds = [];
                            lib.async.forEach(res.drivers,function (driver,cb) {
	                            var driverId = driver.driverId;
	                            lib.dbConnection.ServiceProviderProfile.find({where: {user_id: driverId}}).success(function (driverUser) {
		                            if (driverUser.current_situation_id == lib.Constants.setConstant("serviceProviderCurrentSituationOnline")) {
			                            var UDCSParams = {};
			                            UDCSParams.DriverId = driverId;
			                            UDCSParams.SituationId = lib.Constants.setConstant("serviceProviderCurrentSituationHasRequest");
			                            repository.user.updateDriverCurrentSituation(UDCSParams, function (DSituationResult) {
				                            redisClient.get(driverId, function (error, result) {
					                            if (error) {
						                            tLParams.tripId = res.trip.id;
						                            tLParams.newSituation = UPCSParams.SituationId;
						                            tLParams.description = "passenger request driver but driver socket id not found,error was: " + JSON.stringify(error);
						                            repository.user.setTripLog(tLParams, function (tLResult) {
						                            });
						                            console.log('error', error);
					                            }
					                            if (result) {
						                            socketIds.push({socketId: result, driverId: driverId});
						                            cb();
					                            }
				                            });
			                            });
		                            } else {
			                            tLParams.newSituation = null;
			                            tLParams.description = "passenger request driver,but driverUser "+driverId+" current_situation_id is not online.his current_situation_id was: "+driverUser.current_situation_id;
			                            repository.user.setTripLog(tLParams,function(tLResult) {});
			                            console.log("passenger request driver,but driverUser "+driverId+" current_situation_id is not online.his current_situation_id was: "+driverUser.current_situation_id);
		                            }
	                            }).error(function (error) {
		                            tLParams.newSituation = null;
		                            tLParams.description = "passenger request driver,but ServiceProviderProfile query has error ,error was: "+JSON.stringify(error);
		                            repository.user.setTripLog(tLParams,function(tLResult) {});
		                            console.log("an error accord: ", error);
		                            socket.emit('requestDriverRes', lib.errorCodes.setError('dbError'));
	                            });
                            },function (loopError) {
                                if(loopError) return next(loopError);
	                            socketIds.forEach(function (socketId) {
		                            if (ioDriverApp.sockets[socketId.socketId]) {
			                            tLParams.tripId = res.trip.id;
			                            tLParams.newSituation = UPCSParams.SituationId;
			                            tLParams.description = "trip request driver send to "+socketId.driverId;
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
			                            ioDriverApp.sockets[socketId.socketId].emit('newTrip', {Result: true, Data: [returnData]});
		                            } else {
			                            tLParams.tripId = res.trip.id;
			                            tLParams.newSituation = UPCSParams.SituationId;
			                            tLParams.description = "trip request not send to "+socketId.driverId+" because driver not online";
			                            repository.user.setTripLog(tLParams,function(tLResult) {});
			                            var UDCSParams = {};
			                            UDCSParams.DriverId = socketId.driverId;
			                            UDCSParams.SituationId = lib.Constants.setConstant("serviceProviderCurrentSituationOffline");
			                            repository.user.updateDriverCurrentSituation(UDCSParams, function (DSituationResult) {
				                            console.log(socketId.driverId + " not online!!");
			                            });
		                            }
	                            });
                            });
                            setTimeout(function () {
	                            redisClient.get("trip_" + res.trip.id, function (error, tripSituation) {
		                            if (tripSituation == 0) {
			                            socket.emit('requestDriverRes', lib.errorCodes.setError('noDriverAcceptRequest'));
		                            }
	                            });
                            },15000);
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
	});*/
}