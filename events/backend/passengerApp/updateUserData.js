module.exports = function(redisClient, namespaceKey, socket, dbConnection, appConfig,io) {
	socket.on('updateUserData',function(params){
		var repo = require('../../../include/repo');
		var repository = new repo();
		repository.drivers.getPassengerInfoBalance(params, function (result) {
			if(result.Result) {
				redisClient.set(params.UserId, socket.id, function () {
					redisClient.set(socket.id, params.UserId, function () {
						console.log("socket saved for user id for new[emad] "+params.UserId);
						socket.emit('updateUserDataRes', result);
					});
				});
			} else {
				socket.emit('updateUserDataRes', result);
			}
		});
	})
}