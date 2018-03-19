var lib = require('../../include/lib');
/***********************************************************************************************************************
 index action for change mobile service providers/customers

 inputs : DeviceId , NewMobile , UserId
 outputs : result:(true or false) if result true Data is user information if resut false ErrorCode is representing error code

 when user wnat to change his mobile a request will be saved and an activation code has been generate and sent via sms
 
 sending activation code has limitaion:
 minimum period of sending activation code is 5 minutes
 if in 5 minutes user not confirm his account, after 5 minutes user can request another active code and his active code ttl becom 10 minutes
 ttls for active code is 5,10,15,30,60,120,300,600,1440 minutes
 after entering active code, ttl well reset to 0.
************************************************************************************************************************/
exports.index = function(req, res) {
	var repo = require('../../include/repo');
	var repository = new repo();
	var body = JSON.parse (JSON.stringify(req.body));
	body.sendActivationCode = true;
    lib.async.auto({
        findUser: function(callBack, results){
            repository.userChangeMobileRequest.saveRequest(body ,function(result){
		        callBack(null ,result);
	        });
        }
    } ,function(err, result) {
        if(result.findUser.Result == false) {
            res.status(200).json(result.findUser);
        } else {
            res.status(200).json({Result: true, Data: [result.findUser.User]});
        }
    });
};
/***********************************************************************************************************************
 confirm action for confirm changing service providers/customers mobile

 inputs : DeviceId , NewMobile , UserId , ActivationCode
 outputs : result:(true or false) if result true Data is user information if result false ErrorCode is representing error code

 each activation code has life time and after that time, activation code is not valid.
 this life time is same code generation life time.
 ************************************************************************************************************************/
exports.confirm = function(req, res) {
	var repo = require('../../include/repo');
	var repository = new repo();
	var body = JSON.parse(JSON.stringify(req.body));
    lib.async.auto({
        findUser: function(callBack, results) {
	        repository.userChangeMobileRequest.initializeActivationCode(body, function(result) {
		        callBack(null ,result);
	        });
        }
    }, function(err, allResult) {
        if(allResult.findUser.Result == false) {
            res.status(200).json(allResult.findUser);
        } else {
            res.status(200).json({Result: true, Data: [allResult.findUser.User]});
        }
    });
};