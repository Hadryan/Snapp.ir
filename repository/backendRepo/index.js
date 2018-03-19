var lib = require('../../include/lib');
exports.paginate=function(data,pageIndex,pageLength){
    var since,till,total,pageParams,pageNumbers,start,end,index,difEnd,difStart;
    index=parseInt(pageIndex);
    since=(index-1)*pageLength
    till=since+pageLength;
    total=data.length;
    pageNumbers=Math.floor(total/pageLength)+1;
    difStart=index-3;
    if(difStart<=0){
        start=1
    }else{
        start=index-3
    }
    difEnd=parseInt(pageNumbers)-index;
    if(difEnd<3){
        end=index+difEnd;
    }else{
        end=index+3
    }
    pageParams={
        target:parseInt(index),
        start:start,
        end:end
    }
    data=data.slice(since,till)
    return {data:data,pageParams:pageParams}
}
//******************SEPARATE******************
//******************SEPARATE******************
exports.setPony=function(driver,totalPony,backendUser,req){
    Date.prototype.addHours = function (h) {
        this.setTime(this.getTime() - (h * 60 * 60 * 1000));
        return this;
    }
    var gDate=new Date(totalPony.createdAt).addHours(3.5).customFormat("#YYYY#/#MM#/#DD# #hhh#:#mm#")
    setTimeout(function(){
        var thisTime=new Date()
        var chainer = new lib.Sequelize.Utils.QueryChainer;
        chainer.add(lib.dbConnection.ServiceProviderProfile.find({where:{user_id:driver.id}}))
        chainer.add(lib.dbConnection.Trip.findAll({where:{driver_user_id:driver.id},limit:1}))
        chainer.run().success(function(allDetails){
            this.driverProfile=allDetails[0].dataValues;
            if(allDetails[1][0])
                this.firstTrip=allDetails[1][0].dataValues;
            this.startPonyDate=this.driverProfile.last_pony_date || (this.firstTrip?this.firstTrip.start_time:'')
            lib.dbConnection.PaymentPony.create({
                user_id:driver.id,
                amount:driver.balance,
                pony_start_date:this.startPonyDate,
                pony_end_date:thisTime,
                creator_user_id:backendUser.id,
                creator_user_ip:req.client.remoteAddress,
                total_pony_id:totalPony.id
            }).complete(function(err,pony){
                console.log("err",err)
                lib.dbConnection.Trip.findAll({
                    where:["end_time <= '"+ gDate +"' and payment_pony_id is null and driver_user_id="+ driver.id +" and trip_situation_id="+lib.Constants['tripSituationTripDone']]
                }).complete(function(err,driverTrips){
                    driverTrips.forEach(function(driverTrip,i){
                        driverTrip.updateAttributes({payment_pony_id:pony.id},['payment_pony_id']
                        ).complete(function(err,row){
                            console.log("err",err)
                        })
                    })
                })
            })
            lib.dbConnection.User.find({
                where:{id:driver.id}
            }).complete(function(err,user){
                user.updateAttributes({balance:user.balance-driver.balance},['balance']
                ).complete(function(err,row){
                    console.log("err",err)
                })
            })
            lib.dbConnection.ServiceProviderProfile.update(
                {
                    last_pony_date:thisTime
                },
                {
                    user_id:driver.id
                }
            ).complete(function(err,row){
                console.log("err",err)
            })
            totalPony.updateAttributes({situation_id:2},['situation_id']).complete(function(err,row){
                console.log("err",err)
            })
        })
    },200)
}
//******************SEPARATE******************
//******************SEPARATE******************
exports.setDriverPony=function(body,backendUser,req){
    Date.prototype.addHours = function (h) {
        this.setTime(this.getTime() - (h * 60 * 60 * 1000));
        return this;
    }
    var gDate=new Date(body.settleDate).addHours(3.5).customFormat("#YYYY#/#MM#/#DD# #hhh#:#mm#:#ss#")
    setTimeout(function(){
        var thisTime=new Date()
        var chainer = new lib.Sequelize.Utils.QueryChainer;
        chainer.add(lib.dbConnection.ServiceProviderProfile.find({where:{user_id:body.userId}}))
        chainer.add(lib.dbConnection.Trip.findAll({where:{driver_user_id:body.userId},limit:1}))
        chainer.run().success(function(allDetails){
            this.driverProfile=allDetails[0].dataValues;
            if(allDetails[1][0])
                this.firstTrip=allDetails[1][0].dataValues;
            this.startPonyDate=this.driverProfile.last_pony_date || (this.firstTrip?this.firstTrip.start_time:'')
            lib.dbConnection.PaymentPony.create({
                user_id:body.userId,
                amount:body.balance,
                pony_start_date:this.startPonyDate,
                pony_end_date:thisTime,
                creator_user_id:backendUser.id,
                creator_user_ip:req.client.remoteAddress
            }).complete(function(err,pony){
                console.log("err",err)
                lib.dbConnection.Trip.findAll({
                    where:["end_time <= '"+ gDate +"' and payment_pony_id is null and driver_user_id="+ body.userId +" and trip_situation_id="+lib.Constants['tripSituationTripDone']]
                }).complete(function(err,driverTrips){
                    driverTrips.forEach(function(driverTrip,i){
                        driverTrip.updateAttributes({payment_pony_id:pony.id},['payment_pony_id']
                        ).complete(function(err,row){
                            console.log("err",err)
                        })
                    })
                })
            })
            lib.dbConnection.User.find({
                where:{id:body.userId}
            }).complete(function(err,user){
                user.updateAttributes({balance:parseInt(user.balance)-parseInt(body.balance)},['balance']
                ).complete(function(err,row){
                    console.log("err",err)
                })
            })
            lib.dbConnection.ServiceProviderProfile.update(
                {
                    last_pony_date:thisTime
                },
                {
                    user_id:body.userId
                }
            ).complete(function(err,row){
                console.log("err",err)
            })
        })
    },200)
}