module.exports = function(redisClient, namespaceKey, socket, dbConnection, appConfig,io) {
	socket.on('updateSocket',function(params){
		var repo = require('../../../include/repo');
		var lib = require('../../../include/lib');
		var repository = new repo();
		var UDCSParams = {};
		repository.drivers.getInfo(params, function (result) {
			if(result.Result) {
				redisClient.set(params.UserId, socket.id, function () {
					redisClient.set(socket.id, params.UserId, function () {
						console.log("driver socket saved for user id " + params.UserId+" at first connect");
						socket.emit('updateSocketRes', result);
					});
				});
			} else {
				socket.emit('updateSocketRes', result);
			}
		});
	})
}