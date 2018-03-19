var lib = require('../../include/lib');
var tools = require('../../include/tools');
var repo = require('../../repository/backendRepo');
var theNamespace = 'backend';
//************************************//
exports.index = function (req, res) {
    tools.getLoggedInUser(theNamespace, req.sessionID, function (userLoggedIn) {
        if (userLoggedIn === false) {
            res.redirect('/' + theNamespace + '/login');
        } else {
            if (req.body.pageSize) {
                var pageSize = req.body.pageSize;
            } else {
                var pageSize = 10;
            }
            if (req.body.page) {
                var page = req.body.page;
            } else {
                var page = 1;
            }
            if (req.body.sortField && req.body.sortField != '') {
                var sortArray = req.body.sortField.split('.');
                for (var i = 0; i < (sortArray.length - 1); i++) {
                    sortArray[i] = lib.dbConnection[sortArray[i]];
                }
                sortArray.push(req.body.sortCondition);
                var order = [sortArray];
            } else {
                var order = [['id', 'DESC']];
            }
            var offset = (page - 1) * pageSize;
            if (req.body.searchFlag == 1) {
                offset = 0;
                page = 1;
            }
            var findParams = {
                where: {trip_situation_id: lib.Constants.setConstant("tripSituationTripCancel")},
                include: [{
                    model: lib.dbConnection.User,
                    as: "passengerUser",
                    include: [{
                        model: lib.dbConnection.CustomerProfile
                    }]
                }, {
                    model: lib.dbConnection.User,
                    as: "driverUser",
                    include: [{
                        model: lib.dbConnection.ServiceProviderProfile
                    }]
                }, {
                    model: lib.dbConnection.TripDestination,
                }],
                limit: parseInt(pageSize),
                offset: offset,
                order: order
            };
            lib.dbConnection.Trip.findAndCountAll(findParams).then(function (result) {
                res.render(theNamespace + '/unsuccessful_trips/index', {
                    userLoggedInDetails: userLoggedIn,
                    posts: req.body,
                    paging: lib.paging(page, pageSize, result.count),
                    data: result.rows,
                    selectedMenu: 'unsuccessfulTrip'
                });
            }).catch(function (error) {
                console.log('an error accord: ', error);
                res.json(lib.errorCodes.setError('dbError'));
            });
        }
    });
};
//******************SEPARATE******************
exports.excel = function (req, res) {
    var excel = require('../../repository/backendRepo/excelRepository');
    var excelParams = {
        colsCount: 12,
        fileName: 'unsuccessfulTripLog',
        headers: [
            [{
                data: 'ردیف'
            }, {
                data: 'تاریخ'
            }, {
                data: 'ساعت'
            }, {
                data: 'نام مسافر'
            }, {
                data: 'کد مسافر'
            }, {
                data: 'کد سفر'
            }, {
                data: 'نام راننده'
            }, {
                data: 'کد راننده'
            }, {
                data: 'کد معرف'
            }, {
                data: 'مبلغ سفر'
            }, {
                data: 'مکان سفر'
            }, {
                data: 'علت عدم انجام سفر'
            }]
        ],
        rows: [],
        footers: []
    };
    lib.dbConnection.Trip.findAll({
        where: {trip_situation_id: lib.Constants.setConstant("tripSituationTripCancel")},
        include: [{
            model: lib.dbConnection.User,
            as: "passengerUser",
            include: [{
                model: lib.dbConnection.CustomerProfile
            }]
        }, {
            model: lib.dbConnection.User,
            as: "driverUser",
            include: [{
                model: lib.dbConnection.ServiceProviderProfile
            }]
        }, {
            model: lib.dbConnection.TripDestination,
        }]
    }).then(function (trips) {
        trips.forEach(function (row, index) {
            var excelRow = [];
            excelRow.push({data: index + 1});
            excelRow.push({data: lib.moment(row.request_time).format("jYYYY-jMM-jDD")});
            excelRow.push({data: lib.moment(row.request_time).format("HH:mm")});
            excelRow.push({data: row.passengerUser?row.passengerUser.customerProfile?row.passengerUser.customerProfile.full_name:"-":"-"});
            excelRow.push({data: row.passenger_user_id||"-"});
            excelRow.push({data: row.trip_code||"-"});
            excelRow.push({data: row.driverUser?row.driverUser.serviceProviderProfile?row.driverUser.serviceProviderProfile.first_name+" "+row.driverUser.serviceProviderProfile.last_name:"-":"-"});
            excelRow.push({data: row.driver_user_id||"-"});
            excelRow.push({data: row.driverUser?row.driverUser.serviceProviderProfile?row.driverUser.serviceProviderProfile.representer_code:"-":"-"});
            excelRow.push({data: row.net_price||"-"});
            excelRow.push({data: (row.tripDestinations && row.tripDestinations.length)?row.tripDestinations[0].destination_label:"-"});
            excelRow.push({data: row.description||"-"});
            excelParams.rows.push(excelRow);
        });
        excelParams.rowsCount = excelParams.rows.length + 1;
        // return res.json(excelParams);
        excel.generate(excelParams, function (excelResult) {
            res.redirect('/app/' + excelParams.fileName + '.xlsx');
        });
    }).catch(function (error) {
        console.log('an error accord: ', error);
        res.json(lib.errorCodes.setError('dbError'));
    });
};