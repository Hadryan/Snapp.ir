var lib = require('../../include/lib');
var tools = require('../../include/tools');
var repo = require('../../repository/backendRepo');
var theNamespace = 'backend';
//******************SEPARATE******************
exports.index = function (req, res) {
	tools.getLoggedInUser(theNamespace, req.sessionID, function (userLoggedIn) {
		if (userLoggedIn === false) {
			res.redirect('/' + theNamespace + '/login');
		} else {
			lib.async.auto({
					notificationList: function (cb, results) {
						lib.dbConnection.Notification.findAll({
							include: [lib.dbConnection.NotificationType]
						}).success(function (notifications) {
							if (notifications) {
								cb(null, notifications);
							} else {
								cb(null, false);
							}
						}).error(function (err) {
							cb(null, false);
						});
					},
				}, function (err, allResult) {
					res.render(theNamespace + '/notification/index', {
						userLoggedInDetails: userLoggedIn,
						notificationList: allResult.notificationList,
						selectedMenu: 'notification'
					});
				}
			);
		}
	});
}
//******************SEPARATE******************
exports.edit = function (req, res) {
	tools.getLoggedInUser(theNamespace, req.sessionID, function (userLoggedIn) {
		if (userLoggedIn === false) {
			res.redirect('/' + theNamespace + '/login');
		} else {
			console.log('request id : ', req.params.id);
			lib.async.auto({
					notificationDetail: function (cb, results) {
						lib.dbConnection.Notification.find({where: {id: req.params.id}}).success(function (notification) {
							if (notification) {
								cb(null, notification);
							} else {
								cb(null, false);
							}
						}).error(function (err) {
							cb(null, false);
						});
					}
				}, function (err, allResult) {
					if (allResult.notificationDetail != false) {
						res.render(theNamespace + '/notification/edit', {
							userLoggedInDetails: userLoggedIn,
							notificationDetail: allResult.notificationDetail.dataValues,
							selectedMenu: 'notification'
						});
					} else {
						res.redirect('/' + theNamespace + '/notification');
					}
				}
			);
		}
	});
}
//******************SEPARATE******************
exports.delete = function (req, res) {
	tools.getLoggedInUser(theNamespace, req.sessionID, function (userLoggedIn) {
		if (userLoggedIn === false) {
			res.redirect('/' + theNamespace + '/login');
		} else {
			console.log('request id : ', req.params.id);
			lib.async.auto({
				notificationDetail: function (cb, results) {
					lib.dbConnection.Notification.find({where: {id: req.params.id}}).success(function (notification) {
						if (notification) {
							notification.destroy().success(function () {
								cb(null, true);
							}).error(function (err) {
								cb(null, false);
							});
						} else {
							cb(null, false);
						}
					}).error(function (err) {
						cb(null, false);
					});
				}
			}, function (err, allResult) {
				res.redirect('/' + theNamespace + '/notification');
			});
		}
	});
}
//******************SEPARATE******************
exports.add = function (req, res) {
	tools.getLoggedInUser(theNamespace, req.sessionID, function (userLoggedIn) {
		if (userLoggedIn === false) {
			res.redirect('/' + theNamespace + '/login');
		} else {
			res.render(theNamespace + '/notification/add', {
				userLoggedInDetails: userLoggedIn,
				selectedMenu: 'notification'
			});
		}
	});
}
//******************SEPARATE******************
exports.postAdd = function (req, res) {
	var body = JSON.parse(JSON.stringify(req.body));
	if (req.file) {
		body.image = "http://" + require('../../config.json')['production'].host.domain + ":" + require('../../config.json')['production'].host.port + "/app/notification/" + req.file.filename
	} else {
		body.image = null
	}
	body.created_at = Date.parse(new Date);
	body.user_id = body.type == 'All' ? null : body.user_id
	lib.dbConnection.Notification.create(body).complete(function (err, result) {
		console.log("err", err)
		var clause = (body.notification_type_id == '1' ? " true " : (body.notification_type_id == '2' ? " users.user_type_id=1" : " users.user_type_id=2"))
		lib.dbConnection.sequelize.query("select * " +
			"from user_token " +
			"left outer join users on users.id=user_token.user_id " +
			"where" + clause).complete(function (err, userTokens) {
			var toSendNotify = {
				'title': body.title,
				'description': body.description,
				'photo': body.image,
				'created_at': Date.parse(new Date),
				'user_id': null
			};
			var notification = require('../../repository/backendRepo/notificationRepository');
			notification.send(userTokens, toSendNotify, function (result) {
				console.log("result", result)
			});
			res.redirect("/backend/notification")
		})
	})
}