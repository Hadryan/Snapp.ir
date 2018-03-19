var lib = require('../../include/lib');
var tools = require('../../include/tools');
var repo = require('../../repository/backendRepo');
var theNamespace = 'backend';
exports.index = function (req, res) {
	tools.getLoggedInUser(theNamespace, req.sessionID, function (userLoggedIn) {
		if (userLoggedIn === false) {
			res.redirect('/' + theNamespace + '/login');
		} else {
			lib.dbConnection.User.findAll({
				include: [
					lib.dbConnection.UserSituation,
					{
						model: lib.dbConnection.ServiceProviderProfile,
						include: [
							{
								model: lib.dbConnection.ServiceProviderSpecialInfo,
								include: [
									{
										model: lib.dbConnection.VehicleBrand,
										attributes: ['name']
									},
									{
										model: lib.dbConnection.VehicleModel,
										attributes: ['name']
									}
								]
							},
							{
								model: lib.dbConnection.City,
								attributes: ['name']
							}
						],
						attributes: ['first_name', 'last_name', 'special_code', 'sum_rate', 'rate_count', 'sum_trip_counts', 'current_situation_id', 'representer_code']
					}
				],
				where: {
					user_type_id: 1,
					situation_id: [1, 2]
				},
				attributes: ['id', 'mobile']
			}).complete(function (err, users) {
				lib.dbConnection.City.findAll().complete(function (err, cities) {
					// var allDataCount = passengers.length;
					res.render(theNamespace + '/verifiedDrivers/index', {
						userLoggedInDetails: userLoggedIn,
						userList: users,
						cityList: cities,
						selectedMenu: 'verified_drivers',
					});
				});
			});
		}
	});
};
//******************SEPARATE******************
//******************SEPARATE******************
exports.search = function (req, res) {
	tools.getLoggedInUser(theNamespace, req.sessionID, function (userLoggedIn) {
		if (userLoggedIn === false) {
			res.redirect('/' + theNamespace + '/login');
		} else {
			var body;
			body = req.body;
			if (body.empty == 'true') {
				body['start_rate'] = req.session.searchUnverifiedDriverStartRate;
				body['end_rate'] = req.session.searchUnverifiedDriverEndRate;
				body['special_code'] = req.session.searchUnverifiedDriverSpecialCode;
				body['fullname'] = req.session.searchUnverifiedDriverFullName;
				body['city_id'] = req.session.searchUnverifiedDriverCityId;
				body['situation_id'] = req.session.searchUnverifiedDriverSituationId;

			} else {
				req.session.searchUnverifiedDriverStartRate = body['start_rate'];
				req.session.searchUnverifiedDriverEndRate = body['end_rate'];
				req.session.searchUnverifiedDriverSpecialCode = body['special_code'];
				req.session.searchUnverifiedDriverFullName = body['fullname'];
				req.session.searchUnverifiedDriverCityId = body['city_id'];
				req.session.searchUnverifiedDriverSituationId = body['situation_id'];
			}
			lib.async.auto
			(
				{
					findAll: function (cb, results) {
						var query = "";
						for (var key in body) {
							if (body[key] && body[key] != '' && body[key] != 'null') {
								switch (key) {
									case "start_rate" :
										query += " CAST(service_provider_profile.sum_rate/service_provider_profile.rate_count AS UNSIGNED) >= " + parseInt(body[key]) + " AND ";
										break;
									case "end_rate" :
										query += " CAST(service_provider_profile.sum_rate/service_provider_profile.rate_count AS UNSIGNED) <= " + parseInt(body[key]) + " AND ";
										break;
									case "situation_id" :
										query += " `users`.situation_id='" + body[key] + "' AND ";
										break;
									case "special_code" :
										query += " `users`.mobile LIKE '%" + body[key] + "%' AND ";
										break;
									case "fullname" :
										query += " (service_provider_profile.first_name LIKE '%" + body[key] + "%' OR "
											+ " service_provider_profile.last_name LIKE '%" + body[key] + "%') AND ";
										break;
									case "mobile" :
										query += " `users`.mobile LIKE '%" + body[key] + "%' AND ";
										break;
									case "city_id" :
										query += " `service_provider_profile`.city_id = " + body[key] + " AND ";
										break;
								}
							}
						}
						query += " `users`.user_type_id = 1 and `users`.situation_id in (1,2)";
						lib.dbConnection.User.findAll({
							include: [
								lib.dbConnection.UserSituation,
								{
									model: lib.dbConnection.ServiceProviderProfile,
									include: [
										{
											model: lib.dbConnection.ServiceProviderSpecialInfo,
											include: [
												{
													model: lib.dbConnection.VehicleBrand,
													attributes: ['name']
												},
												{
													model: lib.dbConnection.VehicleModel,
													attributes: ['name']
												}
											]
										},
										{
											model: lib.dbConnection.City,
											attributes: ['name']
										}
									],
									attributes: ['first_name', 'last_name', 'representer_code', 'special_code', 'sum_rate', 'rate_count', 'sum_trip_counts']
								}
							],
							where: [query],
							attributes: ['id', 'mobile']
						}).complete(function (err, users) {
							console.log("err", err);
							cb(null, {result: users || []});
						});
					}
				},
				function (err, allResult) {
					//var rows=repo.paginate(allResult.findAll.result,req.params.pageIndex,7)
					res.render(theNamespace + '/verifiedDrivers/view', {
						userLoggedInDetails: userLoggedIn,
						userList: allResult.findAll.result,
						//pageParams:rows.pageParams,
						selectedMenu: 'verified_drivers',
					});
				}
			);
		}
	});
};
//******************SEPARATE******************
//******************SEPARATE******************
exports.excel = function (req, res) {
	var excelbuilder = require('msexcel-builder');
	var body = req.body;
	lib.async.auto(
		{
			forms: function (cb, forms) {
				var query = "";
				for (var key in body) {
					if (body[key] && body[key] != '' && body[key] != 'null') {
						switch (key) {
							case "start_rate" :
								query += " CAST(service_provider_profile.sum_rate/service_provider_profile.rate_count AS UNSIGNED) >= " + parseInt(body[key]) + " AND ";
								break;
							case "end_rate" :
								query += " CAST(service_provider_profile.sum_rate/service_provider_profile.rate_count AS UNSIGNED) <= " + parseInt(body[key]) + " AND ";
								break;
							case "situation_id" :
								query += " `users`.situation_id='" + body[key] + "' AND ";
								break;
							case "special_code" :
								query += " `users`.mobile LIKE '%" + body[key] + "%' AND ";
								break;
							case "fullname" :
								query += " (service_provider_profile.first_name LIKE '%" + body[key] + "%' OR "
									+ " service_provider_profile.last_name LIKE '%" + body[key] + "%') AND ";
								break;
							case "mobile" :
								query += " `users`.mobile LIKE '%" + body[key] + "%' AND ";
								break;
							case "city_id" :
								query += " `service_provider_profile`.city_id = " + body[key] + " AND ";
								break;
						}
					}
				}
				query += " `users`.user_type_id = 1 and `users`.situation_id in (1,2)";
				lib.dbConnection.User.findAll({
					include: [
						lib.dbConnection.UserSituation,
						{
							model: lib.dbConnection.ServiceProviderProfile,
							include: [
								{
									model: lib.dbConnection.ServiceProviderSpecialInfo,
									include: [
										{
											model: lib.dbConnection.VehicleBrand,
											attributes: ['name']
										},
										{
											model: lib.dbConnection.VehicleModel,
											attributes: ['name']
										}
									]
								},
								{
									model: lib.dbConnection.City,
									attributes: ['name']
								}
							],
							attributes: ['first_name', 'last_name', 'special_code', 'sum_rate', 'rate_count', 'sum_trip_counts']
						}
					],
					where: [query],
					attributes: ['id', 'mobile']
				}).complete(function (err, users) {
					console.log("err", err);
					cb(null, {result: users || []});
				});
			},
			showData: ['forms', function (cb, results) {
				var users = results.forms.result;
				var file = "لیست رانندگان تایید شده";
				var workbook2 = excelbuilder.createWorkbook('./public/app/', file + '.xlsx');
				var sheet2 = workbook2.createSheet('sheet2', 7, users.length + 1);
				sheet2.set(1, 1, 'کد');
				sheet2.set(2, 1, 'کد اختصاصی');
				sheet2.set(3, 1, 'نام و نام خانوادگی راننده');
				sheet2.set(4, 1, 'کد معرف');
				sheet2.set(5, 1, 'موبایل راننده');
				sheet2.set(6, 1, 'شهر');
				sheet2.set(7, 1, 'وضعیت');
				// Save it
				for (var row = 2; row < users.length + 2; row++) {
					console.log(users[row - 2].serviceProviderProfile.first_name+' '+users[row - 2].serviceProviderProfile.first_name);
					sheet2.set(1, row, users[row - 2].id);
					sheet2.set(2, row, users[row - 2].serviceProviderProfile.special_code);
					sheet2.set(3, row, users[row - 2].serviceProviderProfile.first_name+' '+users[row - 2].serviceProviderProfile.last_name);
					sheet2.set(4, row, users[row - 2].serviceProviderProfile.representer_code || "-");
					sheet2.set(5, row, users[row - 2].mobile);
					sheet2.set(6, row, (users[row - 2].serviceProviderProfile.city.title || 'نامشخص'));
					sheet2.set(7, row, (users[row - 2].userSituation.id == 1 ? 'فعال' : 'غیر فعال'));
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
//******************SEPARATE******************
exports.profile = function (req, res) {
	tools.getLoggedInUser(theNamespace, req.sessionID, function (userLoggedIn) {
		if (userLoggedIn === false) {
			res.redirect('/' + theNamespace + '/login');
		} else {
			lib.dbConnection.sequelize.query("SELECT users.id,(SELECT CAST(SUM(driver_slice) AS UNSIGNED)  FROM trip WHERE trip.driver_user_id = users.id and trip.trip_situation_id=6) AS total_slice ,sdoc.confirmed_at,spro.sum_rate,spro.rate_count,spro.deposit_amount,users.balance,sinfo.description,spro.first_name,spro.last_name,states.name AS state_name,city.name AS city_name,users.mobile,users.email,spro.bank_shaba_number,spro.bank_atm_number,vbrand.name AS car_name,vmodel.name AS model_name,sinfo.vehicle_plaque_left,sinfo.vehicle_plaque_alphabet,sinfo.vehicle_plaque_right,sinfo.vehicle_plaque_iran,sinfo.vehicle_capacity,sinfo.vehicle_has_license_traffic_plan,sinfo.license_traffic_plan_expiration_date,sdoc.driving_licence_pic,sdoc.driving_licence_confirm,sdoc.vehicle_insurance_expiration_date,sdoc.technical_diagnosis_expiration_date,sdoc.driving_licence_expiration_date,sdoc.technical_diagnosis_pic,sdoc.technical_diagnosis_confirm,sdoc.vehicle_card_front,sdoc.vehicle_card_back,sdoc.vehicle_card_confirm,sdoc.clearances_pic,sdoc.clearances_confirm,sdoc.vehicle_ownership_document_pic,sdoc.vehicle_ownership_document_confirm,sdoc.vehicle_insurance_pic,sdoc.vehicle_insurance_confirm FROM users LEFT OUTER JOIN service_provider_profile as spro on spro.user_id=users.id LEFT OUTER JOIN service_provider_documents as sdoc on sdoc.id=spro.documents_id LEFT OUTER JOIN service_provider_special_info as sinfo on sinfo.id=spro.special_info_id LEFT OUTER JOIN cities as city on city.id=spro.city_id LEFT OUTER JOIN states on states.id=spro.state_id LEFT OUTER JOIN vehicle_brands as vbrand on vbrand.id=sinfo.vehicle_brand_id LEFT OUTER JOIN vehicle_models as vmodel on vmodel.id=sinfo.vehicle_model_id WHERE users.user_type_id=1 AND " +
				"users.id=" + req.query.id).complete(function (err, user) {
				console.log("err", err);
				res.render(theNamespace + '/verifiedDrivers/profile', {
					userLoggedInDetails: userLoggedIn,
					profile: user[0],
					selectedMenu: 'verified_drivers',
				});
			});
		}
	});
};
//******************SEPARATE******************
//******************SEPARATE******************
exports.setMeeting = function (req, res) {
	tools.getLoggedInUser(theNamespace, req.sessionID, function (userLoggedIn) {
		if (userLoggedIn === false) {
			res.redirect('/' + theNamespace + '/login');
		} else {
			lib.dbConnection.User.find({
				include: [
					lib.dbConnection.ServiceProviderProfile
				],
				where: {
					id: req.params.id
				}
			}).complete(function (err, user) {
				user.updateAttributes({situation_id: 5}, ['situation_id']).complete(function (err, row) {
					user.serviceProviderProfile.updateAttributes({visit_date: req.body.date}, ['visit_date']).complete(function (err, row) {
						res.json(true);
					});
				});
			});
		}
	});
};
//******************SEPARATE******************
//******************SEPARATE******************
exports.doMeeting = function (req, res) {
	tools.getLoggedInUser(theNamespace, req.sessionID, function (userLoggedIn) {
		if (userLoggedIn === false) {
			res.redirect('/' + theNamespace + '/login');
		} else {
			var body = req.body;
			lib.dbConnection.User.find({
				include: [
					{
						model: lib.dbConnection.ServiceProviderProfile,
						include: [
							lib.dbConnection.ServiceProviderDocument,
						]
					}
				],
				where: {
					id: req.body.id
				}
			}).complete(function (err, user) {
				console.log("err", err);
				delete body['id'];
				var fields = [];
				for (var key in body) {
					body[key] = true;
					fields.push(key);
				}
				user.serviceProviderProfile.serviceProviderDocument.updateAttributes(body, fields).complete(function (err, row) {
					console.log("err", err);
					res.json(true);
				});
			});
		}
	});
};
//******************SEPARATE******************
//******************SEPARATE******************
exports.messages = function (req, res) {
	tools.getLoggedInUser(theNamespace, req.sessionID, function (userLoggedIn) {
		if (userLoggedIn === false) {
			res.redirect('/' + theNamespace + '/login');
		} else {
			lib.dbConnection.User.find({
				include: [
					{
						model: lib.dbConnection.TripDriversComment,
						as: 'driverComments',
						include: [
							{
								model: lib.dbConnection.User,
								as: 'passenger',
								include: [lib.dbConnection.CustomerProfile]
							}
						]
					}
				],
				where: {
					id: req.query.id
				},
				order: [['id', 'desc']]
			}).complete(function (err, user) {
				console.log("err", err);
				//res.json(user)
				res.render(theNamespace + '/verifiedDrivers/comments', {
					userLoggedInDetails: userLoggedIn,
					profile: user,
					selectedMenu: 'verified_drivers',
				});
			});
		}
	});
};
//******************SEPARATE******************
//******************SEPARATE******************
exports.cars = function (req, res) {
	tools.getLoggedInUser(theNamespace, req.sessionID, function (userLoggedIn) {
		if (userLoggedIn === false) {
			res.redirect('/' + theNamespace + '/login');
		} else {
			lib.dbConnection.sequelize.query("SELECT count(*) as total_number,city.name as city_name,vehicle_brands.id,vehicle_models.name as model_name,vehicle_brands.name as brand_name FROM service_provider_profile inner JOIN service_provider_special_info ON  service_provider_profile.special_info_id = service_provider_special_info.id inner JOIN vehicle_brands on service_provider_special_info.vehicle_brand_id=vehicle_brands.id inner JOIN vehicle_models on service_provider_special_info.vehicle_model_id=vehicle_models.id left outer join cities as city on city.id=service_provider_profile.city_id GROUP BY vehicle_models.id,city.id"
			).complete(function (err, rows) {
				console.log("err", err);
				lib.dbConnection.VehicleBrand.findAll().complete(function (err, brands) {
					lib.dbConnection.City.findAll().complete(function (err, cities) {
						res.render(theNamespace + '/verifiedDrivers/cars', {
							userLoggedInDetails: userLoggedIn,
							data: rows,
							brandList: brands,
							cityList: cities,
							selectedMenu: 'verified_drivers',
						});
					});
				});
			});
		}
	});
};
//******************SEPARATE******************
//******************SEPARATE******************
exports.models = function (req, res) {
	tools.getLoggedInUser(theNamespace, req.sessionID, function (userLoggedIn) {
		if (userLoggedIn === false) {
			res.redirect('/' + theNamespace + '/login');
		} else {
			lib.dbConnection.VehicleModel.findAll({
				where: {
					brand_id: req.body.id
				}
			}).complete(function (err, result) {
				console.log("err", err);
				res.json(result);
			});
		}
	});
};
//******************SEPARATE******************
//******************SEPARATE******************
exports.searchCars = function (req, res) {
	tools.getLoggedInUser(theNamespace, req.sessionID, function (userLoggedIn) {
		if (userLoggedIn === false) {
			res.redirect('/' + theNamespace + '/login');
		} else {
			var body = req.body;
			lib.async.auto
			(
				{
					findAll: function (cb, results) {
						var query = "SELECT count(*) as total_number,city.name as city_name,vehicle_brands.id,vehicle_models.name as model_name,vehicle_brands.name as brand_name FROM service_provider_profile inner JOIN service_provider_special_info ON  service_provider_profile.special_info_id = service_provider_special_info.id inner JOIN vehicle_brands on service_provider_special_info.vehicle_brand_id=vehicle_brands.id inner JOIN vehicle_models on service_provider_special_info.vehicle_model_id=vehicle_models.id left outer join cities as city on city.id=service_provider_profile.city_id  where ";
						for (var key in body) {
							if (body[key] && body[key] != '' && body[key] != 'null') {
								switch (key) {
									case "city_id" :
										query += " city.id =" + body[key] + " AND ";
										break;
									case "brand_id" :
										query += " vehicle_brands.id =" + body[key] + " AND ";
										break;
									case "model_id" :
										query += " vehicle_models.id =" + body[key] + " AND ";
										break;
								}
							}
						}
						query += " vehicle_brands.id <> -1 GROUP BY vehicle_models.id,city.id ";
						lib.dbConnection.sequelize.query(query).complete(function (err, users) {
							console.log("err", err);
							cb(null, {result: users || []});
						});
					}
				},
				function (err, allResult) {
					res.render(theNamespace + '/verifiedDrivers/view2', {
						userLoggedInDetails: userLoggedIn,
						data: allResult.findAll.result,
						selectedMenu: 'verified_drivers',
					});
				}
			);
		}
	});
};
//******************SEPARATE******************
//******************SEPARATE******************
exports.seeOnlineDriver = function (req, res) {
	tools.getLoggedInUser(theNamespace, req.sessionID, function (userLoggedIn) {
		if (userLoggedIn === false) {
			res.redirect('/' + theNamespace + '/login');
		} else {
			lib.dbConnection.User.find({
				include: [lib.dbConnection.ServiceProviderProfile, lib.dbConnection.OnlineDriver],
				where: {
					id: req.params.id
				}
			}).complete(function (err, user) {
				console.log('user.onlineDriver', user.onlineDriver);
				if (user.serviceProviderProfile.current_situation_id == 1) {
					res.redirect("/backend/verified_drivers");
				} else if (user.onlineDriver) {
					res.render(theNamespace + '/verifiedDrivers/seeDriverLocation', {
						userLoggedInDetails: userLoggedIn,
						specifications: user.onlineDriver,
						// selectedMenu : 'verified_drivers',
					});
				} else {
					user.serviceProviderProfile.current_situation_id = 1;
					user.serviceProviderProfile.save({fields: ["current_situation_id"]}).complete(function (err, newProfile) {
						res.redirect("/backend/verified_drivers");
					});
				}
			});
		}
	});
};
//******************SEPARATE******************
exports.getDriverPosition = function (req, res) {
	tools.getLoggedInUser(theNamespace, req.sessionID, function (userLoggedIn) {
		if (userLoggedIn === false) {
			res.redirect('/' + theNamespace + '/login');
		} else {
			lib.dbConnection.User.find({
				include: [lib.dbConnection.OnlineDriver],
				where: {
					id: req.body.id
				}
			}).complete(function (err, user) {
				if(user && user.onlineDriver) {
					res.json({Result: true, data: user.onlineDriver});
				} else {
					res.json({Result: false});
				}
			});
		}
	});
};