var redis = require("redis");
var redisClient = redis.createClient();
var async = require('async');
var appRoot = require('app-root-path');
var dbConnection = require(appRoot.path + '/models')
var theNamespace = 'backend';
var appConfig=require('../../config.json')['development']
var FCM = require('fcm-node');
var fcm = new FCM(appConfig.api);

//******************SEPARATE******************
exports.send=function(params,toSendNotify,callback){
    var toSendNotification,shopOwnerUserTokens,regTokens,sender,message;
    shopOwnerUserTokens = params;
        regTokens = [];
        toSendNotification =toSendNotify;
        delete toSendNotification.type;
        for (var userToken in shopOwnerUserTokens) {
            if (shopOwnerUserTokens[userToken].token != null && shopOwnerUserTokens[userToken].token != "") {
                regTokens.push(shopOwnerUserTokens[userToken].token);
            }
        }
        var payloadMulticast = {
            registration_ids:regTokens,
            data: toSendNotify
        };
        fcm.send(payloadMulticast,function(err,response){
            console.log("err",err)
            console.log("response",response)
        })

    
}
