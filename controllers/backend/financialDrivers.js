var lib = require('../../include/lib');
var tools = require('../../include/tools');
var repo = require('../../repository/backendRepo');
var theNamespace = 'backend';
//******************Main query for this module******************
var mainQuery = 'SELECT users.id,service_provider_profile.first_name,service_provider_profile.last_name,service_provider_profile.representer_code,service_provider_profile.special_code,users.balance,service_provider_profile.last_pony_date FROM users inner JOIN service_provider_profile on service_provider_profile.user_id=users.id WHERE users.situation_id=1 ';
var today = lib.dayBeforeDate();
var todayStart = Date.parse(today.date+' 00:00:00');
var todayEnd = Date.parse(today.date+' 23:59:59');
var subQueries=[
    {
        query: "SELECT SUM(system_slice) as total_slice FROM trip WHERE trip.trip_situation_id=" + lib.Constants['tripSituationTripDone'],
        name: 'total_slice'
    },
    {
        query: "select sum(amount) as total_pony from payment_pony",
        name: 'total_pony'
    },
    {
        query: "select SUM(balance) as total_demand from users where users.user_type_id=1 and balance < 0",
        name: 'total_demand'
    },
    {
        query: "select SUM(balance) as total_debt from users where users.user_type_id=1 and balance > 0",
        name: 'total_debt'
    },
    {
        // query:"SELECT SUM(system_slice) as total_today_slice FROM trip WHERE trip.trip_situation_id=6 and trip.trip_millisecond >='"+parseInt(Date.parse(new Date)-86400000)+"'",
        query:"SELECT SUM(system_slice) as total_today_slice FROM trip WHERE trip.trip_situation_id=6 and trip.trip_millisecond between '"+todayStart+"' AND '"+todayEnd+"'",
        name:'total_today_slice'
    },
]
var pageLength = 10;
Date.prototype.customFormat = function (formatString) {
    var YYYY, YY, MMMM, MMM, MM, M, DDDD, DDD, DD, D, hhhh, hhh, hh, h, mm, m, ss, s, ampm, AMPM, dMod, th;
    YY = ((YYYY = this.getFullYear()) + "").slice(-2);
    MM = (M = this.getMonth() + 1) < 10 ? ('0' + M) : M;
    MMM = (MMMM = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][M - 1]).substring(0, 3);
    DD = (D = this.getDate()) < 10 ? ('0' + D) : D;
    DDD = (DDDD = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][this.getDay()]).substring(0, 3);
    th = (D >= 10 && D <= 20) ? 'th' : ((dMod = D % 10) == 1) ? 'st' : (dMod == 2) ? 'nd' : (dMod == 3) ? 'rd' : 'th';
    formatString = formatString.replace("#YYYY#", YYYY).replace("#YY#", YY).replace("#MMMM#", MMMM).replace("#MMM#", MMM).replace("#MM#", MM).replace("#M#", M).replace("#DDDD#", DDDD).replace("#DDD#", DDD).replace("#DD#", DD).replace("#D#", D).replace("#th#", th);
    h = (hhh = this.getHours());
    if (h == 0) h = 24;
    if (h > 12) h -= 12;
    hh = h < 10 ? ('0' + h) : h;
    hhhh = h < 10 ? ('0' + hhh) : hhh;
    AMPM = (ampm = hhh < 12 ? 'am' : 'pm').toUpperCase();
    mm = (m = this.getMinutes()) < 10 ? ('0' + m) : m;
    ss = (s = this.getSeconds()) < 10 ? ('0' + s) : s;
    return formatString.replace("#hhhh#", hhhh).replace("#hhh#", hhh).replace("#hh#", hh).replace("#h#", h).replace("#mm#", mm).replace("#m#", m).replace("#ss#", ss).replace("#s#", s).replace("#ampm#", ampm).replace("#AMPM#", AMPM);
};
//******************Main query for this module******************
exports.index = function (req, res) {
    tools.getLoggedInUser(theNamespace, req.sessionID, function (userLoggedIn) {
        if (userLoggedIn === false) {
            res.redirect('/' + theNamespace + '/login');
        } else {
            var query = mainQuery + "order by users.id desc";
            var chainer = new lib.Sequelize.Utils.QueryChainer;
            for (var subQuery in subQueries) {
                chainer.add(lib.dbConnection.sequelize.query(subQueries[subQuery].query))
            }
            chainer.run().success(function (allDetails) {
                lib.dbConnection.sequelize.query(query).complete(function (err, drivers) {
                    console.log("err", err);
                    // var allDataCount = drivers.length;
                    // var drivers = repo.paginate(drivers, 1, pageLength)
                    res.render(theNamespace + '/financial_drivers/index', {
                        userLoggedInDetails: userLoggedIn,
                        data: drivers,
                        // data: drivers.data,
                        // pageParams: drivers.pageParams,
                        // allDataCount:allDataCount,
                        allDetails: allDetails,
                        selectedMenu: 'financialDrivers'
                    });
                })
            })
        }
    })
};
//******************Main query for this module******************
exports.ponyDriver = function (req, res) {
    tools.getLoggedInUser(theNamespace, req.sessionID, function (userLoggedIn) {
        if (userLoggedIn === false) {
            res.json({result: false, message: "شما اجزه دسترسی به این صفحه را ندارید."});
        } else {
            lib.dbConnection.Trip.findAll({
                where: {
                    driver_user_id: req.body.id,
                    trip_situation_id: lib.Constants.setConstant("tripSituationTripDone"),
                    payment_pony_id: null
                },
                include: [{
                    model: lib.dbConnection.Payment,
                    attributes: ["payment_method_id"]
                }],
                order: 'trip_millisecond ASC'
            }).then(function (trips) {
                if (trips.length) {
                    var amount = 0;
                    for (var i in trips) {
                        if (trips[i].payment.payment_method_id == lib.Constants.setConstant("paymentMethodCash")) {
                            amount -= parseInt(trips[i].system_slice);
                        } else {
                            amount += parseInt(trips[i].driver_slice);
                        }
                    }
                    lib.dbConnection.PaymentPony.create({
                        user_id: req.body.id,
                        amount: amount,
                        pony_start_date: trips[0].start_time,
                        pony_end_date: trips[(trips.length - 1)].start_time,
                        creator_user_id: userLoggedIn.id,
                        creator_user_ip: req.client.remoteAddress
                    }).then(function (paymentPony) {
                        lib.async.forEach(trips, function (trip, cb) {
                            trip.payment_pony_id = paymentPony.id;
                            trip.save({fields: ["payment_pony_id"]}).then(function (newTrip) {
                                cb();
                            }).catch(function (error) {
                                console.log("an error accord: ", error);
                                callBack(lib.errorCodes.setError('dbError'));
                            });
                        }, function (err) {
                            if (err) {
                                return next(err);
                            }
                            lib.dbConnection.User.update({balance: 0}, {id: req.body.id}).then(function (user) {
                                lib.dbConnection.ServiceProviderProfile.update({last_pony_date: new Date()}, {user_id: req.body.id}).then(function (ServiceProviderProfile) {
                                    var notificationObject = {};
                                    notificationObject.image = null
                                    notificationObject.created_at = Date.parse(new Date);
                                    notificationObject.title = "تسویه حساب";
                                    notificationObject.body = "تسویه حساب شما انجام شد";
                                    notificationObject.notification_type_id = 4;
                                    notificationObject.receiver_user_id = req.body.id;
                                    lib.dbConnection.Notification.create(notificationObject).complete(function (err, result) {
                                        console.log("err", err);
                                        lib.dbConnection.UserToken.findAll({where: {user_id: req.body.id}}).complete(function (err, userTokens) {
                                            var toSendNotify = {
                                                'title': notificationObject.title,
                                                'description': notificationObject.body,
                                                'photo': notificationObject.image,
                                                'created_at': Date.parse(new Date),
                                                'user_id': null
                                            };
                                            var notification = require('../../repository/backendRepo/notificationRepository');
                                            notification.send(userTokens, toSendNotify, function (result) {
                                                console.log("result", result);
                                            });
                                            res.json({Result: true});
                                        });
                                    });
                                }).catch(function (error) {
                                    console.log("an error accord: ", error);
                                    callBack(lib.errorCodes.setError('dbError'));
                                });
                            }).catch(function (error) {
                                console.log("an error accord: ", error);
                                callBack(lib.errorCodes.setError('dbError'));
                            });
                        });
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
    })
};
//******************SEPARATE******************
exports.search = function (req, res) {
    tools.getLoggedInUser(theNamespace, req.sessionID, function (userLoggedIn) {
        if (userLoggedIn === false) {
            res.redirect('/' + theNamespace + '/login');
        } else {
            var body;
            body = req.body;
            if (body.empty == 'true') {
                body['driver_name'] = req.session.fDriverDriverName;
                body['special_code'] = req.session.fDriverSpecialCode;
                body['start_balance'] = req.session.fDriverStartBalance;
                body['end_balance'] = req.session.fDriverEndBalance;
                body['start_date'] = req.session.fDriverStartDate;
                body['end_date'] = req.session.fDriverEndDate;
                body['balance_status'] = req.session.fDriverBalanceStatus;
            } else {
                req.session.fDriverDriverName = body['driver_name'];
                req.session.fDriverSpecialCode = body['special_code'];
                req.session.fDriverStartBalance = body['start_balance'];
                req.session.fDriverEndBalance = body['end_balance'];
                req.session.fDriverStartDate = body['start_date'];
                req.session.fDriverEndDate = body['end_date'];
                req.session.fDriverBalanceStatus = body['balance_status'];
            }
            lib.async.auto
            (
                {
                    findAll: function (cb, results) {
                        var query = mainQuery + "AND "
                        for (var key in body) {
                            if (body[key] && body[key] != '' && body[key] != 'null') {
                                switch (key) {
                                    case "driver_name" :
                                        query += " (first_name LIKE '%" + body[key] + "%' OR last_name LIKE '%" + body[key] + "%') AND "
                                        break;
                                    case "special_code" :
                                        query += " special_code LIKE '%" + body[key] + "%' AND "
                                        break;
                                    case "start_balance" :
                                        query += " users.balance >= '" + body[key] + "' AND "
                                        break;
                                    case "end_balance" :
                                        query += " users.balance <= '" + body[key] + "' AND "
                                        break;
                                    case "start_date" :
                                        var startDate = lib.moment(body[key], 'jYYYY/jMM/jDD').format('YYYY-MM-DD');
                                        query += " last_pony_date >= '" + startDate + "' AND "
                                        break;
                                    case "end_date" :
                                        var endDate = lib.moment(body[key], 'jYYYY/jMM/jDD').format('YYYY-MM-DD');
                                        query += " last_pony_date <= '" + endDate + "' AND "
                                        break;
                                    case "balance_status" :
                                        query += " users.balance " + (body[key] == "+" ? "> 0 " : " < 0") + " AND "
                                        break;
                                }
                            }
                        }
                        query += " users.id <> 0 order by users.id desc"
                        lib.dbConnection.sequelize.query(query).complete(function (err, drivers) {
                            console.log("err", err)
                            cb(null, {result: drivers || []})
                        })
                    }
                },
                function (err, allResult) {
                    // var allDataCount = allResult.findAll.result.length;
                    // var rows = repo.paginate(allResult.findAll.result, req.params.pageIndex, pageLength)
                    res.render(theNamespace + '/financial_drivers/view', {
                        // allDataCount: allDataCount,
                        userLoggedInDetails: userLoggedIn,
                        data: allResult.findAll.result,
                        // pageParams: rows.pageParams,
                        selectedMenu: 'financialDrivers'
                    });
                }
            )
        }
    })
};
//******************SEPARATE******************
exports.excel = function (req, res) {
    var excelbuilder = require('msexcel-builder');
    Date.prototype.customFormat = function (formatString) {
        var YYYY, YY, MMMM, MMM, MM, M, DDDD, DDD, DD, D, hhhh, hhh, hh, h, mm, m, ss, s, ampm, AMPM, dMod, th;
        YY = ((YYYY = this.getFullYear()) + "").slice(-2);
        MM = (M = this.getMonth() + 1) < 10 ? ('0' + M) : M;
        MMM = (MMMM = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][M - 1]).substring(0, 3);
        DD = (D = this.getDate()) < 10 ? ('0' + D) : D;
        DDD = (DDDD = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][this.getDay()]).substring(0, 3);
        th = (D >= 10 && D <= 20) ? 'th' : ((dMod = D % 10) == 1) ? 'st' : (dMod == 2) ? 'nd' : (dMod == 3) ? 'rd' : 'th';
        formatString = formatString.replace("#YYYY#", YYYY).replace("#YY#", YY).replace("#MMMM#", MMMM).replace("#MMM#", MMM).replace("#MM#", MM).replace("#M#", M).replace("#DDDD#", DDDD).replace("#DDD#", DDD).replace("#DD#", DD).replace("#D#", D).replace("#th#", th);
        h = (hhh = this.getHours());
        if (h == 0) h = 24;
        if (h > 12) h -= 12;
        hh = h < 10 ? ('0' + h) : h;
        hhhh = h < 10 ? ('0' + hhh) : hhh;
        AMPM = (ampm = hhh < 12 ? 'am' : 'pm').toUpperCase();
        mm = (m = this.getMinutes()) < 10 ? ('0' + m) : m;
        ss = (s = this.getSeconds()) < 10 ? ('0' + s) : s;
        return formatString.replace("#hhhh#", hhhh).replace("#hhh#", hhh).replace("#hh#", hh).replace("#h#", h).replace("#mm#", mm).replace("#m#", m).replace("#ss#", ss).replace("#s#", s).replace("#ampm#", ampm).replace("#AMPM#", AMPM);
    };
    lib.async.auto(
        {
            forms: function (cb, forms) {
                var body, query;
                body = req.body
                var query = mainQuery + " AND "
                for (var key in body) {
                    if (body[key] && body[key] != '' && body[key] != 'null') {
                        switch (key) {
                            case "driver_name" :
                                query += " (first_name LIKE '%" + body[key] + "%' OR last_name LIKE '%" + body[key] + "%') AND "
                                break;
                            case "special_code" :
                                query += " special_code LIKE '%" + body[key] + "%' AND "
                                break;
                            case "start_balance" :
                                query += " users.balance >= '" + body[key] + "' AND "
                                break;
                            case "end_balance" :
                                query += " users.balance <= '" + body[key] + "' AND "
                                break;
                            case "start_date" :
                                var startDate = lib.moment(body[key], 'jYYYY/jMM/jDD').format('YYYY-MM-DD');
                                query += " last_pony_date >= '" + startDate + "' AND "
                                break;
                            case "end_date" :
                                var endDate = lib.moment(body[key], 'jYYYY/jMM/jDD').format('YYYY-MM-DD');
                                query += " last_pony_date <= '" + endDate + "' AND "
                                break;
                            case "balance_status" :
                                query += " users.balance " + (body[key] == "+" ? "> 0 " : " < 0") + " AND "
                                break;
                        }
                    }
                }
                query += " users.id <> 0 order by users.id desc"
                lib.dbConnection.sequelize.query(query).complete(function (err, result) {
                    console.log("err", err)
                    cb(null, result)
                })
            },
            showData: ['forms', function (cb, results) {
                var users = results.forms;
                var file = "لیست مالی رانندگان";
                var workbook2 = excelbuilder.createWorkbook('./public/app/', file + '.xlsx')
                var sheet2 = workbook2.createSheet('sheet2', 7, users.length + 1);
                sheet2.set(1, 1, 'ردیف');
                sheet2.set(2, 1, 'راننده');
                sheet2.set(3, 1, 'کد راننده');
                sheet2.set(4, 1, 'کد معرف');
                sheet2.set(5, 1, 'موجودی حساب');
                sheet2.set(6, 1, 'وضعیت');
                sheet2.set(7, 1, 'تاریخ آخرین تسویه');
                // Save it
                for (var row = 2; row < users.length + 2; row++) {
                    sheet2.set(1, row, users[row - 2].id);
                    sheet2.set(2, row, users[row - 2].first_name + " " + users[row - 2].last_name);
                    sheet2.set(3, row, users[row - 2].special_code);
                    sheet2.set(4, row, users[row - 2].representer_code||"-")
                    sheet2.set(5, row, users[row - 2].balance)
                    sheet2.set(6, row, users[row - 2].balance > 0 ? 'بستانکار' : (users[row - 2].balance == 0 ? "تسویه" : 'بدهکار'));
                    sheet2.set(7, row, lib.moment(new Date(users[row - 2].last_pony_date).customFormat("#YYYY#/#MM#/#DD#").toString(), 'YYYY/MM/DD').format('jYYYY/jMM/jDD'));
                }
                workbook2.save(function (err) {
                    res.json('/app/' + file + '.xlsx')
                });
            }]
        },
        function (err, allResult) {
        }
    );
};
//******************SEPARATE******************
exports.totalSettlement = function (req, res) {
    tools.getLoggedInUser(theNamespace, req.sessionID, function (userLoggedIn) {
        if (userLoggedIn === false) {
            res.redirect('/' + theNamespace + '/login');
        } else {
            var query = "SELECT (select sum(users.balance) from users where users.user_type_id=1 and users.balance > 0 ) as total_balance,users.id,users.balance,service_provider_profile.first_name,service_provider_profile.last_name,service_provider_profile.bank_shaba_number FROM users inner join service_provider_profile on service_provider_profile.user_id=users.id where users.balance > 0 group by users.id order by users.id desc ";
            lib.dbConnection.sequelize.query(query).complete(function (err, data) {
                console.log("err", err)
                lib.dbConnection.PaymentTotalPony.create({
                    situation_id: 1
                }).complete(function (err, pony) {
                    console.log("err", err)
                    pony.updateAttributes({code: pony.id + 100000000}, ['code']).complete(function (err, result) {
                        res.render(theNamespace + '/financial_drivers/total_settlement', {
                            userLoggedInDetails: userLoggedIn,
                            data: data.length > 0 ? data : [{}],
                            pony: pony,
                            selectedMenu: 'financialDrivers'
                        });
                    })
                })
            })
        }
    })
};
//******************SEPARATE******************
exports.bankOutput = function (req, res) {
    var excelbuilder = require('msexcel-builder');
    var randomstring = require("randomstring");
    Date.prototype.customFormat = function (formatString) {
        var YYYY, YY, MMMM, MMM, MM, M, DDDD, DDD, DD, D, hhhh, hhh, hh, h, mm, m, ss, s, ampm, AMPM, dMod, th;
        YY = ((YYYY = this.getFullYear()) + "").slice(-2);
        MM = (M = this.getMonth() + 1) < 10 ? ('0' + M) : M;
        MMM = (MMMM = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][M - 1]).substring(0, 3);
        DD = (D = this.getDate()) < 10 ? ('0' + D) : D;
        DDD = (DDDD = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][this.getDay()]).substring(0, 3);
        th = (D >= 10 && D <= 20) ? 'th' : ((dMod = D % 10) == 1) ? 'st' : (dMod == 2) ? 'nd' : (dMod == 3) ? 'rd' : 'th';
        formatString = formatString.replace("#YYYY#", YYYY).replace("#YY#", YY).replace("#MMMM#", MMMM).replace("#MMM#", MMM).replace("#MM#", MM).replace("#M#", M).replace("#DDDD#", DDDD).replace("#DDD#", DDD).replace("#DD#", DD).replace("#D#", D).replace("#th#", th);
        h = (hhh = this.getHours());
        if (h == 0) h = 24;
        if (h > 12) h -= 12;
        hh = h < 10 ? ('0' + h) : h;
        hhhh = h < 10 ? ('0' + hhh) : hhh;
        AMPM = (ampm = hhh < 12 ? 'am' : 'pm').toUpperCase();
        mm = (m = this.getMinutes()) < 10 ? ('0' + m) : m;
        ss = (s = this.getSeconds()) < 10 ? ('0' + s) : s;
        return formatString.replace("#hhhh#", hhhh).replace("#hhh#", hhh).replace("#hh#", hh).replace("#h#", h).replace("#mm#", mm).replace("#m#", m).replace("#ss#", ss).replace("#s#", s).replace("#ampm#", ampm).replace("#AMPM#", AMPM);
    };
    tools.getLoggedInUser(theNamespace, req.sessionID, function (userLoggedIn) {
        if (userLoggedIn === false) {
            res.redirect('/' + theNamespace + '/login');
        } else {
            lib.async.auto(
                {
                    forms: function (cb, forms) {
                        var body, query;
                        body = req.body
                        var query = "SELECT (select sum(users.balance) from users where users.user_type_id=1 and users.balance > 0 ) as total_balance,users.id,users.balance,service_provider_profile.first_name,service_provider_profile.last_name,service_provider_profile.bank_shaba_number FROM users inner join service_provider_profile on service_provider_profile.user_id=users.id where users.balance > 0 group by users.id order by users.id desc ";
                        lib.dbConnection.sequelize.query(query).complete(function (err, data) {
                            console.log("err", err)
                            lib.dbConnection.sequelize.query("select * from payment_total_pony where code=" + body.code
                            ).complete(function (err, pony) {
                                console.log("err", err)
                                cb(null, {pony: pony, data: data})
                            })
                        })
                    },
                    showData: ['forms', function (cb, results) {
                        var users = results.forms.data;
                        var file = "لیست تسویه بانک";
                        var workbook2 = excelbuilder.createWorkbook('./public/app/', file + '.xlsx')
                        var sheet2 = workbook2.createSheet('sheet2', 6, users.length + 1);
                        sheet2.set(1, 1, 'شماره فایل');
                        sheet2.set(2, 1, 'شناسه واریز');
                        sheet2.set(3, 1, 'شرح واریز');
                        sheet2.set(4, 1, 'مبلغ (ریال)');
                        sheet2.set(5, 1, 'نام راننده');
                        sheet2.set(6, 1, 'شماره شبا راننده');
                        // Save it
                        for (var row = 2; row < users.length + 2; row++) {
                            sheet2.set(1, row, results.forms.pony[0].code);
                            sheet2.set(2, row, randomstring.generate({
                                    length: 4,
                                    charset: 'numeric'
                                }) + results.forms.pony[0].code);
                            sheet2.set(3, row, lib.moment(new Date(results.forms.pony[0].createdAt).customFormat("#YYYY#/#MM#/#DD# #hh#:#mm#").toString(), 'YYYY/MM/DD HH:mm').format('jYYYY/jMM/jDD HH:mm'));
                            sheet2.set(4, row, users[row - 2].balance * 10);
                            sheet2.set(5, row, users[row - 2].first_name + " " + users[row - 2].last_name);
                            sheet2.set(6, row, users[row - 2].bank_shaba_number);
                        }
                        workbook2.save(function (err) {
                            res.json('/app/' + file + '.xlsx')
                        });
                    }]
                },
                function (err, allResult) {
                }
            );
        }
    })
}
//******************SEPARATE******************
exports.doTotalSettlement = function (req, res) {
    var body = req.body;
    tools.getLoggedInUser(theNamespace, req.sessionID, function (userLoggedIn) {
        if (userLoggedIn === false) {
            res.redirect('/' + theNamespace + '/login');
        } else {
            lib.dbConnection.PaymentTotalPony.find({
                where: {
                    code: body.ponyCode
                }
            }).complete(function (err, totalPony) {
                var drivers = body.drivers;
                drivers.forEach(function (driver, i) {
                    repo.setPony(driver, totalPony, userLoggedIn, req)
                })
                setTimeout(function () {
                    res.json(true)
                }, 3000)
            })
        }
    })
};
//******************SEPARATE******************
exports.getReport = function (req, res) {
    tools.getLoggedInUser(theNamespace, req.sessionID, function (userLoggedIn) {
        if (userLoggedIn === false) {
            res.redirect('/' + theNamespace + '/login');
        } else {
            var renderView = theNamespace + '/financial_drivers/';
            var userQuery = "SELECT users.id,users.balance,service_provider_profile.bank_shaba_number,service_provider_profile.first_name,service_provider_profile.last_name,service_provider_profile.last_pony_date FROM users LEFT OUTER JOIN service_provider_profile ON service_provider_profile.user_id = users.id where users.id=" + req.params.id;
            var tripQuery = "SELECT trip.*, payment_methods.`name`,payment_reasons.payment_name FROM trip LEFT OUTER JOIN payments on payments.id=trip.payment_id LEFT OUTER JOIN payment_methods on payment_methods.id=payments.payment_method_id LEFT OUTER JOIN payment_reasons on payment_reasons.id=payments.payment_reason_id where trip.driver_user_id=" + req.params.id + " and trip.payment_id is not null and trip.trip_situation_id=" + lib.Constants['tripSituationTripDone'] + " order by trip.id desc"
            lib.dbConnection.sequelize.query(userQuery).complete(function (err, userData) {
                console.log("err", err);
                lib.dbConnection.sequelize.query(tripQuery).complete(function (err, userTrips) {
                    console.log("err", err);
                    if (userData[0].balance > 0) {
                        renderView += 'creditors'
                    } else {
                        renderView += 'deptors'
                    }
                    // var rows=repo.paginate(userTrips,1,pageLength)
                    res.render(renderView, {
                        userLoggedInDetails: userLoggedIn,
                        userData: userData,
                        data: userTrips,
                        id: req.params.id,
                        // data:rows.data,
                        // pageParams:rows.pageParams,
                        thisDate: new Date(),
                        selectedMenu: 'financialDrivers'
                    });
                })
            })
        }
    })
};
//******************SEPARATE******************
exports.searchReport = function (req, res) {
    tools.getLoggedInUser(theNamespace, req.sessionID, function (userLoggedIn) {
        if (userLoggedIn === false) {
            res.redirect('/' + theNamespace + '/login');
        } else {
            var body = req.body;
            var query = "SELECT trip.*, payment_methods.`name`,payment_reasons.payment_name FROM trip LEFT OUTER JOIN payments on payments.id=trip.payment_id LEFT OUTER JOIN payment_methods on payment_methods.id=payments.payment_method_id LEFT OUTER JOIN payment_reasons on payment_reasons.id=payments.payment_reason_id where trip.driver_user_id=" + req.body.user_id + " and trip.payment_id is not null and trip.trip_situation_id=" + lib.Constants['tripSituationTripDone'] + "  and "
            for (var key in body) {
                if (body[key] && body[key] != '' && body[key] != 'null') {
                    switch (key) {
                        case "trip_code" :
                            query += " trip.trip_code LIKE '%" + body[key] + "%'  AND "
                            break;
                        case "pony_id" :
                            query += " trip.payment_pony_id is " + (body[key] == 'true' ? " not null " : " null ") + " AND "
                            break;
                    }
                }
            }
            query += " trip.id <> 0 order by trip.id desc"
            lib.dbConnection.sequelize.query(query).complete(function (err, result) {
                console.log("err", err)
                var rows = repo.paginate(result, req.params.pageIndex, pageLength)
                res.render(theNamespace + '/financial_drivers/report_search', {
                    userLoggedInDetails: userLoggedIn,
                    data: rows.data,
                    pageParams: rows.pageParams,
                    selectedMenu: 'financialDrivers'
                });
            })
        }
    })
};
//******************SEPARATE******************
exports.settleReport = function (req, res) {
    tools.getLoggedInUser(theNamespace, req.sessionID, function (userLoggedIn) {
        if (userLoggedIn === false) {
            res.redirect('/' + theNamespace + '/login');
        } else {
            lib.dbConnection.sequelize.query("select * from payment_pony where id=" + req.params.id
            ).complete(function (err, data) {
                res.json(data)
            })
        }
    })
};
//******************SEPARATE******************
exports.settleDriver = function (req, res) {
    tools.getLoggedInUser(theNamespace, req.sessionID, function (userLoggedIn) {
        if (userLoggedIn === false) {
            res.redirect('/' + theNamespace + '/login');
        } else {
            var body = req.body;
            repo.setDriverPony(body, userLoggedIn, req)
            setTimeout(function () {
                res.json(true)
            }, 3000)
        }
    })
};
//******************SEPARATE******************
exports.getReportExcel = function (req, res) {
    var excelbuilder = require('msexcel-builder');
    var tripQuery = "SELECT trip.*," +
        "payment_methods.name " +
        "FROM trip " +
        "LEFT OUTER JOIN payments on payments.id=trip.payment_id " +
        "LEFT OUTER JOIN payment_methods on payment_methods.id=payments.payment_method_id " +
        "LEFT OUTER JOIN payment_reasons on payment_reasons.id=payments.payment_reason_id " +
        "where trip.driver_user_id=" + req.params.id + "  and trip.trip_situation_id=" + lib.Constants['tripSituationTripDone'] + " ";
    lib.async.auto(
        {
            forms: function (cb, forms) {
                var body, query;
                body = req.body;
                query = tripQuery + " AND ";
                for (var key in body) {
                    if (body[key] && body[key] != '' && body[key] != 'null') {
                        switch (key) {
                            case "trip_code" :
                                query += " trip_code LIKE '%" + body[key] + "%' AND ";
                                break;
                            case "pony_id" : {
                                console.log(body[key]);
                                if(body[key] == "true"){
                                    query += "payment_pony_id IS NOT NULL AND ";
                                }else{
                                    query += "payment_pony_id IS NULL AND ";
                                }
                                break;
                            }
                        }
                    }
                }
                query += " trip.id <> 0 order by trip.id desc";
                lib.dbConnection.sequelize.query(query).complete(function (err, result) {
                    console.log("err", err);
                    cb(null, result)
                })
            },
            showData: ['forms', function (cb, results) {
                var users = results.forms;
                var file = "لیست مالی راننده";
                var workbook2 = excelbuilder.createWorkbook('./public/app/', file + '.xlsx');
                var sheet2 = workbook2.createSheet('sheet2', 7, users ? users.length + 1 : 1);
                sheet2.set(1, 1, 'ردیف');
                sheet2.set(2, 1, 'سفر');
                sheet2.set(3, 1, 'هزینه سفر');
                sheet2.set(4, 1, 'سهم راننده');
                sheet2.set(5, 1, 'سهم هوبر');
                sheet2.set(6, 1, 'نوع پرداخت');
                sheet2.set(7, 1, 'وضعیت');
                // Save it
                if (users) {
                    for (var row = 2; row < users.length + 2; row++) {
                        sheet2.set(1, row, users[row - 2].id);
                        sheet2.set(2, row, users[row - 2].trip_code);
                        sheet2.set(3, row, users[row - 2].main_price);
                        sheet2.set(4, row, users[row - 2].driver_slice);
                        sheet2.set(5, row, users[row - 2].system_slice);
                        sheet2.set(6, row, users[row - 2].name);
                        sheet2.set(7, row, users[row - 2].payment_pony_id ? 'تسویه شده' : 'تسویه نشده');
                    }
                }
                workbook2.save(function (err) {
                    res.json('/app/' + file + '.xlsx');
                });
            }]
        },
        function (err, allResult) {
        }
    );
};

