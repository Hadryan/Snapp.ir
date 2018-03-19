var lib = require('../../include/lib');
var tools = require('../../include/tools');
var repo = require('../../repository/backendRepo');
var theNamespace = 'backend';
//******************Main query for this module******************
var mainQuery="SELECT support_messages.*,support_message_subjects.`name` AS subject_name,support_message_flags.`id` AS flag_id,trip.trip_code,customer_profile.full_name,service_provider_profile.first_name,service_provider_profile.last_name FROM support_messages LEFT OUTER JOIN support_message_subjects ON support_message_subjects.id = support_messages.message_subject_id LEFT OUTER JOIN support_message_flags ON support_message_flags.id = support_messages.message_flag_id LEFT OUTER JOIN trip ON trip.id = support_messages.trip_id LEFT OUTER JOIN customer_profile on support_messages.sender_id=customer_profile.user_id LEFT OUTER JOIN service_provider_profile on support_messages.sender_id=service_provider_profile.user_id where ";
var pageLength = 7
//******************Main query for this module******************
exports.index = function (req, res) {
    tools.getLoggedInUser(theNamespace, req.sessionID, function (userLoggedIn) {
        if (userLoggedIn === false) {
            res.redirect('/' + theNamespace + '/login');
        } else {
            var dataType=req.params.type;
            var query=mainQuery+(dataType=='passengers'?"support_messages.trip_id is not null":"support_messages.trip_id is null");
            query+=" order by support_messages.createdAt desc";
            lib.dbConnection.sequelize.query(query).complete(function(err,feedBacks){
                console.log("err",err)
                // var rows=repo.paginate(feedBacks,1,pageLength);
                res.render(theNamespace+'/feedback/index',{
                    userLoggedInDetails: userLoggedIn,
                    data: feedBacks,
                    // data: rows.data,
                    // pageParams: rows.pageParams,
                    allCount:feedBacks.length,
                    dataType:dataType,
                    selectedMenu: 'feedback_'+dataType,
                })
            })
        }
    })
}
//******************SEPARATE******************
exports.search=function(req,res){
    tools.getLoggedInUser(theNamespace, req.sessionID, function (userLoggedIn) {
        if (userLoggedIn === false) {
            res.redirect('/' + theNamespace + '/login');
        } else {
            var body=req.body;
            var dataType=req.params.dataType;
            var query=mainQuery+(dataType=='passengers'?"support_messages.trip_id is not null":"support_messages.trip_id is null");
            query+=" and ";
            for (var key in body) {
                if (body[key] && body[key] != '' && body[key] != 'null') {
                    switch (key) {
                        case "start_date" :
                            var startDate = lib.moment(body[key], 'jYYYY/jMM/jDD').format('YYYY-MM-DD');
                            query += " support_messages.createdAt >= '" + startDate + "' AND "
                            break;
                        case "end_date" :
                            var endDate = lib.moment(body[key], 'jYYYY/jMM/jDD').format('YYYY-MM-DD');
                            query += " support_messages.createdAt <= '" + endDate + "' AND "
                            break;
                    }
                }
            }
            query += " support_messages.id <> 0 order by support_messages.createdAt desc"
            lib.dbConnection.sequelize.query(query).complete(function(err,priceParams){
                console.log("err",err)
                // var rows=repo.paginate(priceParams,req.params.pageIndex,pageLength);
                res.render(theNamespace+'/feedback/view',{
                    userLoggedInDetails: userLoggedIn,
                    data: priceParams,
                    // pageParams: rows.pageParams,
                    dataType:dataType,
                    selectedMenu: 'ss'
                })
            })
        }
    })
}
//******************SEPARATE******************
exports.delete=function(req,res){
    tools.getLoggedInUser(theNamespace, req.sessionID, function (userLoggedIn) {
        if (userLoggedIn === false) {
            res.redirect('/' + theNamespace + '/login');
        } else {
          lib.dbConnection.sequelize.query("delete from support_messages where id="+req.params.id
          ).complete(function(err,row){
              console.log("err",err)
              res.json(true)
          })
        }
    })
}
//******************SEPARATE******************
exports.profile = function (req,res) {
	tools.getLoggedInUser(theNamespace, req.sessionID, function (userLoggedIn) {
		if (userLoggedIn === false) {
			res.redirect('/' + theNamespace + '/login');
		} else {
			var id = req.params.id;
			lib.dbConnection.SupportMessage.find({
				where:{id:id},
				include: [
					lib.dbConnection.SupportMessageSubject
				]
			}).success(function(message) {
				res.render(theNamespace+"/feedback/profile",{
					userLoggedInDetails: userLoggedIn,
					profile: message,
					selectedMenu: 'ss'
				});
			}).error(function(error) {
				console.log('error',error);
			})
		}
	});
}
//******************SEPARATE******************
exports.sendRes=function(req,res){
    tools.getLoggedInUser(theNamespace, req.sessionID, function (userLoggedIn) {
        if (userLoggedIn === false) {
            res.redirect('/' + theNamespace + '/login');
        } else {
            var body=JSON.parse(JSON.stringify(req.body));
            var notification = require('../../repository/backendRepo/notificationRepository');
            lib.dbConnection.UserToken.findAll({
                where:{user_id:body.user_id}
            }).complete(function(err,userTokens){
                console.log("err",err)
                body.photo=null;
                body.created_at=Date.parse(new Date);
                notification.send(userTokens,body,function(response){
                    console.log("this is notification response",response)
                    lib.dbConnection.Notification.create({
                        title:body.title,
                        body:body.description,
                        notification_type_id:body.type_id,
                        receiver_user_id:body.user_id,
                        creator_user_id:userLoggedIn.id,
                        creator_user_ip:req.client.remoteAddress,
                    }).complete(function(err,row){
                        console.log("err",err)
                        res.json(true)
                    })
                })
            })
        }
    })
}