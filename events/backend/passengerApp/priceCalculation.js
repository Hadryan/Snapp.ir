module.exports = function(redisClient, namespaceKey, socket, dbConnection, appConfig,io) {
	socket.on('priceCalculation',function(params){
		var repo = require('../../../include/repo');
		var repository = new repo();
		redisClient.set(params.UserId,socket.id,function(){
			redisClient.set(socket.id, params.UserId, function () {
				console.log("socket saved for user id "+params.UserId);
			});
		});
		repository.trip.calculateTripPrice(params, function (res) {
			socket.emit('priceCalculationRes', res);
		});
	})
}