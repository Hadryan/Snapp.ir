module.exports = function(redisClient, namespaceKey, socket, dbConnection, appConfig,io) {
    socket.on('refreshSocket',function(params){
        var repo = require('../../../include/repo');
        var lib = require('../../../include/lib');
        var repository = new repo();
	    var tLParams = {};
	    tLParams.userId = params.UserId;
	    tLParams.tripId = null;
	    repository.drivers.getPassengerSituation(params, function (result) {
            if(result.Result) {
                redisClient.set(params.UserId, socket.id, function () {
                    redisClient.set(socket.id, params.UserId, function () {
	                    tLParams.newSituation = 1;
	                    tLParams.description = "passenger " + params.UserId + " socket refreshed.";
	                    repository.user.setTripLog(tLParams, function (tLResult) {});
	                    console.log("passenger socket saved for user id " + params.UserId+" at first connect");
                        socket.emit('refreshSocketRes', result);
                    });
                });
            } else {
	            tLParams.newSituation = null;
	            tLParams.description = "passenger socket become refresh.but accord database error. error was:"+JSON.stringify(result);
	            repository.user.setTripLog(tLParams, function (tLResult) {});
	            socket.emit('refreshSocketRes', result);
            }
        });
	    socket.on('disconnect', function () {
		    redisClient.get(socket.id, function (error, userId) {
			    if(error){
				    tLParams.newSituation = null;
				    tLParams.description = "passenger become offline.but can not get his id from redis.error was:"+JSON.stringify(error);
				    repository.user.setTripLog(tLParams, function (tLResult) {});
			    }
			    if(userId) {
				    console.log('DISCONNECT!!! ', userId);
				    repository.user.disconnectUserSocket({userId: userId}, function (disconnectUserSocketResult) {
					    if(disconnectUserSocketResult.Result){
						    tLParams.newSituation = 1;
						    tLParams.description = "passenger "+userId+" become offline.";
						    repository.user.setTripLog(tLParams, function (tLResult) {});
					    } else if(disconnectUserSocketResult.ErrorCode){
						    tLParams.newSituation = null;
						    tLParams.description = "passenger become offline.but his situation is greather than 3";
						    repository.user.setTripLog(tLParams, function (tLResult) {});
					    } else {
						    tLParams.newSituation = null;
						    tLParams.description = "passenger become offline.but can not offline in database.error was:"+JSON.stringify(error);
						    repository.user.setTripLog(tLParams, function (tLResult) {});
					    }
				    });
			    }
		    });
	    });
    });
}