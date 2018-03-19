var lib = require('../../include/lib');
/***********************************************************************************************************************
 index action for get trip price

 inputs : DeviceId , TripTime , TripDestination
 outputs : result:(true or false) if result tru data is a day trip information and result false ErrorCode is representing error code
 ************************************************************************************************************************/
exports.index = function(req, res) {
	var repo = require('../../include/repo');
	var repository = new repo();
	var body = JSON.parse (JSON.stringify(req.body));
	lib.async.auto({
        find: function(callBack, results) {
	        repository.passengerRate.applyPassengerRate(body, function (res) {
		        callBack(null, res);
	        });
        }
    } ,function(err, result) {
        if(result.find.Result == false) {
            res.status(200).json(result.find);
        } else {
            res.status(200).json({Result: true, Data: [result.find.data]});
        }
    });
};