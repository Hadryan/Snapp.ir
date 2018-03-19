module.exports = function(redisClient, namespaceKey, socket, dbConnection, appConfig,io) {
	io.of('/backend_driverApp').emit('disconnectRes',{message:"I am down!"})
}