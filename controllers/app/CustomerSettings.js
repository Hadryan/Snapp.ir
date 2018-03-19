var lib = require('../../include/lib');
/***********************************************************************************************************************
 add action for add a favorite address to a customer

 inputs : DeviceId , UserId , AddressName , GeographicalLat , GeographicalLong , Details
 outputs : result:(true or false) if result true Data is address info if result false ErrorCode is representing error code
 ************************************************************************************************************************/
exports.index = function(req, res) {
	var repo = require('../../include/repo');
	var repository = new repo();
	var body = JSON.parse (JSON.stringify(req.body));
	lib.async.auto({
        find: function(callBack, results){
	        repository.customerSettings.updateSetting(body, function(res) {
		        callBack(null ,res);
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