var lib = require('../../include/lib');
var tools = require('../../include/tools');
var repo = require('../../repository/backendRepo');
var theNamespace = 'backend';
//******************Main query for this module******************
var mainQuery = 'SELECT users.id,customer_profile.full_name,users.mobile,customer_profile.sum_trip_counts,customer_profile.sum_trip_canceled,customer_profile.like_count,customer_profile.dislike_count,users.situation_id,users.balance,customer_profile.gender_id,customer_profile.birth_date from users INNER JOIN customer_profile on users.id=customer_profile.user_id  ';
var pageLength = 7;
//******************Main query for this module******************
exports.index = function (req, res) {
	tools.getLoggedInUser(theNamespace, req.sessionID, function (userLoggedIn) {
		if (userLoggedIn === false) {
			res.redirect('/' + theNamespace + '/login');
		} else {
			var findParams = lib.pagingFindParams(req.body);
			findParams.where.user_type_id = {eq: 2};
			findParams.include = [{
				model: lib.dbConnection.CustomerProfile,
				where: {}
			}];
			if (req.body.mobile) {
				findParams.where.mobile = {like: '%' + req.body.mobile + '%'};
			}
			if (req.body.fullname) {
				findParams.include[0].where.full_name = {like: '%' + req.body.fullname + '%'};
			}
			if (req.body.start_balance && req.body.end_balance) {
				findParams.where.balance = {
					between: [
						req.body.start_balance,
						req.body.end_balance
					]
				};
			} else if (req.body.start_balance) {
				findParams.where.balance = {gte: req.body.start_balance};
			} else if (req.body.end_balance) {
				findParams.where.balance = {lte: req.body.end_balance};

			}
			var start_birth, end_birth;
			if (req.body.start_birth && req.body.end_birth) {
				start_birth = lib.moment(req.body.start_birth, 'jYYYY/jMM/jDD').format('YYYY-MM-DD');
				end_birth = lib.moment(req.body.end_birth, 'jYYYY/jMM/jDD').format('YYYY-MM-DD');
				findParams.include[0].where.birth_date = {
					between: [
						start_birth,
						end_birth
					]
				};
			} else if (req.body.start_birth) {
				start_birth = lib.moment(req.body.start_birth, 'jYYYY/jMM/jDD').format('YYYY-MM-DD');
				findParams.include[0].where.birth_date = {gte: start_birth};
			} else if (req.body.end_birth) {
				end_birth = lib.moment(req.body.end_birth, 'jYYYY/jMM/jDD').format('YYYY-MM-DD');
				findParams.include[0].where.birth_date = {lte: end_birth};
			}

			if (req.body.gender_id) {
				findParams.include[0].where.gender_id = {eq: req.body.gender_id};

			}


			lib.dbConnection.User.findAndCountAll(findParams).success(function (result) {
				res.render(theNamespace + '/passengers/index', {
					userLoggedInDetails: userLoggedIn,
					data: result.rows,
					posts: req.body,
					selectedMenu: 'passengers',
					paging: lib.paging(findParams.page, findParams.limit, result.count),
					pageIndex: findParams.offset
				});
			}).error(function (err) {
				console.log("err", err);
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
				body['mobile'] = req.session.searchPassengersMobile;
				body['start_balance'] = req.session.searchPassengersStartBalance;
				body['end_balance'] = req.session.searchPassengersEndBalance;
				body['start_birth'] = req.session.searchPassengersStartBirth;
				body['end_birth'] = req.session.searchPassengersEndBirth;
				body['gender_id'] = req.session.searchPassengersGender;
			} else {
				req.session.searchPassengersMobile = body['mobile'];
				req.session.searchPassengersStartBalance = body['start_balance'];
				req.session.searchPassengersEndBalance = body['end_balance'];
				req.session.searchPassengersStartBirth = body['start_birth'];
				req.session.searchPassengersEndBirth = body['end_birth'];
				req.session.searchPassengersGender = body['gender_id'];
			}
			lib.async.auto
			(
				{
					findAll: function (cb, results) {
						var query = mainQuery + "where ";
						for (var key in body) {
							if (body[key] && body[key] != '' && body[key] != 'null') {
								switch (key) {
									case "fullname" :
										query += " full_name LIKE '%" + body[key] + "%' AND ";
										break;
									case "mobile" :
										query += " mobile LIKE '%" + body[key] + "%' AND ";
										break;
									case "start_balance" :
										query += " balance >= '" + body[key] + "' AND ";
										break;
									case "end_balance" :
										query += " balance <= '" + body[key] + "' AND ";
										break;
									case "start_birth" :
										var startDate = lib.moment(body[key], 'jYYYY/jMM/jDD').format('YYYY-MM-DD');
										var startMiliSeconds = Date.parse(new Date(startDate));
										query += " birth_date >= '" + startMiliSeconds + "' AND ";
										break;
									case "end_birth" :
										var startDate = lib.moment(body[key], 'jYYYY/jMM/jDD').format('YYYY-MM-DD');
										var endMiliSeconds = Date.parse(new Date(startDate));
										query += " birth_date <= '" + endMiliSeconds + "' AND ";
										break;
									case "gender_id" :
										query += " gender_id = " + body[key] + " AND ";
										break;
								}
							}
						}
						query += " users.id <> 0 ";
						lib.dbConnection.sequelize.query(query).complete(function (err, passengers) {
							console.log("err", err);
							cb(null, {result: passengers || []});
						});
					}
				},
				function (err, allResult) {
					// var allDataCount = allResult.findAll.result.length;
					// var rows=repo.paginate(allResult.findAll.result,req.params.pageIndex,pageLength)
					res.render(theNamespace + '/passengers/view', {
						userLoggedInDetails: userLoggedIn,
						// allDataCount: allDataCount,
						data: allResult.findAll.result,
						// data: rows.data,
						// pageParams:rows.pageParams,
						selectedMenu: 'passengers'
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
							case "fullname" :
								query += " full_name LIKE '%" + body[key] + "%' AND ";
								break;
							case "mobile" :
								query += " mobile LIKE '%" + body[key] + "%' AND ";
								break;
							case "start_balance" :
								query += " balance >= '" + body[key] + "' AND ";
								break;
							case "end_balance" :
								query += " balance <= '" + body[key] + "' AND ";
								break;
							case "start_birth" :
								var startDate = lib.moment(body[key], 'jYYYY/jMM/jDD').format('YYYY-MM-DD');
								var startMiliSeconds = Date.parse(new Date(startDate));
								query += " birth_date >= '" + startMiliSeconds + "' AND ";
								break;
							case "end_birth" :
								var startDate = lib.moment(body[key], 'jYYYY/jMM/jDD').format('YYYY-MM-DD');
								var endMiliSeconds = Date.parse(new Date(startDate));
								query += " birth_date <= '" + endMiliSeconds + "' AND ";
								break;
							case "gender_id" :
								query += " gender_id = " + body[key] + " AND ";
								break;
						}
					}
				}
				query += " users.id <> 0 ";
				lib.dbConnection.sequelize.query(query).complete(function (err, result) {
					console.log("err", err);
					cb(null, result);
				});
			},
			showData: ['forms', function (cb, results) {
				var users = results.forms;
				var file = "لیست مسافران";
				var workbook2 = excelbuilder.createWorkbook('./public/app/', file + '.xlsx');
				var sheet2 = workbook2.createSheet('sheet2', 8, users.length + 1);
				sheet2.set(1, 1, 'کد');
				sheet2.set(2, 1, 'نام و نام خانوادگی');
				sheet2.set(3, 1, 'شماره تماس');
				sheet2.set(4, 1, 'تعداد سفر');
				sheet2.set(5, 1, 'تعداد لغو سفر');
				sheet2.set(6, 1, 'لایک');
				sheet2.set(7, 1, 'دیسلایک');
				sheet2.set(8, 1, 'وضعیت');
				// Save it
				for (var row = 2; row < users.length + 2; row++) {
					sheet2.set(1, row, users[row - 2].id);
					sheet2.set(2, row, users[row - 2].full_name);
					sheet2.set(3, row, users[row - 2].mobile);
					sheet2.set(4, row, users[row - 2].sum_trip_counts);
					sheet2.set(5, row, users[row - 2].sum_trip_canceled);
					sheet2.set(6, row, (users[row - 2].like_count));
					sheet2.set(7, row, (users[row - 2].dislike_count));
					sheet2.set(8, row, users[row - 2].situation_id == 1 ? 'فعال' : 'غیر فعال');
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
//!******************SEPARATE******************
exports.profile = function (req, res) {
	tools.getLoggedInUser(theNamespace, req.sessionID, function (userLoggedIn) {
		if (userLoggedIn === false) {
			res.redirect('/' + theNamespace + '/login');
		} else {
			var profileQuery = "select customer_profile.*,users.mobile,users.email,users.balance " +
				"from users inner join customer_profile on users.id=customer_profile.user_id " +
				"where users.id=" + req.params.id;
			lib.dbConnection.sequelize.query(profileQuery).complete(function (err, profile) {
				console.log("err", err);
				res.render(theNamespace + '/passengers/profile', {
					userLoggedInDetails: userLoggedIn,
					profile: profile[0],
					selectedMenu: 'passengers'
				});
			});
		}
	});
};
