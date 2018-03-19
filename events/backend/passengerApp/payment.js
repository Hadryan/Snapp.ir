module.exports = function(redisClient, namespaceKey, socket, dbConnection, appConfig,io) {
	socket.on('payment',function(params) {
		var ioDriverApp = io.of('/backend_driverApp');
		var repo = require('../../../include/repo');
		var repository = new repo();
		redisClient.set(params.UserId,socket.id,function(){
			redisClient.set(socket.id, params.UserId, function () {
				console.log("socket saved for user id "+params.UserId);
			});
		});
		repository.payment.setTripPaymentFromBalance(params, function (res) {
			if(res.Result) {
                redisClient.get(res.DriverId, function (error, result) {
                    if (error) {
                        console.log('error', error);
                    }
                    if (result) {
                        var socketId = result;
                        if (ioDriverApp.sockets[socketId]) {
                            socket.emit('paymentRes', {Result: true, Data: [res.Data[0]]});
                            ioDriverApp.sockets[socketId].emit('passengerPayment', {Result: true});
                        } else {
                            console.log(res.passengerId + " not online!!");
                        }
                    } else {
                        console.log(res.passengerId + " socketId not found on redis!!");
                    }
                });
                socket.emit('paymentRes', res);
            } else {
                socket.emit('paymentRes', res);
            }
		});
	});
}