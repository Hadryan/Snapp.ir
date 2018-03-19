module.exports = function(redisClient, namespaceKey, socket, dbConnection, appConfig,io) {
	socket.on('updateSocket',function(params){
		var repo = require('../../../include/repo');
		var repository = new repo();
		repository.drivers.getPassengerInfo(params, function (result) {
			if(result.Result) {
				redisClient.set(params.UserId, socket.id, function () {
					redisClient.set(socket.id, params.UserId, function () {
						console.log("socket saved for user id "+params.UserId);
						socket.emit('updateSocketRes', result);
					});
				});
			} else {
				socket.emit('updateSocketRes', result);
			}
		});
	})
}