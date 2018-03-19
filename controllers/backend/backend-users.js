var redis = require("redis");
var redisClient = redis.createClient();
var dbConnection = require('../../models');
var tools = require('../../include/tools');
var async = require('async');
var theNamespace = 'backend';
// ******************************************************************************************
// ** /Define routers  **********************************************************************
// ******************************************************************************************
// -- /Route / ------------------------------------------------------------------------------
exports.index = function (req, res) {
	tools.getLoggedInUser(theNamespace, req.sessionID, function (userLoggedIn) {
		if (userLoggedIn === false) {
			res.redirect('/' + theNamespace + '/login');
		} else {
			async.auto(
				{
					userList: function (cb, results) {
						dbConnection.BackendUser.findAll()
							.success(function (users) {
								if (users) {
									cb(null, users);
								} else {
									cb(null, false);
								}
							})
							.error(function (err) {
								cb(null, false);
							});
					}
				},
				function (err, allResult) {
					console.log('all results', allResult);
					res.render(theNamespace + '/backend-users/index', {
						userLoggedInDetails: userLoggedIn,
						userList: allResult.userList,
						selectedMenu: 'backend-users'
					});
				}
			);
		}
	});
};
// -- Route // ------------------------------------------------------------------------------
// -- /Route / ------------------------------------------------------------------------------
exports.edit = function (req, res) {
	tools.getLoggedInUser(theNamespace, req.sessionID, function (userLoggedIn) {
		if (userLoggedIn === false) {
			res.redirect('/' + theNamespace + '/login');
		} else {
			console.log('request id : ', req.params.id);
			async.auto(
				{
					userDetail: function (cb, results) {
						dbConnection.BackendUser.find(
							{
								where: {
									id: req.params.id
									//status : 'Active'
								}
							}
						)
							.success(function (user) {
								if (user) {
									cb(null, user);
								} else {
									cb(null, false);
								}
							})
							.error(function (err) {
								cb(null, false);
							});
					}
				},
				function (err, allResult) {
					//console.log('all results', allResult);
					if (allResult.userDetail != false) {
						if (allResult.userDetail.dataValues.password) {
							allResult.userDetail.dataValues.password = tools.decode(allResult.userDetail.dataValues.password);
						}
						res.render(theNamespace + '/backend-users/edit', {
							userLoggedInDetails: userLoggedIn,
							userDetail: allResult.userDetail.dataValues,
							selectedMenu: 'backend-users'
						});
					} else {
						res.redirect('/' + theNamespace + '/backend-users');
					}
				}
			);
		}
	});
};
// -- Route // ------------------------------------------------------------------------------
// -- /Route / ------------------------------------------------------------------------------
exports.delete = function (req, res) {
	tools.getLoggedInUser(theNamespace, req.sessionID, function (userLoggedIn) {
		if (userLoggedIn === false) {
			res.redirect('/' + theNamespace + '/login');
		} else {
			console.log('request id : ', req.params.id);
			async.auto(
				{
					userDetail: function (cb, results) {
						dbConnection.BackendUser.find(
							{
								where: {
									id: req.params.id
									//status : 'Active'
								}
							}
						)
							.success(function (user) {
								if (user) {
									if (user.dataValues.id == userLoggedIn.id) {
										// do nothing beacuse you cannot remove yourself!
										cb(null, false);
									} else {
										//console.log('user detail :', user.dataValues);
										user.destroy().success(function () {
											//console.log('destroy success ');
											cb(null, true);
										}).error(function (err) {
											cb(null, false);
										});
									}
								} else {
									cb(null, false);
								}
							})
							.error(function (err) {
								cb(null, false);
							});
					}
				},
				function (err, allResult) {
					//console.log('all results', allResult);
					res.redirect('/' + theNamespace + '/backend-users');
				}
			);
		}
	});
}
// -- Route // ------------------------------------------------------------------------------
// -- /Route / ------------------------------------------------------------------------------
exports.add = function (req, res) {
	tools.getLoggedInUser(theNamespace, req.sessionID, function (userLoggedIn) {
		if (userLoggedIn === false) {
			res.redirect('/' + theNamespace + '/login');
		} else {
			res.render(theNamespace + '/backend-users/add', {
				userLoggedInDetails: userLoggedIn,
				selectedMenu: 'backend-users'
			});
		}
	});
}
// -- Route // ------------------------------------------------------------------------------
// ** Define routers/ ***********************************************************************