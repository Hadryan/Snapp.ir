var lib = require('../../include/lib');
var tools = require('../../include/tools');
var repo = require('../../repository/backendRepo');
var theNamespace = 'backend';
//******************Main query for this module******************
var mainQuery = 'select users.id,users.balance,customer_profile.full_name from users INNER JOIN customer_profile on customer_profile.user_id=users.id ';
var pageLength = 7;
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
			lib.dbConnection.sequelize.query(query).complete(function (err, users) {
				console.log("err", err);
				// var allDataCount = users.length;
				// var rows=repo.paginate(users,1,pageLength);
				res.render(theNamespace + '/financial_passengers/index', {
					userLoggedInDetails: userLoggedIn,
					// allDataCount: allDataCount,
					data: users,
					// data: rows.data,
					// pageParams: rows.pageParams,
					selectedMenu: 'financialPassengers'
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
			lib.async.auto
			(
				{
					findAll: function (cb, results) {
						var query = mainQuery + "where ";
						for (var key in body) {
							if (body[key] && body[key] != '' && body[key] != 'null') {
								switch (key) {
									case "driver_name" :
										query += " full_name LIKE '%" + body[key] + "%'  AND ";
										break;
									case "start_balance" :
										query += " users.balance >= '" + body[key] + "' AND ";
										break;
									case "end_balance" :
										query += " users.balance <= '" + body[key] + "' AND ";
										break;
								}
							}
						}
						query += " users.id <> 0 order by users.id desc";
						lib.dbConnection.sequelize.query(query).complete(function (err, drivers) {
							console.log("err", err);
							cb(null, {result: drivers || []});
						});
					}
				},
				function (err, allResult) {
					// var allDataCount = allResult.findAll.result.length;
					// var rows = repo.paginate(allResult.findAll.result, req.params.pageIndex, pageLength)
					res.render(theNamespace + '/financial_passengers/view', {
						userLoggedInDetails: userLoggedIn,
						data: allResult.findAll.result,
						// allDataCount: allDataCount,
						// pageParams: rows.pageParams,
						selectedMenu: 'financialPassengers'
					});
				}
			);
		}
	});
};
//******************SEPARATE******************
exports.excel = function (req, res) {
	var excelbuilder = require('msexcel-builder');
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
								query += " full_name LIKE '%" + body[key] + "%'  AND ";
								break;
							case "start_balance" :
								query += " users.balance >= '" + body[key] + "' AND ";
								break;
							case "end_balance" :
								query += " users.balance <= '" + body[key] + "' AND ";
								break;
						}
					}
				}
				query += " users.id <> 0 order by users.id desc";
				lib.dbConnection.sequelize.query(query).complete(function (err, result) {
					console.log("err", err);
					cb(null, result);
				});
			},
			showData: ['forms', function (cb, results) {
				var users = results.forms;
				var file = "لیست مالی مسافران";
				var workbook2 = excelbuilder.createWorkbook('./public/app/', file + '.xlsx');
				var sheet2 = workbook2.createSheet('sheet2', 3, users.length + 1);
				sheet2.set(1, 1, 'ردیف');
				sheet2.set(2, 1, 'مسافر');
				sheet2.set(3, 1, 'میزان اعتبار فعلی');
				// Save it
				for (var row = 2; row < users.length + 2; row++) {
					sheet2.set(1, row, users[row - 2].id);
					sheet2.set(2, row, users[row - 2].full_name);
					sheet2.set(3, row, users[row - 2].balance);
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
exports.paymentReport = function (req, res) {
	tools.getLoggedInUser(theNamespace, req.sessionID, function (userLoggedIn) {
		if (userLoggedIn === false) {
			res.redirect('/' + theNamespace + '/login');
		} else {
			var userId = req.params.id;
			var query = "SELECT payments.user_id, trip.id AS trip_id, trip.trip_code, payments.amount, payments.createdAt, payment_reasons.payment_name, payment_methods.NAME AS payment_method, payments.id  FROM payments LEFT OUTER JOIN trip ON trip.id = payments.trip_id LEFT OUTER JOIN payment_reasons ON payment_reasons.id = payments.payment_reason_id LEFT OUTER JOIN payment_methods ON payment_methods.id = payments.payment_method_id where payments.user_id=" + userId + " order by payments.createdAt desc";
			lib.dbConnection.sequelize.query(query).complete(function (err, payments) {
				console.log("err", err);
				var rows = repo.paginate(payments, 1, pageLength);
				res.render(theNamespace + '/financial_passengers/payments', {
					userLoggedInDetails: userLoggedIn,
					data: rows.data,
					pageParams: rows.pageParams,
					selectedMenu: 'financialPassengers'
				});
			});
		}
	});
};
//******************SEPARATE******************
exports.searchPaymentReport = function (req, res) {
	tools.getLoggedInUser(theNamespace, req.sessionID, function (userLoggedIn) {
		if (userLoggedIn === false) {
			res.redirect('/' + theNamespace + '/login');
		} else {
			var userId = req.params.id;
			var body = req.body;
			var query = "SELECT payments.user_id,trip.id AS trip_id,trip.trip_code,payments.amount,payments.createdAt,payment_reasons.payment_name,payment_methods.name as payment_method,payments.id FROM payments LEFT OUTER JOIN trip ON trip.id = payments.trip_id LEFT OUTER JOIN payment_reasons ON payment_reasons.id = payments.payment_reason_id LEFT OUTER JOIN payment_methods ON payment_methods.id = payments.payment_method_id where payments.user_id=" + userId + " and ";
			for (var key in body) {
				if (body[key] && body[key] != '' && body[key] != 'null') {
					switch (key) {
						case "start_date" :
							var startDate = lib.moment(body[key], 'jYYYY/jMM/jDD').format('YYYY-MM-DD');
							query += " payments.createdAt >= '" + startDate + "' AND ";
							break;
						case "end_date" :
							var endDate = lib.moment(body[key], 'jYYYY/jMM/jDD').format('YYYY-MM-DD');
							query += " payments.createdAt <= '" + endDate + "' AND ";
							break;
					}
				}
			}
			query += " payments.id <> 0 order by  payments.createdAt desc";
			lib.dbConnection.sequelize.query(query).complete(function (err, payments) {
				console.log("err", err);
				var rows = repo.paginate(payments, req.params.pageIndex, pageLength);
				res.render(theNamespace + '/financial_passengers/payments_view', {
					userLoggedInDetails: userLoggedIn,
					data: rows.data,
					pageParams: rows.pageParams,
					selectedMenu: 'financialPassengers'
				});
			});
		}
	});
};