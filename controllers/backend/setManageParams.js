var lib = require('../../include/lib');
var tools = require('../../include/tools');
var repo = require('../../repository/backendRepo');
var theNamespace = 'backend';
//******************Main query for this module******************
var pageLength = 7
//******************Main query for this module******************
exports.index = function (req, res) {
    tools.getLoggedInUser(theNamespace, req.sessionID, function (userLoggedIn) {
        if (userLoggedIn === false) {
            res.redirect('/' + theNamespace + '/login');
        } else {
            var query="select * from trip_price_parameters order by id desc "
            lib.dbConnection.sequelize.query(query).complete(function(err,priceParams){
                console.log("err",err)
                // var rows=repo.paginate(priceParams,1,pageLength);
                res.render(theNamespace+'/manage_params/index',{
                    userLoggedInDetails: userLoggedIn,
                    data: priceParams,
                    // data: rows.data,
                    // pageParams: rows.pageParams,
                    selectedMenu: 'setManageParams'
                })
            })
        }
    })
}
//******************SEPARATE******************
/*exports.search=function(req,res){
    tools.getLoggedInUser(theNamespace, req.sessionID, function (userLoggedIn) {
        if (userLoggedIn === false) {
            res.redirect('/' + theNamespace + '/login');
        } else {
            var query="select * from trip_price_parameters order by id desc "
            lib.dbConnection.sequelize.query(query).complete(function(err,priceParams){
                console.log("err",err)
                var rows=repo.paginate(priceParams,req.params.pageIndex,pageLength);
                res.render(theNamespace+'/manage_params/view',{
                    userLoggedInDetails: userLoggedIn,
                    data: rows.data,
                    pageParams: rows.pageParams,
                    selectedMenu: 'setManageParams'
                })
            })
        }
    })
}*/
//******************SEPARATE******************
exports.add=function(req,res){
    tools.getLoggedInUser(theNamespace, req.sessionID, function (userLoggedIn) {
        if (userLoggedIn === false) {
            res.redirect('/' + theNamespace + '/login');
        } else {
            res.render(theNamespace+'/manage_params/add',{
                userLoggedInDetails: userLoggedIn,
                selectedMenu: 'setManageParams'
            })
        }
    })
}
//******************SEPARATE******************
exports.postAdd=function(req,res){
    tools.getLoggedInUser(theNamespace, req.sessionID, function (userLoggedIn) {
        if (userLoggedIn === false) {
            res.redirect('/' + theNamespace + '/login');
        } else {
          var body=JSON.parse(JSON.stringify(req.body));
          body.flag_id=1;
          body.creator_user_id=userLoggedIn.id
          body.creator_user_ip=req.client.remoteAddress
          lib.dbConnection.TripPriceParameters.create(body).complete(function(err,result){
              console.log("err",err)
              res.redirect('/backend/set_manage_params')
          })
        }
    })
}


