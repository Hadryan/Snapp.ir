var tools = require('../../../include/tools');
var async = require('async');
var Sequelize = require('sequelize');

module.exports = function (redisClient, namespaceKey, socket, dbConnection, appConfig) {
	
	// ==========================================================================================
	// ==/ signup event =========================================================================
	// ==========================================================================================
	var returnCode = socket.on('backend.user.add', function (formData) {
		
		if (formData) {
			if (typeof formData !== 'object') {
				formData = JSON.parse(formData);
			}
			console.log('receive : ', formData);
		} else {
			return false;
		}
		
		async.auto(
			{
				allowAdd: function (cb, results) {
					
					dbConnection.BackendUser.find(
						{
							where: Sequelize.or(
								{username: formData.username},
								{email: formData.email},
								{mobileNumber: formData.mobileNumber}
							)
						}
					)
						.success(function (user) {
							if (user) {
								cb(null, false);
							} else {
								cb(null, true);
							}
						})
						.error(function (err) {
							console.log('user error',err);
							cb(null, false);
						});
					
				},
				
				userAdd: ['allowAdd', function (cb, results) {
					
					if (results.allowAdd) {
						
						formData.password = tools.encode(formData.password);
						
						dbConnection.BackendUser.create(formData).success(function (user) {
							if (user) {
								cb(null, user.dataValues);
							} else {
								console.log('user error',user);
								cb(null, false);
							}
						})
							.error(function (err) {
								console.log('user error',err);
								cb(null, err);
							});
						
					} else {
						cb(null, false);
					}
					
				}],
				
			},
			
			function (err, allResult) {
				if (allResult.allowAdd) {
					resultResponse = {
						'result': true,
						'allowAdd': true,
						'data': allResult.userAdd
					};
					socket.emit('backend.user.add_res', resultResponse);
				} else {
					resultResponse = {
						'result': false,
						'data': false,
						'allowAdd': false,
						'errorAllObj': {
							'ALL': 'به علت خطا در اطلاعات ورودی امکان اضافه کردن رکورد جدید نمی باشد.'
						}
					};
					socket.emit('backend.user.add_res', resultResponse);
				}
			}
		);
		
	});
	// == signup event /=========================================================================
	
	return returnCode;
	
}