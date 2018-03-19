var lib = require('../../include/lib');
/***********************************************************************************************************************
 add action for add a favorite address to a customer

 inputs : DeviceId , UserId , AddressName , GeographicalLat , GeographicalLong , Details
 outputs : result:(true or false) if result true Data is address info if result false ErrorCode is representing error code
 ************************************************************************************************************************/
exports.add = function(req, res) {
	var repo = require('../../include/repo');
	var repository = new repo();
	var body = JSON.parse (JSON.stringify(req.body));
	lib.async.auto({
        find: function(callBack, results){
	        repository.favoriteAddress.saveAddress(body, function(res) {
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
/***********************************************************************************************************************
 edit action for edit an exist favorite address of a customer

 inputs : DeviceId , UserId , AddressId , AddressName , GeographicalLat , GeographicalLong , Details
 outputs : result:(true or false) if result true Data is address info if result false ErrorCode is representing error code
************************************************************************************************************************/
exports.edit = function(req, res) {
	var repo = require('../../include/repo');
	var repository = new repo();
	var body = JSON.parse (JSON.stringify(req.body));
	lib.async.auto({
		find: function(callBack, results){
			repository.favoriteAddress.updateAddress(body, function(res) {
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
/***********************************************************************************************************************
 delete action for delete an exist favorite address of a customer

 inputs : DeviceId , UserId , AddressId
 outputs : result:(true or false) if result false ErrorCode is representing error code
************************************************************************************************************************/
exports.delete = function(req, res) {
	var repo = require('../../include/repo');
	var repository = new repo();
	var body = JSON.parse (JSON.stringify(req.body));
	lib.async.auto({
		find: function(callBack, results){
			repository.favoriteAddress.delete(body, function(res) {
				callBack(null ,res);
			});
		}
	} ,function(err, result) {
		if(result.find.Result == false) {
			res.status(200).json(result.find);
		} else {
			res.status(200).json({Result: true});
		}
	});
};
/***********************************************************************************************************************
 list action for getting all favorite address of a customer

 inputs : DeviceId , UserId
 outputs : result:(true or false) if result true Data is an array of json object of favorite address and if result false ErrorCode is representing error code
************************************************************************************************************************/
exports.list = function(req, res) {
	var repo = require('../../include/repo');
	var repository = new repo();
	var body = JSON.parse (JSON.stringify(req.body));
	lib.async.auto({
		find: function(callBack, results){
			repository.favoriteAddress.list(body, function(res) {
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
