var lib = require('../include/lib');
//******************SEPARATE******************
var setDiscountCodeForOwner = function (trip) {
	if (trip.discount_code_id) {
		lib.dbConnection.DiscountCode.find({where: {id: trip.discount_code_id}}).success(function (discountCode) {
			if (discountCode) {
				lib.dbConnection.DiscountCodeUsedLog.create({
					user_id: trip.passenger_user_id,
					discount_code_id: discountCode.id,
					trip_id: trip.id,
					discount_price: lib.Constants.setConstant("defaultDiscountAmount")
				}).success(function (discountCodeUsedLog) {
					lib.dbConnection.DiscountCodeAvailableForUser.create({
						user_id: discountCode.user_id,
						discount_code_used_id: discountCodeUsedLog.id,
						available_discount_price: lib.Constants.setConstant("defaultDiscountAmount"),
						used_flag: false
					}).success(function (discountCodeUsedLog) {
						console.log('setDiscountCodeForOwner successful');
					}).error(function (error) {
						discountCodeUsedLog.destroy();
						console.log('setDiscountCodeForOwner unsuccessful!!!');
					});
				}).error(function (error) {
					console.log('setDiscountCodeForOwner unsuccessful!!!');
				});
			}
		}).error(function (error) {
			console.log('setDiscountCodeForOwner unsuccessful!!!');
		});
	} else if (trip.discount_coupon_id) {
		lib.dbConnection.DiscountCoupon.find({where: {id: trip.discount_coupon_id}}).then(function (discountCoupon) {
			if (discountCoupon) {
				lib.dbConnection.DiscountCouponUsedLog.find({
					where: {
						couponId: discountCoupon.id,
						userId: trip.passenger_user_id
					}
				}).then(function (discountCouponUsedLog) {
					if (!discountCouponUsedLog) {
						lib.dbConnection.DiscountCouponUsedLog.create({
							couponId: discountCoupon.id,
							userId: trip.passenger_user_id,
							orderPrice: trip.main_price,
							discountPrice: trip.discount_price,
						}).then(function (discountCouponUsedLog) {
							console.log('setDiscountCodeForOwner successful');
						}).catch(function (error) {
							console.log("an error accord: ", error);
							callBack(lib.errorCodes.setError('dbError'));
						});
					}
				}).catch(function (error) {
					console.log("an error accord: ", error);
					callBack(lib.errorCodes.setError('dbError'));
				});
			}
		}).catch(function (error) {
			console.log("an error accord: ", error);
			callBack(lib.errorCodes.setError('dbError'));
		});
	}
};
//******************SEPARATE******************
/*var tripPrice = function(params, callBack){
 lib.dbConnection.TripPriceParameters.findAll({where:{flag_id:1}}).success(function (params) {
 var price;
 if (params.distance >= 20) {
 price = params.distance * 600;
 } else {
 price = (params.time * 400) + (params.distance - (((params.time * 2) / 3) * 100));
 if (price <= 2000) {
 price = 3500;
 } else if (price > 2000 && price <= 3000) {
 price = 4000;
 }
 }
 if(params.length!=0){
 for (var i in params){
 var amount = (price*params[i].change_amount)/100;
 if(params[i].parameter_type_id==lib.Constants.setConstant("TripPriceParameterIncrease")){
 price += amount;
 } else {
 price -= amount;
 }
 }
 }
 return price;
 }).error(function (error) {
 console.log("an error accord: ", error);
 callBack(lib.errorCodes.setError('dbError'));
 });
 }*/
//******************SEPARATE******************
exports.getTripIdByTripCode = function (params, callBack) {
	findParams = {where: {trip_code: params.TripCode}};
	if (params.include) {
		findParams.include = params.include;
	}
	if (params.attributes) {
		findParams.attributes = params.attributes;
	}
	lib.dbConnection.Trip.find(findParams).success(function (trip) {
		if (trip) {
			callBack({Result: true, data: trip});
		} else {
			callBack(lib.errorCodes.setError('notExistRecord'));
		}
	}).error(function (error) {
		console.log("an error accord: ", error);
		callBack(lib.errorCodes.setError('dbError'));
	});
};
//******************SEPARATE******************
exports.driverDayTripsInfo = function (params, callBack) {
	var repo = require('../include/repo');
	var repository = new repo();
	var validateParams = {"params": params, "requireParams": ['DeviceId', 'UserId', 'Date']};
	repository.validate.validate(validateParams, function (validationResult) {
		if (validationResult.Result) {
			params.checkServiceProvider = true;
			repository.user.checkUserId(params, function (result) {
				if (result.Result) {
					lib.dbConnection.PaymentPony.find({
						where: {user_id: params.UserId},
						attributes: ['createdAt'],
						order: 'createdAt DESC',
					}).success(function (pony) {
						lib.dbConnection.Trip.findAll({
							where: {
								driver_user_id: params.UserId,
								trip_situation_id: lib.Constants.setConstant("tripSituationTripDone"),
								start_time: {between: [params.Date.date + ' 00:00:00', params.Date.date + ' 23:59:59']}
							},
							include: [{
								model: lib.dbConnection.User,
								as: 'passengerUser',
								attributes: [],
								include: [{
									model: lib.dbConnection.CustomerProfile,
									attributes: [
										"full_name"
									],
									include: [{
										model: lib.dbConnection.UserGender,
										// where: {flag_id: 1},
										attributes: ["name"]
									}]
								}]
							}, {
								model: lib.dbConnection.TripDestination,
								/*attributes: [
								 "geographical_lat",
								 "geographical_long",
								 "destination_label",
								 ]*/
							}, {
								model: lib.dbConnection.TripType,
								// where: {flag_id: 1},
								attributes: ["name"]
							}, {
								model: lib.dbConnection.Payment,
								// where: {payment_situation_id: 2},
								attributes: [],
								include: [{
									model: lib.dbConnection.PaymentMethod,
									// where: {flag_id: 1},
									attributes: ["name"]
								}]
							}]
						}).success(function (trip) {
							var returnParams = [];
							console.log('trip.length', trip.length);
							if (trip.length) {
								for (var i in trip) {
									returnParams[i] = JSON.parse(JSON.stringify(trip[i]));
									returnParams[i].Start = Date.parse(trip[i].start_time);
									returnParams[i].End = Date.parse(trip[i].end_time);
									returnParams[i].TripCode = trip[i].trip_code;
									returnParams[i].SourceLat = trip[i].trip_source_geographical_lat;
									returnParams[i].SourceLong = trip[i].trip_source_geographical_long;
									returnParams[i].SourceLabel = trip[i].trip_source_label;
									returnParams[i].TripPrice = trip[i].net_price;
									returnParams[i].DriverSlice = trip[i].driver_slice;
									returnParams[i].HooberSlice = trip[i].system_slice;
									delete returnParams[i].trip_code;
									delete returnParams[i].trip_source_geographical_lat;
									delete returnParams[i].trip_source_geographical_long;
									delete returnParams[i].trip_source_label;
									delete returnParams[i].net_price;
									delete returnParams[i].driver_slice;
									delete returnParams[i].system_slice;
									delete returnParams[i].request_time;
									delete returnParams[i].driver_place_geographical_lat;
									delete returnParams[i].driver_place_geographical_long;
									delete returnParams[i].driver_place_label;
									delete returnParams[i].trip_source_description;
									delete returnParams[i].driver_user_id;
									delete returnParams[i].passenger_user_id;
									delete returnParams[i].trip_situation_id;
									delete returnParams[i].main_price;
									delete returnParams[i].discount_code_id;
									delete returnParams[i].payment_id;
									delete returnParams[i].payment_pony_id;
									delete returnParams[i].trip_type_id;
									delete returnParams[i].trip_millisecond;
									delete returnParams[i].start_time;
									delete returnParams[i].end_time;
								}
							}
							// console.log('returnParams',returnParams);
							callBack({Result: true, data: returnParams});
						}).error(function (error) {
							console.log("an error accord: ", error);
							callBack(lib.errorCodes.setError('dbError'));
						});
					}).error(function (error) {
						console.log("an error accord: ", error);
						callBack(lib.errorCodes.setError('dbError'));
					});
				} else {
					callBack(result);
				}
			});
		} else {
			callBack(validationResult);
		}
	});
};
//******************SEPARATE******************
exports.calculateTripPrice = function (params, callBack) {
	var repo = require('../include/repo');
	var repository = new repo();
	var validateParams = {"params": params, "requireParams": ['DeviceId', 'UserId', 'TripTime', 'TripDistance']};
	repository.validate.validate(validateParams, function (validationResult) {
		if (validationResult.Result) {
			params.checkCustomer = true;
			repository.user.checkUserId(params, function (userFlag) {
				if (userFlag.Result) {
					repository.payment.tripPrice({
						distance: params.TripDistance,
						time: params.TripTime
					}, function (Price) {
						if (Price.Result) {
							callBack({Result: true, Data: [{price: Price.price}]});
						} else {
							callBack(Price);
						}
					});
				} else {
					callBack(userFlag);
				}
			});
		} else {
			callBack(validationResult);
		}
	});
};
//******************SEPARATE******************
exports.checkTripIdByDriverAndPassenger = function (params, callBack) {
	lib.dbConnection.Trip.find({
		where: {
			id: params.TripId,
			passenger_user_id: params.PassengerId,
			driver_user_id: params.DriverId,
		}
	}).success(function (trip) {
		if (trip) {
			callBack({Result: true, data: trip});
		} else {
			callBack(lib.errorCodes.setError('notExistRecord'));
		}
	}).error(function (error) {
		console.log("an error accord: ", error);
		callBack(lib.errorCodes.setError('dbError'));
	});
};
//******************SEPARATE******************
exports.getPassengerTrips = function (params, callBack) {
	var repo = require('../include/repo');
	var repository = new repo();
	var validateParams = {"params": params, "requireParams": ['DeviceId', 'UserId']};
	repository.validate.validate(validateParams, function (validationResult) {
		if (validationResult.Result) {
			params.checkCustomer = true;
			params.include = [{
				model: lib.dbConnection.CustomerProfile,
				attributes: [
					'sum_trip_times',
					'sum_trip_counts',
					'sum_trip_distances',
					'sum_trip_canceled',
				]
			}];
			repository.user.checkUserId(params, function (user) {
				if (user.Result) {
					lib.dbConnection.Trip.findAll({
						where: {
							passenger_user_id: params.UserId,
							trip_situation_id: {in: [2, 3, 4, 5, 6]}
						},
						attributes: [
							['trip_source_geographical_lat', 'sourceLat'],
							['trip_source_geographical_long', 'sourceLong'],
							['trip_source_label', 'sourceLabel'],
							['net_price', 'price'],
							['trip_millisecond', 'date'],
							'trip_code',
							'id',
						],
						include: [{
							model: lib.dbConnection.TripDestination,
							attributes: ["geographical_lat", "geographical_long", "destination_label", "trip_situation_id"]
						}],
						order: "id DESC"
					}).success(function (trips) {
						var returnParams = {
							sumTripTimes: user.data.customerProfile.sum_trip_times,
							sumTripCounts: user.data.customerProfile.sum_trip_counts,
							sumTripDistances: user.data.customerProfile.sum_trip_distances,
							sumTripCanceled: user.data.customerProfile.sum_trip_canceled,
							trips: trips
						};
						callBack({Result: true, data: returnParams});
					}).error(function (error) {
						console.log("an error accord: ", error);
						callBack(lib.errorCodes.setError('dbError'));
					});
				} else {
					callBack(user);
				}
			});
		} else {
			callBack(validationResult);
		}
	});
};
//******************SEPARATE******************
exports.getPassengerTripInfo = function (params, callBack) {
	var repo = require('../include/repo');
	var repository = new repo();
	var validateParams = {"params": params, "requireParams": ['DeviceId', 'UserId', 'TripId']};
	repository.validate.validate(validateParams, function (validationResult) {
		if (validationResult.Result) {
			params.checkCustomer = true;
			repository.user.checkUserId(params, function (user) {
				if (user.Result) {
					lib.dbConnection.Trip.find({
						where: {id: params.TripId},
						attributes: [
							['trip_source_geographical_lat', 'sourceLat'],
							['trip_source_geographical_long', 'sourceLong'],
							['trip_source_label', 'sourceLabel'],
							['net_price', 'netPrice'],
							['main_price', 'mainPrice'],
							['trip_millisecond', 'date'],
							'trip_code',
							'id',
						],
						include: [{
							model: lib.dbConnection.User,
							as: "driverUser",
							include: [{
								model: lib.dbConnection.ServiceProviderProfile,
								attributes: ["first_name", "last_name", "gender_id"],
								include: [{
									model: lib.dbConnection.ServiceProviderSpecialInfo,
									attributes: ["vehicle_brand_id", "vehicle_model_id"],
									include: [{
										model: lib.dbConnection.VehicleBrand,
										attributes: ["name"]
									}, {
										model: lib.dbConnection.VehicleModel,
										attributes: ["name"]
									}]
								}, {
									model: lib.dbConnection.ServiceProviderDocument,
									attributes: ["user_pic"]
								}]
							}],
							attributes: ["id"]
						}, {
							model: lib.dbConnection.TripDriverRateLog,
							attributes: ["rate"]
						}]
					}).success(function (trip) {
						trip.driverUser.serviceProviderProfile.serviceProviderDocument.user_pic = "http://" + lib.config.production.host.domain + ":" + lib.config.production.host.port + "/" + trip.driverUser.serviceProviderProfile.serviceProviderDocument.user_pic;
						callBack({Result: true, data: trip});
					}).error(function (error) {
						console.log("an error accord: ", error);
						callBack(lib.errorCodes.setError('dbError'));
					});
				} else {
					callBack(user);
				}
			});
		} else {
			callBack(validationResult);
		}
	});
};
//******************SEPARATE******************
exports.insertTrip = function (params, callBack) {
	var createParams = {};
	createParams.trip_code = "HBR-" + (Date.parse(new Date()) / 1000);
	createParams.trip_type_id = lib.Constants.setConstant("tripTypeSingleDestination");
	createParams.request_time = new Date();
	createParams.trip_source_geographical_lat = params.SourceLat;
	createParams.trip_source_geographical_long = params.SourceLong;
	createParams.trip_source_label = params.SourceLabel;
	createParams.trip_source_description = params.SourceDescription;
	createParams.passenger_user_id = params.UserId;
	createParams.trip_situation_id = lib.Constants.setConstant("tripSituationLookingForDriver");
	createParams.main_price = params.TripPrice;
	createParams.net_price = params.TripPrice;
	createParams.discount_price = 0;
	if (params.discountCodeId) {
		if (params.DiscountFlag && params.DiscountFlag == 1) {
			createParams.discount_coupon_id = params.discountCodeId;
		} else {
			createParams.discount_code_id = params.discountCodeId;
		}
		createParams.net_price = params.TripNetPrice;
		createParams.discount_price = createParams.main_price - params.TripNetPrice;
	}
	lib.dbConnection.Setting.findAll({limit: 1}).success(function (setting) {
		setting = setting[0];
		var commissionSlice = createParams.main_price * setting.commission_amount / 100;
		var driverSlice = createParams.main_price - commissionSlice;
		createParams.driver_slice = driverSlice;
		createParams.system_slice = createParams.net_price - driverSlice;
		lib.dbConnection.Trip.create(createParams).success(function (trip) {
			lib.dbConnection.TripDestination.create({
				trip_id: trip.id,
				geographical_lat: params.DestinationLat,
				geographical_long: params.DestinationLong,
				destination_label: params.DestinationLabel,
				destination_description: params.DestinationDescription,
				payment_flag: lib.Constants.setConstant("tripUnPaid"),
				trip_situation_id: lib.Constants.setConstant("tripDestinationSituationNotStarted")
			}).success(function (tripDestination) {
				callBack({Result: true, data: trip, tripDestination: tripDestination});
			}).error(function (error) {
				trip.destroy();
				console.log("an error accord: ", error);
				callBack(lib.errorCodes.setError('dbError'));
			});
		}).error(function (error) {
			console.log("an error accord: ", error);
			callBack(lib.errorCodes.setError('dbError'));
		});
	}).error(function (error) {
		console.log("an error accord: ", error);
		callBack(lib.errorCodes.setError('dbError'));
	});
};
//******************SEPARATE******************
exports.setTripRejectionReason = function (params, callBack) {
	var repo = require('../include/repo');
	var repository = new repo();
	var validateParams = {"params": params, "requireParams": ['DeviceId', 'UserId', 'TripId', 'ReasonId']};
	repository.validate.validate(validateParams, function (validationResult) {
		if (validationResult.Result) {
			params.checkServiceProvider = true;
			repository.user.checkUserId(params, function (user) {
				if (user.Result) {
					var checkTripRejectReasonIdParams = {id: params.ReasonId};
					repository.tripRejectReason.checkTripRejectReasonId(checkTripRejectReasonIdParams, function (checkTripRejectReasonResult) {
						if (checkTripRejectReasonResult.Result) {
							var createParams = {
								driver_user_id: params.UserId,
								reject_reason_id: params.ReasonId,
								reject_description: params.Description
							};
							if (params.TripId != -1) {
								createParams.trip_id = params.TripId;
							}
							lib.dbConnection.TripRejected.create(createParams).success(function (trips) {
								var UDCSParams = {};
								UDCSParams.DriverId = params.UserId;
								UDCSParams.SituationId = lib.Constants.setConstant("serviceProviderCurrentSituationOnline");
								repository.user.updateDriverCurrentSituation(UDCSParams, function (DSituationResult) {
									callBack({Result: true, Data: []});
								});
							}).error(function (error) {
								console.log("an error accord: ", error);
								callBack(lib.errorCodes.setError('dbError'));
							});
						} else {
							callBack(checkTripRejectReasonResult);
						}
					});
				} else {
					callBack(user);
				}
			});
		} else {
			callBack(validationResult);
		}
	});
};
//******************SEPARATE******************
exports.acceptTrip = function (params, callBack) {
	var repo = require('../include/repo');
	var repository = new repo();
	var validateParams = {
		"params": params,
		"requireParams": ['DeviceId', 'UserId', 'TripId', 'DriverPlaceLat', 'DriverPlaceLong', 'DriverPlaceLabel']
	};
	lib.dbConnection.tripDriverAcceptedLogs.create({
		trip_id: params.TripId,
		driver_user_id: params.UserId,
		date: new Date()
	});
	repository.validate.validate(validateParams, function (validationResult) {
		if (validationResult.Result) {
			var userParams = params;
			userParams.checkServiceProvider = true;
			userParams.include = [{
				model: lib.dbConnection.ServiceProviderProfile,
				attributes: ["gender_id", "first_name", "last_name", "sum_trip_counts", "sum_rate", "rate_count"],
				include: [{
					model: lib.dbConnection.ServiceProviderSpecialInfo,
					attributes: ["vehicle_plaque_left", "vehicle_plaque_alphabet", "vehicle_plaque_right", "vehicle_plaque_iran"],
					include: [{
						model: lib.dbConnection.VehicleBrand,
						attributes: ["name"]
					}, {
						model: lib.dbConnection.VehicleModel,
						attributes: ["name"]
					}]
				}, {
					model: lib.dbConnection.ServiceProviderDocument,
					attributes: ["user_pic"]
				}]
			}];
			repository.user.checkUserId(userParams, function (user) {
				if (user.Result) {
					user.data.serviceProviderProfile.sum_trip_counts++;
					user.data.serviceProviderProfile.save({fields: ["sum_trip_counts"]}).success(function (driverProfile) {
						lib.dbConnection.Trip.find({
							where: {id: params.TripId},
							include: [lib.dbConnection.TripDestination]
						}).success(function (trip) {
							trip.driver_place_geographical_lat = params.DriverPlaceLat;
							trip.driver_place_geographical_long = params.DriverPlaceLong;
							trip.driver_place_label = params.DriverPlaceLabel;
							trip.driver_user_id = params.UserId;
							trip.trip_situation_id = lib.Constants.setConstant("tripSituationWaitingForDriver");
							trip.save({
								fields: [
									"driver_place_geographical_lat",
									"driver_place_geographical_long",
									"driver_place_label",
									"driver_user_id",
									"trip_situation_id",
								]
							}).success(function (newTrip) {
								trip.tripDestinations[0].trip_situation_id = lib.Constants.setConstant("tripDestinationSituationNotStarted");
								trip.tripDestinations[0].save({field: ["trip_situation_id"]}).success(function (tripDestination) {
									var returnParams = {};
									returnParams.driverUserId = user.data.id;
									returnParams.driverGenderId = driverProfile.gender_id;
									returnParams.driverFullName = driverProfile.first_name + ' ' + driverProfile.last_name;
									returnParams.vehiclePelaqueLeft = driverProfile.serviceProviderSpecialInfo.vehicle_plaque_left;
									returnParams.vehiclePelaqueAlphabet = driverProfile.serviceProviderSpecialInfo.vehicle_plaque_alphabet;
									returnParams.vehiclePelaqueRight = driverProfile.serviceProviderSpecialInfo.vehicle_plaque_right;
									returnParams.vehiclePelaqueIran = driverProfile.serviceProviderSpecialInfo.vehicle_plaque_iran;
									returnParams.vehicleBrand = driverProfile.serviceProviderSpecialInfo.vehicleBrand.name;
									returnParams.vehicleModel = driverProfile.serviceProviderSpecialInfo.vehicleModel.name;
									returnParams.driverPic = "http://" + lib.config.production.host.domain + ":" + lib.config.production.host.port + "/" + driverProfile.serviceProviderDocument.user_pic;
									returnParams.driverRate = driverProfile.rate_count ? (Math.floor((parseInt(driverProfile.sum_rate) / parseInt(driverProfile.rate_count)) * 100) / 100) : 0;
									returnParams.mobile = user.data.mobile;
									returnParams.passengerId = newTrip.passenger_user_id;
									returnParams.TripId = newTrip.id;
									returnParams.DriverPlaceLat = params.DriverPlaceLat;
									returnParams.DriverPlaceLong = params.DriverPlaceLong;
									returnParams.DriverPlaceLabel = params.DriverPlaceLabel;
									callBack({Result: true, Data: [returnParams]});
								}).error(function (error) {
									console.log("an error accord: ", error);
									callBack(lib.errorCodes.setError('dbError'));
								});
							}).error(function (error) {
								console.log("an error accord: ", error);
								callBack(lib.errorCodes.setError('dbError'));
							});
						}).error(function (error) {
							console.log("an error accord: ", error);
							callBack(lib.errorCodes.setError('dbError'));
						});
					}).error(function (error) {
						console.log("an error accord: ", error);
						callBack(lib.errorCodes.setError('dbError'));
					});
				} else {
					callBack(user);
				}
			});
		} else {
			callBack(validationResult);
		}
	});
};
//******************SEPARATE******************
exports.arrivalToPassenger = function (params, callBack) {
	var repo = require('../include/repo');
	var repository = new repo();
	var validateParams = {"params": params, "requireParams": ['DeviceId', 'UserId', 'TripId']};
	repository.validate.validate(validateParams, function (validationResult) {
		if (validationResult.Result) {
			var userParams = params;
			userParams.checkServiceProvider = true;
			repository.user.checkUserId(userParams, function (user) {
				if (user.Result) {
					lib.dbConnection.Trip.find({where: {id: params.TripId}}).success(function (trip) {
						trip.trip_situation_id = lib.Constants.setConstant("tripSituationWaitingForPassenger");
						trip.save({fields: ["trip_situation_id"]}).success(function (newTrip) {
							callBack({Result: true, Data: [newTrip]});
						}).error(function (error) {
							console.log("an error accord: ", error);
							callBack(lib.errorCodes.setError('dbError'));
						});
					}).error(function (error) {
						console.log("an error accord: ", error);
						callBack(lib.errorCodes.setError('dbError'));
					});
				} else {
					callBack(user);
				}
			});
		} else {
			callBack(validationResult);
		}
	});
};
//******************SEPARATE******************
exports.passengerArrivalTime = function (params, callBack) {
	var repo = require('../include/repo');
	var repository = new repo();
	var validateParams = {"params": params, "requireParams": ['DeviceId', 'UserId', 'TripId', 'Arrival']};
	repository.validate.validate(validateParams, function (validationResult) {
		if (validationResult.Result) {
			var userParams = params;
			userParams.checkCustomer = true;
			repository.user.checkUserId(userParams, function (user) {
				if (user.Result) {
					lib.dbConnection.Trip.find({where: {id: params.TripId}}).success(function (trip) {
						trip.trip_situation_id = lib.Constants.setConstant("tripSituationWaitingForPassenger");
						trip.save({fields: ["trip_situation_id"]}).success(function (newTrip) {
							var returnParams = JSON.parse(JSON.stringify(newTrip));
							returnParams.arrival = params.Arrival;
							callBack({Result: true, Data: [returnParams]});
						}).error(function (error) {
							console.log("an error accord: ", error);
							callBack(lib.errorCodes.setError('dbError'));
						});
					}).error(function (error) {
						console.log("an error accord: ", error);
						callBack(lib.errorCodes.setError('dbError'));
					});
				} else {
					callBack(user);
				}
			});
		} else {
			callBack(validationResult);
		}
	});
};
//******************SEPARATE******************
exports.startTrip = function (params, callBack) {
	var repo = require('../include/repo');
	var repository = new repo();
	var validateParams = {"params": params, "requireParams": ['DeviceId', 'UserId', 'TripId']};
	repository.validate.validate(validateParams, function (validationResult) {
		if (validationResult.Result) {
			var userParams = params;
			userParams.checkServiceProvider = true;
			repository.user.checkUserId(userParams, function (user) {
				if (user.Result) {
					lib.dbConnection.Trip.find({
						where: {id: params.TripId},
						include: [{
							model: lib.dbConnection.TripDestination
						}, {
							model: lib.dbConnection.User,
							as: "passengerUser",
							include: [{
								model: lib.dbConnection.CustomerProfile
							}]
						}]
					}).success(function (trip) {
						trip.trip_millisecond = Date.parse(new Date());
						trip.start_time = new Date();
						trip.trip_situation_id = lib.Constants.setConstant("tripSituationOnTrip");
						trip.save({fields: ["trip_millisecond", "start_time", "trip_situation_id"]}).success(function (newTrip) {
							if (trip.discount_code_id || trip.discount_coupon_id) {
								setDiscountCodeForOwner(newTrip);
							}
							trip.tripDestinations[0].trip_situation_id = lib.Constants.setConstant("tripDestinationSituationOnTrip");
							trip.tripDestinations[0].save({fields: ["trip_situation_id"]}).success(function (tripDestination) {
								trip.passengerUser.customerProfile.sum_trip_counts++;
								trip.passengerUser.customerProfile.save({fields: ["sum_trip_counts"]}).success(function (customer) {
									callBack({Result: true, Data: [newTrip]});
								}).error(function (error) {
									console.log("an error accord: ", error);
									callBack(lib.errorCodes.setError('dbError'));
								});
							}).error(function (error) {
								console.log("an error accord: ", error);
								callBack(lib.errorCodes.setError('dbError'));
							});
						}).error(function (error) {
							console.log("an error accord: ", error);
							callBack(lib.errorCodes.setError('dbError'));
						});
					}).error(function (error) {
						console.log("an error accord: ", error);
						callBack(lib.errorCodes.setError('dbError'));
					});
				} else {
					callBack(user);
				}
			});
		} else {
			callBack(validationResult);
		}
	});
};
//******************SEPARATE******************
exports.editDestination = function (params, callBack) {
	var repo = require('../include/repo');
	var repository = new repo();
	var validateParams = {
		"params": params,
		"requireParams": ['DeviceId', 'UserId', 'TripId', 'NewTripEditTime', 'NewTripEditDistance']
	};
	repository.validate.validate(validateParams, function (validationResult) {
		if (validationResult.Result) {
			var userParams = params;
			userParams.checkCustomer = true;
			repository.user.checkUserId(userParams, function (user) {
				if (user.Result) {
					lib.dbConnection.Trip.find({
						where: {id: params.TripId},
						include: [lib.dbConnection.DiscountCode]
					}).success(function (trip) {
						// repository.payment.tripPrice({distance: params.NewTripEditDistance, time: params.NewTripEditTime,editDestination: true}, function(newPrice) {
						repository.payment.tripPrice({
							distance: params.NewTripEditDistance,
							time: params.NewTripEditTime
						}, function (newPrice) {
							if (newPrice.Result) {
								newPrice = newPrice.price;
								var discountCodeParams = {};
								discountCodeParams.DeviceId = params.DeviceId;
								discountCodeParams.UserId = params.UserId;
								// discountCodeParams.TripPrice = parseInt(newPrice) + parseInt(trip.main_price);
								discountCodeParams.TripPrice = parseInt(newPrice);
								discountCodeParams.DiscountCode = (trip.discountCode ? trip.discountCode.discount_code : "");
								repository.discountCode.applyDiscountCode(discountCodeParams, function (res) {
									var returnParams = {};
									returnParams.oldPrice = trip.net_price;
									returnParams.editPrice = newPrice;
									returnParams.newMainPrice = parseInt(newPrice);
									// returnParams.newMainPrice = parseInt(newPrice) + parseInt(trip.main_price);
									if (res.Result) {
										returnParams.newNetPrice = res.Data[0].price;
									} else {
										returnParams.newNetPrice = parseInt(newPrice);
										// returnParams.newNetPrice = parseInt(newPrice) + parseInt(trip.main_price);
									}
									callBack({Result: true, Data: [returnParams]});
								});
							} else {
								callBack(newPrice);
							}
						});
					}).error(function (error) {
						console.log("an error accord: ", error);
						callBack(lib.errorCodes.setError('dbError'));
					});
				} else {
					callBack(user);
				}
			});
		} else {
			callBack(validationResult);
		}
	});
};
//******************SEPARATE******************
exports.addDestination = function (params, callBack) {
	var repo = require('../include/repo');
	var repository = new repo();
	var validateParams = {
		"params": params,
		"requireParams": ['DeviceId', 'UserId', 'TripId', 'NewTripAddTime', 'NewTripAddDistance']
	};
	repository.validate.validate(validateParams, function (validationResult) {
		if (validationResult.Result) {
			var userParams = params;
			userParams.checkCustomer = true;
			repository.user.checkUserId(userParams, function (user) {
				if (user.Result) {
					lib.dbConnection.Trip.find({
						where: {id: params.TripId},
						include: [lib.dbConnection.DiscountCode]
					}).success(function (trip) {
						repository.payment.tripPrice({
							distance: params.NewTripAddDistance,
							time: params.NewTripAddTime
						}, function (newPrice) {
							if (newPrice.Result) {
								newPrice = newPrice.price;
								var discountCodeParams = {};
								discountCodeParams.DeviceId = params.DeviceId;
								discountCodeParams.UserId = params.UserId;
								discountCodeParams.TripPrice = parseInt(newPrice) + parseInt(trip.main_price);
								discountCodeParams.DiscountCode = (trip.discountCode ? trip.discountCode.discount_code : "");
								repository.discountCode.applyDiscountCode(discountCodeParams, function (res) {
									var returnParams = {};
									returnParams.oldPrice = trip.net_price;
									returnParams.editPrice = newPrice;
									returnParams.newMainPrice = parseInt(newPrice) + parseInt(trip.main_price);
									if (res.Result) {
										returnParams.newNetPrice = res.Data[0].price;
									} else {
										returnParams.newNetPrice = parseInt(newPrice) + parseInt(trip.main_price);
									}
									callBack({Result: true, Data: [returnParams]});
								});
							} else {
								callBack(newPrice);
							}
						});
					}).error(function (error) {
						console.log("an error accord: ", error);
						callBack(lib.errorCodes.setError('dbError'));
					});
				} else {
					callBack(user);
				}
			});
		} else {
			callBack(validationResult);
		}
	});
};
//******************SEPARATE******************
exports.confirmEditDestination = function (params, callBack) {
	var repo = require('../include/repo');
	var repository = new repo();
	var validateParams = {
		"params": params,
		"requireParams": ['DeviceId', 'UserId', 'TripId', 'NewNetPrice', 'NewMainPrice', 'NewEditDestinationLat', 'NewEditDestinationLong', 'NewEditDestinationLabel']
	};
	repository.validate.validate(validateParams, function (validationResult) {
		if (validationResult.Result) {
			var userParams = params;
			userParams.checkCustomer = true;
			repository.user.checkUserId(userParams, function (user) {
				if (user.Result) {
					lib.dbConnection.Trip.find({
						where: {id: params.TripId},
						include: [{
							model: lib.dbConnection.TripDestination,
							where: {
								trip_situation_id: lib.Constants.setConstant("tripDestinationSituationOnTrip")
							},
						}, lib.dbConnection.DiscountCode]
					}).success(function (trip) {
						if (trip && trip.tripDestinations[0]) {
							var discountCodeParams = {};
							discountCodeParams.DeviceId = params.DeviceId;
							discountCodeParams.UserId = params.UserId;
							discountCodeParams.TripPrice = params.NewMainPrice;
							discountCodeParams.DiscountCode = (trip.discountCode ? trip.discountCode.discount_code : "");
							repository.discountCode.applyDiscountCode(discountCodeParams, function (res) {
								trip.trip_type_id = lib.Constants.setConstant("tripTypeDestinationChanged");
								trip.main_price = params.NewMainPrice;
								if (res.Result) {
									trip.net_price = res.Data[0].price;
								} else {
									trip.net_price = params.NewMainPrice;
								}
								lib.dbConnection.Setting.findAll({limit: 1}).success(function (setting) {
									setting = setting[0];
									var commissionSlice = trip.main_price * setting.commission_amount / 100;
									var driverSlice = trip.main_price - commissionSlice;
									trip.driver_slice = driverSlice;
									trip.system_slice = trip.net_price - driverSlice;
									trip.save({
										fields: ["trip_type_id", "main_price", "net_price", "driver_slice", "system_slice"]
									}).success(function (newTrip) {
										trip.tripDestinations[0].trip_situation_id = lib.Constants.setConstant("tripDestinationSituationEdited");
										trip.tripDestinations[0].save({fields: ["trip_situation_id"]}).success(function (tripOldDestination) {
											lib.dbConnection.TripDestination.create({
												trip_id: trip.id,
												geographical_lat: params.NewEditDestinationLat,
												geographical_long: params.NewEditDestinationLong,
												destination_label: params.NewEditDestinationLabel,
												destination_description: params.NewEditDestinationDescription,
												trip_time: params.NewEditDestinationTime,
												trip_distance: params.NewEditDestinationDistance,
												trip_situation_id: lib.Constants.setConstant("tripDestinationSituationOnTrip"),
											}).success(function (tripNewDestination) {
												var returnData = newTrip.dataValues;
												returnData.newDestination = tripNewDestination;
												callBack({Result: true, Data: [returnData]});
											}).error(function (error) {
												console.log("an error accord: ", error);
												callBack(lib.errorCodes.setError('dbError'));
											});
										}).error(function (error) {
											console.log("an error accord: ", error);
											callBack(lib.errorCodes.setError('dbError'));
										});
									}).error(function (error) {
										console.log("an error accord: ", error);
										callBack(lib.errorCodes.setError('dbError'));
									});
								}).error(function (error) {
									console.log("an error accord: ", error);
									callBack(lib.errorCodes.setError('dbError'));
								});
							});
						} else {
							callBack(lib.errorCodes.setError('activeDestinationNotFound'));
						}
					}).error(function (error) {
						console.log("an error accord: ", error);
						callBack(lib.errorCodes.setError('dbError'));
					});
				} else {
					callBack(user);
				}
			});
		} else {
			callBack(validationResult);
		}
	});
};
//******************SEPARATE******************
exports.confirmAddDestination = function (params, callBack) {
	var repo = require('../include/repo');
	var repository = new repo();
	var validateParams = {
		"params": params,
		"requireParams": ['DeviceId', 'UserId', 'TripId', 'NewNetPrice', 'NewMainPrice', 'NewAddDestinationLat', 'NewAddDestinationLong', 'NewAddDestinationLabel']
	};
	repository.validate.validate(validateParams, function (validationResult) {
		if (validationResult.Result) {
			var userParams = params;
			userParams.checkCustomer = true;
			repository.user.checkUserId(userParams, function (user) {
				if (user.Result) {
					lib.dbConnection.Trip.find({
						where: {id: params.TripId},
						include: [lib.dbConnection.DiscountCode]
					}).success(function (trip) {
						var discountCodeParams = {};
						discountCodeParams.DeviceId = params.DeviceId;
						discountCodeParams.UserId = params.UserId;
						discountCodeParams.TripPrice = params.NewMainPrice;
						discountCodeParams.DiscountCode = (trip.discountCode ? trip.discountCode.discount_code : "");
						repository.discountCode.applyDiscountCode(discountCodeParams, function (res) {
							trip.trip_type_id = lib.Constants.setConstant("tripTypeDoubleDestination");
							trip.main_price = params.NewMainPrice;
							if (res.Result) {
								trip.net_price = res.Data[0].price;
							} else {
								trip.net_price = params.NewMainPrice;
							}
							lib.dbConnection.Setting.findAll({limit: 1}).success(function (setting) {
								setting = setting[0];
								var commissionSlice = trip.main_price * setting.commission_amount / 100;
								var driverSlice = trip.main_price - commissionSlice;
								trip.driver_slice = driverSlice;
								trip.system_slice = trip.net_price - driverSlice;
								trip.save({
									fields: ["trip_type_id", "main_price", "net_price", "driver_slice", "system_slice"]
								}).success(function (newTrip) {
									lib.dbConnection.TripDestination.create({
										trip_id: trip.id,
										geographical_lat: params.NewAddDestinationLat,
										geographical_long: params.NewAddDestinationLong,
										destination_label: params.NewAddDestinationLabel,
										destination_description: params.NewAddDestinationDescription,
										trip_time: params.NewAddDestinationTime,
										trip_distance: params.NewAddDestinationDistance,
										trip_situation_id: lib.Constants.setConstant("tripDestinationSituationNotStarted"),
									}).success(function (tripNewDestination) {
										var returnData = newTrip.dataValues;
										returnData.newDestination = tripNewDestination;
										callBack({Result: true, Data: [returnData]});
									}).error(function (error) {
										console.log("an error accord: ", error);
										callBack(lib.errorCodes.setError('dbError'));
									});
								}).error(function (error) {
									console.log("an error accord: ", error);
									callBack(lib.errorCodes.setError('dbError'));
								});
							}).error(function (error) {
								console.log("an error accord: ", error);
								callBack(lib.errorCodes.setError('dbError'));
							});
						});
					}).error(function (error) {
						console.log("an error accord: ", error);
						callBack(lib.errorCodes.setError('dbError'));
					});
				} else {
					callBack(user);
				}
			});
		} else {
			callBack(validationResult);
		}
	});
};
//******************SEPARATE******************
exports.endTrip = function (params, callBack) {
	var repo = require('../include/repo');
	var repository = new repo();
	var validateParams = {"params": params, "requireParams": ['DeviceId', 'UserId', 'TripId']};
	repository.validate.validate(validateParams, function (validationResult) {
		if (validationResult.Result) {
			var userParams = params;
			userParams.checkServiceProvider = true;
			repository.user.checkUserId(userParams, function (user) {
				if (user.Result) {
					lib.dbConnection.Trip.find({
						where: {id: params.TripId},
						include: [{
							model: lib.dbConnection.TripDestination,
							where: {trip_situation_id: lib.Constants.setConstant("tripDestinationSituationOnTrip")}
						}]
					}).success(function (trip) {
						if (trip && trip.tripDestinations.length) {
							var tripEndTime = new Date();
							var dif = Date.parse(tripEndTime) - Date.parse(trip.start_time);
							var tripTime = dif / 60000;
							trip.tripDestinations[0].trip_situation_id = lib.Constants.setConstant("tripDestinationSituationTripDone");
							trip.tripDestinations[0].trip_time = tripTime;
							trip.tripDestinations[0].trip_distance = params.TripDistance;
							trip.tripDestinations[0].save({fields: ["trip_situation_id", "trip_time", "trip_distance"]}).success(function (tripNewDestination) {
								lib.dbConnection.TripDestination.findAll({
									where: {
										trip_id: trip.id,
										trip_situation_id: lib.Constants.setConstant("tripDestinationSituationNotStarted")
									}
								}).success(function (tripPendingDestinations) {
									if (tripPendingDestinations.length == 0) {
										trip.end_time = tripEndTime;
										trip.trip_situation_id = lib.Constants.setConstant("tripSituationWaitingForConfirmPayment");
										trip.save({fields: ["trip_situation_id", "end_time"]}).success(function (newTrip) {
											repository.user.updateUsersTripInfo(trip, function (updateUsersTripInfoRes) {
												if (updateUsersTripInfoRes.Result) {
													callBack({
														Result: true,
														Data: [{
															finish: true,
															paymentAmount: trip.payment_id ? 0 : trip.net_price
														}],
														passengerId: trip.passenger_user_id
													});
												} else {
													callBack(updateUsersTripInfoRes);
												}
											});
										}).error(function (error) {
											console.log("an error accord: ", error);
											callBack(lib.errorCodes.setError('dbError'));
										});
									} else if (tripPendingDestinations.length == 1) {
										tripPendingDestinations[0].trip_situation_id = lib.Constants.setConstant("tripDestinationSituationOnTrip");
										tripPendingDestinations[0].save({fields: ["trip_situation_id"]}).success(function (tripOnTrip) {
											var returnParams = {};
											returnParams.finish = false;
											returnParams.destinations = tripOnTrip;
											callBack({
												Result: true,
												Data: [returnParams],
												passengerId: trip.passenger_user_id
											});
										}).error(function (error) {
											console.log("an error accord: ", error);
											callBack(lib.errorCodes.setError('dbError'));
										});
									} else {
										callBack(lib.errorCodes.setError('tripHasMoreThanOnePendingDestination'));
									}
								}).error(function (error) {
									console.log("an error accord: ", error);
									callBack(lib.errorCodes.setError('dbError'));
								});
							}).error(function (error) {
								console.log("an error accord: ", error);
								callBack(lib.errorCodes.setError('dbError'));
							});
						} else {
							callBack(lib.errorCodes.setError('activeDestinationNotFound'));
						}
					}).error(function (error) {
						console.log("an error accord: ", error);
						callBack(lib.errorCodes.setError('dbError'));
					});
				} else {
					callBack(user);
				}
			});
		} else {
			callBack(validationResult);
		}
	});
};
//******************SEPARATE******************
exports.cancelTrip = function (params, callBack) {
	var repo = require('../include/repo');
	var repository = new repo();
	lib.dbConnection.Trip.find({where: {id: params.TripId}}).success(function (trip) {
		var lastSituationId = trip.trip_situation_id;
		if (lastSituationId < parseInt(lib.Constants.setConstant("tripSituationOnTrip"))) {
			trip.trip_situation_id = lib.Constants.setConstant("tripSituationTripCancel");
			trip.save({fields: ["trip_situation_id"]}).success(function (newTrip) {
				if (lastSituationId > parseInt(lib.Constants.setConstant("tripSituationLookingForDriver"))) {
					var userParams = {
						UserId: trip.driver_user_id,
						checkServiceProvider: true,
						include: [{
							model: lib.dbConnection.ServiceProviderProfile,
							attributes: ["sum_trip_counts"]
						}]
					};
					repository.user.checkUserId(userParams, function (driver) {
						if (driver.Result) {
							driver.data.serviceProviderProfile.sum_trip_counts--;
							driver.data.serviceProviderProfile.save({fields: ["sum_trip_counts"]}).success(function (driverProfile) {
								callBack({
									Result: true,
									Data: [newTrip],
									DriverUserId: trip.driver_user_id,
									lastSituationId: lastSituationId
								});
							});
						} else {
							callBack(driver);
						}
					});
				} else {
					callBack({Result: true, Data: [newTrip], lastSituationId: lastSituationId});
				}
			}).error(function (error) {
				console.log("an error accord: ", error);
				callBack(lib.errorCodes.setError('dbError'));
			});
		} else {
			callBack(lib.errorCodes.setError('tripCanNotBeenCancelled'));
		}
	}).error(function (error) {
		console.log("an error accord: ", error);
		callBack(lib.errorCodes.setError('dbError'));
	});
};
//******************SEPARATE******************
exports.getDriverTripInfo = function (params, callBack) {
	lib.dbConnection.Trip.findAll({
		where: {
			driver_user_id: params.user.id,
			trip_situation_id: params.tripSituationId
		},
		include: [{
			model: lib.dbConnection.TripDestination,
			attributes: ["geographical_lat", "geographical_long", "destination_label"]
		}, {
			model: lib.dbConnection.User,
			as: 'passengerUser',
			attributes: ["mobile"],
			include: [{
				model: lib.dbConnection.CustomerProfile,
				attributes: ["full_name", "gender_id"]
			}]
		}],
		order: [["`trip`.`id`", "DESC"]],
	}).success(function (trip) {
		var returnParams = {};
		returnParams.onlineDriverId = params.onlineDriver.id;
		returnParams.currentSituationId = params.user.serviceProviderProfile.current_situation_id;
		trip = trip[0];
		if (trip) {
			returnParams.TripId = trip.id;
			returnParams.SourceLat = trip.trip_source_geographical_lat;
			returnParams.SourceLong = trip.trip_source_geographical_long;
			returnParams.SourceLabel = trip.trip_source_label;
			returnParams.SourceDescription = trip.trip_source_description;
			returnParams.DestinationLat = trip.tripDestinations[0].geographical_lat;
			returnParams.DestinationLong = trip.tripDestinations[0].geographical_long;
			returnParams.DestinationLabel = trip.tripDestinations[0].destination_label;
			returnParams.DestinationDescription = trip.tripDestinations[0].destination_description;
			returnParams.TripPrice = trip.net_price;
			returnParams.PassengerId = trip.passenger_user_id;
			returnParams.passengerFullName = trip.passengerUser.customerProfile.full_name;
			returnParams.passengerGenderId = trip.passengerUser.customerProfile.gender_id;
			returnParams.passengerMobile = trip.passengerUser.mobile;
			if (params.paymentAmount) {
				if (trip.payment_id) {
					returnParams.paymentAmount = 0;
				} else {
					returnParams.paymentAmount = trip.net_price;
				}
			}
			console.log('returnParams', returnParams);
			callBack({Result: true, Data: [returnParams]});
		} else {
			callBack(lib.errorCodes.setError('dbError'));
		}
	}).error(function (error) {
		console.log("an error accord: ", error);
		callBack(lib.errorCodes.setError('dbError'));
	});
};
//******************SEPARATE******************
exports.getDriverRejectTripInfo = function (params, callBack) {
	var repo = require('../include/repo');
	var repository = new repo();
	var returnParams = {};
	returnParams.onlineDriverId = params.onlineDriver.id;
	returnParams.currentSituationId = params.user.serviceProviderProfile.current_situation_id;
	returnParams.TripId = null;
	returnParams.SourceLat = null;
	returnParams.SourceLong = null;
	returnParams.SourceLabel = null;
	returnParams.DestinationLat = null;
	returnParams.DestinationLong = null;
	returnParams.DestinationLabel = null;
	returnParams.TripPrice = null;
	returnParams.PassengerId = null;
	returnParams.passengerFullName = null;
	returnParams.passengerGenderId = null;
	returnParams.passengerMobile = null;
	returnParams.paymentAmount = null;
	console.log('returnParams', returnParams);
	callBack({Result: true, Data: [returnParams]});
};
//******************SEPARATE******************
exports.getDriverOnTripInfo = function (params, callBack) {
	var repo = require('../include/repo');
	var repository = new repo();
	lib.dbConnection.Trip.findAll({
		where: {
			driver_user_id: params.user.id,
			trip_situation_id: params.tripSituationId
		},
		include: [{
			model: lib.dbConnection.TripDestination,
			attributes: ["geographical_lat", "geographical_long", "destination_label", "trip_situation_id"]
		}, {
			model: lib.dbConnection.User,
			as: 'passengerUser',
			attributes: ["mobile"],
			include: [{
				model: lib.dbConnection.CustomerProfile,
				attributes: ["full_name", "gender_id"]
			}]
		}],
		order: [["`trip`.`id`", "DESC"]],
	}).success(function (trip) {
		var returnParams = {};
		returnParams.onlineDriverId = params.onlineDriver.id;
		returnParams.currentSituationId = params.user.serviceProviderProfile.current_situation_id;
		trip = trip[0];
		returnParams.TripId = trip.id;
		returnParams.SourceLat = trip.trip_source_geographical_lat;
		returnParams.SourceLong = trip.trip_source_geographical_long;
		returnParams.SourceLabel = trip.trip_source_label;
		returnParams.DestinationLat = trip.tripDestinations[0].geographical_lat;
		returnParams.DestinationLong = trip.tripDestinations[0].geographical_long;
		returnParams.DestinationLabel = trip.tripDestinations[0].destination_label;
		returnParams.DestinationDescription = trip.tripDestinations[0].destination_description;
		returnParams.tripSituation = 1;
		if (trip.tripDestinations.length > 1) {
			returnParams.tripSituation = trip.tripDestinations[0].trip_situation_id;
			returnParams.DestinationLat2 = trip.tripDestinations[1].geographical_lat;
			returnParams.DestinationLong2 = trip.tripDestinations[1].geographical_long;
			returnParams.DestinationLabel2 = trip.tripDestinations[1].destination_label;
			returnParams.DestinationDescription2 = trip.tripDestinations[1].destination_description;
		}
		returnParams.TripPrice = trip.net_price;
		returnParams.PassengerId = trip.passenger_user_id;
		returnParams.passengerFullName = trip.passengerUser.customerProfile.full_name;
		returnParams.passengerGenderId = trip.passengerUser.customerProfile.gender_id;
		returnParams.passengerMobile = trip.passengerUser.mobile;
		if (params.paymentAmount) {
			if (trip.payment_id) {
				returnParams.paymentAmount = 0;
			} else {
				returnParams.paymentAmount = trip.net_price;
			}
		}
		console.log('returnParams', returnParams);
		callBack({Result: true, Data: [returnParams]});
	}).error(function (error) {
		console.log("an error accord: ", error);
		callBack(lib.errorCodes.setError('dbError'));
	});
};
//******************SEPARATE******************
exports.getPassengerTripInfoRun = function (params, callBack) {
	lib.dbConnection.Trip.findAll({
		where: {
			passenger_user_id: params.user.id,
			trip_situation_id: params.tripSituationId
		},
		include: [{
			model: lib.dbConnection.TripDestination,
			attributes: ["geographical_lat", "geographical_long", "destination_label"]
		}, {
			model: lib.dbConnection.User,
			as: 'driverUser',
			attributes: ["mobile"],
			include: [{
				model: lib.dbConnection.ServiceProviderProfile,
				attributes: ["first_name", "last_name", "gender_id", "rate_count", "sum_rate"],
				include: [{
					model: lib.dbConnection.ServiceProviderSpecialInfo,
					include: [
						lib.dbConnection.VehicleBrand,
						lib.dbConnection.VehicleModel,
					]
				}, {
					model: lib.dbConnection.ServiceProviderDocument,
					attributes: ["user_pic"],
				}]
			}]
		}, {
			model: lib.dbConnection.User,
			as: 'passengerUser',
			attributes: ["balance"]
		}],
		order: [["`trip`.`id`", "DESC"]],
	}).success(function (trip) {
		trip = trip[0];
		if (trip) {
			var returnParams = {
				trip: {
					Id: trip.id,
					PassengerBalance: trip.passengerUser.balance,
					PassengerLat: trip.trip_source_geographical_lat,
					PassengerLong: trip.trip_source_geographical_long,
					PassengerLabel: trip.trip_source_label,
					PassengerDescription: trip.trip_source_description,
					SourceLat: trip.trip_source_geographical_lat,
					SourceLong: trip.trip_source_geographical_long,
					SourceLabel: trip.trip_source_label,
					SourceDescription: trip.trip_source_description,
					DestinationLat: trip.tripDestinations[0].geographical_lat,
					DestinationLong: trip.tripDestinations[0].geographical_long,
					DestinationLabel: trip.tripDestinations[0].destination_label,
					DestinationDescription: trip.tripDestinations[0].destination_description,
					TripNetPrice: trip.net_price,
					TripPrice: trip.main_price,
					Payment: trip.payment_id ? true : false,
				}, driver: {
					Id: trip.driver_user_id,
					PassengerId: params.user.id,
					TripId: trip.id,
					GenderId: trip.driverUser.serviceProviderProfile.gender_id,
					FullName: trip.driverUser.serviceProviderProfile.first_name + ' ' + trip.driverUser.serviceProviderProfile.last_name,
					DriverMobile: trip.driverUser.mobile,
					VehiclePelaqueLeft: trip.driverUser.serviceProviderProfile.serviceProviderSpecialInfo.vehicle_plaque_left,
					VehiclePelaqueAlphabet: trip.driverUser.serviceProviderProfile.serviceProviderSpecialInfo.vehicle_plaque_alphabet,
					VehiclePelaqueRight: trip.driverUser.serviceProviderProfile.serviceProviderSpecialInfo.vehicle_plaque_right,
					VehiclePelaqueIran: trip.driverUser.serviceProviderProfile.serviceProviderSpecialInfo.vehicle_plaque_iran,
					VehicleBrand: trip.driverUser.serviceProviderProfile.serviceProviderSpecialInfo.vehicleBrand.name,
					VehicleModel: trip.driverUser.serviceProviderProfile.serviceProviderSpecialInfo.vehicleModel.name,
					DriverPic: "http://" + lib.config.production.host.domain + ":" + lib.config.production.host.port + "/" + trip.driverUser.serviceProviderProfile.serviceProviderDocument.user_pic,
					DriverRate: trip.driverUser.serviceProviderProfile.rate_count ? (Math.floor((parseInt(trip.driverUser.serviceProviderProfile.sum_rate) / parseInt(trip.driverUser.serviceProviderProfile.rate_count)) * 100) / 100) : 0,
				}
			};
			if (trip.discount_code_id) {
				returnParams.trip.DiscountCodeId = trip.discount_code_id;
			}
			if (trip.discount_coupon_id) {
				returnParams.trip.DiscountCodeId = trip.discount_coupon_id;
				returnParams.trip.DiscountFlag = 1;
			}
			console.log('passengerReturnParams', returnParams);
			callBack({Result: true, Data: [returnParams]});
		} else {
			callBack(lib.errorCodes.setError('dbError'));
		}
	}).error(function (error) {
		console.log("an error accord: ", error);
		callBack(lib.errorCodes.setError('dbError'));
	});
};
//******************SEPARATE******************
exports.getPassengerOnTripInfoRun = function (params, callBack) {
	var repo = require('../include/repo');
	var repository = new repo();
	lib.dbConnection.Trip.findAll({
		where: {
			passenger_user_id: params.user.id,
			trip_situation_id: params.tripSituationId
		},
		include: [{
			model: lib.dbConnection.TripDestination,
		}, {
			model: lib.dbConnection.User,
			as: 'driverUser',
			attributes: ["mobile"],
			include: [{
				model: lib.dbConnection.ServiceProviderProfile,
				attributes: ["first_name", "last_name", "gender_id", "rate_count", "sum_rate"],
				include: [{
					model: lib.dbConnection.ServiceProviderSpecialInfo,
					include: [
						lib.dbConnection.VehicleBrand,
						lib.dbConnection.VehicleModel,
					]
				}, {
					model: lib.dbConnection.ServiceProviderDocument,
					attributes: ["user_pic"],
				}]
			}]
		}, {
			model: lib.dbConnection.User,
			as: 'passengerUser',
			attributes: ["balance"]
		}],
		order: [["`trip`.`id`", "DESC"]],
	}).success(function (trip) {
		trip = trip[0];
		if (trip) {
			var returnParams = {
				trip: {
					Id: trip.id,
					PassengerBalance: trip.passengerUser.balance,
					PassengerLat: trip.trip_source_geographical_lat,
					PassengerLong: trip.trip_source_geographical_long,
					PassengerLabel: trip.trip_source_label,
					PassengerDescription: trip.trip_source_description,
					SourceLat: trip.trip_source_geographical_lat,
					SourceLong: trip.trip_source_geographical_long,
					SourceLabel: trip.trip_source_label,
					SourceDescription: trip.trip_source_description,
					DestinationLat: trip.tripDestinations[0].geographical_lat,
					DestinationLong: trip.tripDestinations[0].geographical_long,
					DestinationLabel: trip.tripDestinations[0].destination_label,
					DestinationDescription: trip.tripDestinations[0].destination_description,
					TripNetPrice: trip.net_price,
					TripPrice: trip.main_price,
					Payment: trip.payment_id ? true : false,
					TripSituation: 1,
				}, driver: {
					Id: trip.driver_user_id,
					PassengerId: params.user.id,
					TripId: trip.id,
					GenderId: trip.driverUser.serviceProviderProfile.gender_id,
					FullName: trip.driverUser.serviceProviderProfile.first_name + ' ' + trip.driverUser.serviceProviderProfile.last_name,
					DriverMobile: trip.driverUser.mobile,
					VehiclePelaqueLeft: trip.driverUser.serviceProviderProfile.serviceProviderSpecialInfo.vehicle_plaque_left,
					VehiclePelaqueAlphabet: trip.driverUser.serviceProviderProfile.serviceProviderSpecialInfo.vehicle_plaque_alphabet,
					VehiclePelaqueRight: trip.driverUser.serviceProviderProfile.serviceProviderSpecialInfo.vehicle_plaque_right,
					VehiclePelaqueIran: trip.driverUser.serviceProviderProfile.serviceProviderSpecialInfo.vehicle_plaque_iran,
					VehicleBrand: trip.driverUser.serviceProviderProfile.serviceProviderSpecialInfo.vehicleBrand.name,
					VehicleModel: trip.driverUser.serviceProviderProfile.serviceProviderSpecialInfo.vehicleModel.name,
					DriverPic: "http://" + lib.config.production.host.domain + ":" + lib.config.production.host.port + "/" + trip.driverUser.serviceProviderProfile.serviceProviderDocument.user_pic,
					DriverRate: trip.driverUser.serviceProviderProfile.rate_count ? (Math.floor((parseInt(trip.driverUser.serviceProviderProfile.sum_rate) / parseInt(trip.driverUser.serviceProviderProfile.rate_count)) * 100) / 100) : 0,
				}
			};
			if (trip.discount_code_id) {
				returnParams.trip.DiscountCodeId = trip.discount_code_id;
				returnParams.trip.DiscountFlag = 0;
			}
			if (trip.discount_coupon_id) {
				returnParams.trip.DiscountCodeId = trip.discount_coupon_id;
				returnParams.trip.DiscountFlag = 1;
			}
			if (trip.tripDestinations.length > 1) {
				returnParams.trip.TripSituation = trip.tripDestinations[0].trip_situation_id;
				returnParams.trip.DestinationLat2 = trip.tripDestinations[1].geographical_lat;
				returnParams.trip.DestinationLong2 = trip.tripDestinations[1].geographical_long;
				returnParams.trip.DestinationLabel2 = trip.tripDestinations[1].destination_label;
				returnParams.trip.DestinationDescription2 = trip.tripDestinations[1].destination_description;
				console.log('trip.tripDestinations[1].destination_description', trip.tripDestinations[1].destination_description);
				console.log('trip.tripDestinations[0].trip_situation_id', trip.tripDestinations[0].trip_situation_id);
			}
			console.log('passengerReturnParams', returnParams);
			callBack({Result: true, Data: [returnParams]});
		} else {
			callBack(lib.errorCodes.setError('dbError'));
		}
	}).error(function (error) {
		console.log("an error accord: ", error);
		callBack(lib.errorCodes.setError('dbError'));
	});
};
//******************SEPARATE******************
exports.listCancelTrip = function (params, callBack) {
	var repo = require('../include/repo');
	var repository = new repo();
	var validateParams = {"params": params, "requireParams": ['DeviceId', 'UserId']};
	repository.validate.validate(validateParams, function (validationResult) {
		if (validationResult.Result) {
			if (!params.PageSize) {
				params.PageSize = 10;
			}
			if (!params.Page) {
				params.Page = 1;
			}
			var offset = (params.Page - 1) * params.PageSize;
			var driverParams = {
				UserId: params.UserId
			};
			repository.user.checkUserId(driverParams, function (driver) {
				if (driver.Result) {
					lib.dbConnection.Trip.findAll({
						where: {
							driver_user_id: params.UserId,
							trip_situation_id: lib.tools.Constants.tripSituationTripCancel
						},
						include: [{
							model: lib.dbConnection.User,
							as: "passengerUser",
							attributes: ["id", "mobile", "email", "balance"],
							include: [{
								model: lib.dbConnection.CustomerProfile,
								attributes: ["id", "full_name", "phone", "address", "birth_date", "sum_trip_times", "sum_trip_counts", "sum_trip_distances", "sum_trip_canceled"],
							}]

						}],
						limit: params.PageSize,
						order: [["id", "DESC"]]
					}).success(function (tripCancelDriver) {
						tripCancelDriver = JSON.parse(JSON.stringify(tripCancelDriver));
						tripCancelDriver.forEach(function (item, index) {
							tripCancelDriver[index].request_time = Date.parse(item.request_time);
							tripCancelDriver[index].start_time = Date.parse(item.start_time);
							tripCancelDriver[index].end_time = Date.parse(item.end_time);
						});
						callBack({Result: true, data: tripCancelDriver});
					}).error(function (error) {
						console.log("an error accord: ", error);
						callBack(lib.errorCodes.setError('dbError'));
					});
				} else {
					callBack(driver);
				}
			});
		} else {
			callBack(validationResult);
		}
	});
};
//******************SEPARATE******************
exports.getTripPrice = function (params, callBack) {
	var repo = require('../include/repo');
	var repository = new repo();
	var validateParams = {"params": params, "requireParams": ['DeviceId', 'TripId']};
	repository.validate.validate(validateParams, function (validationResult) {
		if (validationResult.Result) {
			lib.dbConnection.Trip.find({where:{id: params.TripId}}).then(function (trip) {
				if (trip) {
					lib.dbConnection.TripDestination.findAll({
						where: {
							trip_id: trip.id,
							trip_situation_id: lib.Constants.setConstant("tripDestinationSituationNotStarted")
						}
					}).success(function (tripPendingDestinations) {
						var tripEndTime = new Date();
						if (tripPendingDestinations.length == 0) {
							trip.end_time = tripEndTime;
							trip.trip_situation_id = lib.Constants.setConstant("tripSituationWaitingForConfirmPayment");
							trip.save({fields: ["trip_situation_id", "end_time"]}).success(function (newTrip) {
								repository.user.updateUsersTripInfo(trip, function (updateUsersTripInfoRes) {
									if (updateUsersTripInfoRes.Result) {
										callBack({
											Result: true,
											Data: [{
												finish: true,
												paymentAmount: trip.payment_id ? 0 : trip.net_price,
												passengerId: trip.passenger_user_id											
											}],
										});
									} else {
										callBack(updateUsersTripInfoRes);
									}
								});
							}).error(function (error) {
								console.log("an error accord: ", error);
								callBack(lib.errorCodes.setError('dbError'));
							});
						} else if (tripPendingDestinations.length == 1) {
							tripPendingDestinations[0].trip_situation_id = lib.Constants.setConstant("tripDestinationSituationOnTrip");
							tripPendingDestinations[0].save({fields: ["trip_situation_id"]}).success(function (tripOnTrip) {
								var returnParams = {};
								returnParams.finish = false;
								returnParams.destinations = tripOnTrip;
								callBack({
									Result: true,
									Data: [returnParams],
									passengerId: trip.passenger_user_id
								});
							}).error(function (error) {
								console.log("an error accord: ", error);
								callBack(lib.errorCodes.setError('dbError'));
							});
						} else {
							callBack(lib.errorCodes.setError('tripHasMoreThanOnePendingDestination'));
						}
					}).error(function (error) {
						console.log("an error accord: ", error);
						callBack(lib.errorCodes.setError('dbError'));
					});
					// if(trip.payment_id){
					// 	callBack({Result: true, data: {price: 0}})
					// } else {
					// 	callBack({Result: true, data: {price: trip.net_price}});
					// }
				} else {
					callBack(lib.errorCodes.setError('notExistRecord'));
				}
			}).catch(function (error) {
				console.log("an error accord: ", error);
				callBack(lib.errorCodes.setError('dbError'));
			});
		} else {
			callBack(validationResult);
		}
	});
};