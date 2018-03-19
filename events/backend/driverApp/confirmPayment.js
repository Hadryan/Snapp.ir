module.exports = function(redisClient, namespaceKey, socket, dbConnection, appConfig,io) {
	socket.on('confirmPayment',function(params) {
		var ioPassengerApp = io.of('/backend_passengerApp');
		var lib = require('../../../include/lib');
		var repo = require('../../../include/repo');
		var repository = new repo();
		redisClient.set(params.UserId,socket.id,function(){
			redisClient.set(socket.id, params.UserId, function () {
				console.log("socket saved for user id "+params.UserId);
			});
		});
		var tLParams = {};
		tLParams.userId = params.UserId;
		tLParams.tripId = params.TripId;
		var UDCSParams = {};
		UDCSParams.DriverId = params.UserId;
		UDCSParams.SituationId = lib.Constants.setConstant("serviceProviderCurrentSituationWaitingForRatingToPassenger");
		repository.user.updateDriverCurrentSituation(UDCSParams,function(DSituationResult) {
			repository.payment.confirmPayment(params, function (res) {
				if (res.Result) {
					var UPCSParams = {};
					UPCSParams.PassengerId = res.Data[0].trip.passenger_user_id;
					UPCSParams.SituationId = lib.Constants.setConstant("customerCurrentSituationWaitingForRatingToDriver");
					repository.user.updatePassengerCurrentSituation(UPCSParams,function(PSituationResult) {
						redisClient.get(res.Data[0].trip.passenger_user_id, function (error, result) {
							if (error) {
								tLParams.newSituation = UDCSParams.SituationId;
								tLParams.description = "Driver confirm payment,but passenger socket id not found,error was: "+JSON.stringify(error);
								repository.user.setTripLog(tLParams,function(tLResult) {});
								console.log('error', error);
							}
							if (result) {
								var socketId = result;
								if (ioPassengerApp.sockets[socketId]) {
									tLParams.newSituation = UDCSParams.SituationId;
									tLParams.description = "Driver confirm payment";
									repository.user.setTripLog(tLParams,function(tLResult) {});
									ioPassengerApp.sockets[socketId].emit('confirmedPayment', res);
								} else {
									tLParams.newSituation = UDCSParams.SituationId;
									tLParams.description = "Driver confirm payment and passenger socket id found, but passenger not online, error was: "+JSON.stringify(error);
									repository.user.setTripLog(tLParams,function(tLResult) {});
									console.log(res.passengerId + " not online!!");
								}
								if(res.Data[0].user.balance<lib.Constants.setConstant("minDriverBalanceAllowed")){
									repository.user.disableDebtorDriver(params.UserId);
									socket.emit('userDisabled', {Result: true, });
								}
								socket.emit('confirmPaymentRes', res);
							} else {
								tLParams.newSituation = UDCSParams.SituationId;
								tLParams.description = "Driver confirm payment and passenger socket id not found, but no error!!";
								repository.user.setTripLog(tLParams,function(tLResult) {});
								console.log(res.passengerId + " socketId not found on redis!!");
							}
						});
					});
				} else {
					tLParams.newSituation = UDCSParams.SituationId;
					tLParams.description = "Driver confirm payment has error! error was:"+JSON.stringify(res);
					repository.user.setTripLog(tLParams,function(tLResult) {});
					console.log(res);
				}
			});
		});
	});
}