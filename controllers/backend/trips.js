var lib = require('../../include/lib');
var tools = require('../../include/tools');
var repo = require('../../repository/backendRepo');
var theNamespace = 'backend';
//******************Main query for this module******************
var mainQuery = 'SELECT ' +
	'trip.id,' +
	'trip.trip_millisecond,' +
	'trip.start_time as time,' +
	'trip.passenger_user_id,' +
	'trip.driver_user_id,' +
	'trip.start_time,' +
	'service_provider_profile.first_name,' +
	'service_provider_profile.last_name,' +
	'service_provider_profile.representer_code,' +
	'customer_profile.full_name,' +
	'trip.main_price,' +
	'payment_methods.name,' +
	'payment_methods.id as payment_method_id,' +
	'trip.trip_code, ' +
	'discount_codes.discount_code as discountCode ' +
	'from trip ' +
	'INNER JOIN service_provider_profile on service_provider_profile.user_id=trip.driver_user_id ' +
	'INNER JOIN customer_profile on customer_profile.user_id=trip.passenger_user_id ' +
	'INNER JOIN payments ON trip.payment_id=payments.id ' +
	"LEFT OUTER JOIN discount_codes on discount_codes.id=trip.discount_code_id " +
	'LEFT OUTER JOIN payment_methods on payment_methods.id=payments.payment_method_id ';
var subQuery = 'select count(*) as total_canceled from trip where trip_situation_id=' + lib.Constants['tripSituationTripCancel'];
var pageLength = 7;
//******************Main query for this module******************
exports.index = function (req, res) {
	tools.getLoggedInUser(theNamespace, req.sessionID, function (userLoggedIn) {
		if (userLoggedIn === false) {
			res.redirect('/' + theNamespace + '/login');
		} else {
			var query = mainQuery + " WHERE trip_situation_id=" + lib.Constants['tripSituationTripDone'] + " order by trip.id desc";
			console.log('query', query);
			lib.dbConnection.sequelize.query(query).complete(function (err, alltrips) {
				console.log("err", err);
				// var allDataCount = alltrips.length;
				// var trips = repo.paginate(alltrips, 1, pageLength);
				lib.dbConnection.sequelize.query(subQuery).complete(function (err, totalCanceled) {
					console.log("err", err);
					res.render(theNamespace + '/trips/index', {
						userLoggedInDetails: userLoggedIn,
						// allDataCount: allDataCount,
						data: alltrips,
						// data: trips.data,
						// pageParams: trips.pageParams,
						totalCanceled: totalCanceled[0].total_canceled,
						total: alltrips.length,
						selectedMenu: 'trips'
					});
				});
			});
		}
	});
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
				body['driver_name'] = req.session.searchTripsDriverName;
				body['passenger_name'] = req.session.searchTripsPassengerName;
				body['start_time'] = req.session.searchTripsStartTime;
				body['end_time'] = req.session.searchTripsEndTime;
				body['start_date'] = req.session.searchTripsStartDate;
				body['end_date'] = req.session.searchTripsEndDate;
				body['payment_id'] = req.session.searchTripsPaymentId;
			} else {
				req.session.searchTripsDriverName = body['driver_name'];
				req.session.searchTripsPassengerName = body['passenger_name'];
				req.session.searchTripsStartTime = body['start_time'];
				req.session.searchTripsEndTime = body['end_time'];
				req.session.searchTripsStartDate = body['start_date'];
				req.session.searchTripsEndDate = body['end_date'];
				req.session.searchTripsPaymentId = body['payment_id'];
			}
			lib.async.auto({
				findAll: function (cb, results) {
					var query = mainQuery + "WHERE trip_situation_id=" + lib.Constants['tripSituationTripDone'] + " AND ";
					for (var key in body) {
						if (body[key] && body[key] != '' && body[key] != 'null') {
							switch (key) {
								case "driver_name" :
									query += " (first_name LIKE '%" + body[key] + "%' OR last_name LIKE '%" + body[key] + "%') AND ";
									break;
								case "passenger_name" :
									query += " full_name LIKE '%" + body[key] + "%' AND ";
									break;
								case "start_time" :
									query += " HOUR(trip.start_time) >= '" + body[key] + "' AND ";
									break;
								case "end_time" :
									query += " HOUR(trip.end_time) <= '" + body[key] + "' AND ";
									break;
								case "start_date" :
									var startDate = lib.moment(body[key], 'jYYYY/jMM/jDD').format('YYYY-MM-DD');
									var startMiliSeconds = Date.parse(new Date(startDate));
									query += " trip_millisecond >= '" + startMiliSeconds + "' AND ";
									break;
								case "end_date" :
									var startDate = lib.moment(body[key], 'jYYYY/jMM/jDD').format('YYYY-MM-DD');
									var endMiliSeconds = Date.parse(new Date(startDate));
									query += " trip_millisecond <= '" + endMiliSeconds + "' AND ";
									break;
								case "payment_id" :
									query += " payment_method_id = " + body[key] + " AND ";
									break;
								case "trip_code" :
									query += " trip_code LIKE '%" + body[key] + "%' AND ";
									break;
							}
						}
					}
					query += " trip.id <> 0 order by trip.id desc";
					lib.dbConnection.sequelize.query(query).complete(function (err, passengers) {
						console.log("err", err);
						cb(null, {result: passengers || []});
					});
				}
			}, function (err, allResult) {
				// var allDataCount = allResult.findAll.result.length;
				// var rows = repo.paginate(allResult.findAll.result, req.params.pageIndex, pageLength)
				res.render(theNamespace + '/trips/view', {
					userLoggedInDetails: userLoggedIn,
					// allDataCount: allDataCount,
					data: allResult.findAll.result,
					// pageParams: rows.pageParams,
					selectedMenu: 'trips'
				});
			});
		}
	});
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
				body = req.body;
				var query = mainQuery + "where ";
				for (var key in body) {
					if (body[key] && body[key] != '' && body[key] != 'null') {
						switch (key) {
							case "driver_name" :
								query += " (first_name LIKE '%" + body[key] + "%' OR last_name LIKE '%" + body[key] + "%') AND ";
								break;
							case "passenger_name" :
								query += " full_name LIKE '%" + body[key] + "%' AND ";
								break;
							case "start_time" :
								query += " HOUR(trip.start_time) >= '" + body[key] + "' AND ";
								break;
							case "end_time" :
								query += " HOUR(trip.end_time) <= '" + body[key] + "' AND ";
								break;
							case "start_date" :
								var startDate = lib.moment(body[key], 'jYYYY/jMM/jDD').format('YYYY-MM-DD');
								var startMiliSeconds = Date.parse(new Date(startDate));
								query += " trip_millisecond >= '" + startMiliSeconds + "' AND ";
								break;
							case "end_date" :
								var startDate = lib.moment(body[key], 'jYYYY/jMM/jDD').format('YYYY-MM-DD');
								var endMiliSeconds = Date.parse(new Date(startDate));
								query += " trip_millisecond <= '" + endMiliSeconds + "' AND ";
								break;
							case "payment_id" :
								query += " payment_method_id = " + body[key] + " AND ";
								break;
							case "trip_code" :
								query += " trip_code LIKE '%" + body[key] + "%' AND ";
								break;
						}
					}
				}
				query += " trip.id <> 0 ";
				lib.dbConnection.sequelize.query(query).complete(function (err, result) {
					console.log("err", err);
					cb(null, result);
				});
			},
			showData: ['forms', function (cb, results) {
				var users = results.forms;
				var file = "لیست سفرها";
				var workbook2 = excelbuilder.createWorkbook('./public/app/', file + '.xlsx');
				var sheet2 = workbook2.createSheet('sheet2', 9, users.length + 1);
				sheet2.set(1, 1, 'کد');
				sheet2.set(2, 1, 'نام و نام خانوادگی راننده');
				sheet2.set(3, 1, 'کد معرف راننده');
				sheet2.set(4, 1, 'نام و نام خانوادگی  مسافر');
				sheet2.set(5, 1, 'هزینه سفر');
				sheet2.set(6, 1, 'نوع پرداخت');
				sheet2.set(7, 1, ':کد سفر');
				sheet2.set(8, 1, ':کد تخفیف');
				sheet2.set(9, 1, 'تاریخ');
				// Save it
				for (var row = 2; row < users.length + 2; row++) {
					sheet2.set(1, row, users[row - 2].id);
					sheet2.set(2, row, users[row - 2].first_name + " " + users[row - 2].last_name);
					sheet2.set(3, row, users[row - 2].representer_code || "-");
					sheet2.set(4, row, users[row - 2].full_name);
					sheet2.set(5, row, users[row - 2].main_price);
					sheet2.set(6, row, users[row - 2].name);
					sheet2.set(7, row, users[row - 2].trip_code);
					sheet2.set(8, row, users[row - 2].discountCode);
					sheet2.set(9, row, (users[row - 2].trip_millisecond ? lib.moment(new Date(parseInt(users[row - 2].trip_millisecond)).customFormat("#YYYY#/#MM#/#DD#").toString(), 'YYYY/MM/DD').format('jYYYY/jMM/jDD') : '-'));
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
//******************SEPARATE******************
exports.profile = function (req, res) {
	tools.getLoggedInUser(theNamespace, req.sessionID, function (userLoggedIn) {
		if (userLoggedIn === false) {
			res.redirect('/' + theNamespace + '/login');
		} else {
			var profileQuery = "SELECT " +
				"trip.id," +
				"trip.trip_millisecond," +
				"trip.trip_code," +
				"trip.driver_user_id," +
				"trip.passenger_user_id," +
				"sum(trip_destinations.trip_time) as total_time," +
				"sum(trip_destinations.trip_distance) as total_distance," +
				"trip.start_time as start_time," +
				"trip.request_time as request_time," +
				"trip.end_time as end_time," +
				"GROUP_CONCAT(destination_label) as destinations," +
				"trip.driver_place_label," +
				"trip.trip_source_label," +
				"trip_destinations.destination_label," +
				"service_provider_profile.first_name," +
				"service_provider_profile.last_name," +
				"customer_profile.full_name," +
				"discount_codes.discount_code," +
				"trip.main_price," +
				"trip.net_price," +
				"trip.driver_slice," +
				"trip.system_slice," +
				"payment_methods.NAME AS method_name," +
				"payment_reasons.payment_name " +
				"from trip " +
				"LEFT OUTER JOIN trip_destinations on trip.id=trip_destinations.trip_id " +
				"LEFT OUTER JOIN customer_profile on customer_profile.user_id=trip.passenger_user_id " +
				"LEFT OUTER JOIN service_provider_profile on service_provider_profile.user_id=trip.driver_user_id " +
				"LEFT OUTER JOIN discount_codes on discount_codes.id=trip.discount_code_id " +
				"LEFT OUTER JOIN payments on payments.id=trip.payment_id " +
				"LEFT OUTER JOIN payment_methods on payment_methods.id=payments.payment_method_id " +
				"LEFT OUTER JOIN payment_reasons on payment_reasons.id=payments.payment_reason_id " +
				"where trip.id= " + req.params.id + " " +
				"GROUP BY trip.id";
			lib.dbConnection.sequelize.query(profileQuery).complete(function (err, profile) {
				console.log("err", err);
				profile = profile[0];
				if(profile.request_time) {
					profile.request_time = lib.moment(profile.request_time).format('HH:mm:ss');
				}
				if(profile.start_time) {
					profile.start_time = lib.moment(profile.start_time).format('HH:mm:ss');
				}
				if(profile.end_time) {
					profile.end_time = lib.moment(profile.end_time).format('HH:mm:ss');
				}
				res.render(theNamespace + '/trips/profile', {
					userLoggedInDetails: userLoggedIn,
					profile: profile,
					selectedMenu: 'trips'
				});
			});
		}
	});
};
//******************SEPARATE******************
exports.sourceMap = function (req, res) {
	tools.getLoggedInUser(theNamespace, req.sessionID, function (userLoggedIn) {
		if (userLoggedIn === false) {
			res.redirect('/' + theNamespace + '/login');
		} else {
			lib.dbConnection.sequelize.query("SELECT trip.trip_source_geographical_lat as lat,trip.trip_source_geographical_long as `long` from trip"
			).complete(function (err, points) {
				res.render(theNamespace + '/trips/sources_map', {
					userLoggedInDetails: userLoggedIn,
					points: JSON.stringify(points),
					selectedMenu: 'trips'
				});
			});
		}
	});
};
//******************SEPARATE******************
exports.fixedPassengerTripsCount = function (req, res) {
	lib.dbConnection.CustomerProfile.findAll({
		include: [{
			model: lib.dbConnection.User,
			where: {situation_id: lib.Constants.setConstant("UserSituationActive")}
		}]
	}).then(function (customers) {
		lib.async.forEach(customers, function (customer, cb) {
			lib.dbConnection.Trip.count({
				where: {
					passenger_user_id: customer.user_id,
					trip_situation_id: lib.Constants.setConstant("tripSituationTripDone")
				}
			}).success(function (count) {
				customer.sum_trip_counts = count;
				customer.save({fields: ["sum_trip_counts"]}).success(function (newCustomer) {
					cb();
				}).error(function (error) {
					console.log("an error accord: ", error);
					callBack(lib.errorCodes.setError('dbError'));
				});
			}).error(function (error) {
				console.log("an error accord: ", error);
				callBack(lib.errorCodes.setError('dbError'));
			});
		}, function (err) {
			if (err) return next(err);
			res.json("ok");
		});
	}).catch(function (error) {
		console.log("an error accord: ", error);
		callBack(lib.errorCodes.setError('dbError'));
	});
};
