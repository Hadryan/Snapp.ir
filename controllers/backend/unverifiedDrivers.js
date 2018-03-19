var lib=require('../../include/lib');
var tools=require('../../include/tools');
var repo=require('../../repository/backendRepo');
var theNamespace='backend';
exports.index=function(req,res){
    tools.getLoggedInUser(theNamespace, req.sessionID, function( userLoggedIn ) {
        if (userLoggedIn === false) {
            res.redirect('/' + theNamespace + '/login');
        } else {
            lib.dbConnection.User.findAll({
                include:[
                        lib.dbConnection.UserSituation,
                        {
                            model:lib.dbConnection.ServiceProviderProfile,
                            include:[
                                {
                                    model:lib.dbConnection.ServiceProviderSpecialInfo,
                                    attributes:['id'],
                                    include:{
                                        model:lib.dbConnection.VehicleBrand,
                                        attributes:['name']
                                    }
                                },
                                {
                                    model:lib.dbConnection.City,
                                    attributes:['name'],
                                    include:[
                                        {
                                            model:lib.dbConnection.State,
                                            attributes:['name']
                                        }
                                    ]
                                }
                            ],
                            attributes:['first_name','last_name','visit_date','special_code']
                        }
                    ],
                    where:{
                        user_type_id:1,
                        situation_id:[3,4,5]
                    },
                    attributes:['id','mobile']
            }).complete(function(err,users){
                //var allResult=repo.paginate(users,1,7)
                lib.dbConnection.City.findAll().complete(function(err,cities){
                    res.render(theNamespace + '/unverifiedDrivers/index',{
                        userLoggedInDetails : userLoggedIn,
                        userList : users,
                        //pageParams:allResult.pageParams,
                        cityList:cities,
                        selectedMenu : 'unverified_drivers',
                    });
                })
            })
        }
    })
}
//******************SEPARATE******************
//******************SEPARATE******************
exports.search=function(req,res){
	console.log("req.body", req.body);
    tools.getLoggedInUser(theNamespace, req.sessionID, function( userLoggedIn ) {
        if (userLoggedIn === false) {
            res.redirect('/' + theNamespace + '/login');
        } else {
            var body;
            body = req.body;
            if(body.empty=='true'){
                body['type']=req.session.searchUnverifiedDriverType;
                body['mobile']=	req.session.searchUnverifiedDriverMobile;
                body['fullname']=	req.session.searchUnverifiedDriverFullName;
                body['city_id']=	req.session.searchUnverifiedDriverCityId;
                body['situation_id']=	req.session.searchUnverifiedDriverSituationId;
            }else{
                req.session.searchUnverifiedDriverType =body['type'];
                req.session.searchUnverifiedDriverMobile =body['mobile'];
                req.session.searchUnverifiedDriverFullName =body['fullname'];
                req.session.searchUnverifiedDriverCityId=body['city_id'];
                req.session.searchUnverifiedDriverSituationId=body['situation_id'];
            }
            lib.async.auto
            (
                {
                    findAll: function (cb, results) {
                        var query="";
                        for (var key in body) {
                            if (body[key] && body[key] != '' && body[key] != 'null') {
                                switch (key) {
                                    case "situation_id" :
                                        query += " `users`.situation_id='" + body[key] + "' AND "
                                        break;
                                    case "mobile" :
                                        query += " `users`.mobile LIKE '%" + body[key] + "%' AND "
                                        break;
                                    case "special_code" :
                                        query += " `service_provider_profile`.special_code LIKE '%" + body[key] + "%' AND "
                                        break;
                                    case "fullname" :
                                        query += " (service_provider_profile.first_name LIKE '%" + body[key] + "%' OR "
                                        + " service_provider_profile.last_name LIKE '%" + body[key] + "%') AND "
                                        break;
                                    case "city_id" :
                                        query += " `service_provider_profile`.city_id = " + body[key] + " AND "
                                        break;
                                }
                            }
                        }
                        query += " `users`.user_type_id = 1 and `users`.situation_id in (3,4,5) "
                        lib.dbConnection.User.findAll({
                            include:[
                                lib.dbConnection.UserSituation,
                                {
                                    model:lib.dbConnection.ServiceProviderProfile,
                                    include:[
                                        {
                                            model:lib.dbConnection.ServiceProviderSpecialInfo,
                                            attributes:['id'],
                                            include:{
                                                model:lib.dbConnection.VehicleBrand,
                                                attributes:['name']
                                            }
                                        },
                                        {
                                            model:lib.dbConnection.City,
                                            attributes:['name'],
                                            include:[
                                                {
                                                    model:lib.dbConnection.State,
                                                    attributes:['name']
                                                }
                                            ]
                                        }
                                    ],
                                    attributes:['first_name','last_name','visit_date','special_code']
                                }
                            ],
                            where:[query],
                            attributes:['id','mobile']
                        }).complete(function(err,users){
                            console.log("err", err)
                            cb(null, {result: users || []})
                        })
                    }
                },
                function (err, allResult) {
                    //var rows=repo.paginate(allResult.findAll.result,req.params.pageIndex,7)
                    // console.log("rows.pageParams",rows.pageParams)
                    res.render(theNamespace + '/unverifiedDrivers/view', {
                        userLoggedInDetails: userLoggedIn,
                        userList: allResult.findAll.result,
                        //pageParams:rows.pageParams,
	                    selectedMenu : 'unverified_drivers',
                    });
                }
            )
        }
    })
}
//******************SEPARATE******************
//******************SEPARATE******************
exports.profile=function(req,res){
	tools.getLoggedInUser(theNamespace, req.sessionID, function( userLoggedIn ) {
		if (userLoggedIn === false) {
			res.redirect('/' + theNamespace + '/login');
		} else {
			lib.dbConnection.User.find({
				include:[
					lib.dbConnection.UserSituation,
					{
						model:lib.dbConnection.ServiceProviderProfile,
						include:[
							lib.dbConnection.ServiceProviderDocument,
							{
								model:lib.dbConnection.ServiceProviderSpecialInfo,
								include:[
									lib.dbConnection.VehicleBrand,
									lib.dbConnection.VehicleModel
								]
							},
							{
								model:lib.dbConnection.City,
								attributes:['name'],
								include:[
									{
										model:lib.dbConnection.State,
										attributes:['name']
									}
								]
							}
						]
					}
				],
				where:{
					id:req.params.id
				}
			}).complete(function(err,user){
				console.log("err",err)
				//res.json(user)
				res.render(theNamespace + '/unverifiedDrivers/profile', {
					userLoggedInDetails: userLoggedIn,
					profile: user,
					selectedMenu : 'unverified_drivers',
				});
			})
		}
	})
}
//******************SEPARATE******************
//******************SEPARATE******************
exports.setMeeting=function(req,res){
	tools.getLoggedInUser(theNamespace, req.sessionID, function( userLoggedIn ) {
		if (userLoggedIn === false) {
			res.redirect('/' + theNamespace + '/login');
		} else {
			lib.dbConnection.User.find({
				include: [lib.dbConnection.ServiceProviderProfile],
				where:{id:req.params.id}
			}).complete(function(err,user){
				console.log("err",err)
				user.updateAttributes({situation_id:5},['situation_id']).complete(function(err,row){
					user.serviceProviderProfile.updateAttributes({visit_date:req.body.date},['visit_date']).complete(function(err,row){
						var content="هوبر"+'\n'+
							(user.serviceProviderProfile.gender_id=="1"?"آقای ":"خانم ")+
							user.serviceProviderProfile.first_name+" "+
							user.serviceProviderProfile.last_name+"خواهشمند است جهت تحویل اصل مدارک ارایه شده در تاریخ "+
							req.body.date+" به محل شرکت مراجعه فرمایید"
						lib.tools.sendSms(user.mobile,content,lib.config['production'].sms,function(result){
							
						})
					})
					res.json(true)
				})
			})
		}
	})
}
//******************SEPARATE******************
//******************SEPARATE******************
exports.confirm=function(req,res){
	tools.getLoggedInUser(theNamespace, req.sessionID, function( userLoggedIn ) {
		if (userLoggedIn === false) {
			res.redirect('/' + theNamespace + '/login');
		} else {
			lib.dbConnection.User.find({
				include:[
					lib.dbConnection.ServiceProviderProfile
				],
				where:{
					id:req.params.id
				}
			}).complete(function(err,user){
				var error = req.query.error?true:false;
				res.render(theNamespace + '/unverifiedDrivers/setMeeting', {
					error:error,
					userLoggedInDetails: userLoggedIn,
					profile: user,
					selectedMenu : 'unverified_drivers',
				});
			})
		}
	})
}
//******************SEPARATE******************
//******************SEPARATE******************
exports.doMeeting=function(req,res){
	tools.getLoggedInUser(theNamespace, req.sessionID, function( userLoggedIn ) {
		if (userLoggedIn === false) {
			res.redirect('/' + theNamespace + '/login');
		} else {
			var body=req.body;
			lib.dbConnection.User.find({
				include:[
					{
						model:lib.dbConnection.ServiceProviderProfile,
						include:[
							lib.dbConnection.ServiceProviderDocument,
							lib.dbConnection.ServiceProviderSpecialInfo,
							lib.dbConnection.City,
						]
					}
				],
				where:{
					id:req.body.id
				}
			}).complete(function(err,user){
				console.log("err",err);
				if(user.serviceProviderProfile.serviceProviderSpecialInfo.vehicle_brand_id && user.serviceProviderProfile.serviceProviderSpecialInfo.vehicle_model_id) {
					delete body['id'];
					var fields = ['confirmed_at'];
					for (var key in body) {
						body[key] = true;
						fields.push(key);
					}
					body = JSON.parse(JSON.stringify(body));
					body.confirmed_at = Date.parse(new Date);
					var city = parseInt(user.serviceProviderProfile.city.code);
					var national = parseInt(user.serviceProviderProfile.id) + 11111;
					var special_code = city.toString() + "-" + national.toString();
					user.updateAttributes({situation_id: 1}, ['situation_id']).complete(function (err, result) {
						user.serviceProviderProfile.updateAttributes({special_code: special_code}, ['special_code']).complete(function (err, row) {
							console.log("err", err);
							user.serviceProviderProfile.serviceProviderDocument.updateAttributes(body, fields).complete(function (err, row) {
								console.log("err", err);
								res.redirect('/backend/unverified_drivers');
							});
						});
					});
				} else {
					res.redirect('/backend/unverified_drivers/set_meeting/'+req.body.id+'?error=1');
				}
			})
		}
	})
}
