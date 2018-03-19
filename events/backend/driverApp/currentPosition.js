module.exports = function (redisClient, namespaceKey, socket, dbConnection, appConfig, io) {
	socket.on('currentPosition', function (params) {
		var ioPassengerApp = io.of('/backend_passengerApp');
		var lib = require('../../../include/lib');
		var repo = require('../../../include/repo');
		var repository = new repo();
		redisClient.set(params.UserId, socket.id, function () {
			redisClient.set(socket.id, params.UserId, function () {
				console.log("socket saved for user id " + params.UserId);
			});
		});
		repository.drivers.currentPosition(params, function (res) {
			socket.emit('currentPositionRes', {Result: true});
			if (res.Result && res.trip) {
				redisClient.get(res.trip.passenger_user_id, function (error, result) {
					if (error) {
						console.log('Driver Current Position Received And Driver Is On Trip, But Passenger Is Not Online.');
						console.log('Error Is: ', error);
					}
					if (result) {
						var socketId = result;
						if (ioPassengerApp.sockets[socketId]) {
							// console.log('!!!!!!!!!!!!@@@@@@@@@@@@############$$$$$$$$$$$');
							// console.log(res);
							// console.log('!!!!!!!!!!!!@@@@@@@@@@@@############$$$$$$$$$$$');
							var returnParams = JSON.parse(JSON.stringify(res.driverOnline));
							returnParams.trip = res.trip;
							ioPassengerApp.sockets[socketId].emit('driverLocation', {
								Result: true,
								Data: [returnParams]
							});
						} else {
							console.log('Driver Current Position Received And Driver Is On Trip, But Passenger Is Not Online.');
						}
					}
				});
			} else {
				console.log('Driver Current Position Received And repository has error.');
				console.log('Error Is: ', res);
			}
		});
	});
};