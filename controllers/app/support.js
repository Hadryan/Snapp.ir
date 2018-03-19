var lib = require('../../include/lib');
/***********************************************************************************************************************
 subjects action for get list of support subjects according to user type id

 inputs : DeviceId , TypeId
 outputs : result:(true or false) if result true Data is array of all exist support subject info if resut false ErrorCode is representing error code
 ************************************************************************************************************************/
exports.subjects = function(req, res) {
	var repo = require('../../include/repo');
	var repository = new repo();
	var body = JSON.parse (JSON.stringify(req.body));
	lib.async.auto({
        find: function(callBack, results){
	        repository.supportMessageSubject.list(body, function(res) {
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
 send action for send support message for service provider/customer

 inputs : DeviceId, TypeId, UserId, messageSubjectId, messageBody for service providers and TripCode aditional for customers
 outputs : result:(true or false) if result true Data is support message information if resut false ErrorCode is representing error code
************************************************************************************************************************/
exports.send = function(req, res) {
	var repo = require('../../include/repo');
	var repository = new repo();
	var body = JSON.parse (JSON.stringify(req.body));
    lib.async.auto({
        find: function(callBack, results) {
	        repository.supportMessage.saveMessage(body ,function(result){
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
