var lib = require('../../include/lib');
/***********************************************************************************************************************
 index action for get passenger trips list info

 inputs : DeviceId , UserId , Date
 outputs : result:(true or false) if result tru data is an array of trip information and result false ErrorCode is representing error code
 ************************************************************************************************************************/
exports.index = function(req, res) {
	var repo = require('../../include/repo');
	var repository = new repo();
	var body = JSON.parse (JSON.stringify(req.body));
	body.Date = lib.dayBeforeDate(0,parseInt(body.Date));
	lib.async.auto({
        find: function(callBack, results) {
	        repository.trip.getPassengerTrips(body, function (res) {
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