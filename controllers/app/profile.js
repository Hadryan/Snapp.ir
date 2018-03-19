var lib = require('../../include/lib');
/***********************************************************************************************************************
 genders action for get list of user genders

 inputs : DeviceId
 outputs : result:(true or false) if result true Data is array of all exist user gender info if resut false ErrorCode is representing error code
************************************************************************************************************************/
exports.genders = function(req, res) {
	var repo = require('../../include/repo');
	var repository = new repo();
	var body = JSON.parse (JSON.stringify(req.body));
    lib.async.auto({
        find: function(callBack, results){
	        repository.userGender.gendersList(function(res) {
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
 editCustomer action for edit customers profile info

 inputs : DeviceId , UserId , GenderId , FullName , Phone , Address , BirthDate
 outputs : result:(true or false) if result true Data is customer profile information if resut false ErrorCode is representing error code
************************************************************************************************************************/
exports.editCustomer = function(req, res) {
	var repo = require('../../include/repo');
	var repository = new repo();
	var body = JSON.parse (JSON.stringify(req.body));
    lib.async.auto({
        find: function(callBack, results){
	        repository.customerProfile.updateInfo(body ,function(result){
		        callBack(null ,result);
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