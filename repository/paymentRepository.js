var lib = require('../include/lib');
//******************SEPARATE******************
var roundTo500 = function (price) {
	var remain = price % 1000;
	if (remain == 500 || remain == 0) {
		return price;
	} else if (remain > 500) {
		if (remain > 750) {
			return (parseInt(price / 1000) + 1) * 1000;
		} else {
			return (parseInt(price / 1000) * 1000) + 500;
		}
	} else {
		if (remain > 250) {
			return (parseInt(price / 1000) * 1000) + 500;
		} else {
			return parseInt(price / 1000) * 1000;
		}
	}
};
//******************SEPARATE******************
exports.getPassengerPayments = function (params, callBack) {
	var repo = require('../include/repo');
	var repository = new repo();
	var validateParams = {"params": params, "requireParams": ['DeviceId', 'UserId']};
	repository.validate.validate(validateParams, function (validationResult) {
		if (validationResult.Result) {
			params.checkCustomer = true;
			repository.user.checkUserId(params, function (user) {
				if (user.Result) {
					lib.dbConnection.Payment.findAll({
						where: {user_id: params.UserId},
						attributes: [
							'amount',
							'description',
							'createdAt'
							// ['createdAt', 'date']
						],
						include: [{
							model: lib.dbConnection.PaymentMethod,
							where: {flag_id: 1},
							attributes: ["name"]
						}, {
							model: lib.dbConnection.PaymentReason,
							where: {flag_id: 1},
							attributes: ["payment_name"]
						}, {
							model: lib.dbConnection.paymentSituation,
							where: {flag_id: 1},
							attributes: ["name"]
						}, {
							model: lib.dbConnection.Trip,
							attributes: ["trip_code"]
						}],
						order: "createdAt DESC"
					}).success(function (payments) {
						payments = JSON.parse(JSON.stringify(payments));
						for (var i in payments) {
							console.log('payments[i].date', payments[i].createdAt);
							payments[i].date = Date.parse(payments[i].createdAt);
							delete payments[i].createdAt;
						}
						callBack({Result: true, data: payments});
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
exports.setTripPaymentFromBalance = function (params, callBack) {
	var repo = require('../include/repo');
	var repository = new repo();
	var validateParams = {"params": params, "requireParams": ['DeviceId', 'UserId', 'TripId']};
	repository.validate.validate(validateParams, function (validationResult) {
		if (validationResult.Result) {
			params.checkCustomer = true;
			repository.user.checkUserId(params, function (user) {
				if (user.Result) {
					lib.dbConnection.Trip.find({where: {id: params.TripId}}).success(function (trip) {
						if (trip) {
							if (user.data.dataValues.balance >= trip.dataValues.net_price) {
								lib.dbConnection.Payment.create({
									user_id: params.UserId,
									payment_method_id: lib.Constants.setConstant("paymentMethodInternalTransfer"),
									payment_reason_id: lib.Constants.setConstant("paymentReasonTripPaymentByPassenger"),
									payment_situation_id: lib.Constants.setConstant("paymentSituationSuccessful"),
									trip_id: trip.id,
									amount: trip.net_price,
									description : 'پرداخت صورت حساب از حساب کاربری مسافر',
									last_balance: user.data.balance
								}).success(function (payment) {
									user.data.dataValues.balance -= trip.dataValues.net_price;
									user.data.save({fields: ["balance"]}).success(function (newUser) {
										trip.dataValues.payment_id = payment.dataValues.id;
										trip.save({fields: ["payment_id"]}).success(function (payment) {
											callBack({
												Result: true,
												Data: [{newBalance: newUser.balance}],
												DriverId: trip.driver_user_id
											});
										}).error(function (error) {
											payment.destroy();
											console.log("an error accord: ", error);
											callBack(lib.errorCodes.setError('dbError'));
										});
									}).error(function (error) {
										payment.destroy();
										console.log("an error accord: ", error);
										callBack(lib.errorCodes.setError('dbError'));
									});
								}).error(function (error) {
									console.log("an error accord: ", error);
									callBack(lib.errorCodes.setError('dbError'));
								});
							} else {
								callBack(lib.errorCodes.setError('userBalanceIsLowerThanExpected'));
							}
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
exports.confirmPayment = function (params, callBack) {
	var repo = require('../include/repo');
	var repository = new repo();
	var validateParams = {"params": params, "requireParams": ['DeviceId', 'UserId', 'TripId', 'PaymentAmount']};
	repository.validate.validate(validateParams, function (validationResult) {
		if (validationResult.Result) {
			params.checkServiceProvider = true;
			repository.user.checkUserId(params, function (user) {
				if (user.Result) {
					lib.dbConnection.Trip.find({
						where: {id: params.TripId},
						include: [lib.dbConnection.Payment]
					}).success(function (trip) {
						if(!trip.payment_flag){
							if (trip.payment) {
								lib.dbConnection.Payment.create({
									user_id: params.UserId,
									payment_method_id: lib.Constants.setConstant("paymentMethodInternalTransfer"),
									payment_reason_id: lib.Constants.setConstant("paymentReasonDepositDriverSliceForTrip"),
									payment_situation_id: lib.Constants.setConstant("paymentSituationSuccessful"),
									trip_id: trip.id,
									amount: trip.driver_slice,
									description : 'پرداخت سهم راننده',
									last_balance: user.data.balance
								}).success(function (driverSlicePayment) {
									user.data.balance += trip.driver_slice;
									user.data.save({fields: ["balance"]}).success(function (newUser) {
										trip.trip_situation_id = lib.Constants.setConstant("tripSituationTripDone");
										// bug fix - add to const value [payment_flag]
										trip.payment_flag = 1;
										trip.save({fields: ["trip_situation_id","payment_flag"]}).success(function (newTrip) {
											var returnParams = {};
											returnParams.trip = newTrip.dataValues;
											returnParams.user = newUser.dataValues;
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
							} else {
								lib.dbConnection.Payment.create({
									user_id: trip.passenger_user_id,
									payment_method_id: lib.Constants.setConstant("paymentMethodCash"),
									payment_reason_id: lib.Constants.setConstant("paymentReasonTripPaymentByPassenger"),
									payment_situation_id: lib.Constants.setConstant("paymentSituationSuccessful"),
									trip_id: trip.id,
									description : 'پرداخت نقدی مسافر',									
									amount: trip.net_price,
								}).success(function (passengerPayment) {
									lib.dbConnection.Payment.create({
										user_id: trip.driver_user_id,
										payment_method_id: lib.Constants.setConstant("paymentMethodInternalTransfer"),
										payment_reason_id: lib.Constants.setConstant("paymentReasonRemoveSystemSliceForTrip"),
										payment_situation_id: lib.Constants.setConstant("paymentSituationSuccessful"),
										trip_id: trip.id,
										amount: trip.system_slice,
										description: 'سهم نرم افزار',
										last_balance: user.data.balance
									}).success(function (driverPayment) {
										user.data.balance -= parseInt(trip.system_slice);
										user.data.save({fields: ["balance"]}).success(function (newUser) {
											trip.payment_id = passengerPayment.id;
											trip.trip_situation_id = lib.Constants.setConstant("tripSituationTripDone");
											trip.payment_flag = 1;
											trip.save({fields: ["trip_situation_id", "payment_id","payment_flag"]}).success(function (newTrip) {
												var returnParams = {};
												returnParams.trip = newTrip.dataValues;
												returnParams.user = newUser.dataValues;
												if (trip.discount_code_id || trip.discount_coupon_id) {
													lib.dbConnection.Payment.create({
														user_id: trip.driver_user_id,
														payment_method_id: lib.Constants.setConstant("paymentMethodInternalTransfer"),
														payment_reason_id: lib.Constants.setConstant("paymentReasonSystemPaymentToDriverForDiscount"),
														payment_situation_id: lib.Constants.setConstant("paymentSituationSuccessful"),
														trip_id: trip.id,
														amount: trip.discount_price,
														last_balance: newUser.balance
													}).success(function (driverPayment) {
														newUser.balance += parseInt(trip.discount_price);
														newUser.save({fields: ["balance"]}).success(function (newNewUser) {
															returnParams.user = newNewUser.dataValues;
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
													callBack({Result: true, Data: [returnParams]});
												}
											}).error(function (error) {
												console.log("an error accord: ", error);
												callBack(lib.errorCodes.setError('dbError'));
											});
										}).error(function (error) {
											systemSlicePayment.destroy();
											console.log("an error accord: ", error);
											callBack(lib.errorCodes.setError('dbError'));
										});
									}).error(function (error) {
										systemSlicePayment.destroy();
										console.log("an error accord: ", error);
										callBack(lib.errorCodes.setError('dbError'));
									});
									/*var createParams = {};
									if (trip.system_slice > 0) {
										createParams.user_id = params.UserId;
										createParams.payment_method_id = lib.Constants.setConstant("paymentMethodInternalTransfer");
										createParams.payment_reason_id = lib.Constants.setConstant("paymentReasonRemoveSystemSliceForTrip");
										createParams.payment_situation_id = lib.Constants.setConstant("paymentSituationSuccessful");
										createParams.trip_id = trip.id;
										createParams.amount = trip.system_slice;
										user.data.balance -= trip.system_slice;
									} else if (trip.system_slice < 0) {
										createParams.user_id = params.UserId;
										createParams.payment_method_id = lib.Constants.setConstant("paymentMethodInternalTransfer");
										createParams.payment_reason_id = lib.Constants.setConstant("paymentReasonSystemPaymentToDriverForDiscount");
										createParams.payment_situation_id = lib.Constants.setConstant("paymentSituationSuccessful");
										createParams.trip_id = trip.id;
										createParams.amount = -1 * trip.system_slice;
										user.data.balance += -1 * trip.system_slice;
									}
									lib.dbConnection.Payment.create(createParams).success(function (systemSlicePayment) {
										user.data.save({fields: ["balance"]}).success(function (newUser) {
											trip.payment_id = passengerPayment.id;
											trip.trip_situation_id = lib.Constants.setConstant("tripSituationTripDone");
											trip.save({fields: ["trip_situation_id", "payment_id"]}).success(function (newTrip) {
												var returnParams = {};
												returnParams.trip = newTrip.dataValues;
												returnParams.user = newUser.dataValues;
												callBack({Result: true, Data: [returnParams]});
											}).error(function (error) {
												console.log("an error accord: ", error);
												callBack(lib.errorCodes.setError('dbError'));
											});
										}).error(function (error) {
											systemSlicePayment.destroy();
											console.log("an error accord: ", error);
											callBack(lib.errorCodes.setError('dbError'));
										});
									}).error(function (error) {
										console.log("an error accord: ", error);
										callBack(lib.errorCodes.setError('dbError'));
									});*/
								}).error(function (error) {
									console.log("an error accord: ", error);
									callBack(lib.errorCodes.setError('dbError'));
								});
							}
						}
						else if (trip.payment_flag){
							callBack(lib.errorCodes.setError('tripPaymented'));
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
exports.tripPrice = function (params, callBack) {
	var tripPriceLog = lib.dbConnection.tripPriceLog.build();
	tripPriceLog.user_id = params.UserId;
	tripPriceLog.distance = params.distance;
	tripPriceLog.time = params.time;
	var distance = params.distance / 1000;
	var time = params.time / 60;
	lib.dbConnection.TripPriceParameters.findAll({where: {flag_id: 1}}).success(function (parameters) {
		tripPriceLog.parameters = JSON.stringify(parameters);
		var price;
		if (distance >= lib.Constants.setConstant("TripPriceCalculationMaxDistance")) {
			price = parseInt(distance) * parseInt(lib.Constants.setConstant("TripPriceCalculationMaxDistanceEachKilometer"));
		} else {
			price = parseInt(parseInt(distance) * parseInt(lib.Constants.setConstant("TripPriceCalculationP1"))) + parseInt((parseInt(time) - ((parseInt(distance) * 6) / 5)) * parseInt(lib.Constants.setConstant("TripPriceCalculationP2")));
			if ((price < lib.Constants.setConstant("TripPriceCalculationMinPrice")) && (!params.editDestination)) {
				price = lib.Constants.setConstant("TripPriceCalculationMinPrice");
			}
			var nowHours = new Date().getHours();
			if (nowHours >= lib.Constants.setConstant("TripPriceCalculationNightStart") || nowHours < lib.Constants.setConstant("TripPriceCalculationMorningEnd")) {
				price = price * 1.5;
			}
		}
		tripPriceLog.calculated_price = price;
		if (parameters.length) {
			var changeAmountPercent = 0;
			for (var i in parameters) {
				if (parameters[i].parameter_type_id == lib.Constants.setConstant("TripPriceParameterIncrease")) {
					changeAmountPercent = parseInt(changeAmountPercent) + parseInt(parameters[i].change_amount);
				} else {
					changeAmountPercent = parseInt(changeAmountPercent) - parseInt(parameters[i].change_amount);
				}
			}
			if (changeAmountPercent < -100) {
				price = 0;
			} else {
				price = parseInt(price) + parseInt(price * changeAmountPercent / 100);
			}
		}
		if ((price < lib.Constants.setConstant("TripPriceCalculationMinPrice")) && (!params.editDestination)) {
			price = lib.Constants.setConstant("TripPriceCalculationMinPrice");
		}
		tripPriceLog.final_price = price;
		price = roundTo500(price);
		tripPriceLog.final_rounded_price = price;
		tripPriceLog.date = new Date();
		tripPriceLog.save();
		callBack({Result: true, price: price});
	}).error(function (error) {
		console.log("an error accord: ", error);
		callBack(lib.errorCodes.setError('dbError'));
	});
};
//******************SEPARATE******************
exports.requestIncreaseBalance = function (params, callBack) {
	var repo = require('../include/repo');
	var repository = new repo();
	var validateParams = {"params": params, "requireParams": ['DeviceId', 'UserId', 'TypeId', 'Amount']};
	repository.validate.validate(validateParams, function (validationResult) {
		if (validationResult.Result) {
			if (params.TypeId == lib.Constants.setConstant("UserTypeDriver")) {
				params.checkServiceProvider = true;
			} else if (params.TypeId == lib.Constants.setConstant("UserTypePassenger")) {
				params.checkCustomer = true;
			} else {
				callBack(lib.errorCodes.setError('dbError'));
			}
			repository.user.checkUserId(params, function (user) {
				if (user.Result) {
					var createParams = {
						user_id: params.UserId,
						payment_method_id: lib.Constants.setConstant("paymentMethodOnline"),
						payment_situation_id: lib.Constants.setConstant("paymentSituationPending"),
						amount: params.Amount,
						description : ' افزایش اعتبار کاربر ' + params.UserId,
						last_balance: user.data.amount,
					};
					if (params.TypeId == lib.Constants.setConstant("UserTypeDriver")) {
						createParams.payment_reason_id = lib.Constants.setConstant("paymentReasonPaymentDriverDebt");
					} else if (params.TypeId == lib.Constants.setConstant("UserTypePassenger")) {
						createParams.payment_reason_id = lib.Constants.setConstant("paymentReasonPassengerOnlinePaymentForIncreaseBalance");
					}
					lib.dbConnection.Payment.create(createParams).success(function (payment) {
						var returnData = {
							token: lib.jwt.sign({DeviceId: params.DeviceId, PaymentId: payment.id}, "ATDDecoder"),
							payment: payment
						};
						callBack({Result: true, data: returnData});
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
exports.confirmIncreaseBalance = function (params, callBack) {
	var repo = require('../include/repo');
	var repository = new repo();
	var validateParams = {"params": params, "requireParams": ['DeviceId', 'UserId', 'TypeId', 'PaymentId']};
	repository.validate.validate(validateParams, function (validationResult) {
		if (validationResult.Result) {
			if (params.TypeId == lib.Constants.setConstant("UserTypeDriver")) {
				params.checkServiceProvider = true;
			} else if (params.TypeId == lib.Constants.setConstant("UserTypePassenger")) {
				params.checkCustomer = true;
			} else {
				callBack(lib.errorCodes.setError('dbError'));
			}
			repository.user.checkUserId(params, function (user) {
				if (user.Result) {
					lib.dbConnection.Payment.find({where: {id: params.PaymentId}}).success(function (payment) {
						if (payment) {
							if (payment.user_id == params.UserId) {
								var returnParams = {payment: payment, balance: user.data.balance};
								if (payment.payment_situation_id == lib.Constants.setConstant("paymentSituationSuccessful")) {
									returnParams.success = true;
									callBack({Result: true, data: returnParams});
								} else {
									returnParams.success = false;
									callBack({Result: true, data: returnParams});
								}
							} else {
								callBack(lib.errorCodes.setError('thisObjectIsNotForThisUser'));
							}
						} else {
							callBack(lib.errorCodes.setError('noRecordFound'));
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