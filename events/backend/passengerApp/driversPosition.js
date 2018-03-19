module.exports = function(redisClient, namespaceKey, socket, dbConnection, appConfig,io) {
	socket.on('driversPosition',function(params){
		var lib = require('../../../include/lib');
		var repo = require('../../../include/repo');
		var repository = new repo();
		var socketId = socket.id;
		redisClient.set(params.UserId,socket.id,function(){
			redisClient.set(socket.id, params.UserId, function () {
				console.log("passenger socket saved for user id "+params.UserId);
			});
		});
		repository.drivers.allNearDrivers(params, function (result) {
			socket.emit('driversPositionRes', result);
		});
	})
}