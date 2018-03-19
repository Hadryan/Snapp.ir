var tools = require('../../../include/tools');
var theNamespace = 'backend';

module.exports = function (redisClient, namespaceKey, socket, dbConnection, appConfig) {

	sessionId = tools.getSessionIdBySocket(socket, appConfig.app.sessionKey);
	// ==========================================================================================
	// ==/ signUp event =========================================================================
	// ==========================================================================================
	var returnCode = socket.on('login', function (formData) {

		if (formData) {
			if (typeof formData !== 'object') {
				formData = JSON.parse(formData);
			}
			console.log('receive : ', formData);
		} else {
			return false;
		}

		var encodePassword = tools.encode(formData.password);
		dbConnection.BackendUser.find(
			{
				where: {
					username: formData.username,
					password: encodePassword,
					status: 'Active'
				}
			}
		).complete(function (err, userRow) {

			if (!!err) {

				resultResponse = {
					'result': false,
					'errorAllObj': {
						'ALL': 'There is an error in Database, please wait a little and try again.'
					}
				};
				socket.emit('login_res', resultResponse);
				console.log('error happend', error, resultResponse);

			} else if (!userRow) {

				resultResponse = {
					'result': false,
					'errorAllObj': {
						'ALL': 'User not found or it is INACTIVE. Please provide a valid USERNAME and PASSWORD please.'
					}
				};
				socket.emit('login_res', resultResponse);
				console.log('user not found', resultResponse);

			} else {

				tools.log('session id before login in panel' + theNamespace + ' is :', sessionId);
				userRow.login(theNamespace, sessionId, function (result) {
					console.log('yes login in panel ' + theNamespace, userRow.dataValues);


					console.log('@@@@@@@@@ SOCKET set mobile :', appConfig.app.sessionKey, sessionId, tools.encode(sessionId));
					console.log('yes login in panel ' + theNamespace, userRow.dataValues);

					resultResponse = {
						'result': true,
						'token_key': appConfig.app.sessionKey,
						'token_value': tools.encode(sessionId),
						'data': userRow
					};
					socket.emit('login_res', resultResponse);
				});

			}

		});


	});
	// == signup event /=========================================================================


	return returnCode;

};