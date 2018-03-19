var lib = require('../include/lib');
var addedLocationParam = 0.01;
var getRandomDirection = function () {
    return Math.floor(Math.random() * 2);
};
//******************SEPARATE******************
var getRandomLocationParam = function () {
    return (Math.floor((Math.random() * 100) + 1)) / 10000;
};
//******************SEPARATE******************
var getRandomDriver = function (driver) {
    if (getRandomDirection()) {
        driver.lat = parseFloat(driver.lat) + getRandomLocationParam();
        driver.long = parseFloat(driver.long) + getRandomLocationParam();
    } else {
        driver.lat = parseFloat(driver.lat) - getRandomLocationParam();
        driver.long = parseFloat(driver.long) - getRandomLocationParam();
    }
    return driver;
};
//******************SEPARATE******************
// Converts from degrees to radians.
/*Math.radians = function(degrees) {
 return degrees * Math.PI / 180;
 };

 // Converts from radians to degrees.
 Math.degrees = function(radians) {
 return radians * 180 / Math.PI;
 };
 var insertToArray = function(driver,result){
 var returnArray = [];
 if(result.length==0){
 returnArray.push(driver);
 } else {
 for (var i in result) {
 if (result[i].point < driver.point) {
 returnArray.push(result[i]);
 } else if (result[i].point > driver.point) {
 returnArray.push(driver);
 returnArray.push(result[i]);
 } else if (driver.distance < result[i].distance) {
 returnArray.push(driver);
 returnArray.push(result[i]);
 } else {
 returnArray.push(result[i]);
 returnArray.push(driver);
 }
 }
 }
 return returnArray;
 }*/
//******************SEPARATE******************
exports.driverOnline = function (params, callBack) {
    var repo = require('../include/repo');
    var repository = new repo();
    var validateParams = {"params": params, "requireParams": ['DeviceId', 'UserId']};
    repository.validate.validate(validateParams, function (validationResult) {
        if (validationResult.Result) {
            params.checkServiceProvider = true;
            params.include = [lib.dbConnection.ServiceProviderProfile];
            repository.user.checkUserId(params, function (checkUserResult) {
                if (checkUserResult.Result) {
                    lib.dbConnection.OnlineDriver.find({where: {driverId: params.UserId}}).success(function (oldDriverOnline) {
                        if (oldDriverOnline) {
                            oldDriverOnline.driverId = params.UserId;
                            oldDriverOnline.lat = params.Lat;
                            oldDriverOnline.long = params.Long;
                            oldDriverOnline.rate = Math.floor((checkUserResult.data.serviceProviderProfile.sum_rate / (checkUserResult.data.serviceProviderProfile.rate_count ? checkUserResult.data.serviceProviderProfile.rate_count : 1)) * 100) / 100;
                            oldDriverOnline.sumTripCount = checkUserResult.data.serviceProviderProfile.sum_trip_counts;
                            oldDriverOnline.sumTripRejected = checkUserResult.data.serviceProviderProfile.sum_trip_rejected;
                            oldDriverOnline.current_situation_id = lib.Constants.setConstant("serviceProviderCurrentSituationOnline");
                            oldDriverOnline.save().success(function (driverOnline) {
                                callBack({Result: true, Data: [driverOnline]});
                            }).error(function (error) {
                                console.log("an error accord: ", error);
                                callBack(lib.errorCodes.setError('dbError'));
                            });
                        } else {
                            lib.dbConnection.OnlineDriver.create({
                                driverId: params.UserId,
                                lat: params.Lat,
                                long: params.Long,
                                rate: Math.floor((parseInt(checkUserResult.data.serviceProviderProfile.sum_rate) / parseInt(checkUserResult.data.serviceProviderProfile.rate_count)) * 100) / 100,
                                rate: Math.floor((checkUserResult.data.serviceProviderProfile.sum_rate / (checkUserResult.data.serviceProviderProfile.rate_count ? checkUserResult.data.serviceProviderProfile.rate_count : 1)) * 100) / 100,
                                sumTripCount: checkUserResult.data.serviceProviderProfile.sum_trip_counts,
                                sumTripRejected: checkUserResult.data.serviceProviderProfile.sum_trip_rejected,
                                current_situation_id: lib.Constants.setConstant("serviceProviderCurrentSituationOnline")
                            }).success(function (driverOnline) {
                                callBack({Result: true, Data: [driverOnline]});
                            }).error(function (error) {
                                console.log("an error accord: ", error);
                                callBack(lib.errorCodes.setError('dbError'));
                            });
                        }
                    }).error(function (error) {
                        console.log("an error accord: ", error);
                        callBack(lib.errorCodes.setError('dbError'));
                    });
                } else {
                    callBack(checkUserResult);
                }
            });
        } else {
            callBack(validationResult);
        }
    });
};
//******************SEPARATE******************
exports.allDrivers = function (params, callBack) {
    var repo = require('../include/repo');
    var repository = new repo();
    var validateParams = {"params": params, "requireParams": ['DeviceId', 'UserId']};
    repository.validate.validate(validateParams, function (validationResult) {
        if (validationResult.Result) {
            params.checkCustomer = true;
            repository.user.checkUserId(params, function (checkUserResult) {
                if (checkUserResult.Result) {
                    lib.dbConnection.OnlineDriver.findAll({
                        where: {current_situation_id: lib.Constants.setConstant("serviceProviderCurrentSituationOnline")}
                    }).success(function (drivers) {
                        callBack({Result: true, Data: [{drivers: drivers}]});
                    }).error(function (error) {
                        console.log("an error accord: ", error);
                        callBack(lib.errorCodes.setError('dbError'));
                    });
                } else {
                    callBack(checkUserResult);
                }
            });
        } else {
            callBack(validationResult);
        }
    });
};
//******************SEPARATE******************
exports.allNearDrivers = function (params, callBack) {
    var repo = require('../include/repo');
    var repository = new repo();
    var validateParams = {"params": params, "requireParams": ['DeviceId', 'UserId', 'SourceLat', 'SourceLong']};
    repository.validate.validate(validateParams, function (validationResult) {
        if (validationResult.Result) {
            params.checkCustomer = true;
            repository.user.checkUserId(params, function (checkUserResult) {
                if (checkUserResult.Result) {
                    lib.dbConnection.sequelize.query(
                        "SELECT " +
                        "`id`, " +
                        "`driverId`, " +
                        "`lat`, " +
                        "`long`, " +
                        "`direction`, " +
                        "`rate`, " +
                        "`sumTripCount`, " +
                        "`sumTripRejected`, " +
                        "`current_situation_id`, " +
                        "( 6371 * acos( cos( radians(" + params.SourceLat + ") ) * cos( radians( `lat` ) ) * cos( radians( `long` ) - radians(" + params.SourceLong + ") ) + sin( radians(" + params.SourceLat + ") ) * sin( radians( `lat` ) ) ) ) AS distance " +
                        "FROM `online_drivers` " +
                        "WHERE `current_situation_id`=2 " +
                        "HAVING distance < " + lib.Constants.setConstant("findingDriverCircularDistance") + " " +
                        "ORDER BY distance"
                    ).success(function (nearDrivers) {
                        var returnParams = [];
                        nearDrivers.forEach(function (driver) {
                            var driver0 = JSON.parse(JSON.stringify(driver));
                            var driver1 = JSON.parse(JSON.stringify(driver));
                            var driver2 = JSON.parse(JSON.stringify(driver));
                            var driver3 = JSON.parse(JSON.stringify(driver));
                            driver0.direction = parseInt(driver0.direction) ? parseInt(driver0.direction) : 0;

                            driver1.lat = parseFloat(driver0.lat) + .011;
                            driver1.long = parseFloat(driver0.long) + .016;
                            driver1.direction = parseInt(driver0.direction) + 170;
                            driver1.direction = driver1.direction >= 180 ? driver1.direction - 180 : driver1.direction;

                            driver2.lat = parseFloat(driver0.lat) + .013;
                            driver2.long = parseFloat(driver0.long) - .017;
                            driver2.direction = parseInt(driver0.direction) + 37;
                            driver2.direction = driver2.direction >= 180 ? driver2.direction - 180 : driver2.direction;

                            driver3.lat = parseFloat(driver0.lat) - .009;
                            driver3.long = parseFloat(driver.long) - .0059;
                            driver3.direction = parseInt(driver0.direction) + 140;
                            driver3.direction = driver3.direction >= 180 ? driver3.direction - 180 : driver3.direction;

                            returnParams.push(driver0);
                            returnParams.push(driver1);
                            returnParams.push(driver2);
                            returnParams.push(driver3);
                        });
                        callBack({Result: true, Data: [{drivers: returnParams}]});
                    }).error(function (error) {
                        console.log("an error accord: ", error);
                        callBack(lib.errorCodes.setError('dbError'));
                    });
                } else {
                    callBack(checkUserResult);
                }
            });
        } else {
            callBack(validationResult);
        }
    });
};
//******************SEPARATE******************
exports.findDriver = function (params, callBack) {
    var repo = require('../include/repo');
    var repository = new repo();
    var validateParams = {
        "params": params,
        "requireParams": ['DeviceId', 'UserId', 'SourceLat', 'SourceLong', 'DestinationLat', 'DestinationLong', 'TripPrice']
    };
    repository.validate.validate(validateParams, function (validationResult) {
        if (validationResult.Result) {
            params.checkCustomer = true;
            params.include = [{
                model: lib.dbConnection.CustomerProfile,
                attributes: ["current_situation_id", "gender_id", "full_name", "sum_trip_counts"]
            }];
            repository.user.checkUserId(params, function (userFlag) {
                if (userFlag.Result) {
                    userFlag.data.customerProfile.current_situation_id = lib.Constants.setConstant("customerCurrentSituationLookingForDriver");
                    userFlag.data.customerProfile.save({fields: ["current_situation_id"]}).success(function (customerNewProfile) {
                        repository.trip.insertTrip(params, function (trip) {
                            if (trip.Result) {
                                /*var query = "SELECT " +
                                 "`driverId`, " +
                                 "`lat`, " +
                                 "`long`, " +
                                 "@distance := ( 6371 * acos( cos( radians(" + params.SourceLat + ") ) * cos( radians( `lat` ) ) * cos( radians( `long` ) - radians(" + params.SourceLong + ") ) + sin( radians(" + params.SourceLat + ") ) * sin( radians( `lat` ) ) ) ) AS distance, " +
                                 "(IF (@distance*`sumTripRejected`=0,1000,((`rate`*`sumTripCount`)/(@distance*@distance*`sumTripRejected`))))as point " +
                                 "FROM `online_drivers` " +
                                 "WHERE `current_situation_id`=2 " +
                                 "HAVING distance < " + lib.Constants.setConstant("findingDriverCircularDistance") + " " +
                                 "ORDER BY point";*/
                                var query = "SELECT " +
                                    "`driverId`, " +
                                    "`lat`, " +
                                    "`long`, " +
                                    "( 6371 * acos( cos( radians(" + params.SourceLat + ") ) * cos( radians( `lat` ) ) * cos( radians( `long` ) - radians(" + params.SourceLong + ") ) + sin( radians(" + params.SourceLat + ") ) * sin( radians( `lat` ) ) ) ) AS distance " +
                                    "FROM `online_drivers` " +
                                    "WHERE `current_situation_id`=2 " +
                                    "HAVING distance < " + lib.Constants.setConstant("findingDriverCircularDistance") + " " +
                                    "ORDER BY distance";
                                lib.dbConnection.sequelize.query(query).success(function (nearDrivers) {
                                    var returnParams = [];
                                    nearDrivers.forEach(function (driver) {
                                        var driver0 = JSON.parse(JSON.stringify(driver));
                                        var driver1 = JSON.parse(JSON.stringify(driver));
                                        var driver2 = JSON.parse(JSON.stringify(driver));
                                        var driver3 = JSON.parse(JSON.stringify(driver));
                                        driver0.direction = parseInt(driver0.direction) ? parseInt(driver0.direction) : 0;

                                        driver1.lat = parseFloat(driver0.lat) + .011;
                                        driver1.long = parseFloat(driver0.long) + .016;
                                        driver1.direction = parseInt(driver0.direction) + 170;
                                        driver1.direction = driver1.direction >= 180 ? driver1.direction - 180 : driver1.direction;

                                        driver2.lat = parseFloat(driver0.lat) + .013;
                                        driver2.long = parseFloat(driver0.long) - .017;
                                        driver2.direction = parseInt(driver0.direction) + 37;
                                        driver2.direction = driver2.direction >= 180 ? driver2.direction - 180 : driver2.direction;

                                        driver3.lat = parseFloat(driver0.lat) - .009;
                                        driver3.long = parseFloat(driver.long) - .0059;
                                        driver3.direction = parseInt(driver0.direction) + 140;
                                        driver3.direction = driver3.direction >= 180 ? driver3.direction - 180 : driver3.direction;

                                        returnParams.push(driver0);
                                        returnParams.push(driver1);
                                        returnParams.push(driver2);
                                        returnParams.push(driver3);
                                    });
                                    var passenger = {};
                                    passenger.id = userFlag.data.id;
                                    passenger.balance = userFlag.data.balance;
                                    passenger.fullName = userFlag.data.customerProfile.full_name;
                                    passenger.genderId = userFlag.data.customerProfile.gender_id;
                                    passenger.mobile = userFlag.data.mobile;
                                    callBack({
                                        Result: true,
                                        drivers: returnParams,
                                        trip: trip.data,
                                        passenger: passenger,
                                        tripDestination: trip.tripDestination
                                    });
                                }).error(function (error) {
                                    console.log("an error accord: ", error);
                                    callBack(lib.errorCodes.setError('dbError'));
                                });
                            } else {
                                callBack(trip);
                            }
                        });
                    }).error(function (error) {
                        console.log("an error accord: ", error);
                        callBack(lib.errorCodes.setError('dbError'));
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
exports.tripRejected = function (params, callBack) {
    var repo = require('../include/repo');
    var repository = new repo();
    var validateParams = {"params": params, "requireParams": ['DeviceId', 'UserId', 'TripId']};
    repository.validate.validate(validateParams, function (validationResult) {
        if (validationResult.Result) {
            params.checkServiceProvider = true;
            params.include = [{
                model: lib.dbConnection.ServiceProviderProfile,
                attributes: ["sum_trip_rejected"]
            }];
            repository.user.checkUserId(params, function (userFlag) {
                if (userFlag.Result) {
                    userFlag.data.serviceProviderProfile.sum_trip_rejected++;
                    userFlag.data.serviceProviderProfile.save({fields: ['sum_trip_rejected']}).success(function (newProfile) {
                        callBack({Result: true});
                    }).error(function (error) {
                        console.log("an error accord: ", error);
                        callBack(lib.errorCodes.setError('dbError'));
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
exports.tripproblem = function (params, callBack) {
    var repo = require('../include/repo');
    var repository = new repo();
    var validateParams = {"params": params, "requireParams": ['DeviceId', 'UserId']};
    repository.validate.validate(validateParams, function (validationResult) {
        if (validationResult.Result) {
            params.checkServiceProvider = true;
            repository.user.checkUserId(params, function (userFlag) {
                if (userFlag.Result) {
                    callBack({Result: true});
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
exports.currentPosition = function (params, callBack) {
    var repo = require('../include/repo');
    var repository = new repo();
    var validateParams = {
        "params": params,
        "requireParams": ['DeviceId', 'UserId', 'OnlineDriverId', 'Lat', 'Long', 'Direction']
    };
    repository.validate.validate(validateParams, function (validationResult) {
        if (validationResult.Result) {
            params.checkServiceProvider = true;
            repository.user.checkUserId(params, function (checkUserResult) {
                if (checkUserResult.Result) {
                    lib.dbConnection.OnlineDriver.update({
                        lat: params.Lat,
                        long: params.Long,
                        direction: params.Direction,
                    }, {
                        id: params.OnlineDriverId
                    }).success(function (driverOnline) {
                        lib.dbConnection.OnlineDriver.find({
                            where:{id: params.OnlineDriverId}
                        }).success(function (driverOnline) {
                            if (params.TripId) {
                                lib.dbConnection.Trip.find({
                                    where: {id: params.TripId}
                                }).success(function (trip) {
                                    if (trip) {
                                        callBack({Result: true, driverOnline: driverOnline, trip: trip});
                                    } else {
                                        callBack({Result: true, driverOnline: driverOnline, trip: false});
                                    }
                                }).error(function (error) {
                                    console.log("an error accord: ", error);
                                    callBack(lib.errorCodes.setError('dbError'));
                                });
                            } else {
                                callBack({Result: true, driverOnline: driverOnline, trip: false});
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
                    callBack(checkUserResult);
                }
            });
        } else {
            callBack(validationResult);
        }
    });
};
//******************SEPARATE******************
exports.setDriverOffline = function (params, callBack) {
    var repo = require('../include/repo');
    var repository = new repo();
    var validateParams = {"params": params, "requireParams": ['DeviceId', 'UserId', 'OnlineDriverId']};
    repository.validate.validate(validateParams, function (validationResult) {
        if (validationResult.Result) {
            params.checkServiceProvider = true;
            params.include = [lib.dbConnection.ServiceProviderProfile];
            repository.user.checkUserId(params, function (checkUserResult) {
                if (checkUserResult.Result) {
                    lib.dbConnection.OnlineDriver.destroy({
                        id: params.OnlineDriverId
                    }).success(function (driverOnline) {
                        checkUserResult.data.serviceProviderProfile.current_situation_id = lib.Constants.setConstant("serviceProviderCurrentSituationOffline");
                        checkUserResult.data.serviceProviderProfile.save({fields: ["current_situation_id"]}).success(function (driverProfile) {
                            callBack({Result: true});
                        }).error(function (error) {
                            console.log("an error accord: ", error);
                            callBack(lib.errorCodes.setError('dbError'));
                        });
                    }).error(function (error) {
                        console.log("an error accord: ", error);
                        callBack(lib.errorCodes.setError('dbError'));
                    });
                } else {
                    callBack(checkUserResult);
                }
            });
        } else {
            callBack(validationResult);
        }
    });
};
//******************SEPARATE******************
exports.getInfo = function (params, callBack) {
    var repo = require('../include/repo');
    var repository = new repo();
    var validateParams = {"params": params, "requireParams": ['DeviceId', 'UserId', 'SituationId']};
    repository.validate.validate(validateParams, function (validationResult) {
        if (validationResult.Result) {
            var userParams = params;
            userParams.checkServiceProvider = true;
            userParams.include = [{
                model: lib.dbConnection.ServiceProviderProfile,
                // attributes: ["current_situation_id"]
            }];
            repository.user.checkUserId(userParams, function (checkUserResult) {
                if (checkUserResult.Result) {
                    lib.dbConnection.OnlineDriver.find({
                        driverId: params.UserId
                    }).success(function (driverOnline) {
                        var situation = params.SituationId;
                        // var situation = checkUserResult.data.serviceProviderProfile.current_situation_id;
                        switch (situation) {
                            case 4: {
                                var getInfoParams = {
                                    user: checkUserResult.data,
                                    onlineDriver: driverOnline,
                                    tripSituationId: lib.Constants.setConstant("tripSituationWaitingForDriver")
                                };
                                repository.trip.getDriverTripInfo(getInfoParams, function (driverTripRes) {
                                    callBack(driverTripRes);
                                });
                                break;
                            }
                            case 5: {
                                var getInfoParams = {
                                    user: checkUserResult.data,
                                    onlineDriver: driverOnline,
                                    tripSituationId: lib.Constants.setConstant("tripSituationWaitingForPassenger")
                                };
                                repository.trip.getDriverTripInfo(getInfoParams, function (driverTripRes) {
                                    callBack(driverTripRes);
                                });
                                break;
                            }
                            case 6: {
                                var getInfoParams = {
                                    user: checkUserResult.data,
                                    onlineDriver: driverOnline,
                                    tripSituationId: lib.Constants.setConstant("tripSituationOnTrip")
                                };
                                repository.trip.getDriverOnTripInfo(getInfoParams, function (driverTripRes) {
                                    callBack(driverTripRes);
                                });
                                break;
                            }
                            case 7: {
                                var getInfoParams = {
                                    user: checkUserResult.data,
                                    onlineDriver: driverOnline,
                                    paymentAmount: true,
                                    tripSituationId: lib.Constants.setConstant("tripSituationWaitingForConfirmPayment")
                                };
                                repository.trip.getDriverTripInfo(getInfoParams, function (driverTripRes) {
                                    callBack(driverTripRes);
                                });
                                break;
                            }
                            case 8: {
                                var getInfoParams = {
                                    user: checkUserResult.data,
                                    onlineDriver: driverOnline,
                                    paymentAmount: true,
                                    tripSituationId: lib.Constants.setConstant("tripSituationTripDone")
                                };
                                repository.trip.getDriverTripInfo(getInfoParams, function (driverTripRes) {
                                    callBack(driverTripRes);
                                });
                                break;
                            }
                            case 9: {
                                var getInfoParams = {
                                    user: checkUserResult.data,
                                    onlineDriver: driverOnline,
                                    paymentAmount: true,
                                    tripSituationId: lib.Constants.setConstant("tripSituationTripDone")
                                };
                                repository.trip.getDriverRejectTripInfo(getInfoParams, function (driverTripRes) {
                                    callBack(driverTripRes);
                                });
                                break;
                            }
                            default: {
                                var returnParams = JSON.parse(JSON.stringify(checkUserResult.data.serviceProviderProfile));
                                returnParams.onlineDriverId = driverOnline ? driverOnline.id : null;
                                callBack({Result: true, Data: [returnParams]});
                            }
                        }
                    }).error(function (error) {
                        console.log("an error accord: ", error);
                        callBack(lib.errorCodes.setError('dbError'));
                    });
                } else {
                    callBack(checkUserResult);
                }
            });
        } else {
            callBack(validationResult);
        }
    });
};
//******************SEPARATE******************
exports.getSituation = function (params, callBack) {
    var repo = require('../include/repo');
    var repository = new repo();
    var validateParams = {"params": params, "requireParams": ['DeviceId', 'UserId']};
    repository.validate.validate(validateParams, function (validationResult) {
        if (validationResult.Result) {
            var userParams = params;
            userParams.checkServiceProvider = true;
            userParams.include = [{
                model: lib.dbConnection.ServiceProviderProfile,
                attributes: ["current_situation_id"]
            }];
            repository.user.checkUserId(userParams, function (checkUserResult) {
                if (checkUserResult.Result) {
                    lib.dbConnection.OnlineDriver.find({
                        driverId: params.UserId
                    }).success(function (driverOnline) {
                        if (checkUserResult.data.serviceProviderProfile.current_situation_id == lib.Constants.setConstant("serviceProviderCurrentSituationOffline")) {
                            var UDCSParams = {};
                            UDCSParams.DriverId = params.UserId;
                            UDCSParams.SituationId = lib.Constants.setConstant("serviceProviderCurrentSituationOnline");
                            repository.user.updateDriverCurrentSituation(UDCSParams, function (DSituationResult) {
                                callBack({Result: true, Data: [driverOnline]});
                            });
                        }
                    }).error(function (error) {
                        console.log("an error accord: ", error);
                        callBack(lib.errorCodes.setError('dbError'));
                    });
                } else {
                    callBack(checkUserResult);
                }
            });
        } else {
            callBack(validationResult);
        }
    });
};
//******************SEPARATE******************
exports.getPassengerInfo = function (params, callBack) {
    var repo = require('../include/repo');
    var repository = new repo();
    var validateParams = {"params": params, "requireParams": ['DeviceId', 'UserId', 'SituationId']};
    repository.validate.validate(validateParams, function (validationResult) {
        if (validationResult.Result) {
            var userParams = params;
            userParams.checkCustomer = true;
            userParams.include = [{
                model: lib.dbConnection.CustomerProfile,
            }];
            repository.user.checkUserId(userParams, function (checkUserResult) {
                if (checkUserResult.Result) {
                    var situation = parseInt(params.SituationId);
                    switch (situation) {
                        case 10: {
                            callBack({Result: true, Data: [{mobile: checkUserResult.data.mobile}]});
                            break;
                        }
                        case 11: {
                            callBack({Result: true, Data: {
                                id : checkUserResult.data.id,
                                email : checkUserResult.data.email,
                                mobile : checkUserResult.data.mobile,
                                balance : checkUserResult.data.balance
                            }});
                            break;
                        }
                        case 1: {
                            callBack({Result: true});
                            break;
                        }
                        case 2: {
                            callBack({Result: true});
                            break;
                        }
                        case 4: {
                            var getInfoParams = {
                                user: checkUserResult.data,
                                tripSituationId: lib.Constants.setConstant("tripSituationWaitingForDriver")
                            };
                            repository.trip.getPassengerTripInfoRun(getInfoParams, function (driverTripRes) {
                                callBack(driverTripRes);
                            });
                            break;
                        }
                        case 5: {
                            var getInfoParams = {
                                user: checkUserResult.data,
                                tripSituationId: lib.Constants.setConstant("tripSituationWaitingForPassenger")
                            };
                            repository.trip.getPassengerTripInfoRun(getInfoParams, function (driverTripRes) {
                                callBack(driverTripRes);
                            });
                            break;
                        }
                        case 6: {
                            var getInfoParams = {
                                user: checkUserResult.data,
                                tripSituationId: lib.Constants.setConstant("tripSituationOnTrip")
                            };
                            repository.trip.getPassengerOnTripInfoRun(getInfoParams, function (driverTripRes) {
                                callBack(driverTripRes);
                            });
                            break;
                        }
                        case 7: {
                            var getInfoParams = {
                                user: checkUserResult.data,
                                paymentAmount: true,
                                tripSituationId: lib.Constants.setConstant("tripSituationWaitingForConfirmPayment")
                            };
                            repository.trip.getPassengerTripInfoRun(getInfoParams, function (driverTripRes) {
                                callBack(driverTripRes);
                            });
                            break;
                        }
                        case 8: {
                            var getInfoParams = {
                                user: checkUserResult.data,
                                paymentAmount: true,
                                tripSituationId: lib.Constants.setConstant("tripSituationTripDone")
                            };
                            repository.trip.getPassengerTripInfoRun(getInfoParams, function (driverTripRes) {
                                callBack(driverTripRes);
                            });
                            break;
                        }
                        default: {
                            callBack(lib.errorCodes.setError('dbError'));
                        }
                    }
                } else {
                    callBack(checkUserResult);
                }
            });
        } else {
            callBack(validationResult);
        }
    });
};
//******************SEPARATE******************
exports.getPassengerInfoBalance = function (params, callBack) {
    var repo = require('../include/repo');
    var repository = new repo();
    var validateParams = {"params": params, "requireParams": ['DeviceId', 'UserId']};
    repository.validate.validate(validateParams, function (validationResult) {
        if (validationResult.Result) {
            var userParams = params;
            userParams.checkCustomer = true;
            userParams.include = [{
                model: lib.dbConnection.CustomerProfile,
            }];
            repository.user.checkUserId(userParams, function (checkUserResult) {
                if (checkUserResult.Result) {
                    callBack({Result: true, Data: {
                        id : checkUserResult.data.id,
                        email : checkUserResult.data.email,
                        mobile : checkUserResult.data.mobile,
                        balance : checkUserResult.data.balance
                    }});
                } else {
                    callBack(checkUserResult);
                }
            });
        } else {
            callBack(validationResult);
        }
    });
};
//******************SEPARATE******************
exports.getPassengerSituation = function (params, callBack) {
    var repo = require('../include/repo');
    var repository = new repo();
    var validateParams = {"params": params, "requireParams": ['DeviceId', 'UserId']};
    repository.validate.validate(validateParams, function (validationResult) {
        if (validationResult.Result) {
            var userParams = params;
            userParams.checkCustomer = true;
            userParams.include = [{
                model: lib.dbConnection.CustomerProfile,
                attributes: ["current_situation_id"]
            }];
            repository.user.checkUserId(userParams, function (checkUserResult) {
                if (checkUserResult.Result) {
                    lib.dbConnection.OnlineDriver.find({
                        driverId: params.UserId
                    }).success(function (driverOnline) {
                        if (checkUserResult.data.customerProfile.current_situation_id == lib.Constants.setConstant("customerCurrentSituationOffline")) {
                            var UPCSParams = {};
                            UPCSParams.PassengerId = params.UserId;
                            UPCSParams.SituationId = lib.Constants.setConstant("customerCurrentSituationDetermineSourceAndDestination");
                            repository.user.updatePassengerCurrentSituation(UPCSParams, function (PSituationResult) {
                                callBack({Result: true, Data: [driverOnline]});
                            });
                        }
                    }).error(function (error) {
                        console.log("an error accord: ", error);
                        callBack(lib.errorCodes.setError('dbError'));
                    });
                } else {
                    callBack(checkUserResult);
                }
            });
        } else {
            callBack(validationResult);
        }
    });
};
//******************SEPARATE******************
exports.getDriverLocation = function (params, callBack) {
    var repo = require('../include/repo');
    var repository = new repo();
    var validateParams = {"params": params, "requireParams": ['DeviceId', 'UserId', 'TripId']};
    repository.validate.validate(validateParams, function (validationResult) {
        if (validationResult.Result) {
            var userParams = params;
            userParams.checkCustomer = true;
            repository.user.checkUserId(userParams, function (checkUserResult) {
                if (checkUserResult.Result) {
                    lib.dbConnection.Trip.find({where: {id: params.TripId}}).success(function (trip) {
                        if (trip) {
                            lib.dbConnection.OnlineDriver.find({driverId: trip.driver_user_id}).success(function (driverOnline) {
                                if (driverOnline) {
                                    callBack({Result: true, data: driverOnline});
                                } else {
                                    callBack(lib.errorCodes.setError('noOnlineDriverFound'));
                                }
                            }).error(function (error) {
                                console.log("an error accord: ", error);
                                callBack(lib.errorCodes.setError('dbError'));
                            });
                        } else {
                            callBack(lib.errorCodes.setError('notExistRecord'));
                        }
                    }).error(function (error) {
                        console.log("an error accord: ", error);
                        callBack(lib.errorCodes.setError('dbError'));
                    });
                } else {
                    callBack(checkUserResult);
                }
            });
        } else {
            callBack(validationResult);
        }
    });
};