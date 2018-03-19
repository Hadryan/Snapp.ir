module.exports = function(redisClient, namespaceKey, socket, dbConnection, appConfig) {
    

    // ==========================================================================================
    // == /socket disconnect event ==============================================================
    // ==========================================================================================
    var returnCode = socket.on('disconnect', function(){
      console.log('disconnect ' + namespaceKey);
      return true;
    });
    // == socket disconnect event/ ==============================================================


    return returnCode;

}