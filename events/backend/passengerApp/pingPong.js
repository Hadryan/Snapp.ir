module.exports = function(redisClient, namespaceKey, socket, dbConnection, appConfig,io) {
	function sendHeartbeat(){
		setTimeout(function () {
			// console.log("ping sent!");
			socket.emit('ping', { beat : 1 });
			sendHeartbeat();
		}, 15000);
	}
	socket.on('pong',function(params) {
		// console.log("pong Received!!!!!!!!!");
	});
	socket.on('myPong',function(params) {
		// console.log("my pong Received@@@@@");
	});
	sendHeartbeat();
};