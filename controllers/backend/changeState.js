var redis = require("redis");
var redisClient = redis.createClient();
var dbConnection = require('../../models');
var tools = require('../../include/tools');
var async = require('async');
var theNamespace = 'backend';

// -- /Route / ------------------------------------------------------------------------------
exports.index = function(req, res){
    tools.getLoggedInUser(theNamespace, req.sessionID, function( userLoggedIn ){
        if ( userLoggedIn === false ) {
            res.redirect('/' + theNamespace + '/login');
        } else {
                dbConnection[req.params.model].find({
                    where:{
                        id:req.params.id
                    }
                }).complete(function(err,model){
                    console.log("err",err)
                    model.updateAttributes(
                        {situation_id: req.body.newState},
                        ['situation_id']
                    ).complete(function(err,result){
                        console.log("err",err)
                        res.json("ok")
                    })
                })
            }
    });
}
