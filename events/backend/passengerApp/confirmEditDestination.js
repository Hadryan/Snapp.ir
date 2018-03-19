module.exports = function(redisClient, namespaceKey, socket, dbConnection, appConfig,io) {
	socket.on('confirmEditDestination',function(params) {
		var ioDriverApp = io.of('/backend_driverApp');
		var repo = require('../../../include/repo');
		var repository = new repo();
		redisClient.set(params.UserId,socket.id,function(){
			redisClient.set(socket.id,params.UserId,function(){
				console.log("socket saved for user id "+params.UserId);
			});
		});
		repository.trip.confirmEditDestination(params, function (res) {
			if(res.Result) {
				redisClient.get(res.Data[0].driver_user_id, function (error, result) {
					if (error) {
						console.log('error', error);
					}
					if (result) {
						var socketId = result;
						if (ioDriverApp.sockets[socketId]) {
							socket.emit('confirmEditDestinationRes', res);
							ioDriverApp.sockets[socketId].emit('editDestination', res);
						} else {
							console.log(res.passengerId + " not online!!");
						}
					} else {
						console.log(res.passengerId + " socketId not found on redis!!");
					}
				});
			} else {
				socket.emit('confirmEditDestinationRes', res);
				console.log(res);
			}
		});
	});
}