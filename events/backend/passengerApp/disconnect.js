module.exports = function(redisClient, namespaceKey, socket, dbConnection, appConfig,io) {
	io.of('/backend_passengerApp').emit('disconnectRes',{message:"I am down!"});
}