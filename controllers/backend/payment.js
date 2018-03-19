var lib = require('../../include/lib');

//******************SEPARATE******************
var userToken=require('../../repository/userTokenRepository');
//******************SEPARATE******************

//******************SEPARATE******************
exports.index=function(req,res){
    var token,decodedToken,deviceId,PaymentCode,status;
    token=req.params.token;
    var decoded = lib.jwt.decode(token,'ATDDecoder');
    decodedToken=JSON.stringify(decoded)
    decodedToken = JSON.parse(decodedToken);
    deviceId=decodedToken['DeviceId']
    var paymentId=decodedToken['PaymentId']
    lib.async.auto
    (
        {
            checkDevice:function(cb,results){
                userToken.existDeviceId(deviceId,function(result){
                    status=result.success;
                    if(status){
                        cb(null,true)
                    }else{
                        res.json("درخواست نا معتبر")
                    }
                })
            },
            findFactor:['checkDevice',function(cb,results){
                lib.dbConnection.Payment.find({
                    where:{
                        id:paymentId
                    }
                }).complete(function(err,payment){
                    console.log("err",err)
                    if(payment){
                        if(payment.payment_situation_id==lib.Constants.setConstant('paymentSituationPending')){
                            cb(null,payment)
                        }else{
                            res.json("وضعیت فاکتور شما از قبل مشخص شده است")
                        }
                    }else{
                        res.json("چنین فاکتوری یافت نشد")
                    }
                })
            }],
            sendBank:['findFactor',function(cb,results){
                var thisFactor,args;
                thisFactor=results.findFactor;
                var args={
                    Amount:thisFactor.amount*10,
                    MID:'10766940',
                    ResNum:thisFactor.id,
                    RedirectURL:"http://"+lib.config['production'].host.domain+":"+lib.config['production'].host.port+"/resolve/payment"
                }
                res.render('backend/payment',args)
            }]
        }
        ,
        function(err,allResult){
        }
    )

}
//******************SEPARATE******************
exports.resolve=function(req,res){
    var xhr = new lib.XMLHttpRequest();

    var state=req.body.State;
    var refnum=req.body.RefNum;
    var resnum=req.body.ResNum;
    var mid=req.body.MID;
    var traceno=req.body.TRACENO;
    var paymentId=parseInt(resnum);

    if(refnum!='' && state.toLowerCase()=='ok'){
        xhr.open('POST', 'https://acquirer.samanepay.com/payments/referencepayment.asmx', true);
        // build SOAP request
        var sr =
            '<?xml version="1.0" encoding="utf-8"?>' +
            '<soap:Envelope ' +
            'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ' +
            'xmlns:xsd="http://www.w3.org/2001/XMLSchema" ' +
            'xmlns:soapenc="http://schemas.xmlsoap.org/soap/encoding/" ' +
            'xmlns:tns="urn:Foo" ' +
            'xmlns:types="urn:Foo/encodedTypes" ' +
            'xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">' +
            '<soap:Body soap:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">' +
            '<tns:verifyTransaction>'+
            '<String_1 xsi:type="xsd:string">'+refnum+'</String_1>'+
            '<String_2 xsi:type="xsd:string">'+mid+'</String_2>'+
            '</tns:verifyTransaction>'+
            '</soap:Body>' +
            '</soap:Envelope>';

        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                if (xhr.status == 200) {
                    console.log("200")
                    console.log("status is 200 and everything is ok")
                    var parseString = lib.xml2js.parseString;
                    var xml = xhr.responseText;
                    parseString(xml, function (err, result) {
                        var response=result['soap:Envelope']['soap:Body'][0]['types:verifyTransactionResponse'][0]['result'][0]['_'];
                        if(response>0) {
                            lib.dbConnection.Payment.find({
                                where: {
                                    id: paymentId
                                }
                            }).complete(function (err, payment) {
                                payment.updateAttributes({
                                    payment_situation_id: lib.Constants.setConstant('paymentSituationSuccessful'),
                                    description: refnum
                                }, ['payment_situation_id', 'description']).complete(function (err, row) {
                                    console.log("err", err)
                                    lib.dbConnection.sequelize.query("update users set balance=balance+" + parseInt(payment.amount) + " where id=" + payment.user_id
                                    ).complete(function (err, row) {
                                        console.log("err", err)
                                        res.json("اعتبار شما افزایش یافت")
                                    })
                                })
                            })
                        }else{
                            lib.dbConnection.Payment.update(
                                {
                                    payment_situation_id:lib.Constants.setConstant('paymentSituationFail'),
                                    description:refnum
                                },
                                {
                                    id:paymentId
                                }
                            ).complete(function (err,row) {
                                console.log("err",err)
                                res.json("متاسفانه مشکلی در افزایش اعتبار شما پیش آمده است")
                            })
                        }
                    });
                }
            }
        }

        // Send the POST request
        console.log("now send request")
        xhr.setRequestHeader("SOAPAction", "verifyTransaction");
        xhr.setRequestHeader( "Content-Type","text/xml; charset=utf-8");
        xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
        xhr.setRequestHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
        xhr.setRequestHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
        xhr.send(sr);
    }else{
        lib.dbConnection.Payment.update(
            {
                payment_situation_id:lib.Constants.setConstant('paymentSituationFail'),
                description:refnum
            },
            {
                id:paymentId
            }
        ).complete(function (err,row) {
            console.log("err",err)
            res.json("پرداخت شما با مشکل مواجه شده است")
        })
    }
}