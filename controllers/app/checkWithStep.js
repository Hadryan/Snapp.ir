var lib = require('../../include/lib');
//******************Repositories******************
exports.check = function(parameters,requireParams,step,callback){
	var repo = require('../../include/repo');
	var repository = new repo();
	var body=JSON.parse(JSON.stringify(parameters));
    const OK='OK'
    body.validation=function(params){
        this.status=true
        for(var key in params){
            if(!(typeof this[params[key]] !='undefined' && this[params[key]] && this[params[key]]!="")){
				console.log(this[params[key]])
                this.status=false;
            }
        }
    }
    var params=requireParams;
    body.validation(params)
    if(body.status){
        lib.async.auto
        (
            {
                existDeviceId:function(cb,results){
                    repository.userToken.existDeviceId(body,function(result){
                        cb(null,(result.status?{Result:true}:lib.errorCodes.setError('missesDeviceId')))
                    })
                },
                checkUser:['existDeviceId',function(cb,results){
                    var checkDevice=results.existDeviceId
                    if(checkDevice.Result && step>1){
                        if(
                            (body['Mobile'] && typeof body['Mobile']!='undefined' && body['Mobile']!="" && lib.tools.isValidMobileNumber(body['Mobile'])) ||
                            (body['Email'] && typeof body['Email']!='undefined' && body['Email']!="" && repository.validator.isEmail(body['Email']))
                        ){
                            repository.user.checkAll(parameters,function(result){
                                if(result.status==2){
                                    var thisUser=result.User;
                                    if(thisUser.state=='active'){
                                        cb(null,{Result:true,User:thisUser})
                                    }else{
                                        cb(null,lib.errorCodes.setError('inactiveUser'))
                                    }
                                }else{
                                    cb(null,lib.errorCodes.setError('invalidAuthentication'))
                                }
                            })
                        }else{
                            cb(null,lib.errorCodes.setError('InvalidParameters'))
                        }
                    }else{
                        cb(null,checkDevice)
                    }
                }]
            },
            function(err,allResult){
                callback(allResult.checkUser)
            }
        )
    } else {
        callback(lib.errorCodes.setError('emptyParams'))
    }
}

