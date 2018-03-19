var lib = require('../include/lib');
//******************SEPARATE******************
exports.updateOrCreate=function(params,callBack) {
    lib.dbConnection.UserToken.find( {
            where: { device_id: params.DeviceId }
    }).complete(function (err, UserToken) {
        if (UserToken) {
            UserToken.updateAttributes({
                user_id: null,
                token: params.Token
            }, ['user_id', 'token']).success(function (result) {
                console.log(result)
                callBack(true)
            });
        } else {
            lib.dbConnection.UserToken.create({
                device_id: params.DeviceId,
                token: params.Token,
                user_id: null,
                app_id: 1
            }).complete(function (err, UserToken) {
                if (err) {
                    console.log(err)
                    callBack(false)
                } else {
                    if (UserToken) {
                        callBack(true)
                    } else {
                        callBack(false)
                    }
                }
            })
        }
    })
}
//******************SEPARATE******************
exports.existDeviceId = function(DeviceId, callBack) {
    lib.dbConnection.UserToken.find( {
        where:{ device_id: DeviceId }
    }).complete(function (err, UserToken) {
        if (err) {
            callBack({success:false})
        }else{
            if(UserToken){
                callBack({success:true,result:UserToken})
            }else{
                callBack({success:false})
            }
        }
    })
}
//******************SEPARATE******************
exports.setUserId = function(params, callBack) {
    lib.dbConnection.UserToken.find( {
        where:{ device_id: params.DeviceId }
    }).success(function (userToken) {
        if(userToken) {
	        userToken.user_id = params.userId;
	        userToken.save().success(function(newUserToken) {
                callBack({success:true})
            }).error(function(error) {
	            console.log("an error accord: ",error);
                callBack({success:false})
            });
        } else {
	        callBack(lib.errorCodes.setError('missesDeviceId'));
        }
    }).error(function(error) {
	    console.log("an error accord: ",error);
	    callBack({success:false})
    });
}
//******************SEPARATE******************
exports.getUserId = function(DeviceId, callBack) {
    lib.dbConnection.UserToken.find( {
        where:{ device_id: DeviceId }
    }).success(function (userToken) {
        if(userToken) {
	        callBack({success:true,userId:userToken.user_id})
        } else {
	        callBack({success:false});
        }
    }).error(function(error) {
	    console.log("an error accord: ",error);
	    callBack({success:false})
    });
}